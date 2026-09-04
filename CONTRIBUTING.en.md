# Contributing

[日本語版](CONTRIBUTING.md)

Contributions to Wea's Game Benchmark Archive are welcome. Please open a pull request for website improvements, accessibility or display fixes, documentation improvements, and corrections to benchmark data.

## Before submitting a pull request

1. Keep each change focused and small enough that its purpose is clear.
2. Follow the existing file formats, terminology, and code style.
3. When changing benchmark data, run `npm install` followed by `npm run generate`, and include the updated `data/benchmarks.json`, `data/filter-options.json`, `assets/ogp/`, and `benchmarks/` files.
4. When changing JSON, confirm that it can be parsed correctly.

## Correcting benchmark data

Corrections to typos, values, game versions, test systems, settings, and video URLs are welcome. When possible, include the reason for the change and the video, public source, or relevant location used to verify it in the pull request description.

## License

By contributing, you agree that code contributions are released under the [MIT License](LICENSE), and contributions to benchmark data under `data/` are released under [CC0 1.0](LICENSE-DATA).
