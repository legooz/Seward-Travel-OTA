import { createDemoInventory, queryAvailability, readManualFeed } from './inventory.js';
import { InputError, parseDate, parsePositiveInteger, tomorrowInSeward } from './validation.js';

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: npm run demo -- [--date YYYY-MM-DD] [--party-size 1..100] [--feed local.json]');
    console.log('Without --feed, uses SYNTHETIC inventory. Date defaults to tomorrow in America/Anchorage.');
    return;
  }
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--date', '--party-size', '--feed'].includes(args[i]) || !args[i + 1] || options.has(args[i])) {
      throw new InputError(`invalid or repeated option: ${args[i]}`);
    }
    options.set(args[i], args[i + 1]);
  }
  const now = Date.now();
  const date = parseDate(options.get('--date') ?? tomorrowInSeward(now));
  const partySize = parsePositiveInteger(options.get('--party-size') ?? '1');
  const inventory = options.has('--feed') ? await readManualFeed(options.get('--feed'), now) : createDemoInventory(date, now, partySize);
  console.log(JSON.stringify(queryAvailability(inventory, date, partySize, now), null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
