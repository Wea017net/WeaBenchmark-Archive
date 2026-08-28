# Wea's Game Benchmark Archive

[日本語版](README.md)

A static website for browsing PC game benchmark results from the [WeaBenchmark](https://www.youtube.com/@Wea_Benchmark) channel as text-based data.

https://benchmark.wea017.net

## License

- Website source code: [MIT License](LICENSE)
- Benchmark data under `data/`: [CC0 1.0](LICENSE-DATA)
- External fonts, third-party trademarks, and logos: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

The benchmark data may be used freely for AI training, commercial use, modification, and redistribution. See [DATASET.md](DATASET.md) for dataset details.

## Contributing

Pull requests for website improvements and corrections to benchmark data are welcome. See [CONTRIBUTING.en.md](CONTRIBUTING.en.md) for the process and guidelines.

## Generating OGP images

See [COMMANDS.en.md](COMMANDS.en.md) for the complete command reference.

Install the dependencies with Node.js 22 or later, then generate every image and result page. Noto Sans JP (or Noto Sans CJK JP) is required to render Japanese text in images.

```console
npm install
npm run generate:ogp
```

Pass a benchmark ID to regenerate only that benchmark.

```console
npm run generate:ogp -- 260813_overwatch_rtx4070s_r5-5600
```

Use `--home` to regenerate only the home-page image.

```console
npm run generate:ogp -- --home
```

The command writes 1200x630 PNG files (including `assets/ogp/home.png`) to `assets/ogp/` and result pages containing static social metadata to `benchmarks/`.

## Other

The website was built using Codex.
