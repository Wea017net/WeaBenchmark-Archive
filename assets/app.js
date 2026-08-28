const DATA_INDEX = 'data/benchmarks.json';
const FILTER_OPTIONS = 'data/filter-options.json';
const SITE_ROOT = new URL('../', import.meta.url);

const $ = (selector) => document.querySelector(selector);

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));


// Add future languages here. JSON fields can be a string or { ja: '', en: '' }.
const translations = {
  ja: {
    siteBrand: 'うぇあのゲームベンチまとめ',
    indexTitle: 'うぇあのゲームベンチまとめ',
    language: '言語',
    themeDark: 'ダーク',
    themeLight: 'ライト',
    switchToDark: 'ダークモードに切り替え',
    switchToLight: 'ライトモードに切り替え',
    heroTitle: 'ベンチマーク結果を<br>素早く簡単に確認',
    heroDescription: 'ベンチマーク専門チャンネル「WeaBenchmark」で投稿した検証結果を、検索可能なテキストデータとして公開しています。',
    searchLabel: 'ベンチマークを検索',
    game: 'ゲームで絞り込む',
    gpu: 'GPUで絞り込む',
    cpu: 'CPUで絞り込む',
    allOptions: 'すべて',
    gamePlaceholder: '例: フォートナイト',
    gpuPlaceholder: '例: RTX 5070',
    cpuPlaceholder: '例: Ryzen 7',
    clearFilters: '条件をクリア',
    latestBenchmarks: 'ベンチマーク一覧',
    searchResults: '検索結果',
    loading: 'データを読み込んでいます…',
    footer: '© Wea017net · ベンチマークデータは <a href="https://github.com/Wea017net/WeaBenchmark-Archive" target="_blank" rel="noopener">GitHub リポジトリ</a>で公開しています。',
    results: '件',
    today: '今日',
    daysAgo: (count) => `${count}日前`,
    monthsAgo: (count) => `${count}か月前`,
    yearsAgo: (count) => `${count}年前`,
    noResults: '条件に一致するベンチマークはありません。',
    dataError: 'データを取得できませんでした',
    idMissing: 'ベンチマークIDが指定されていません。',
    back: '一覧へ戻る',
    postToX: 'ポスト',
    copyLink: 'リンクをコピー',
    copied: 'コピーしました',
    testEnvironment: '検証環境',
    testConditions: '検証条件',
    pcModel: 'PCモデル',
    motherboard: 'マザーボード',
    memory: 'メモリ',
    version: 'バージョン',
    season: 'シーズン',
    gameVersion: 'ゲームバージョン · シーズン',
    method: '計測方法',
    video: '動画',
    watchVideo: 'YouTubeで見る',
    resultsTable: '測定結果',
    resolution: '解像度',
    upscaling: 'アップスケーリング',
    graphicsApi: 'グラフィックスAPI',
    graphicsApiValues: {
      'Rendering mode': 'レンダリングモード',
      Performance: 'パフォーマンス'
    },
    graphics: 'グラフィック設定',
    averageFps: '平均 FPS',
    lowFps: '1% Low FPS',
    notes: '備考'
  },
  en: {
    siteBrand: "Wea's Benchmark Archive",
    indexTitle: 'Wea\'s Benchmark Archive',
    language: 'Language',
    themeDark: 'Dark',
    themeLight: 'Light',
    switchToDark: 'Switch to dark mode',
    switchToLight: 'Switch to light mode',
    heroTitle: 'Check benchmark results<br>quickly and easily',
    heroDescription: 'Browse benchmark results from our videos as searchable, text-based data.',
    searchLabel: 'Search benchmarks',
    game: 'Game',
    gpu: 'GPU',
    cpu: 'CPU',
    allOptions: 'All',
    gamePlaceholder: 'e.g. Fortnite',
    gpuPlaceholder: 'e.g. RTX 5070',
    cpuPlaceholder: 'e.g. Ryzen 7',
    clearFilters: 'Clear filters',
    latestBenchmarks: 'Latest benchmarks',
    searchResults: 'Search results',
    loading: 'Loading data…',
    footer: '© Wea017net · Benchmark data is available in the <a href="https://github.com/Wea017net/WeaBenchmark-Archive" target="_blank" rel="noopener">GitHub repository</a>.',
    results: 'results',
    today: 'today',
    daysAgo: (count) => `${count} days ago`,
    monthsAgo: (count) => `${count} month${count === 1 ? '' : 's'} ago`,
    yearsAgo: (count) => `${count} year${count === 1 ? '' : 's'} ago`,
    noResults: 'No benchmarks match your filters.',
    dataError: 'Unable to load data.',
    idMissing: 'No benchmark ID was specified.',
    back: 'Back to benchmarks',
    postToX: 'Post',
    copyLink: 'Copy link',
    copied: 'Copied',
    testEnvironment: 'Test system',
    testConditions: 'Test conditions',
    pcModel: 'PC model',
    motherboard: 'Motherboard',
    memory: 'Memory',
    version: 'Version',
    season: 'Season',
    gameVersion: 'Game version / season',
    method: 'Method',
    video: 'Video',
    watchVideo: 'Watch on YouTube',
    resultsTable: 'Results',
    resolution: 'Resolution',
    upscaling: 'Upscaling',
    graphicsApi: 'Graphics API',
    graphicsApiValues: {},
    graphics: 'Graphics preset',
    averageFps: 'Average FPS',
    lowFps: '1% low FPS',
    notes: 'Notes'
  }
};

// Use Japanese only when the browser's primary language is Japanese.
// A language selected with the page switcher takes precedence on later visits.
const browserLanguage = (navigator.language || '').toLowerCase();
const browserDefaultLanguage = browserLanguage.startsWith('ja') ? 'ja' : 'en';
const savedLanguage = localStorage.getItem('language');
let language = translations[savedLanguage] ? savedLanguage : browserDefaultLanguage;

const t = (key) => translations[language][key] ?? translations.ja[key] ?? key;

const localized = (value) => typeof value === 'object' && value !== null ? value[language] ?? value.ja ?? value.en ?? '' : value;

const siteUrl = (path) => new URL(path, SITE_ROOT).href;

const benchmarkPath = (id) => siteUrl(`data/benchmarks/${String(id).split('/').map(encodeURIComponent).join('/')}.json`);

const benchmarkPagePath = (id) => siteUrl(`benchmarks/${String(id).split('/').map(encodeURIComponent).join('/')}.html`);

const memoryLabel = (memory) => typeof memory === 'string' ? memory : [memory?.frequency, memory?.capacity].filter(Boolean).join(' / ');

const formatDate = (value) => {
  if (language !== 'en') return String(value).replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1/$2/$3');
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

const relativeDate = (value) => {
  const [year, month, day] = String(value).split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) return '';
  const published = new Date(Date.UTC(year, month - 1, day));
  const now = new Date();
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const days = Math.floor((today - published) / 86_400_000);
  if (days < 0) return '';
  if (days === 0) return t('today');
  let months = (today.getUTCFullYear() - published.getUTCFullYear()) * 12 + today.getUTCMonth() - published.getUTCMonth();
  if (today.getUTCDate() < published.getUTCDate()) months--;
  if (months >= 12) return t('yearsAgo')(Math.floor(months / 12));
  if (months >= 1) return t('monthsAgo')(months);
  return t('daysAgo')(days);
};

const formatIndexDate = (value) => {
  const relative = relativeDate(value);
  if (!relative) return formatDate(value);
  return `${formatDate(value)} · ${relative}`;
};

const versionSeasonLabel = (version, season) => [localized(version), localized(season)].filter(Boolean).join(' · ');

const versionSeasonDetails = (version, season) => {
  const versionValue = localized(version);
  const seasonValue = localized(season);
  if (versionValue && seasonValue) {
    return `<div class="version-season-pair"><div><dt>${t('version')}</dt><dd>${escapeHtml(versionValue)}</dd></div><div><dt>${t('season')}</dt><dd>${escapeHtml(seasonValue)}</dd></div></div>`;
  }
  return versionValue ? `<dt>${t('version')}</dt><dd>${escapeHtml(versionValue)}</dd>` : seasonValue ? `<dt>${t('season')}</dt><dd>${escapeHtml(seasonValue)}</dd>` : '';
};

const graphicsApiText = (value) => {
  const englishValue = typeof value === 'object' && value !== null ? value.en ?? value.ja ?? '' : value;
  return translations[language].graphicsApiValues?.[englishValue] ?? englishValue;
};

function youtubeEmbedUrl(videoUrl) {
  if (!videoUrl) return '';
  try {
    const url = new URL(videoUrl);
    let videoId = '';
    if (url.hostname === 'youtu.be') videoId = url.pathname.slice(1);
    else if (url.hostname.endsWith('youtube.com')) {
      videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/?]+)/)?.[1] || '';
    }
    return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube-nocookie.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
}

const youtubePlayer = (videoUrl) => {
  const embedUrl = youtubeEmbedUrl(videoUrl);
  return embedUrl ? `<iframe class="youtube-player" src="${embedUrl}" title="YouTube video player" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` : '—';
};


function applyTranslations() {
  document.documentElement.lang = language;
  if ($('#benchmark-list')) document.title = t('indexTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => el.innerHTML = t(el.dataset.i18n));
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => el.placeholder = t(el.dataset.i18nPlaceholder));
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)));
  const languageSwitcher = $('#language-switcher');
  languageSwitcher.value = language;
  $('.language-current').textContent = languageSwitcher.selectedOptions[0].textContent;
  updateThemeLabel();
}

function setupLanguage() {
  $('#language-switcher').addEventListener('change', event => {
    language = event.target.value;
    localStorage.setItem('language', language);
    applyTranslations();
    if ($('#benchmark-list')) renderIndex();
    else renderDetail();
  });
}

function updateThemeLabel() {
  const button = $('.theme-toggle'), dark = document.documentElement.dataset.theme === 'dark';
  button.querySelector('.material-symbols-outlined').textContent = dark ? 'light_mode' : 'dark_mode';
  button.querySelector('span:last-child').textContent = dark ? t('themeLight') : t('themeDark');
  button.setAttribute('aria-label', dark ? t('switchToLight') : t('switchToDark'));
}

function setupTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('theme');
  const hasSavedTheme = savedTheme === 'dark' || savedTheme === 'light';
  const systemPrefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = hasSavedTheme
    ? (savedTheme === 'dark' ? 'dark' : '')
    : (systemPrefersDark ? 'dark' : '');
  updateThemeLabel();
  $('.theme-toggle').addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    root.dataset.theme = dark ? 'dark' : '';
    updateThemeLabel();
  });
}

async function getJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(t('dataError'));
  return response.json();
}

function vendorClass(component, type) {
  const v = String(component || '').toLowerCase();
  if (/nvidia|geforce|rtx|gtx/.test(v)) return 'tag-nvidia';
  if (v.includes('radeon')) return 'tag-radeon';
  if (v.includes('ryzen')) return 'tag-ryzen';
  if (type === 'gpu' && v.includes('intel arc')) return 'tag-intel-arc';
  if (/intel|core /.test(v)) return 'tag-intel';
  return `tag-${type}`;
}

function card(item) {
  const gameDetail = localized(item.season) || localized(item.version);
  return `<a class="benchmark-card" href="${benchmarkPagePath(item.id)}"><div class="card-top"><h3>${escapeHtml(localized(item.game))}${gameDetail ? ` <span class="card-game-detail">· ${escapeHtml(gameDetail)}</span>` : ''}</h3><span class="date">${escapeHtml(formatIndexDate(item.testedAt))}</span></div><div class="specs"><span class="tag ${vendorClass(item.system.gpu, 'gpu')}">${escapeHtml(item.system.gpu)}</span><span class="tag ${vendorClass(item.system.cpu, 'cpu')}">${escapeHtml(item.system.cpu)}</span></div><p class="meta">${escapeHtml(localized(item.summary))}</p></a>`;
}

let indexItems = [];
let filterOptions = null;
let indexListenersBound = false;
const INDEX_STATE_KEY = 'wea-benchmark-index-state';

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
    if (!filterOptions) [indexItems, filterOptions] = await Promise.all([getJson(DATA_INDEX), getJson(FILTER_OPTIONS)]);
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

function upscalingLabel(result) {
  return [result.upscalingType, result.upscalingQuality].filter(Boolean).join(' ') || '—';
}

function upscalingClass(result) {
  const type = String(result.upscalingType || '').toLowerCase();
  if (type.includes('dlss')) return 'upscaling-dlss';
  if (type.includes('fsr')) return 'upscaling-fsr';
  if (type.includes('xess')) return 'upscaling-xess';
  return '';
}

function resultRows(results, display) {
  return results.map(r => `<tr><td>${escapeHtml(r.resolutionX)} × ${escapeHtml(r.resolutionY)}</td>${display.showUpscaling ? `<td class="${upscalingClass(r)}">${escapeHtml(upscalingLabel(r))}</td>` : ''}${display.showGraphicsApi ? `<td>${escapeHtml(graphicsApiText(r.graphicsApi) || '—')}</td>` : ''}<td>${escapeHtml(localized(r.preset))}</td><td>${escapeHtml(r.averageFps)}</td><td>${escapeHtml(r.onePercentLowFps)}</td></tr>`).join('');
}

async function copyCurrentUrl() {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(location.href);
    return;
  }
  const temporaryInput = document.createElement('textarea');
  temporaryInput.value = location.href;
  temporaryInput.style.position = 'fixed';
  temporaryInput.style.opacity = '0';
  document.body.append(temporaryInput);
  temporaryInput.select();
  document.execCommand('copy');
  temporaryInput.remove();
}

function setupCopyLink() {
  const button = $('#copy-link');
  let resetTimer;
  button.addEventListener('click', async () => {
    try {
      await copyCurrentUrl();
      const label = button.querySelector('.copy-label');
      const icon = button.querySelector('.copy-icon');
      clearTimeout(resetTimer);
      label.textContent = t('copied');
      icon.textContent = 'check';
      button.setAttribute('aria-label', t('copied'));
      resetTimer = setTimeout(() => {
        label.textContent = t('copyLink');
        icon.textContent = 'link';
        button.setAttribute('aria-label', t('copyLink'));
      }, 2000);
    } catch {
      // Browsers may block clipboard access outside a secure context.
    }
  });
}

function setDetailSearchMetadata(id, data, game, cpu, gpu) {
  const canonicalUrl = new URL(benchmarkPagePath(id));
  const description = language === 'en'
    ? `${game} benchmark results on ${cpu} and ${gpu}, including graphics settings, average FPS, and 1% low FPS.`
    : `${cpu} と ${gpu} で実施した ${game} のベンチマーク結果。グラフィック設定、平均 FPS、1% Low FPS を掲載。`;
  let descriptionTag = document.querySelector('meta[name="description"]');
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta');
    descriptionTag.name = 'description';
    document.head.append(descriptionTag);
  }
  descriptionTag.content = description;
  let canonicalTag = document.querySelector('link[rel="canonical"]');
  if (!canonicalTag) {
    canonicalTag = document.createElement('link');
    canonicalTag.rel = 'canonical';
    document.head.append(canonicalTag);
  }
  canonicalTag.href = canonicalUrl.href;
  let structuredData = document.querySelector('#benchmark-structured-data');
  if (!structuredData) {
    structuredData = document.createElement('script');
    structuredData.id = 'benchmark-structured-data';
    structuredData.type = 'application/ld+json';
    document.head.append(structuredData);
  }
  structuredData.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: document.title,
    description,
    url: canonicalUrl.href,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    creator: { '@type': 'Organization', name: 'WeaBenchmark' },
    dateCreated: data.testedAt,
    variableMeasured: ['Average FPS', '1% low FPS']
  });
}

async function renderDetail() {
  const target = $('#benchmark-detail');
  const generatedPageId = document.body.dataset.benchmarkId;
  const id = generatedPageId || new URLSearchParams(location.search).get('id');
  if (!id) {
    target.innerHTML = `<p class="error">${t('idMissing')}</p>`;
    return;
  }
  if (!generatedPageId) {
    document.body.dataset.benchmarkId = id;
    history.replaceState(null, '', benchmarkPagePath(id));
  }
  try {
    const d = await getJson(benchmarkPath(id)), game = localized(d.game), driver = String(d.system.gpuDriver || '').match(/[0-9]+(?:\.[0-9]+)+/)?.[0] || '', versionSeason = versionSeasonLabel(d.version, d.season), display = d.display;
    const cpuShortName = d.system.cpuShortName || d.system.cpu;
    const gpuShortName = d.system.gpuShortName || d.system.gpu;
    const graphicsCardName = d.system.graphicsCardName || d.system.gpu;
    document.title = language === 'en'
      ? `${cpuShortName} + ${gpuShortName} — ${game} benchmark results | Wea's Benchmark Archives`
      : `${cpuShortName} + ${gpuShortName} で ${game} 検証結果 | うぇあのゲームベンチまとめ`;
    setDetailSearchMetadata(id, d, game, cpuShortName, gpuShortName);
    const xPostUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${document.title}\n${location.href}\n\n#WeaBenchmark\n@Wea017net `)}`;
    target.innerHTML = `
      <div class="detail-actions">
        <a class="back-button" href="${siteUrl('index.html')}" aria-label="${t('back')}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span><span class="action-label">${t('back')}</span></a>
        <div class="detail-share-actions">
          <a class="post-to-x" href="${xPostUrl}" target="_blank" rel="noopener" aria-label="${t('postToX')}"><img class="x-logo" src="${siteUrl('assets/x-logo.svg')}" alt=""><span class="action-label">${t('postToX')}</span></a>
          <button class="copy-link" id="copy-link" type="button" aria-label="${t('copyLink')}"><span class="material-symbols-outlined copy-icon" aria-hidden="true">link</span><span class="copy-label action-label">${t('copyLink')}</span></button>
        </div>
      </div>
      <p class="eyebrow detail-eyebrow">BENCHMARK RESULT</p>
      <h1>${escapeHtml(game)}</h1>
      <p class="lead">${[formatDate(d.testedAt), versionSeason].filter(Boolean).map(escapeHtml).join(' · ')}</p>
      <div class="detail-grid">
        <section class="info-box">
          <h2>${t('testEnvironment')}</h2>
          <dl>
            ${d.system.pcModel ? `<dt>${t('pcModel')}</dt><dd>${escapeHtml(d.system.pcModel)}</dd>` : ''}
            <dt>CPU</dt><dd class="component-name ${vendorClass(d.system.cpu, 'cpu')}">${escapeHtml(d.system.cpu)}</dd>
            <dt>GPU</dt><dd class="component-name ${vendorClass(d.system.gpu, 'gpu')}">${escapeHtml(graphicsCardName)}${driver ? ` <small class="driver-version">/ ${escapeHtml(driver)}</small>` : ''}</dd>
            ${d.system.motherboard ? `<dt>${t('motherboard')}</dt><dd>${escapeHtml(d.system.motherboard)}</dd>` : ''}
            <dt>${t('memory')}</dt><dd>${escapeHtml(memoryLabel(d.system.memory))}</dd>
            <dt>OS</dt><dd>${escapeHtml(d.system.os)}</dd>
          </dl>
        </section>
        <section class="info-box">
          <h2>${t('testConditions')}</h2>
          <dl>
            ${versionSeasonDetails(d.version, d.season)}
            <dt>${t('method')}</dt><dd>${escapeHtml(localized(d.method))}</dd>
            <dt class="video-label">${t('video')}</dt><dd>${youtubePlayer(d.videoUrl)}</dd>
          </dl>
        </section>
      </div>
      <section class="table-wrap">
        <h2>${t('resultsTable')}</h2>
        <table>
          <thead><tr><th>${t('resolution')}</th>${display.showUpscaling ? `<th>${t('upscaling')}</th>` : ''}${display.showGraphicsApi ? `<th>${escapeHtml(graphicsApiText(display.graphicsApiLabel) || t('graphicsApi'))}</th>` : ''}<th>${t('graphics')}</th><th>${t('averageFps')}</th><th>${t('lowFps')}</th></tr></thead>
          <tbody>${resultRows(d.results, display)}</tbody>
        </table>
      </section>
      <section class="info-box">
        <h2>${t('notes')}</h2>
        <p class="note">${escapeHtml(localized(d.notes) || '—')}</p>
      </section>
      <div class="detail-actions detail-actions-bottom">
        <a class="back-button" href="${siteUrl('index.html')}" aria-label="${t('back')}"><span class="material-symbols-outlined" aria-hidden="true">arrow_back</span><span class="action-label">${t('back')}</span></a>
      </div>`;
    setupCopyLink();
  } catch (e) {
    target.innerHTML = `<p class="error">${escapeHtml(e.message)}</p>`;
  }
}

setupTheme();

setupLanguage();

applyTranslations();

if ($('#benchmark-list')) renderIndex();
else renderDetail();
