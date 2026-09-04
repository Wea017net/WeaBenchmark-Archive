# コマンド一覧

[English version](COMMANDS.en.md)

OGP画像とベンチマーク一覧を生成・検証するためのコマンドです。`package.json` があるリポジトリのルートディレクトリで実行してください。

## 初回セットアップ

Node.js 22以降を用意し、依存パッケージをインストールします。

```console
npm install
```

OGP画像内の日本語表示には Noto Sans JP、または Noto Sans CJK JPが必要です。

## すべて生成

ベンチマーク一覧、ゲーム・GPU・CPUのフィルター選択肢、ホームページ用OGP画像、全ベンチマーク用OGP画像、結果HTMLをまとめて生成します。

```console
npm run generate
```

生成対象:

- `data/benchmarks.json`
- `data/filter-options.json`
- `assets/ogp/home.png`
- `assets/ogp/<ベンチマークID>.png`
- `assets/ogp/generation-manifest.json`（環境差による不要な画像の再生成を防ぐハッシュ）
- `benchmarks/<ベンチマークID>.html`

## OGP関連を一括生成

ホームページ用と全ベンチマーク用のOGP画像、結果HTMLを生成します。ベンチマーク一覧JSONは生成しません。

```console
npm run generate:ogp
```

## ホームページ用OGP画像のみ生成

`assets/ogp/home.png` だけを再生成します。データ、ゲーム、GPU、CPUの種類数はベンチマークJSONから自動集計されます。

```console
npm run generate:ogp -- --home
```

## IDを指定して再生成

指定したベンチマークのOGP画像と結果HTMLだけを再生成します。

```console
npm run generate:ogp -- 260813_overwatch_rtx4070s_r5-5600
```

`--id` を明示する書き方も使用できます。

```console
npm run generate:ogp -- --id 260813_overwatch_rtx4070s_r5-5600
```

## ベンチマーク一覧のみ生成

`data/benchmarks/` 以下から `data/benchmarks.json` を再生成します。

```console
npm run generate:index
```

## フィルター選択肢のみ生成

生成済みの `data/benchmarks.json` から、ゲーム・GPU・CPUの選択肢を `data/filter-options.json` に反映します。通常は `npm run generate` に含まれるため、個別に実行する必要はありません。

```console
npm run generate:filters
```

## 生成結果を検証

ホーム画像と全ベンチマーク画像が1200×630のPNGであること、結果HTMLと `index.html` に必要なOGP・Twitter Card情報があることを検証します。

```console
npm run check:ogp
```

## 通常の更新手順

ベンチマークデータを追加・変更した場合は、次の順番で実行します。

```console
npm run generate
npm run check:ogp
```

フィルター選択肢の更新はローカルの `npm run generate` で行います。GitHub Actionsはベンチマーク一覧、OGP画像、結果HTMLの生成と検証のみを行います。
