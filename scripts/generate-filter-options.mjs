import { readFile, writeFile } from 'node:fs/promises';

const benchmarkIndexFile = 'data/benchmarks.json';
const filterOptionsFile = 'data/filter-options.json';
const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

function localizedGameLabel(game) {
  if (game && typeof game === 'object') {
    const ja = String(game.ja ?? game.en ?? '').trim();
    const en = String(game.en ?? game.ja ?? '').trim();
    if (!ja || !en) throw new Error('A game name must contain a non-empty ja or en value');
    return { ja, en };
  }

  const label = String(game ?? '').trim();
  if (!label) throw new Error('A game name must not be empty');
  return { ja: label, en: label };
}

function gameValue(game) {
  return localizedGameLabel(game).en.toLocaleLowerCase('en-US');
}

function existingOptionValue(option) {
  return String(typeof option === 'string' ? option : option?.value ?? '').trim();
}

function generateGameOptions(records, existingOptions = []) {
  // The index is newest-first, so the latest spelling wins if old records differ.
  const games = new Map();
  for (const record of records) {
    const value = gameValue(record.game);
    if (!games.has(value)) games.set(value, localizedGameLabel(record.game));
  }

  const options = [];
  for (const existingOption of existingOptions) {
    const value = existingOptionValue(existingOption).toLocaleLowerCase('en-US');
    const label = games.get(value);
    if (!label) continue;
    options.push({ value, label });
    games.delete(value);
  }

  const newOptions = [...games].map(([value, label]) => ({ value, label }));
  newOptions.sort((a, b) => collator.compare(a.label.en, b.label.en));
  return [...options, ...newOptions];
}

function uniqueComponents(records, key) {
  const components = new Map();
  for (const record of records) {
    const value = String(record.system?.[key] ?? '').trim();
    if (!value) throw new Error(`${record.id}: system.${key} must not be empty`);
    const normalized = value.toLocaleLowerCase('en-US');
    if (!components.has(normalized)) components.set(normalized, value);
  }
  return components;
}

function generateComponentOptions(records, key, existingOptions = []) {
  const remaining = uniqueComponents(records, key);
  const options = [];

  // Preserve intentional grouping such as "GTX 1060" matching "GTX 1060 6GB".
  for (const existingOption of existingOptions) {
    const option = existingOptionValue(existingOption);
    const normalizedOption = option.toLocaleLowerCase('en-US');
    if (!option) continue;
    const matches = [...remaining].filter(([normalizedValue]) => normalizedValue.includes(normalizedOption));
    if (!matches.length) continue;
    options.push(option);
    for (const [normalizedValue] of matches) remaining.delete(normalizedValue);
  }

  return [...options, ...[...remaining.values()].sort(collator.compare)];
}

async function readExistingOptions() {
  try {
    return JSON.parse(await readFile(filterOptionsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

const records = JSON.parse(await readFile(benchmarkIndexFile, 'utf8'));
if (!Array.isArray(records)) throw new Error(`${benchmarkIndexFile}: expected an array`);

const existingOptions = await readExistingOptions();
const filterOptions = {
  games: generateGameOptions(records, existingOptions.games),
  gpus: generateComponentOptions(records, 'gpu', existingOptions.gpus),
  cpus: generateComponentOptions(records, 'cpu', existingOptions.cpus)
};

await writeFile(filterOptionsFile, `${JSON.stringify(filterOptions, null, 2)}\n`, 'utf8');
console.log(
  `Generated ${filterOptionsFile} with ${filterOptions.games.length} game(s), `
  + `${filterOptions.gpus.length} GPU(s), and ${filterOptions.cpus.length} CPU(s).`
);
