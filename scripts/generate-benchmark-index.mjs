import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const benchmarksDirectory = 'data/benchmarks';
const outputFile = 'data/benchmarks.json';

async function findJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return findJsonFiles(path);
    return entry.isFile() && entry.name.endsWith('.json') ? [path] : [];
  }));
  return files.flat();
}

function indexEntry(data, file) {
  const expectedId = relative(benchmarksDirectory, file)
    .replace(/\.json$/, '')
    .split(sep)
    .join('/');
  const required = ['id', 'game', 'testedAt', 'system'];
  const missing = required.filter(key => data[key] === undefined || data[key] === '');
  if (missing.length) throw new Error(`${file}: required field missing: ${missing.join(', ')}`);
  if (data.id !== expectedId) throw new Error(`${file}: "id" must be "${expectedId}"`);
  if (!data.system.cpu || !data.system.gpu) throw new Error(`${file}: system.cpu and system.gpu are required`);
  if (!data.display || typeof data.display !== 'object') throw new Error(`${file}: display is required`);
  if (typeof data.display.showUpscaling !== 'boolean') throw new Error(`${file}: display.showUpscaling must be true or false`);
  if (typeof data.display.showGraphicsApi !== 'boolean') throw new Error(`${file}: display.showGraphicsApi must be true or false`);
  if (data.display.graphicsApiLabel !== undefined && typeof data.display.graphicsApiLabel !== 'string') throw new Error(`${file}: display.graphicsApiLabel must be an English string`);
  if (!Array.isArray(data.results)) throw new Error(`${file}: results must be an array`);
  data.results.forEach((result, index) => {
    if (!Number.isFinite(result.resolutionX) || !Number.isFinite(result.resolutionY)) {
      throw new Error(`${file}: results[${index}] requires numeric resolutionX and resolutionY`);
    }
    if (result.graphicsApi !== undefined && typeof result.graphicsApi !== 'string') {
      throw new Error(`${file}: results[${index}].graphicsApi must be an English string`);
    }
  });

  return {
    id: data.id,
    game: data.game,
    testedAt: data.testedAt,
    system: {
      cpu: data.system.cpu,
      gpu: data.system.gpu
    },
    summary: data.summary ?? '',
    version: data.version ?? '',
    season: data.season ?? ''
  };
}

const files = await findJsonFiles(benchmarksDirectory);
const benchmarks = await Promise.all(files.map(async file => {
  try {
    return indexEntry(JSON.parse(await readFile(file, 'utf8')), file);
  } catch (error) {
    throw new Error(`Could not process ${file}: ${error.message}`);
  }
}));

benchmarks.sort((a, b) => String(b.testedAt).localeCompare(String(a.testedAt)) || a.id.localeCompare(b.id));
await writeFile(outputFile, `${JSON.stringify(benchmarks, null, 2)}\n`, 'utf8');
console.log(`Generated ${outputFile} with ${benchmarks.length} benchmark(s).`);
