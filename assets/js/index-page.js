import {
  $,
  DATA_INDEX,
  FILTER_OPTIONS,
  card,
  escapeHtml,
  getJson,
  language,
  localized,
  siteUrl,
  t
} from './shared.js';

let indexItems = [];
let filterOptions = null;
let indexListenersBound = false;
const INDEX_STATE_KEY = 'wea-benchmark-index-state';

async function getBenchmarkIndex() {
  if (!indexItems.length) indexItems = await getJson(siteUrl(DATA_INDEX));
  return indexItems;
}

function saveIndexState() {
  try {
    sessionStorage.setItem(INDEX_STATE_KEY, JSON.stringify({
      filters: Object.fromEntries(['game-filter', 'gpu-filter', 'cpu-filter'].map(id => [id, $('#' + id).value])),
      scrollY: window.scrollY
    }));
  } catch {
    // Restoring the list is optional when browser storage is unavailable.
  }
}

function savedIndexState() {
  try {
    const state = JSON.parse(sessionStorage.getItem(INDEX_STATE_KEY) || 'null');
    return state && typeof state === 'object' ? state : null;
  } catch {
    return null;
  }
}

function restoreFilterValue(id, value) {
  const select = $('#' + id);
  if (typeof value === 'string' && Array.from(select.options).some(option => option.value === value)) select.value = value;
}

function filterOptionMarkup(option) {
  const value = typeof option === 'string' ? option : option.value;
  const label = typeof option === 'string' ? option : localized(option.label ?? option.value);
  return `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
}

function gameOptionsForCurrentLanguage(options = []) {
  const collator = new Intl.Collator(language === 'ja' ? 'ja' : 'en', {
    numeric: true,
    sensitivity: 'base'
  });
  return [...options].sort((a, b) => {
    const aLabel = typeof a === 'string' ? a : localized(a.label ?? a.value);
    const bLabel = typeof b === 'string' ? b : localized(b.label ?? b.value);
    return collator.compare(aLabel, bLabel);
  });
}

function populateFilter(id, options = []) {
  const select = $('#' + id);
  const selected = select.value;
  const displayedOptions = id === 'game-filter' ? gameOptionsForCurrentLanguage(options) : options;
  select.innerHTML = `<option value="">${escapeHtml(t('allOptions'))}</option>${displayedOptions.map(filterOptionMarkup).join('')}`;
  select.value = displayedOptions.some(option => (typeof option === 'string' ? option : option.value) === selected) ? selected : '';
}

function renderFilteredIndex() {
  const list = $('#benchmark-list');
  const terms = Object.fromEntries([['game-filter', 'game'], ['gpu-filter', 'gpu'], ['cpu-filter', 'cpu']].map(([id, key]) => [key, $('#' + id).value.trim().toLowerCase()]));
  const filtered = indexItems
    .filter(item => !terms.game || JSON.stringify(item.game).toLowerCase().includes(terms.game))
    .filter(item => !terms.gpu || item.system.gpu.toLowerCase().includes(terms.gpu))
    .filter(item => !terms.cpu || item.system.cpu.toLowerCase().includes(terms.cpu));
  const hasActiveFilters = Object.values(terms).some(Boolean);
  document.querySelector('.results-heading h2').textContent = t(hasActiveFilters ? 'searchResults' : 'latestBenchmarks');
  list.innerHTML = filtered.length ? filtered.map(card).join('') : `<p>${t('noResults')}</p>`;
  $('#result-count').textContent = `${filtered.length} ${t('results')}`;
}

async function renderIndex() {
  const list = $('#benchmark-list');
  try {
    if (!filterOptions) [indexItems, filterOptions] = await Promise.all([getBenchmarkIndex(), getJson(FILTER_OPTIONS)]);
    const state = savedIndexState();
    populateFilter('game-filter', filterOptions.games);
    populateFilter('gpu-filter', filterOptions.gpus);
    populateFilter('cpu-filter', filterOptions.cpus);
    if (state?.filters) {
      ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => restoreFilterValue(id, state.filters[id]));
      sessionStorage.removeItem(INDEX_STATE_KEY);
    }
    if (!indexListenersBound) {
      ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => $('#' + id).addEventListener('change', renderFilteredIndex));
      list.addEventListener('click', event => {
        if (event.target.closest('.benchmark-card')) saveIndexState();
      });
      $('#clear-filters').addEventListener('click', () => {
        ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => $('#' + id).value = '');
        renderFilteredIndex();
      });
      indexListenersBound = true;
    }
    renderFilteredIndex();
    if (Number.isFinite(state?.scrollY) && state.scrollY > 0) requestAnimationFrame(() => window.scrollTo(0, state.scrollY));
  } catch (e) {
    list.innerHTML = `<p class="error">${escapeHtml(e.message)}</p>`;
  }
}

function sameConfigurationBenchmarks(items, current) {
  return items
    .filter(item => item.id !== current.id
      && item.system.cpu === current.system.cpu
      && item.system.gpu === current.system.gpu)
    .sort((a, b) => String(b.testedAt).localeCompare(String(a.testedAt)) || a.id.localeCompare(b.id))
    .slice(0, 4);
}

function gameNames(value) {
  const names = typeof value === 'object' && value !== null ? Object.values(value) : [value];
  return new Set(names.map(name => String(name ?? '').trim().toLowerCase()).filter(Boolean));
}

function sameGameBenchmarks(items, current, excludedIds = []) {
  const currentGameNames = gameNames(current.game);
  const excluded = new Set([current.id, ...excludedIds]);
  return items
    .filter(item => !excluded.has(item.id)
      && [...gameNames(item.game)].some(name => currentGameNames.has(name)))
    .sort((a, b) => String(b.testedAt).localeCompare(String(a.testedAt)) || a.id.localeCompare(b.id))
    .slice(0, 4);
}

export {
  getBenchmarkIndex,
  renderIndex,
  sameConfigurationBenchmarks,
  sameGameBenchmarks
};

