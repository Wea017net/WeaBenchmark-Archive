# うぇあのゲームベンチまとめ

[English version](README.en.md)

ベンチマーク専門チャンネル「[WeaBenchmark](https://www.youtube.com/@Wea_Benchmark)」で投稿しているPCゲームのベンチマーク結果をテキストで閲覧できる静的ウェブサイト。

https://benchmark.wea017.net

## ライセンス

- サイトのコード: [MIT License](LICENSE)
- `data/` 配下のベンチマークデータ: [CC0 1.0](LICENSE-DATA)
- 外部フォントおよび第三者の商標・ロゴ: [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)

ベンチマークデータはAI学習、商用利用、改変、再配布を含めて自由に利用できます。データセットの詳細は [DATASET.md](DATASET.md) を参照してください。

## 貢献

ウェブサイトの改善やベンチマークデータの誤りの修正に関する Pull Request を歓迎します。手順と注意事項は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## OGP画像の生成

用途別の全コマンドは [COMMANDS.md](COMMANDS.md) にまとめています。

Node.js 22以降で依存パッケージをインストールしたあと、次のコマンドを実行します。画像内の日本語表示には Noto Sans JP（または Noto Sans CJK JP）が必要です。

```console
npm install
npm run generate:ogp
```

特定のベンチマークだけを再生成する場合はIDを指定します。

```console
npm run generate:ogp -- 260813_overwatch_rtx4070s_r5-5600
```

ホームページの画像だけを再生成する場合は `--home` を指定します。

```console
npm run generate:ogp -- --home
```

1200×630pxのPNG（ホームは `assets/ogp/home.png`）が `assets/ogp/` に、SNSクローラー向けメタデータを含む結果ページが `benchmarks/` に生成されます。

## その他

ウェブサイトの構築には Codex を使用しています。
