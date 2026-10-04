import { readFile, mkdir, open } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { buildObservation } from './evidence.js';
import { scrapeFareHarbor } from './browser.js';

async function writeNew(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const file = await open(path, 'wx');
  try { await file.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8'); }
  finally { await file.close(); }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: npm run scrape -- (--fixture evidence.json | --config page.json) --out observation.json');
    console.log('Fixture mode is offline. Config mode opens one real page. Existing outputs are never overwritten.');
    return;
  }
  const options = new Map();
  for (let index = 0; index < args.length; index += 2) {
    if (!['--fixture', '--config', '--out'].includes(args[index]) || !args[index + 1] || options.has(args[index])) throw new Error('Invalid/repeated arguments; use --help');
    options.set(args[index], args[index + 1]);
  }
  if (options.has('--fixture') === options.has('--config') || !options.has('--out')) throw new Error('Choose exactly one of --fixture or --config, and supply --out');
  const fixture = options.has('--fixture');
  const input = JSON.parse(await readFile(options.get(fixture ? '--fixture' : '--config'), 'utf8'));
  const observation = fixture ? buildObservation(input) : await scrapeFareHarbor(input);
  const out = resolve(options.get('--out'));
  await writeNew(out, { mode: fixture ? 'offline_fixture' : 'live_page_observation', ...observation });
  console.log(`${fixture ? 'OFFLINE FIXTURE (synthetic; not live inventory)' : 'Page observation'} saved to ${out}`);
  console.log(`${observation.feed.availability.length} departures; ${observation.warnings.length} warnings. Review the evidence before importing the feed.`);
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
