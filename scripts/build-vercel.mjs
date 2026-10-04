import { copyFile, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Bundle browser analytics only; this deployment never imports collectors.
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = resolve(root, 'dist');
const analyticsEnabled = process.env.VERCEL_ENV === 'production' && process.env.SEWARD_ANALYTICS_ENABLED === 'true';
const source = JSON.parse(await readFile(join(root, 'data', 'catalog.json'), 'utf8'));
if (!Array.isArray(source.products) || !source.products.length || source.products.length > 100) {
  throw new Error('Expected a saved catalog containing 1–100 listings.');
}
const ids = new Set();
const products = source.products.map(product => {
  if (!product || typeof product.id !== 'string' || !product.id || ids.has(product.id)) {
    throw new Error('Catalog contains a missing or duplicate listing ID.');
  }
  ids.add(product.id);
  const { availability, ...saved } = product;
  return { ...saved, calendarSupported: false };
});
const catalog = {
  ...source,
  products,
  mode: 'snapshot',
  capabilities: { refresh: false, calendar: false },
  notice: 'Saved provider information. Check current rates, schedules, and availability with each provider.',
};

// Only replace this repository's generated dist directory; reject linked paths.
if (dirname(output) !== root) throw new Error('Unsafe build output path.');
const existing = await lstat(output).catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return null;
});
if (existing && (!existing.isDirectory() || existing.isSymbolicLink() || await realpath(output) !== output)) {
  throw new Error('Build output must be a regular directory inside this repository.');
}
await rm(output, { recursive: true, force: true });

async function copyPublic(from, to) {
  const info = await lstat(from);
  if (info.isSymbolicLink()) throw new Error(`Public assets must not be symbolic links: ${from}`);
  if (info.isDirectory()) {
    await mkdir(to, { recursive: true });
    for (const entry of await readdir(from)) await copyPublic(join(from, entry), join(to, entry));
  } else if (info.isFile()) {
    await copyFile(from, to);
  } else {
    throw new Error(`Unsupported public asset: ${from}`);
  }
}

await copyPublic(join(root, 'public'), output);
await mkdir(join(output, 'data'), { recursive: true });
await writeFile(join(output, 'data', 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');
await build({
  entryPoints: [join(root, 'public', 'analytics.js')],
  outfile: join(output, 'analytics.js'),
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: 'es2020',
  minify: true,
  sourcemap: false,
  legalComments: 'none',
  define: {
    __SEWARD_ANALYTICS_ENABLED__: JSON.stringify(analyticsEnabled),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG': JSON.stringify(process.env.VERCEL_OBSERVABILITY_CLIENT_CONFIG || ''),
  },
});
const indexPath = join(output, 'index.html');
const html = await readFile(indexPath, 'utf8');
const appScript = /<script\b[^>]*\bsrc=["']\/app\.js["'][^>]*>\s*<\/script>/gi;
if ([...html.matchAll(appScript)].length !== 1 || /<script\b[^>]*\bsrc=["']\/analytics\.js["']/i.test(html)) {
  throw new Error('Expected one app.js script and no analytics script in the source HTML.');
}
await writeFile(indexPath, html.replace(appScript, '$&\n  <script defer src="/analytics.js"></script>'));
console.log(`Built ${products.length} saved listings in dist/. Analytics ${analyticsEnabled ? 'enabled for production' : 'disabled'}. No live collector was run.`);
