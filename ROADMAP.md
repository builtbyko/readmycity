# Roadmap

This project is currently a public prototype of an urban policy GIS for central Okayama. The next phase is to make the method reusable without overstating what the data can prove.

## Current Status

- Published a lightweight web GIS for Okayama City.
- Visualized daytime and nighttime high people-flow areas.
- Added supporting layers for public transport, parking, pedestrian space, commercial facilities, parks, and bicycle-related features.
- Documented key limitations, especially that people-flow points are representative points, not official mesh centroids or official area boundaries.

## Near-Term Priorities

1. Keep the Okayama version stable

   Avoid adding unnecessary layers to the public map. Future updates should improve clarity, documentation, or reproducibility rather than simply increasing data volume.

2. Improve data management

   Separate raw data, intermediate data, lightweight public data, and local-only files. Large or license-uncertain source files should remain outside the public repository.

3. Test nationally available people-flow data

   Okayama City provides unusually useful local people-flow data. To generalize the method, compare the current analysis with nationally available mesh-based people-flow datasets and evaluate whether major urban patterns can still be observed.

4. Apply the workflow to other municipalities

   Test at least two additional cities with different urban characteristics, such as a transit-oriented city center, a car-oriented regional city, or a tourism-heavy city.

5. Develop an analysis support workflow

   The goal is not to automatically produce a single score. The more realistic goal is to automate early-stage urban analysis: collect relevant data, simplify it, visualize relationships, and generate structured prompts for human interpretation.

## Analysis Principles

- Treat indicators as supporting evidence, not final conclusions.
- Preserve local urban context in the interpretation.
- Distinguish observed facts from hypotheses.
- Avoid presenting representative points or approximate ranges as official boundaries.
- Prefer focused, lightweight datasets around analysis areas over citywide heavy layers.

## Possible Future Features

- Reproducible data preparation workflow.
- Comparison between local people-flow data and national mesh datasets.
- Template-based map generation for other municipalities.
- Structured area summaries for transport, land use, walkability, parking, and stay-oriented public space.
- Optional API or command-line workflow for generating public GIS outputs.

---

# ロードマップ

このプロジェクトは、岡山市中心部を対象とした都市政策GISの公開プロトタイプです。次の段階では、分析方法を他都市にも応用できる形に整理しつつ、データで言えることを過大に見せないことを重視します。

## 現在の到達点

- 岡山市中心部の軽量Web GISを公開。
- 昼間・夜間の人流上位エリアを可視化。
- 公共交通、駐車場、歩行者空間、商業施設、公園、自転車関連施設などの補助レイヤーを整理。
- 人流の点は公式メッシュ重心や公式境界ではなく、代表点であることを明記。

## 当面の優先事項

1. 岡山版を安定版として扱う

   公開地図に不要なレイヤーを追加し続けない。今後の更新は、データ量を増やすことではなく、見やすさ、説明、再現性の改善を優先する。

2. データ管理を改善する

   元データ、中間データ、公開用軽量データ、ローカル専用データを明確に分ける。大容量データや再配布条件が不明確なデータは、公開リポジトリに含めない。

3. 全国利用可能な人流データを検証する

   岡山市の人流データは粒度が高く有用だが、同様のデータを公開している自治体は限られる。国などが提供するメッシュ型人流データで、今回の分析傾向をどこまで再現できるか確認する。

4. 他自治体へ横展開する

   少なくとも2自治体で同様の分析を試す。公共交通型、車依存型、観光型など、岡山と性格の異なる都市を選ぶことで、共通化できる部分と都市固有の部分を切り分ける。

5. 分析支援ワークフローを整える

   目標は、人流要因を単一スコアで自動判定することではない。必要なデータを集め、軽量化し、可視化し、人間が考察するための材料を整える分析支援ツールを目指す。

## 分析上の考え方

- 指標は結論ではなく、分析の補助線として扱う。
- 都市ごとの文脈を重視する。
- 事実と推測を分けて記述する。
- 代表点や概略範囲を、公式境界のように見せない。
- 市域全体の重いデータより、分析対象エリア周辺に絞った軽量データを優先する。

## 今後考えられる機能

- 再現可能なデータ処理手順。
- 自治体独自人流データと全国メッシュ人流データの比較。
- 他自治体向けの地図生成テンプレート。
- 交通、土地利用、歩行空間、駐車場、滞在空間に関するエリア要約。
- 公開用GISを生成するAPIまたはコマンドラインワークフロー。
