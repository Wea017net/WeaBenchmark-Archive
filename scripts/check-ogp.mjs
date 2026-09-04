import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const records = JSON.parse(await readFile('data/benchmarks.json', 'utf8'));
const imageManifest = JSON.parse(await readFile('assets/ogp/generation-manifest.json', 'utf8'));
if (imageManifest.version !== 1) {
  throw new Error('assets/ogp/generation-manifest.json: unsupported manifest version');
}

async function validateManifestEntry(imageFile, manifestKey) {
  const entry = imageManifest.images?.[manifestKey];
  if (!entry?.input || !entry?.output) {
    throw new Error(`${imageFile}: missing generation manifest entry`);
  }
  const outputHash = createHash('sha256').update(await readFile(imageFile)).digest('hex');
  if (outputHash !== entry.output) {
    throw new Error(`${imageFile}: does not match its generation manifest entry`);
  }
}

const homeMetadata = await sharp('assets/ogp/home.png').metadata();
if (homeMetadata.width !== 1200 || homeMetadata.height !== 630 || homeMetadata.format !== 'png') {
  throw new Error('assets/ogp/home.png: expected a 1200x630 PNG');
}
await validateManifestEntry('assets/ogp/home.png', 'home.png');
const indexPage = await readFile('index.html', 'utf8');
for (const expectedValue of [
  '<meta name="theme-color" content="#bc3005">',
  '<meta property="og:type" content="website">',
  '<meta property="og:image" content="https://benchmark.wea017.net/assets/ogp/home.png">',
  '<meta property="og:image:width" content="1200">',
  '<meta property="og:image:height" content="630">',
  '<meta name="twitter:card" content="summary_large_image">'
]) {
  if (!indexPage.includes(expectedValue)) throw new Error(`index.html: missing ${expectedValue}`);
}

for (const record of records) {
  const idSegments = record.id.split('/');
  const imageFile = join('assets/ogp', ...idSegments) + '.png';
  const pageFile = join('benchmarks', ...idSegments) + '.html';
  const metadata = await sharp(imageFile).metadata();
  if (metadata.width !== 1200 || metadata.height !== 630 || metadata.format !== 'png') {
    throw new Error(`${imageFile}: expected a 1200x630 PNG`);
  }
  await validateManifestEntry(imageFile, `${record.id}.png`);

  const page = await readFile(pageFile, 'utf8');
  const expectedValues = [
    `data-benchmark-id="${record.id}"`,
    '<meta name="theme-color" content="#bc3005">',
    `https://benchmark.wea017.net/benchmarks/${record.id}.html`,
    `https://benchmark.wea017.net/assets/ogp/${record.id}.png`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">'
  ];
  for (const expectedValue of expectedValues) {
    if (!page.includes(expectedValue)) throw new Error(`${pageFile}: missing ${expectedValue}`);
  }
}

console.log(`Validated the home OGP image and ${records.length} benchmark image/page pair(s).`);
