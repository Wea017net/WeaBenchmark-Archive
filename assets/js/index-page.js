import {
  $,
  DATA_INDEX,
  FILTER_OPTIONS,
  card,
  escapeHtml,
  getJson,
  language,
  localized,
  setupRelatedCardLayout,
  siteUrl,
  t
} from './shared.js';

let indexItems = [];
let filterOptions = null;
let indexListenersBound = false;
let currentPage = 1;
let preferredViewMode = 'list';
let desktopViewMedia = null;
let viewPreferenceLoaded = false;
const INDEX_STATE_KEY = 'wea-benchmark-index-state';
const VIEW_MODE_KEY = 'wea-benchmark-view-mode';
const PAGE_SIZE = 20;

async function getBenchmarkIndex() {
  if (!indexItems.length) indexItems = await getJson(siteUrl(DATA_INDEX));
  return indexItems;
}

function saveIndexState() {
  try {
    sessionStorage.setItem(INDEX_STATE_KEY, JSON.stringify({
      filters: Object.fromEntries(['game-filter', 'gpu-filter', 'cpu-filter'].map(id => [id, $('#' + id).value])),
      page: currentPage,
      viewMode: preferredViewMode,
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

function loadViewPreference() {
  if (viewPreferenceLoaded) return;
  try {
    const savedViewMode = localStorage.getItem(VIEW_MODE_KEY);
    if (savedViewMode === 'list' || savedViewMode === 'grid') preferredViewMode = savedViewMode;
  } catch {
    // The list remains usable when browser storage is unavailable.
  }
  viewPreferenceLoaded = true;
}

function saveViewPreference() {
  try {
    localStorage.setItem(VIEW_MODE_KEY, preferredViewMode);
  } catch {
    // Remembering the view mode is optional when browser storage is unavailable.
  }
}

function activeViewMode() {
  return desktopViewMedia?.matches && preferredViewMode === 'grid' ? 'grid' : 'list';
}

function paginationMarkup(pageCount) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .map(page => `<button class="pagination-button${page === currentPage ? ' is-current' : ''}" type="button" data-page="${page}" aria-label="${escapeHtml(t('pageNumber')(page))}"${page === currentPage ? ' aria-current="page"' : ''}>${page}</button>`)
    .join('');
  return `<button class="pagination-button pagination-direction" type="button" data-page="${currentPage - 1}" aria-label="${escapeHtml(t('previousPage'))}"${currentPage === 1 ? ' disabled' : ''}><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button>${pages}<button class="pagination-button pagination-direction" type="button" data-page="${currentPage + 1}" aria-label="${escapeHtml(t('nextPage'))}"${currentPage === pageCount ? ' disabled' : ''}><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button>`;
}

function renderPagination(pageCount) {
  const hidden = pageCount <= 1;
  const markup = hidden ? '' : paginationMarkup(pageCount);
  ['pagination-top', 'pagination-bottom'].forEach(id => {
    const pagination = $('#' + id);
    pagination.hidden = hidden;
    pagination.innerHTML = markup;
  });
}

function updateViewButtons() {
  document.querySelectorAll('[data-view-mode]').forEach(button => {
    const active = button.dataset.viewMode === preferredViewMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderFilteredIndex({ scrollToTop = false } = {}) {
  const list = $('#benchmark-list');
  const terms = Object.fromEntries([['game-filter', 'game'], ['gpu-filter', 'gpu'], ['cpu-filter', 'cpu']].map(([id, key]) => [key, $('#' + id).value.trim().toLowerCase()]));
  const filtered = indexItems
    .filter(item => !terms.game || JSON.stringify(item.game).toLowerCase().includes(terms.game))
    .filter(item => !terms.gpu || item.system.gpu.toLowerCase().includes(terms.gpu))
    .filter(item => !terms.cpu || item.system.cpu.toLowerCase().includes(terms.cpu));
  const hasActiveFilters = Object.values(terms).some(Boolean);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1, currentPage), pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const gridView = activeViewMode() === 'grid' && pageItems.length > 0;
  document.querySelector('.results-heading h2').textContent = t(hasActiveFilters ? 'searchResults' : 'latestBenchmarks');
  list.classList.toggle('related-benchmark-grid', gridView);
  list.innerHTML = pageItems.length ? pageItems.map(card).join('') : `<p>${t('noResults')}</p>`;
  $('#result-count').textContent = pageCount > 1
    ? t('paginatedResults')(filtered.length, pageItems.length)
    : `${filtered.length} ${t('results')}`;
  renderPagination(pageCount);
  updateViewButtons();
  if (gridView) setupRelatedCardLayout();
  if (scrollToTop) requestAnimationFrame(() => document.querySelector('.results-heading').scrollIntoView({ block: 'start' }));
}

function handlePaginationClick(event) {
  const button = event.target.closest('[data-page]');
  if (!button || button.disabled) return;
  const requestedPage = Number.parseInt(button.dataset.page, 10);
  if (!Number.isInteger(requestedPage) || requestedPage === currentPage) return;
  currentPage = requestedPage;
  renderFilteredIndex({ scrollToTop: true });
}

function handleViewModeClick(event) {
  const button = event.target.closest('[data-view-mode]');
  if (!button || !desktopViewMedia?.matches) return;
  preferredViewMode = button.dataset.viewMode;
  saveViewPreference();
  renderFilteredIndex();
}

function resetPageAndRender() {
  currentPage = 1;
  renderFilteredIndex();
}

async function renderIndex() {
  const list = $('#benchmark-list');
  try {
    if (!filterOptions) [indexItems, filterOptions] = await Promise.all([getBenchmarkIndex(), getJson(FILTER_OPTIONS)]);
    loadViewPreference();
    if (!desktopViewMedia) desktopViewMedia = window.matchMedia('(min-width: 901px)');
    const state = savedIndexState();
    populateFilter('game-filter', filterOptions.games);
    populateFilter('gpu-filter', filterOptions.gpus);
    populateFilter('cpu-filter', filterOptions.cpus);
    if (state?.filters) {
      ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => restoreFilterValue(id, state.filters[id]));
      if (Number.isInteger(state.page) && state.page > 0) currentPage = state.page;
      if (state.viewMode === 'list' || state.viewMode === 'grid') preferredViewMode = state.viewMode;
      sessionStorage.removeItem(INDEX_STATE_KEY);
    }
    if (!indexListenersBound) {
      ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => $('#' + id).addEventListener('change', resetPageAndRender));
      list.addEventListener('click', event => {
        if (event.target.closest('.benchmark-card')) saveIndexState();
      });
      $('#clear-filters').addEventListener('click', () => {
        ['game-filter', 'gpu-filter', 'cpu-filter'].forEach(id => $('#' + id).value = '');
        resetPageAndRender();
      });
      document.querySelector('.view-toggle').addEventListener('click', handleViewModeClick);
      $('#pagination-top').addEventListener('click', handlePaginationClick);
      $('#pagination-bottom').addEventListener('click', handlePaginationClick);
      desktopViewMedia.addEventListener('change', () => renderFilteredIndex());
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

