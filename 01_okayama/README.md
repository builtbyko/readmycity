# 岡山市GIS 作業用フォルダ / Okayama Map Source

English version is available below the Japanese section.

## 日本語

このフォルダには、岡山市中心市街地の都市政策GISに関する作業用ファイルを置いています。

公開用のGitHub Pagesファイルは次の場所です。

- `../docs/index.html`

作業用の地図HTMLは次の場所です。

- `okayama_osm_light.html`

## 主な生成スクリプト

```powershell
python 01_okayama/scripts/build_osm_overview.py --light --output docs/index.html
```

元データはGit管理外に置き、環境変数または `_local_data/` などのローカル専用フォルダから参照してください。個人PCの絶対パスはコミットしないでください。

## 人流レイヤーの注意

人流の点は表示・分析用の代表点であり、公式メッシュ重心ではありません。点線範囲は分析用の参考範囲であり、公式の125mメッシュ境界ではありません。

この地図は探索的な都市政策分析に使うもので、厳密な密度比較や公式境界比較には使わないでください。

---

## English

This folder contains working files for the Okayama city-center urban policy GIS map.

The public GitHub Pages file is:

- `../docs/index.html`

The working HTML map is:

- `okayama_osm_light.html`

## Main Generator

```powershell
python 01_okayama/scripts/build_osm_overview.py --light --output docs/index.html
```

Source data should be stored outside Git and referenced through environment variables or local ignored folders such as `_local_data/`. Do not commit personal absolute paths.

## People-Flow Layer Notice

People-flow points are representative display points, not official mesh centroids. Dashed ranges are interpretation aids, not official 125 m mesh boundaries.

Use this map for exploratory urban policy analysis, not for strict density or official boundary comparison.
