import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createDemoInventory, queryAvailability, readManualFeed } from './inventory.js';
import { InputError, TIME_ZONE, parseDate, parsePositiveInteger, tomorrowInSeward } from './validation.js';

const MAX_BODY_BYTES = 8192;
const REFRESH_INTERVAL_MS = 60_000;
const STATIC_FILES = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
]);

class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

function localOrigin(request) {
  const host = request.headers.host;
  if (typeof host !== 'string' || !/^(localhost|127\.0\.0\.1|\[::1\])(?::[1-9]\d{0,4})?$/i.test(host)) {
    throw new HttpError(403, 'forbidden_host', 'Use the local server address');
  }
  let origin;
  try { origin = new URL(`http://${host}`).origin; }
  catch { throw new HttpError(403, 'forbidden_host', 'Use the local server address'); }
  if (Number(new URL(origin).port || 80) !== request.socket.localPort) {
    throw new HttpError(403, 'forbidden_host', 'Host must match the local server port');
  }
  if (request.headers.origin !== undefined && request.headers.origin !== origin) {
    throw new HttpError(403, 'forbidden_origin', 'Origin must match the local server');
  }
  return origin;
}

async function readJson(request, allowedFields) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers['content-type'] || '')) {
    request.resume();
    throw new HttpError(415, 'unsupported_media_type', 'Use Content-Type: application/json');
  }
  if (request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity') {
    request.resume();
    throw new HttpError(415, 'unsupported_media_type', 'Compressed request bodies are unsupported');
  }
  if (Number(request.headers['content-length'] || 0) > MAX_BODY_BYTES) {
    request.resume();
    throw new HttpError(413, 'body_too_large', 'JSON body must not exceed 8 KiB');
  }
  const content = await new Promise((resolve, reject) => {
    const chunks = [];
    let length = 0;
    let rejected = false;
    request.on('data', chunk => {
      length += chunk.length;
      if (length > MAX_BODY_BYTES) {
        chunks.length = 0;
        if (!rejected) reject(new HttpError(413, 'body_too_large', 'JSON body must not exceed 8 KiB'));
        rejected = true;
      } else if (!rejected) chunks.push(chunk);
    });
    request.on('end', () => { if (!rejected) resolve(Buffer.concat(chunks)); });
    request.on('error', reject);
    request.on('aborted', () => reject(new InputError('Request body was interrupted')));
  });
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(content)); }
  catch { throw new InputError('Body must be valid UTF-8 JSON'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new InputError('Body must be a JSON object');
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) throw new InputError(`unsupported body field: ${key}`);
  }
  return body;
}

export function createServer({ mode = 'demo', feedPath, clock = Date.now, catalogService, calendarService } = {}) {
  if (!['demo', 'manual'].includes(mode)) throw new InputError('INVENTORY_MODE must be demo or manual');
  if (mode === 'manual' && !feedPath) throw new InputError('manual mode requires INVENTORY_FILE');
  const catalog = catalogService ?? {
    loadCatalog: async () => (await import('./catalog.js')).loadCatalog(),
    refreshCatalog: async () => (await import('./catalog.js')).refreshCatalog(),
    getOperator: async id => (await import('./catalog.js')).getOperator(id),
  };
  const calendar = calendarService ?? {
    loadCalendarObservations: async () => (await import('./calendar.js')).loadCalendarObservations(),
    checkCalendar: async (id, date) => (await import('./calendar.js')).checkCalendar(id, date),
  };
  let refreshPromise;
  let refreshResult;
  let lastRefreshStarted = -Infinity;
  async function refreshCatalog() {
    if (refreshPromise) return refreshPromise;
    if (clock() - lastRefreshStarted < REFRESH_INTERVAL_MS) {
      if (refreshResult) return refreshResult;
      throw new HttpError(429, 'refresh_throttled', 'Wait at least 60 seconds between source refreshes');
    }
    lastRefreshStarted = clock();
    refreshResult = undefined;
    refreshPromise = Promise.resolve().then(() => catalog.refreshCatalog());
    try { refreshResult = await refreshPromise; return refreshResult; }
    finally { refreshPromise = undefined; }
  }
  async function withObservations(snapshot) {
    if (!snapshot || !Array.isArray(snapshot.products)) throw new Error('Catalog has no product list');
    const observations = await calendar.loadCalendarObservations();
    return {
      ...snapshot,
      products: snapshot.products.map(product => ({
        ...product,
        ...(observations && Object.hasOwn(observations, product.id) ? { availability: observations[product.id] } : {}),
      })),
    };
  }
  return http.createServer(async (request, response) => {
    const send = (code, body, extra = {}) => {
      response.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra,
      });
      response.end(JSON.stringify(body, null, 2));
    };
    try {
      const origin = localOrigin(request);
      const url = new URL(request.url, origin);
      if (url.origin !== origin) throw new InputError('Request URL must use the local server');
      const postRoute = ['/api/catalog/refresh', '/api/calendar/check'].includes(url.pathname);
      const expectedMethod = postRoute ? 'POST' : 'GET';
      if (request.method !== expectedMethod) return send(405, { error: { code: 'method_not_allowed', message: `Only ${expectedMethod} is supported` } }, { Allow: expectedMethod });
      if (!STATIC_FILES.has(url.pathname) && !['/health', '/api/products', '/api/availability', '/api/catalog'].includes(url.pathname) && !postRoute) {
        return send(404, { error: { code: 'not_found', message: 'Unknown endpoint' } });
      }
      const allowed = url.pathname === '/api/availability' ? ['date', 'partySize'] : [];
      for (const key of url.searchParams.keys()) {
        if (!allowed.includes(key) || url.searchParams.getAll(key).length !== 1) throw new InputError(`unsupported or repeated query parameter: ${key}`);
      }
      if (STATIC_FILES.has(url.pathname)) {
        const [name, contentType] = STATIC_FILES.get(url.pathname);
        const content = await readFile(new URL(`../public/${name}`, import.meta.url));
        response.writeHead(200, {
          'Content-Type': contentType, 'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY',
          'Referrer-Policy': 'no-referrer',
        });
        return response.end(content);
      }
      if (url.pathname === '/api/catalog' || url.pathname === '/api/catalog/refresh') {
        if (postRoute) await readJson(request, []);
        try {
          return send(200, await withObservations(await (postRoute ? refreshCatalog() : catalog.loadCatalog())));
        } catch (error) {
          if (error instanceof HttpError) throw error;
          console.error(`Catalog error: ${error.message}`);
          return send(503, { error: { code: 'catalog_unavailable', message: 'The catalog could not be loaded. Saved observations may be unavailable; retry later.' } });
        }
      }
      if (url.pathname === '/api/calendar/check') {
        const body = await readJson(request, ['productId', 'date']);
        if (typeof body.productId !== 'string' || !body.productId || body.productId.length > 200) throw new InputError('productId must be a known product ID');
        const date = parseDate(body.date);
        if (!await catalog.getOperator(body.productId)) throw new InputError('productId must be a known product ID');
        try {
          return send(200, { productId: body.productId, availability: await calendar.checkCalendar(body.productId, date) });
        } catch (error) {
          if (error instanceof InputError || error instanceof HttpError) throw error;
          console.error(`Calendar error: ${error.message}`);
          return send(503, { error: { code: 'calendar_unavailable', message: 'Calendar observation failed; remaining availability is unknown.' } });
        }
      }
      const now = clock();
      if (url.pathname === '/health') return send(200, { status: 'ok', mode, isDemo: mode === 'demo', timeZone: TIME_ZONE, feedStatus: mode === 'manual' ? 'validated_on_data_requests' : 'synthetic' });
      const date = url.pathname === '/api/availability' ? parseDate(url.searchParams.get('date')) : tomorrowInSeward(now);
      const partySize = parsePositiveInteger(url.searchParams.get('partySize') ?? '1');
      let inventory;
      try {
        inventory = mode === 'demo' ? createDemoInventory(date, now, partySize) : await readManualFeed(feedPath, now);
      } catch (error) {
        console.error(`Inventory feed error: ${error.message}`);
        return send(503, { error: { code: 'feed_unavailable', message: 'Inventory feed could not be read or validated; availability is unknown. Check the server log.' }, isDemo: false });
      }
      if (url.pathname === '/api/products') return send(200, { isDemo: inventory.isDemo, products: inventory.products });
      return send(200, queryAvailability(inventory, date, partySize, now));
    } catch (error) {
      if (error instanceof InputError) return send(400, { error: { code: 'invalid_request', message: error.message } });
      if (error instanceof HttpError) return send(error.status, { error: { code: error.code, message: error.message } });
      console.error(`Request error: ${error.message}`);
      return send(500, { error: { code: 'internal_error', message: 'The request could not be completed' } });
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const port = parsePositiveInteger(process.env.PORT ?? '3000', 'PORT', 65535);
    const mode = process.env.INVENTORY_MODE ?? 'demo';
    const server = createServer({ mode, feedPath: process.env.INVENTORY_FILE });
    server.on('error', error => { console.error(error.message); process.exitCode = 1; });
    server.listen(port, '127.0.0.1', () => {
      console.log(`Seward Travel OTA real catalog dashboard: http://127.0.0.1:${port}`);
      console.log(`Legacy /api/availability uses ${mode === 'demo' ? 'SYNTHETIC DEMO DATA — no real inventory' : 'a local manual feed'}. Catalog observations are snapshots, not reservations.`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
