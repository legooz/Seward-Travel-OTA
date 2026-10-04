import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretDeparture, calendarUrl, isCalendarNavigation } from '../src/calendar.js';

const product = { platform: 'fareharbor', providerCompany: 'kayakak', providerItemId: '122343', bookingUrl: 'https://fareharbor.com/embeds/book/kayakak/items/122343/?full-items=yes' };
const row = text => interpretDeparture({ id: '1', time: '8:00 AM', label: text, evidenceText: text });

test('calendar evidence uses only explicit remaining-person counts', () => {
  assert.equal(row('8:00 AM\nOnly 4 seats left').remaining, 4);
  assert.equal(row('8:00 AM\n0 spots available').remaining, 0);
  for (const text of ['8:00 AM\nAvailable', '6 passengers max', '14 passenger boat\nCall to book', 'Private tour\n6 seats remaining', '8:00 AM\n6 left', 'Sold out', '4 seats left\n5 seats left', '4 seats left\nSold out', '14 passenger boat\n2 tickets remaining', '8:00 AM\n2 tickets remaining']) {
    assert.equal(row(text).remaining, null, text);
  }
  assert.equal(row('8:00 AM\nAvailable').unit, 'unknown');
});

test('calendar navigation stays on the configured company and item, never checkout', () => {
  assert.equal(calendarUrl(product), 'https://fareharbor.com/embeds/book/kayakak/items/122343/calendar/?full-items=yes');
  assert.equal(isCalendarNavigation('https://fareharbor.com/embeds/book/kayakak/items/122343/calendar/2027/07/', product), true);
  for (const url of ['https://example.com/embeds/book/kayakak/items/122343/calendar/', 'https://fareharbor.com/embeds/book/kayakak/items/122343/availability/123/book/', 'https://fareharbor.com/embeds/book/other/items/122343/calendar/']) {
    assert.equal(isCalendarNavigation(url, product), false);
  }
  assert.throws(() => calendarUrl({ ...product, bookingUrl: 'https://example.com' }));
});
