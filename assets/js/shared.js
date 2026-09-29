const DATA_INDEX = 'data/benchmarks.json';
const FILTER_OPTIONS = 'data/filter-options.json';
const RESOLUTION_LABELS = 'data/resolutions.json';
const SITE_ROOT = new URL('../../', import.meta.url);

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
    heroTitle: 'うぇあのゲームベンチまとめ',
    heroDescription: 'YouTubeチャンネル「WeaBenchmark」で検証した測定結果を<br>ゲーム・GPU・CPUから検索できます。',
    heroStats: '収録データ概要',
    heroDataLabel: 'データ総数',
    heroGamesLabel: '検証ゲーム',
    heroDataUnit: '件',
    heroGamesUnit: 'タイトル',
    heroComponentUnit: '種類',
    youtubeChannel: 'YouTubeチャンネル',
    youtubeChannelDescription: '動画で測定内容を見る',
    openYoutubeChannel: 'WeaBenchmarkのYouTubeチャンネルを開く',
    searchLabel: 'ベンチマークを検索',
    game: 'ゲームで絞り込む',
    gpu: 'GPUで絞り込む',
    cpu: 'CPUで絞り込む',
    allOptions: 'すべて',
    gamePlaceholder: '例: フォートナイト',
    gpuPlaceholder: '例: RTX 4070 SUPER',
    cpuPlaceholder: '例: Ryzen 7',
    clearFilters: '条件をクリア',
    latestBenchmarks: 'ベンチマーク一覧',
    searchResults: '検索結果',
    viewMode: '表示形式',
    listView: 'リスト表示',
    gridView: 'グリッド表示',
    pagination: 'ページ切り替え',
    previousPage: '前のページ',
    nextPage: '次のページ',
    pageNumber: (page) => `${page}ページ目`,
    loading: 'データを読み込んでいます…',
    footer: '© Wea017net · ベンチマークデータは <a href="https://github.com/Wea017net/WeaBenchmark-Archive" target="_blank" rel="noopener">GitHub リポジトリ</a>で公開しています。',
    results: '件',
    paginatedResults: (total, visible) => `${total} 件中 ${visible} 件`,
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
    resultsDescription: '各条件の平均 FPS と 1% Low FPS を、この測定内の最高値を基準に比較しています。',
    testPattern: '測定パターン',
    peakAverage: '最高平均 FPS',
    peakLow: '最高 1% Low',
    frameGenerationNote: '※フレーム生成時',
    conditions: '測定条件',
    frameRate: 'フレームレート',
    averageShort: '平均',
    lowShort: '1% Low',
    sameConfiguration: (count) => `同じ構成のベンチマーク（最新 ${count} 件を表示）`,
    noSameConfiguration: '同じ構成のベンチマークはありません。',
    otherGameBenchmarks: (game, count) => `${game} の他のベンチマーク（最新 ${count} 件を表示）`,
    noOtherGameBenchmarks: (game) => `${game} の他のベンチマークはありません。`,
    gameMode: 'ゲームモード',
    resolution: '解像度',
    upscaling: 'アップスケーリング',
    frameGeneration: 'フレーム生成',
    graphicsApi: 'グラフィックスAPI',
    notSpecified: '指定なし',
    resultGroup: (index, count) => `グループ ${index} · ${count}件`,
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
    heroTitle: "Wea's Benchmark Archive",
    heroDescription: 'Search real-world test results from the WeaBenchmark YouTube channel by game, GPU, or CPU.',
    heroStats: 'Archive statistics',
    heroDataLabel: 'Data',
    heroGamesLabel: 'Games',
    heroDataUnit: '',
    heroGamesUnit: '',
    heroComponentUnit: '',
    youtubeChannel: 'YouTube channel',
    youtubeChannelDescription: 'Watch the benchmark videos',
    openYoutubeChannel: 'Open the WeaBenchmark YouTube channel',
    searchLabel: 'Search benchmarks',
    game: 'Game',
    gpu: 'GPU',
    cpu: 'CPU',
    allOptions: 'All',
    gamePlaceholder: 'e.g. Fortnite',
    gpuPlaceholder: 'e.g. RTX 4070 SUPER',
    cpuPlaceholder: 'e.g. Ryzen 7',
    clearFilters: 'Clear filters',
    latestBenchmarks: 'Latest benchmarks',
    searchResults: 'Search results',
    viewMode: 'View layout',
    listView: 'List view',
    gridView: 'Grid view',
    pagination: 'Pagination',
    previousPage: 'Previous page',
    nextPage: 'Next page',
    pageNumber: (page) => `Page ${page}`,
    loading: 'Loading data…',
    footer: '© Wea017net · Benchmark data is available in the <a href="https://github.com/Wea017net/WeaBenchmark-Archive" target="_blank" rel="noopener">GitHub repository</a>.',
    results: 'results',
    paginatedResults: (total, visible) => `${visible} of ${total} results`,
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
    resultsDescription: 'Average and 1% low FPS are compared against the highest result in this test.',
    testPattern: 'Test cases',
    peakAverage: 'Peak average',
    peakLow: 'Peak 1% low',
    frameGenerationNote: '*With frame gen',
    conditions: 'Test conditions',
    frameRate: 'Frame rate',
    averageShort: 'Average',
    lowShort: '1% low',
    sameConfiguration: (count) => `Benchmarks with the same configuration (showing the latest ${count})`,
    noSameConfiguration: 'No other benchmarks use the same configuration.',
    otherGameBenchmarks: (game, count) => `Other ${game} benchmarks (showing the latest ${count})`,
    noOtherGameBenchmarks: (game) => `No other ${game} benchmarks are available.`,
    gameMode: 'Game mode',
    resolution: 'Resolution',
    upscaling: 'Upscaling',
    frameGeneration: 'Frame generation',
    graphicsApi: 'Graphics API',
    notSpecified: 'Not specified',
    resultGroup: (index, count) => `Group ${index} · ${count} results`,
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

function setupLanguage(renderPage) {
  $('#language-switcher').addEventListener('change', event => {
    language = event.target.value;
    localStorage.setItem('language', language);
    applyTranslations();
    renderPage();
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
  return `<a class="benchmark-card" href="${benchmarkPagePath(item.id)}"><div class="card-top"><h3>${escapeHtml(localized(item.game))}${gameDetail ? ` <span class="card-game-detail"><span class="card-game-detail-separator" aria-hidden="true">· </span>${escapeHtml(gameDetail)}</span>` : ''}</h3><span class="date">${escapeHtml(formatIndexDate(item.testedAt))}</span></div><div class="specs"><span class="tag ${vendorClass(item.system.gpu, 'gpu')}">${escapeHtml(item.system.gpu)}</span><span class="tag ${vendorClass(item.system.cpu, 'cpu')}">${escapeHtml(item.system.cpu)}</span></div><p class="meta">${escapeHtml(localized(item.summary))}</p></a>`;
}

let relatedLayoutFrame;
let relatedLayoutListenerBound = false;

function updateRelatedCardLayout() {
  document.querySelectorAll('.related-benchmark-grid .benchmark-card').forEach(relatedCard => {
    relatedCard.classList.remove('detail-wrapped', 'heading-wrapped');
    const heading = relatedCard.querySelector('h3');
    const detail = relatedCard.querySelector('.card-game-detail');
    if (!heading) return;
    const headingRect = heading.getBoundingClientRect();
    const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight) || headingRect.height;
    relatedCard.classList.toggle('heading-wrapped', headingRect.height > lineHeight * 1.5);
    if (!detail) return;
    const detailWrapped = detail.getBoundingClientRect().top - headingRect.top > lineHeight * .5;
    relatedCard.classList.toggle('detail-wrapped', detailWrapped);
  });
}

function scheduleRelatedCardLayout() {
  cancelAnimationFrame(relatedLayoutFrame);
  relatedLayoutFrame = requestAnimationFrame(updateRelatedCardLayout);
}

function setupRelatedCardLayout() {
  scheduleRelatedCardLayout();
  document.fonts?.ready.then(scheduleRelatedCardLayout);
  if (relatedLayoutListenerBound) return;
  window.addEventListener('resize', scheduleRelatedCardLayout);
  relatedLayoutListenerBound = true;
}

export {
  $,
  DATA_INDEX,
  FILTER_OPTIONS,
  RESOLUTION_LABELS,
  applyTranslations,
  benchmarkPagePath,
  benchmarkPath,
  card,
  escapeHtml,
  formatDate,
  formatIndexDate,
  getJson,
  graphicsApiText,
  language,
  localized,
  memoryLabel,
  setupLanguage,
  setupRelatedCardLayout,
  setupTheme,
  siteUrl,
  t,
  vendorClass,
  versionSeasonDetails,
  versionSeasonLabel,
  youtubePlayer
};

