const $ = selector => document.querySelector(selector);
const state = { products: [], type: 'lodging', category: 'all', platform: 'all', search: '', loading: true, refreshing: false, checking: new Set(), refreshedAt: null, capabilities: { refresh: false, calendar: false } };
const cards = $('#cards');
const dateInput = $('#travel-date');
const announcer = $('#announcer');
const platformSelect = $('#platform');
const expandedListings = new Set();
let expiryTimer;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function safeLink(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function link(text, url, className) {
  const href = safeLink(url);
  if (!href) return element('span', `${className ?? ''} unavailable-link`, 'Link unavailable');
  const node = element('a', className, text);
  node.href = href;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  node.setAttribute('aria-label', `${text} (opens a new tab)`);
  return node;
}

function formatTime(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not checked yet';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Anchorage', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value)) + ' AK';
}

function validDate(value) {
  const timestamp = Date.parse(`${value}T12:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}

function observationTimestamp(value) {
  const match = typeof value === 'string' && /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!match || !validDate(match[1]) || +match[2] > 23 || +match[3] > 59 || +match[4] > 59) return NaN;
  const offset = match[5];
  if (offset !== 'Z' && (+offset.slice(1, 3) > 14 || +offset.slice(4) > 59 || (+offset.slice(1, 3) === 14 && +offset.slice(4) !== 0))) return NaN;
  return Date.parse(value);
}

function formatDate(value) {
  if (!validDate(value)) return 'the selected date';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value}T12:00:00Z`));
}

function platformName(value) {
  if (String(value).toLowerCase() === 'fareharbor') return 'FareHarbor';
  if (!value || value === 'unknown' || value === 'direct') return 'Provider website';
  return String(value).replace(/[_-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function categoryName(value) {
  return String(value || 'Tours').replace(/[_-]/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function listingType(product) {
  return ['tour', 'lodging', 'transportation'].includes(product.listingType) ? product.listingType : 'tour';
}

function providerAction(product) {
  if (product.bookingAction === 'contact' || product.bookingMode === 'contact_operator') return 'Contact provider ↗';
  if (listingType(product) === 'lodging' || product.bookingAction === 'rates') return 'Check rates ↗';
  if (product.bookingAction === 'schedule') return 'View schedule ↗';
  if (listingType(product) === 'transportation') return 'Contact provider ↗';
  return 'Check with operator ↗';
}

function canReadCalendar(product) {
  return state.capabilities.calendar && listingType(product) === 'tour' && String(product.platform).toLowerCase() === 'fareharbor' && product.calendarSupported === true;
}

function chooseType(value, scroll = false) {
  window.SewardAnalytics?.send('category_select', value);
  state.type = value;
  state.category = 'all';
  state.platform = 'all';
  state.search = '';
  $('#search').value = '';
  if (!state.loading) { buildFilters(); render(); }
  if (scroll) $('#experiences').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

function showError(message) {
  const banner = $('#error-banner');
  banner.textContent = message || '';
  banner.classList.toggle('is-hidden', !message);
}

function updateControls() {
  $('#refresh-button').hidden = !state.capabilities.refresh;
  $('#refresh-button').disabled = state.loading || state.refreshing || state.checking.size > 0;
  $('#refresh-label').textContent = state.refreshing ? 'Reading source pages…' : 'Refresh source pages';
  $('#refresh-button').classList.toggle('is-loading', state.refreshing);
  cards.setAttribute('aria-busy', String(state.loading || state.refreshing));
}

async function request(path, options = {}) {
  const response = await fetch(path, { ...options, headers: { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  let body;
  try { body = await response.json(); } catch { throw new Error('The catalog service did not return a valid response.'); }
  if (!response.ok) throw new Error(body?.error?.message || body?.message || (typeof body?.error === 'string' ? body.error : `The request failed (HTTP ${response.status}).`));
  return body;
}

function readSnapshot(snapshot) {
  if (!snapshot || !Array.isArray(snapshot.products)) throw new Error('The catalog response is missing its product list.');
  state.products = snapshot.products.filter(product => product && typeof product.id === 'string' && typeof product.name === 'string');
  state.refreshedAt = snapshot.refreshedAt;
  state.capabilities = { refresh: snapshot.mode !== 'snapshot' && snapshot.capabilities?.refresh !== false, calendar: snapshot.mode !== 'snapshot' && snapshot.capabilities?.calendar !== false };
  $('.preview-label').hidden = snapshot.mode === 'snapshot';
  $('#catalog-notice').textContent = snapshot.notice || 'Published source observations are snapshots. Confirm current details and availability with the operator.';
  buildFilters();
}

function buildFilters() {
  const types = [...new Set(state.products.map(listingType))];
  if (!types.includes(state.type)) state.type = 'all';
  const typeContainer = $('#type-filters');
  typeContainer.replaceChildren();
  for (const [value, label] of [['lodging', 'Lodging'], ['tour', 'Activities'], ['transportation', 'Transport'], ['all', 'All listings']]) {
    if (value !== 'all' && !types.includes(value)) continue;
    const button = element('button', `filter-button${state.type === value ? ' is-selected' : ''}`, label);
    button.type = 'button';
    button.dataset.type = value;
    button.setAttribute('aria-pressed', String(state.type === value));
    button.addEventListener('click', () => chooseType(value));
    typeContainer.append(button);
  }
  const typeProducts = state.products.filter(product => state.type === 'all' || listingType(product) === state.type);
  const categories = [...new Set(typeProducts.map(product => product.category || 'Tours'))].sort();
  if (!categories.includes(state.category)) state.category = 'all';
  const container = $('#category-filters');
  container.replaceChildren();
  for (const [value, label] of [['all', 'All categories'], ...categories.map(category => [category, categoryName(category)])]) {
    const button = element('button', `filter-button${state.category === value ? ' is-selected' : ''}`, label);
    button.type = 'button';
    button.dataset.category = value;
    button.setAttribute('aria-pressed', String(state.category === value));
    button.addEventListener('click', () => {
      state.category = value;
      for (const sibling of container.children) {
        const selected = sibling.dataset.category === value;
        sibling.classList.toggle('is-selected', selected);
        sibling.setAttribute('aria-pressed', String(selected));
      }
      render();
    });
    container.append(button);
  }
  const platforms = [...new Set(typeProducts.map(product => product.platform || 'unknown'))].sort();
  if (!platforms.includes(state.platform)) state.platform = 'all';
  platformSelect.replaceChildren();
  for (const [value, label] of [['all', 'All platforms'], ...platforms.map(platform => [platform, platformName(platform)])]) {
    const option = element('option', '', label);
    option.value = value;
    platformSelect.append(option);
  }
  platformSelect.value = state.platform;
}

function calendarPanel(product) {
  const panel = element('section', 'availability-panel');
  panel.setAttribute('aria-label', `Calendar observations for ${product.name}`);
  if (!state.capabilities.calendar) {
    panel.append(element('h4', '', 'Choose your departure'), element('p', 'availability-message', 'Check dates, departure times, and current availability on the operator’s website.'));
    return panel;
  }
  const heading = element('div', 'availability-heading');
  heading.append(element('h4', '', 'Booking calendar'), element('span', 'calendar-date', formatDate(dateInput.value)));
  panel.append(heading);
  const observation = product.availability;
  const matchingDate = observation?.date === dateInput.value;
  const now = Date.now();
  const checkedAt = observationTimestamp(observation?.checkedAt);
  const expiresAt = observationTimestamp(observation?.expiresAt);
  const expired = Number.isFinite(expiresAt) && expiresAt <= now;
  const fresh = Number.isFinite(checkedAt) && Number.isFinite(expiresAt) && checkedAt <= now && expiresAt > checkedAt && expiresAt > now;
  if (state.checking.has(product.id)) {
    const busy = element('p', 'availability-message checking-message');
    busy.append(element('span', 'spinner'), document.createTextNode('Reading the public booking calendar…'));
    panel.append(busy);
  } else if (observation && matchingDate && expired) {
    panel.append(element('p', 'availability-message', 'This calendar observation has expired. Read the calendar again for a fresh count.'));
    panel.append(element('p', 'checked-label', `Previous check ${formatTime(observation.checkedAt)}`));
  } else if (observation && matchingDate && observation.status === 'observed') {
    const departures = Array.isArray(observation.departures) ? observation.departures : [];
    if (!departures.length) panel.append(element('p', 'availability-message', observation.message || 'No departure count was returned. Check with the operator for this date.'));
    else {
      const list = element('ul', 'departure-list');
      for (const departure of departures) {
        const row = element('li', 'departure-row');
        const title = element('div', 'departure-title');
        title.append(element('strong', '', departure.time || departure.label || 'Departure'));
        const detailLabel = departure.time && departure.label?.startsWith(departure.time) ? departure.label.slice(departure.time.length).trim() : departure.label;
        if (detailLabel && departure.time && detailLabel !== departure.time) title.append(element('span', 'departure-label', detailLabel));
        const exact = fresh && departure.unit === 'people' && Number.isSafeInteger(departure.remaining) && departure.remaining >= 0;
        const count = exact ? `${departure.remaining} ${departure.remaining === 1 ? 'person' : 'people'} remaining` : fresh ? 'Count not published' : 'Count unknown';
        row.append(title, element('span', `count-badge ${exact ? departure.remaining === 0 ? 'count-zero' : 'count-known' : 'count-unknown'}`, count));
        if (departure.evidenceText) {
          const detail = element('details', 'evidence-detail');
          detail.append(element('summary', '', 'View source wording'), element('p', '', departure.evidenceText));
          row.append(detail);
        }
        list.append(row);
      }
      panel.append(list);
      if (fresh && observation.message) panel.append(element('p', 'availability-message', observation.message));
    }
    if (!fresh) panel.append(element('p', 'availability-message', 'This observation has no verified freshness window. Read the calendar again before relying on a count.'));
    panel.append(element('p', 'checked-label', `Calendar checked ${formatTime(observation.checkedAt)}`));
  } else if (observation && matchingDate && observation.status === 'error') {
    panel.append(element('p', 'availability-message collection-error', observation.message || 'The booking calendar could not be read. Remaining capacity is unknown.'));
    if (observation.lastAttemptAt || observation.checkedAt) panel.append(element('p', 'checked-label', `Attempted ${formatTime(observation.lastAttemptAt || observation.checkedAt)}`));
  } else if (observation && matchingDate && observation.status === 'unsupported') {
    panel.append(element('p', 'availability-message', observation.message || 'This calendar does not expose a supported count. Check with the operator.'));
  } else if (observation?.date && !matchingDate) {
    panel.append(element('p', 'availability-message', `Last read for ${formatDate(observation.date)}. Read the calendar again for your selected date.`));
  } else {
    panel.append(element('p', 'availability-message', canReadCalendar(product) ? 'Remaining capacity has not been checked for this date.' : 'Calendar counts are not connected. Check availability directly with the operator.'));
  }
  if (canReadCalendar(product)) {
    const button = element('button', 'calendar-button', state.checking.has(product.id) ? 'Reading calendar…' : 'Read booking calendar');
    button.type = 'button';
    button.disabled = state.refreshing || state.loading || state.checking.has(product.id) || !validDate(dateInput.value);
    button.addEventListener('click', () => checkCalendar(product));
    panel.append(button);
  }
  return panel;
}

function servicePanel(product) {
  const panel = element('section', 'availability-panel service-panel');
  const lodging = listingType(product) === 'lodging';
  panel.setAttribute('aria-label', `Provider information for ${product.name}`);
  const heading = element('div', 'availability-heading');
  heading.append(element('h4', '', lodging ? 'Plan your stay' : product.serviceLabel || 'Transportation details'));
  panel.append(heading);
  if (product.serviceNotes) panel.append(element('p', 'availability-message', product.serviceNotes));
  panel.append(element('p', 'availability-message', lodging
    ? 'Choose stay dates, guests, and a room on the provider’s website. Room availability and a nightly rate have not been checked.'
    : product.bookingAction === 'contact' || product.bookingMode === 'contact_operator'
      ? 'Contact the provider for a quote and pickup arrangement. Availability has not been checked.'
      : 'Published schedules and fares are reference information. Confirm your travel date and seats with the provider.'));
  if (Array.isArray(product.sourceReferences) && product.sourceReferences.length) {
    const references = element('details', 'evidence-detail provider-references');
    references.append(element('summary', '', 'Provider details and booking links'));
    const list = element('ul', 'reference-list');
    for (const reference of product.sourceReferences) {
      if (!reference || !safeLink(reference.url)) continue;
      const item = element('li');
      item.append(link(reference.label || 'Provider source', reference.url, 'source-link'));
      list.append(item);
    }
    references.append(list);
    panel.append(references);
  }
  return panel;
}

function productCard(product, index) {
  const card = element('article', 'tour-card');
  card.dataset.listingType = listingType(product);
  card.dataset.productId = product.id;
  card.style.setProperty('--card-delay', `${Math.min(index, 8) * 35}ms`);
  const media = element('div', 'listing-photo');
  const imageUrl = safeLink(product.imageUrl);
  if (imageUrl) {
    const image = element('img');
    image.src = imageUrl;
    image.alt = product.imageAlt || product.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => { media.replaceChildren(element('span', 'photo-fallback', categoryName(product.category))); });
    media.append(image);
  } else media.append(element('span', 'photo-fallback', categoryName(product.category)));
  const copy = element('div', 'listing-copy');
  copy.append(element('p', 'activity-label', product.subcategory || categoryName(product.category)), element('h3', 'tour-name', product.name));
  if (product.operator !== product.name) copy.append(element('p', 'operator-name', product.operator || 'Local provider'));
  const location = element('p', 'location-text', product.locationLabel || product.locationText || 'Seward, Alaska');
  if (product.mapQuery) location.append(document.createTextNode(' · '), link('View map', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(product.mapQuery)}`, 'map-link'));
  location.querySelector('a')?.addEventListener('click', () => window.SewardAnalytics?.send('map_click', product.id));
  copy.append(location);
  if (product.description) copy.append(element('p', 'listing-description', product.description));
  const duration = product.durationLabel || product.durationText;
  if (listingType(product) !== 'lodging' && duration) copy.append(element('p', 'duration-text', duration));
  if (product.serviceNotes) copy.append(element('p', 'service-note', product.serviceNotes));
  const action = element('div', 'listing-action');
  action.append(element('p', 'price-text', product.priceText || (listingType(product) === 'lodging' ? 'Choose your stay dates' : listingType(product) === 'transportation' ? 'Ask for a quote' : 'See provider rates')));
  action.append(element('p', 'rate-context', listingType(product) === 'lodging' ? 'Rates vary by date and room' : product.priceText ? 'Published price · confirm with provider' : 'Arrange directly with provider'));
  const providerLink = link(providerAction(product), product.bookingUrl || product.sourceUrl, 'button button-dark');
  providerLink.addEventListener('click', () => window.SewardAnalytics?.send('provider_click', product.id));
  action.append(providerLink);
  const details = element('details', 'listing-details');
  details.open = expandedListings.has(product.id);
  details.addEventListener('toggle', () => {
    if (!details.isConnected) return;
    if (details.open) expandedListings.add(product.id);
    else expandedListings.delete(product.id);
  });
  details.append(element('summary', '', 'Details & booking information'));
  const body = element('div', 'listing-details-body');
  if (product.locationText) body.append(element('p', '', product.locationText));
  if (product.locationEvidence) body.append(element('p', '', product.locationEvidence));
  if (product.priceCaveat) {
    const priceDetails = element('details', 'price-caveat');
    priceDetails.append(element('summary', '', 'Price details'), element('p', '', product.priceCaveat));
    body.append(priceDetails);
  }
  if (listingType(product) !== 'lodging' && product.durationEvidence) {
    const durationDetails = element('details', 'price-caveat duration-caveat');
    durationDetails.append(element('summary', '', 'Timing details'), element('p', '', product.durationEvidence));
    body.append(durationDetails);
  }
  const source = element('div', 'source-line');
  const attemptedAt = product.lastAttemptAt || product.checkedAt;
  const sourceStatus = product.fetchStatus === 'error' ? `Source read failed${attemptedAt ? ` · ${formatTime(attemptedAt)}` : ''}`
    : product.checkedAt ? `${product.sourceMode === 'website-review' ? 'Website reviewed' : 'Source checked'} ${formatTime(product.checkedAt)}` : 'Source page not checked yet';
  source.append(element('span', `source-dot${product.fetchStatus === 'error' ? ' has-error' : product.fetchStatus !== 'ok' ? ' is-unknown' : ''}`), element('span', '', sourceStatus));
  body.append(source);
  if (product.fetchStatus === 'error') body.append(element('p', 'source-error', typeof product.error === 'string' ? product.error : product.error?.message || 'The source page could not be collected. Published details may be unavailable or from an earlier observation.'));
  if (product.fetchStatus === 'error' && product.checkedAt && product.lastAttemptAt && product.checkedAt !== product.lastAttemptAt) body.append(element('p', 'checked-label', `Published details last read ${formatTime(product.checkedAt)}`));
  body.append(listingType(product) === 'tour' ? calendarPanel(product) : servicePanel(product));
  const footer = element('div', 'card-footer');
  footer.append(link('View source ↗', product.sourceUrl, 'source-link'));
  if (product.imageSourceUrl) footer.append(link(`Photo: ${product.imageCredit || product.operator}`, product.imageSourceUrl, 'source-link'));
  body.append(footer);
  details.append(body);
  copy.append(details);
  card.append(media, copy, action);
  return card;
}

function render() {
  const focusedControl = document.activeElement;
  const focusedCard = cards.contains(focusedControl) ? focusedControl.closest('[data-product-id]') : null;
  const focusTarget = focusedCard && (focusedControl.matches('.calendar-button') ? 'calendar' : focusedControl.matches('.listing-details > summary') ? 'summary' : null);
  clearTimeout(expiryTimer);
  const upcomingExpiries = state.products.map(product => observationTimestamp(product.availability?.expiresAt)).filter(value => Number.isFinite(value) && value > Date.now());
  if (upcomingExpiries.length) expiryTimer = setTimeout(render, Math.min(Math.max(1, Math.min(...upcomingExpiries) - Date.now() + 20), 2147483647));
  updateControls();
  if (state.loading) return;
  const typeLabels = { lodging: 'Places to stay', tour: 'Activities in Seward', transportation: 'Getting here & around', all: 'Explore Seward' };
  $('#catalog-title').textContent = typeLabels[state.type];
  const tourControls = state.capabilities.calendar && (state.type === 'tour' || state.type === 'all');
  $('.date-field').hidden = !tourControls;
  $('#date-note').hidden = !tourControls;
  $('.search-bar').classList.toggle('without-calendar', !tourControls);
  const filtered = state.products.filter(product => {
    const words = `${product.name} ${product.operator || ''} ${product.category || ''} ${product.subcategory || ''} ${product.platform || ''} ${product.locationText || ''} ${product.serviceLabel || ''} ${product.description || ''}`.toLowerCase();
    return (!state.search || words.includes(state.search)) && (state.type === 'all' || listingType(product) === state.type) && (state.category === 'all' || (product.category || 'Tours') === state.category) && (state.platform === 'all' || (product.platform || 'unknown') === state.platform);
  });
  $('#results-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'listing' : 'listings'}${filtered.length !== state.products.length ? ` of ${state.products.length}` : ''}`;
  const operators = new Set(state.products.map(product => product.operator).filter(Boolean)).size;
  $('#catalog-status-text').textContent = state.refreshing ? 'Reading configured tour source pages. Other provider reviews retain their own dates.' : state.products.length ? `${operators} ${operators === 1 ? 'provider' : 'providers'} · Public source observations · ${state.refreshedAt ? `Tour source refresh ${formatTime(state.refreshedAt)}` : 'No refresh time reported'}` : 'No provider observations loaded';
  cards.replaceChildren();
  if (!filtered.length) {
    const empty = element('div', 'empty-state');
    empty.append(element('span', 'empty-mark', '↗'), element('h3', '', state.products.length ? 'No matching listings.' : 'Ready when the sources are.'), element('p', '', state.products.length ? 'Try another listing type, category, platform, or search term.' : 'Refresh the source pages to collect the configured tours. If collection fails, the error will appear here.'));
    if (state.products.length) {
      const reset = element('button', 'button button-outline', 'Clear filters');
      reset.type = 'button';
      reset.addEventListener('click', () => { state.search = ''; state.type = 'all'; state.category = 'all'; state.platform = 'all'; $('#search').value = ''; buildFilters(); render(); });
      empty.append(reset);
    }
    cards.append(empty);
  } else for (const [index, product] of filtered.entries()) cards.append(productCard(product, index));
  if (focusTarget) {
    const replacement = Array.from(cards.children).find(card => card.dataset.productId === focusedCard.dataset.productId);
    const calendarButton = focusTarget === 'calendar' ? replacement?.querySelector('.calendar-button:not(:disabled)') : null;
    (calendarButton || replacement?.querySelector('.listing-details > summary'))?.focus({ preventScroll: true });
  }
}

async function loadCatalog(refresh = false) {
  if (refresh && !state.capabilities.refresh) return;
  showError('');
  if (refresh) state.refreshing = true;
  updateControls();
  if (refresh) render();
  try {
    const snapshot = await request(refresh ? '/api/catalog/refresh' : '/api/catalog', refresh ? { method: 'POST', body: JSON.stringify({}) } : {});
    readSnapshot(snapshot);
    const errors = state.products.filter(product => product.fetchStatus === 'error').length;
    announcer.textContent = `${refresh ? 'Source refresh finished.' : 'Catalog loaded.'} ${state.products.length} listings.${errors ? ` ${errors} source pages could not be read.` : ''}`;
  } catch (error) {
    showError(`${refresh ? 'Source refresh failed.' : 'The catalog could not be loaded.'} ${error.message}${state.products.length ? ' The previous observations remain visible.' : ''}`);
    announcer.textContent = 'The catalog request failed. Details are shown above the listings.';
  } finally {
    state.loading = false;
    state.refreshing = false;
    render();
  }
}

async function checkCalendar(product) {
  const date = dateInput.value;
  if (!canReadCalendar(product) || !validDate(date) || state.checking.has(product.id)) return;
  expandedListings.add(product.id);
  state.checking.add(product.id);
  render();
  try {
    const result = await request('/api/calendar/check', { method: 'POST', body: JSON.stringify({ productId: product.id, date }) });
    if (result.productId !== product.id || !result.availability || result.availability.date !== date) throw new Error('The calendar response did not match the requested tour and date.');
    const current = state.products.find(item => item.id === product.id);
    if (current) current.availability = result.availability;
    announcer.textContent = `Calendar read finished for ${product.name}, ${formatDate(date)}.`;
  } catch (error) {
    const current = state.products.find(item => item.id === product.id);
    if (current) current.availability = { status: 'error', date, checkedAt: null, message: `Calendar read failed. ${error.message} Remaining capacity is unknown.`, departures: [] };
    announcer.textContent = `Calendar read failed for ${product.name}. Remaining capacity is unknown.`;
  } finally {
    state.checking.delete(product.id);
    render();
  }
}

$('#refresh-button').addEventListener('click', () => loadCatalog(true));
$('#search').addEventListener('input', event => { state.search = event.target.value.toLowerCase().trim(); render(); });
platformSelect.addEventListener('change', event => { state.platform = event.target.value; render(); });
dateInput.addEventListener('change', () => {
  const valid = validDate(dateInput.value);
  dateInput.setAttribute('aria-invalid', String(!valid));
  $('#date-note').textContent = valid ? 'This date applies only to supported tour calendars. Choose stay and transportation dates on the provider’s website.' : 'Enter a valid date to read a tour booking calendar.';
  render();
});
for (const button of document.querySelectorAll('[data-explore-type]')) button.addEventListener('click', () => chooseType(button.dataset.exploreType, true));
loadCatalog();
