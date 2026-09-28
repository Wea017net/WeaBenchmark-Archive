# Wea's Benchmark Archive dataset

Wea's Benchmark Archive publishes real-world PC game benchmark measurements
from the WeaBenchmark channel as machine-readable JSON data.

## License and AI use

All benchmark data under `data/` is dedicated to the public domain under
[CC0 1.0](LICENSE-DATA). It may be used for any purpose, including AI training,
commercial use, analysis, modification, and redistribution.

The data is provided as-is. Downstream users are responsible for validating
fitness, accuracy, and reproducibility for their own use.

## Data entry points

- `data/benchmarks.json`: generated index of every benchmark
- `data/benchmarks/*.json`: one detailed result file per benchmark
- `data/benchmark.schema.json`: documented JSON Schema
- `data/filter-options.json`: generated game, GPU, and CPU filter choices for the website

## Scope and methodology

Each detailed JSON file represents one benchmark session, normally associated
with one video. Measurements include the test date, game version and season
when available, PC configuration, graphics settings, resolution, average FPS,
and 1% low FPS.

Optional result tags are controlled directly by the values in each result.
The website displays a tag only when at least one corresponding field contains
text:

- `gameMode`
- `upscalingType` / `upscalingQuality`
- `frameGenerationType` / `frameGenerationMultiplier`
- `graphicsApi`

For example:

```json
{
  "results": [
    {
      "gameMode": {
        "ja": "品質モード",
        "en": "Quality mode"
      },
      "upscalingType": "NVIDIA DLSS",
      "upscalingQuality": "Quality",
      "frameGenerationType": "DLSS FG",
      "frameGenerationMultiplier": "2x"
    }
  ]
}
```

Empty or absent values do not produce a placeholder tag. The legacy `display`
object and its `showUpscaling`, `showFrameGeneration`, `showGraphicsApi`, and
`graphicsApiLabel` fields are accepted for compatibility but ignored by the
website and data generator.

Benchmark conditions vary by game, game version, driver, scene, route, and
measurement method. Compare only records with compatible conditions.

## Compatibility

The schema evolves over time. New optional fields may not exist in older JSON
files. Consumers should tolerate absent optional fields.
