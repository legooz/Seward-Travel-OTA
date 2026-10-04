import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { createDemoInventory, queryAvailability, readManualFeed } from './inventory.js';
import { InputError, TIME_ZONE, parseDate, parsePositiveInteger, tomorrowInSeward } from './validation.js';

export function createServer({ mode = 'demo', feedPath, clock = Date.now } = {}) {
  if (!['demo', 'manual'].includes(mode)) throw new InputError('INVENTORY_MODE must be demo or manual');
  if (mode === 'manual' && !feedPath) throw new InputError('manual mode requires INVENTORY_FILE');
  return http.createServer(async (request, response) => {
    const send = (code, body, extra = {}) => {
      response.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra,
      });
      response.end(JSON.stringify(body, null, 2));
    };
    try {
      if (request.method !== 'GET') return send(405, { error: { code: 'method_not_allowed', message: 'Only GET is supported' } }, { Allow: 'GET' });
      const url = new URL(request.url, 'http://127.0.0.1');
      if (!['/health', '/api/products', '/api/availability'].includes(url.pathname)) {
        return send(404, { error: { code: 'not_found', message: 'Unknown endpoint' } });
      }
      const allowed = url.pathname === '/api/availability' ? ['date', 'partySize'] : [];
      for (const key of url.searchParams.keys()) {
        if (!allowed.includes(key) || url.searchParams.getAll(key).length !== 1) throw new InputError(`unsupported or repeated query parameter: ${key}`);
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
      console.log(`Seward Travel OTA listening at http://127.0.0.1:${port} (${mode === 'demo' ? 'SYNTHETIC DEMO — no real inventory' : 'local manual feed'})`);
      console.log(`Try /api/availability?date=${tomorrowInSeward()}&partySize=2`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
