# Command reference

Commands for generating and validating the benchmark index and OGP assets. Run them from the repository root—the directory containing `package.json`.

## Initial setup

Use Node.js 22 or later, then install the dependencies.

```console
npm install
```

Noto Sans JP or Noto Sans CJK JP is required to render Japanese text in OGP images.

## Generate everything

Generates the benchmark index, the home-page OGP image, every benchmark OGP image, and static result pages.

```console
npm run generate
```

Generated files:

- `data/benchmarks.json`
- `assets/ogp/home.png`
- `assets/ogp/<benchmark-id>.png`
- `assets/ogp/generation-manifest.json` (hashes that prevent environment-only image regeneration)
- `benchmarks/<benchmark-id>.html`

## Generate all OGP assets

Generates the home-page OGP image, every benchmark OGP image, and static result pages. It does not regenerate the benchmark index JSON.

```console
npm run generate:ogp
```

## Generate only the home-page OGP image

Regenerates only `assets/ogp/home.png`. Counts for Data, Games, GPUs, and CPUs are calculated from the benchmark JSON files.

```console
npm run generate:ogp -- --home
```

## Regenerate a specific benchmark

Regenerates the OGP image and static result page for one benchmark ID.

```console
npm run generate:ogp -- 260813_overwatch_rtx4070s_r5-5600
```

You may also specify the ID explicitly.

```console
npm run generate:ogp -- --id 260813_overwatch_rtx4070s_r5-5600
```

## Generate only the benchmark index

Regenerates `data/benchmarks.json` from files under `data/benchmarks/`.

```console
npm run generate:index
```

## Validate generated assets

Checks that the home and benchmark images are 1200×630 PNG files, and that `index.html` and every result page include the required OGP and Twitter Card metadata.

```console
npm run check:ogp
```

## Usual update workflow

After adding or changing benchmark data, run:

```console
npm run generate
npm run check:ogp
```

GitHub Actions runs the same generation and validation when benchmark data changes.
