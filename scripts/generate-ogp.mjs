import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import sharp from 'sharp';

const SITE_ORIGIN = 'https://benchmark.wea017.net';
const BENCHMARKS_DIRECTORY = 'data/benchmarks';
const PAGE_TEMPLATE = 'benchmark.html';
const PAGE_DIRECTORY = 'benchmarks';
const IMAGE_DIRECTORY = 'assets/ogp';
const LOGO_FILE = 'assets/WeaBenchmark_600px.webp';
const WIDTH = 1200;
const HEIGHT = 630;
const HOME_IMAGE_FILE = `${IMAGE_DIRECTORY}/home.png`;
const HOME_TITLE = 'うぇあのゲームベンチまとめ';
const HOME_DESCRIPTION_LINES = [
  '動画で検証したPCゲームのベンチマーク結果を、',
  '検索可能なテキストデータとして公開しています。'
];
const HOME_DESCRIPTION_EN = 'Browse PC game benchmark results from WeaBenchmark as searchable, text-based data.';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function localized(value, language = 'en') {
  if (value && typeof value === 'object') return value[language] ?? value.ja ?? value.en ?? '';
  return value ?? '';
}

function formatDate(value) {
  return String(value).replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1/$2/$3');
}

function estimatedWidth(text, fontSize) {
  const units = Array.from(String(text)).reduce((total, character) => {
    if (/\s/.test(character)) return total + 0.3;
    if (/[ilI1|.,:'!]/.test(character)) return total + 0.28;
    if (/[mwMW@%&]/.test(character)) return total + 0.85;
    if (/[A-Z0-9]/.test(character)) return total + 0.65;
    if (/[a-z]/.test(character)) return total + 0.54;
    return total + 1;
  }, 0);
  return units * fontSize;
}

function fittedFontSize(text, preferredSize, minimumSize, maximumWidth) {
  const widthAtPreferredSize = estimatedWidth(text, preferredSize);
  if (widthAtPreferredSize <= maximumWidth) return preferredSize;
  return Math.max(minimumSize, Math.floor(preferredSize * maximumWidth / widthAtPreferredSize));
}

function vendorColor(component, type) {
  const value = String(component || '').toLowerCase();
  if (/nvidia|geforce|\brtx\b|\bgtx\b/.test(value)) return '#5c9000';
  if (type === 'gpu' && /intel arc|\barc\s+\d/.test(value)) return '#a33ac0';
  if (type === 'gpu' && /amd|radeon|\brx\s*\d/.test(value)) return '#df1336';
  if (type === 'cpu' && /amd|ryzen|athlon/.test(value)) return '#c44d17';
  if (/intel|\bcore\b|\buhd\b/.test(value)) return '#007ca6';
  return type === 'cpu' ? '#ca4b14' : '#4a8d00';
}

function benchmarkWebPath(id) {
  return `/benchmarks/${String(id).split('/').map(encodeURIComponent).join('/')}.html`;
}

function imageWebPath(id) {
  return `/assets/ogp/${String(id).split('/').map(encodeURIComponent).join('/')}.png`;
}

async function findBenchmarkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findBenchmarkFiles(path);
    return entry.isFile() && entry.name.endsWith('.json') ? [path] : [];
  }));
  return files.flat();
}

function expectedId(file) {
  return relative(BENCHMARKS_DIRECTORY, file)
    .replace(/\.json$/, '')
    .split(sep)
    .join('/');
}

function metadataFor(data) {
  const game = localized(data.game);
  const cpu = data.system.cpuShortName || data.system.cpu;
  const gpu = data.system.gpuShortName || data.system.gpu;
  const title = `${game} benchmark — ${cpu} + ${gpu} | Wea's Benchmark Archive`;
  const description = `${game} benchmark results on ${cpu} and ${gpu}, including graphics settings, average FPS, and 1% low FPS.`;
  const url = `${SITE_ORIGIN}${benchmarkWebPath(data.id)}`;
  const image = `${SITE_ORIGIN}${imageWebPath(data.id)}`;
  return { game, cpu, gpu, title, description, url, image };
}

function createSvg(data) {
  const game = localized(data.game);
  const cpu = data.system.cpuShortName || data.system.cpu;
  const gpu = data.system.gpuShortName || data.system.gpu;
  const detail = [formatDate(data.testedAt), localized(data.season) || localized(data.version)].filter(Boolean).join(' · ');
  const summary = localized(data.summary);
  const gameSize = fittedFontSize(game, 94, 36, 790);
  const detailSize = fittedFontSize(detail, 34, 25, 790);
  const summarySize = fittedFontSize(summary, 34, 24, 1040);
  const cpuSize = fittedFontSize(cpu, 80, 48, 1040);
  const gpuSize = fittedFontSize(gpu, 80, 48, 1040);
  const cpuColor = vendorColor(data.system.cpu, 'cpu');
  const gpuColor = vendorColor(data.system.gpu, 'gpu');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f8f5f1"/>
  <rect x="80" y="63" width="100" height="4" fill="#bd3109"/>
  <g font-family="Noto Sans JP, Noto Sans CJK JP, Meiryo, sans-serif">
    <text x="80" y="136" fill="#b92e06" font-size="42" font-weight="600" letter-spacing="1">WEA'S BENCHMARK ARCHIVE</text>
    <text x="80" y="245" fill="#050505" font-size="${gameSize}" font-weight="700">${escapeHtml(game)}</text>
    <text x="80" y="314" fill="#7f706b" font-size="${detailSize}" font-weight="400">${escapeHtml(detail)}</text>
    <text x="80" y="357" fill="#7f706b" font-size="${summarySize}" font-weight="400">${escapeHtml(summary)}</text>
    <text x="80" y="469" fill="${cpuColor}" font-size="${cpuSize}" font-weight="700">${escapeHtml(cpu)}</text>
    <text x="80" y="566" fill="${gpuColor}" font-size="${gpuSize}" font-weight="700">${escapeHtml(gpu)}</text>
  </g>
</svg>`;
}

function uniqueCount(records, selector) {
  return new Set(records.map(selector).filter(Boolean)).size;
}

function createHomeSvg(records) {
  const titleSize = fittedFontSize(HOME_TITLE, 72, 48, 790);
  const englishDescriptionSize = fittedFontSize(HOME_DESCRIPTION_EN, 20, 16, 1040);
  const stats = [
    { label: 'Data', value: records.length },
    { label: 'Games', value: uniqueCount(records, record => localized(record.game)) },
    { label: 'GPU', value: uniqueCount(records, record => record.system.gpu) },
    { label: 'CPU', value: uniqueCount(records, record => record.system.cpu) }
  ];
  const statMarkup = stats.map((stat, index) => {
    const center = 210 + index * 260;
    return `
    <text x="${center}" y="522" text-anchor="middle" fill="#211d1b" font-size="68" font-weight="700">${stat.value}</text>
    <text x="${center}" y="573" text-anchor="middle" fill="#7f706b" font-size="27" font-weight="500">${stat.label}</text>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f8f5f1"/>
  <rect x="80" y="63" width="100" height="4" fill="#bd3109"/>
  <g font-family="Noto Sans JP, Noto Sans CJK JP, Meiryo, sans-serif">
    <text x="80" y="136" fill="#b92e06" font-size="42" font-weight="600" letter-spacing="1">WEA'S BENCHMARK ARCHIVE</text>
    <text x="80" y="235" fill="#050505" font-size="${titleSize}" font-weight="700">${HOME_TITLE}</text>
    <text x="80" y="307" fill="#7f706b" font-size="29" font-weight="400">${HOME_DESCRIPTION_LINES[0]}</text>
    <text x="80" y="347" fill="#7f706b" font-size="29" font-weight="400">${HOME_DESCRIPTION_LINES[1]}</text>
    <text x="80" y="384" fill="#9a8d88" font-size="${englishDescriptionSize}" font-weight="400">${HOME_DESCRIPTION_EN}</text>
    <line x1="80" y1="422" x2="1120" y2="422" stroke="#ddd5cf" stroke-width="2"/>
    <line x1="340" y1="450" x2="340" y2="583" stroke="#ddd5cf" stroke-width="2"/>
    <line x1="600" y1="450" x2="600" y2="583" stroke="#ddd5cf" stroke-width="2"/>
    <line x1="860" y1="450" x2="860" y2="583" stroke="#ddd5cf" stroke-width="2"/>${statMarkup}
  </g>
</svg>`;
}

function createPage(template, data) {
  const metadata = metadataFor(data);
  const rootPrefix = '../'.repeat(data.id.split('/').length);
  const metadataMarkup = `
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <link rel="canonical" href="${escapeHtml(metadata.url)}">
  <meta property="og:type" content="article">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Wea's Benchmark Archive">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:url" content="${escapeHtml(metadata.url)}">
  <meta property="og:image" content="${escapeHtml(metadata.image)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="${WIDTH}">
  <meta property="og:image:height" content="${HEIGHT}">
  <meta property="og:image:alt" content="${escapeHtml(`${metadata.game} benchmark result: ${metadata.cpu}, ${metadata.gpu}`)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(metadata.title)}">
  <meta name="twitter:description" content="${escapeHtml(metadata.description)}">
  <meta name="twitter:image" content="${escapeHtml(metadata.image)}">`;

  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(metadata.title)}</title>${metadataMarkup}`)
    .replace('<body>', `<body data-benchmark-id="${escapeHtml(data.id)}">`)
    .replaceAll('href="assets/', `href="${rootPrefix}assets/`)
    .replaceAll('src="assets/', `src="${rootPrefix}assets/`)
    .replaceAll('href="index.html"', `href="${rootPrefix}index.html"`);
}

function requestedTarget(arguments_) {
  if (!arguments_.length) return { generateHome: true, id: null };
  if (arguments_.length === 1 && arguments_[0] === '--home') return { generateHome: true, id: null, homeOnly: true };
  if (arguments_.length === 1 && !arguments_[0].startsWith('-')) return { generateHome: false, id: arguments_[0] };
  if (arguments_.length === 2 && arguments_[0] === '--id') return { generateHome: false, id: arguments_[1] };
  throw new Error('Usage: npm run generate:ogp -- [--home | [--id] <benchmark-id>]');
}

const target = requestedTarget(process.argv.slice(2));
const files = await findBenchmarkFiles(BENCHMARKS_DIRECTORY);
const records = await Promise.all(files.map(async file => {
  const data = JSON.parse(await readFile(file, 'utf8'));
  const id = expectedId(file);
  if (data.id !== id) throw new Error(`${file}: "id" must be "${id}"`);
  return data;
}));
const selectedRecords = target.homeOnly ? [] : target.id ? records.filter(record => record.id === target.id) : records;
if (target.id && !selectedRecords.length) throw new Error(`Unknown benchmark ID: ${target.id}`);

const template = await readFile(PAGE_TEMPLATE, 'utf8');
const logo = await readFile(LOGO_FILE);
const logoPng = await sharp(logo).resize(216, 216).png().toBuffer();

if (target.generateHome) {
  await mkdir(IMAGE_DIRECTORY, { recursive: true });
  await sharp(Buffer.from(createHomeSvg(records)))
    .composite([{ input: logoPng, left: 912, top: 68 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(HOME_IMAGE_FILE);
  console.log(`Generated ${HOME_IMAGE_FILE}.`);
}

for (const data of selectedRecords.sort((a, b) => a.id.localeCompare(b.id))) {
  const imageFile = join(IMAGE_DIRECTORY, ...data.id.split('/')) + '.png';
  const pageFile = join(PAGE_DIRECTORY, ...data.id.split('/')) + '.html';
  await mkdir(dirname(imageFile), { recursive: true });
  await mkdir(dirname(pageFile), { recursive: true });
  await sharp(Buffer.from(createSvg(data)))
    .composite([{ input: logoPng, left: 912, top: 68 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(imageFile);
  await writeFile(pageFile, createPage(template, data), 'utf8');
  console.log(`Generated ${imageFile} and ${pageFile}.`);
}

console.log(`Generated OGP assets for ${selectedRecords.length} benchmark(s)${target.generateHome ? ' and the home page' : ''}.`);
