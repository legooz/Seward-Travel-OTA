import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { build } from 'esbuild';
import { VENUES, venueFromURL, analyticsURL, eventProperties } from '../public/venue-tracking.js';

const origin = 'https://seward.example';
const bundles = new Map();
const appSource = await readFile(new URL('../public/app.js', import.meta.url), 'utf8');

// Execute the real browser entry with the SDK replaced at its import boundary.
// No script injection, requests, or actual analytics events leave these tests.
async function analyticsRuntime({ enabled = true, navigator = {}, href = `${origin}/?venue=demo-venue`, failInject = false, failTrack = false } = {}) {
  if (!bundles.has(enabled)) {
    const result = await build({
      entryPoints: [fileURLToPath(new URL('../public/analytics.js', import.meta.url))],
      bundle: true, write: false, platform: 'browser', format: 'iife',
      define: { __SEWARD_ANALYTICS_ENABLED__: JSON.stringify(enabled), 'process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG': JSON.stringify('') },
      plugins: [{
        name: 'analytics-sdk-stub',
        setup(plugin) {
          plugin.onResolve({ filter: /^@vercel\/analytics$/ }, () => ({ path: 'sdk', namespace: 'analytics-test' }));
          plugin.onLoad({ filter: /.*/, namespace: 'analytics-test' }, () => ({ contents: 'export const inject = (...args) => globalThis.__sdk.inject(...args); export const track = (...args) => globalThis.__sdk.track(...args);', loader: 'js' }));
        },
      }],
    });
    bundles.set(enabled, result.outputFiles[0].text);
  }
  const events = [];
  const injections = [];
  const context = vm.createContext({
    URL, navigator, window: { location: { href } },
    __sdk: {
      inject(options) { injections.push(options); if (failInject) throw new Error('SDK unavailable'); },
      track(name, properties) { if (failTrack) throw new Error('SDK request failed'); events.push({ name, properties: structuredClone(properties) }); },
    },
  });
  new vm.Script(bundles.get(enabled)).runInContext(context, { timeout: 1000 });
  return { context, events, injections };
}

test('venue attribution accepts only configured placement codes', () => {
  assert.equal(Object.isFrozen(VENUES), true);
  for (const code of Object.keys(VENUES)) {
    assert.equal(venueFromURL(`${origin}/?venue=${encodeURIComponent(code)}&email=private%40example.com`), code);
  }
  for (const value of ['private@example.com', 'unconfigured-sign', '__proto__', 'constructor', 'VENUE-01', '', 'venue-01 extra']) {
    assert.equal(venueFromURL(`${origin}/?venue=${encodeURIComponent(value)}`), null);
  }
  for (const url of ['not a URL', '/?venue=venue-01', origin, `${origin}/?venue=unknown&venue=venue-01`]) {
    assert.equal(venueFromURL(url), null);
  }
});

test('analytics URLs remove credentials, paths, unrelated query data, and fragments', () => {
  assert.equal(analyticsURL('https://private:secret@seward.example/customer/private@example.com?venue=venue-01&email=private%40example.com&token=secret#private'), `${origin}/?venue=venue-01`);
  assert.equal(analyticsURL(`${origin}/private?venue=private%40example.com&search=phone-number#token`), `${origin}/`);
  assert.equal(analyticsURL(`${origin}/?venue=venue-02&venue=private%40example.com`), `${origin}/?venue=venue-02`);
  assert.throws(() => analyticsURL('not a URL'), TypeError);
});

test('valid events contain only a venue and at most one categorical property', () => {
  const cases = [
    ['qr_landing', undefined, { venue: 'venue-01' }],
    ...['lodging', 'tour', 'transportation', 'all'].map(category => ['category_select', category, { venue: 'venue-01', category }]),
    ['provider_click', 'harbor-360-hotel', { venue: 'venue-01', listingId: 'harbor-360-hotel' }],
    ['map_click', 'pjs-taxi-seward', { venue: 'venue-01', listingId: 'pjs-taxi-seward' }],
  ];
  for (const [name, value, expected] of cases) {
    const properties = eventProperties(name, value, 'venue-01');
    assert.deepEqual(properties, expected);
    assert.ok(Object.keys(properties).length <= 2);
    assert.ok(Object.values(properties).every(item => typeof item === 'string'));
  }
  assert.deepEqual(eventProperties('provider_click', 'hotel-seward', 'private@example.com'), { venue: 'unattributed', listingId: 'hotel-seward' });
});

test('invalid event names, categories, IDs, and QR placement codes are rejected', () => {
  for (const name of ['search', 'email', 'pageview', '', null, {}, '__proto__']) {
    assert.equal(eventProperties(name, 'hotel-seward', 'venue-01'), null);
  }
  for (const value of ['private@example.com', 'https://provider.example/?token=secret', '', '-leading', 'x'.repeat(102), 123, null, { email: 'private@example.com' }]) {
    assert.equal(eventProperties('provider_click', value, 'venue-01'), null);
    assert.equal(eventProperties('map_click', value, 'venue-01'), null);
  }
  assert.equal(eventProperties('category_select', 'private search text', 'venue-01'), null);
  for (const venue of [null, undefined, '', 'private@example.com', '__proto__']) assert.equal(eventProperties('qr_landing', undefined, venue), null);
});

test('disabled build, DNT, and GPC prevent SDK injection and all events', async () => {
  for (const options of [{ enabled: false }, { navigator: { doNotTrack: '1' } }, { navigator: { globalPrivacyControl: true } }]) {
    const runtime = await analyticsRuntime(options);
    assert.equal(runtime.injections.length, 0);
    assert.deepEqual(runtime.events, []);
    assert.equal(runtime.context.window.SewardAnalytics, undefined);
  }
});

test('enabled entry emits one allowlisted landing and sanitizes pageview/custom URLs', async () => {
  const runtime = await analyticsRuntime({ href: `${origin}/private?venue=venue-02&email=private%40example.com#secret` });
  assert.equal(runtime.injections.length, 1);
  assert.equal(runtime.injections[0].mode, 'production');
  assert.deepEqual(runtime.events, [{ name: 'qr_landing', properties: { venue: 'venue-02' } }]);
  const beforeSend = runtime.injections[0].beforeSend;
  for (const type of ['pageview', 'event']) {
    const event = { type, url: `${origin}/secret?venue=venue-02&token=private#hidden` };
    assert.equal(beforeSend(event).url, `${origin}/?venue=venue-02`);
    assert.equal(event.url.includes('token=private'), true, 'SDK input is not mutated');
  }
  assert.equal(beforeSend({ type: 'pageview', url: 'bad URL' }), null);
  runtime.context.window.SewardAnalytics.send('search', 'private@example.com');
  runtime.context.window.SewardAnalytics.send('provider_click', 'private@example.com');
  assert.equal(runtime.events.length, 1);
});

test('unknown query placement is omitted and subsequent actions are unattributed', async () => {
  const runtime = await analyticsRuntime({ href: `${origin}/?venue=private%40example.com&email=secret` });
  assert.deepEqual(runtime.events, []);
  runtime.context.window.SewardAnalytics.send('category_select', 'lodging');
  assert.deepEqual(runtime.events, [{ name: 'category_select', properties: { venue: 'unattributed', category: 'lodging' } }]);
});

class StubElement {
  constructor(tag = 'div') { this.tagName = tag; this.children = []; this.listeners = {}; this.dataset = {}; this.style = { setProperty() {} }; this.classList = { toggle() {} }; this.value = ''; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute() {}
  addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
  dispatch(name, event = {}) { for (const callback of this.listeners[name] ?? []) callback(event); }
  contains() { return false; }
  querySelector(selector) { return this.descendants().find(node => selector === 'a' ? node.tagName === 'a' : node.className?.split(' ').includes(selector.slice(1))) ?? null; }
  descendants() { return this.children.flatMap(node => node instanceof StubElement ? [node, ...node.descendants()] : []); }
}

function attachApp(context) {
  const nodes = new Map();
  const select = selector => { if (!nodes.has(selector)) nodes.set(selector, new StubElement()); return nodes.get(selector); };
  Object.assign(context, {
    document: { querySelector: select, querySelectorAll: () => [], createElement: tag => new StubElement(tag), createTextNode: text => text, activeElement: null },
    fetch: () => new Promise(() => {}), clearTimeout() {}, setTimeout() {},
  });
  new vm.Script(appSource).runInContext(context, { timeout: 1000 });
  return nodes;
}

test('real app click handlers send IDs only and never send search, map, or booking URLs', async () => {
  const runtime = await analyticsRuntime();
  const nodes = attachApp(runtime.context);
  runtime.events.length = 0;
  nodes.get('#search').dispatch('input', { target: { value: 'private@example.com' } });
  assert.deepEqual(runtime.events, []);
  runtime.context.chooseType('tour');
  const card = runtime.context.productCard({ id: 'hotel-seward', name: 'Hotel', listingType: 'lodging', sourceUrl: 'https://hotel.example/?token=secret', mapQuery: 'private map text' }, 0);
  card.querySelector('.map-link').dispatch('click');
  card.querySelector('.button').dispatch('click');
  assert.deepEqual(runtime.events, [
    { name: 'category_select', properties: { venue: 'demo-venue', category: 'tour' } },
    { name: 'map_click', properties: { venue: 'demo-venue', listingId: 'hotel-seward' } },
    { name: 'provider_click', properties: { venue: 'demo-venue', listingId: 'hotel-seward' } },
  ]);
  assert.ok(runtime.events.every(event => Object.keys(event.properties).length <= 2));
});

test('SDK injection or tracking failures leave category and link interactions usable', async () => {
  for (const options of [{ enabled: false }, { failInject: true }, { failTrack: true }]) {
    const runtime = await analyticsRuntime(options);
    const nodes = attachApp(runtime.context);
    nodes.get('#search').value = 'existing search';
    assert.doesNotThrow(() => runtime.context.chooseType('transportation'));
    assert.equal(vm.runInContext('state.type', runtime.context), 'transportation');
    assert.equal(nodes.get('#search').value, '');
    const card = runtime.context.productCard({ id: 'hotel-seward', name: 'Hotel', listingType: 'lodging', sourceUrl: 'https://hotel.example/', mapQuery: 'Seward Alaska' }, 0);
    assert.doesNotThrow(() => card.querySelector('.map-link').dispatch('click'));
    assert.doesNotThrow(() => card.querySelector('.button').dispatch('click'));
  }
});

test('document suppresses request referrers that could contain unsanitized query data', async () => {
  const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta\s+name=["']referrer["']\s+content=["']no-referrer["']\s*\/?\s*>/i);
});
