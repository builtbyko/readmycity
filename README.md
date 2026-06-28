# 公開マップ / Public Map

https://kohekura.github.io/projectGIS_2026/01_okayama/okayama_osm_light.html

English version is available below the Japanese README.

# 岡山市中心市街地 都市政策GIS

このリポジトリは、岡山市中心市街地を対象に、人流と都市空間・交通条件の関係を読み解くための軽量Web GISを公開するものです。

主な公開成果物は `docs/index.html` です。GitHub Pagesでは、`docs/` フォルダを公開元に設定することで地図を閲覧できます。

## 目的

このGISは、単に人流の多い場所を示すだけではなく、なぜその場所に人が集まりやすいのかを都市政策の観点から考えるための分析地図です。

特に次のような条件と人流の関係を重ねて見られるようにしています。

- 歩行者空間、歩きやすい通り
- 鉄道、路面電車、バスなどの公共交通
- 停留所のサービス水準、徒歩圏
- 駐車場、車アクセス
- 商業用地、大規模商業施設
- 商店街、飲食店、カフェ、夜間飲食
- 公園、緑地
- 自転車道、駐輪場、シェアサイクル

この地図は、因果関係を断定するものではありません。人流が多い場所の特徴を整理し、地方都市の中心市街地における回遊、滞在、交通結節、車利用との関係を考えるための探索的なGISです。

## 地図の見方

まずは分析メモの次の2レイヤーを見ることを想定しています。

- 分析「昼に人流が多いエリア」
- 分析「夜に人流が多いエリア」

地図上のランキング点をクリックすると、そのエリアの概要、交通条件、施設構成、想定される利用者像、都市政策上の読み取りを確認できます。

分析メモをONにすると、関連する補助レイヤーも表示されます。駐車場、歩行者空間、緑地、商業施設、公共交通、自転車関連レイヤーを重ねることで、人流が集まりやすい条件を比較できます。

## 使用データ

この地図では、以下のデータを加工・集約して利用しています。

- 岡山市の人流オープンデータ
- OpenStreetMap / Overpass APIから取得した地物
- GTFS形式の公共交通データ
- PLATEAU / CityGML由来の土地利用データ
- 公共の地図タイル、航空写真タイル

再配布条件が明確でない元データは、このリポジトリには含めていません。公開HTMLには、地図表示に必要な加工済み・簡略化済みの情報のみを含めています。

## 人流データに関する重要な注意

この地図で使っている人流データは、エリア別・時間帯別の集計値です。元データには、各エリアの正式な地理境界や公式座標が含まれていません。

そのため、地図上の人流点や点線範囲について、次の点に注意してください。

- 地図上の点は公式メッシュ重心ではなく、表示・分析用の代表点です。
- 点線範囲は分析用の参考範囲であり、公式境界ではありません。
- 厳密な125mメッシュ単位の分析として読まないでください。
- ポリゴン面積あたりの厳密な密度比較には使わないでください。
- 公式な境界比較や制度上の区域判定には使わないでください。

この地図は、都市政策上の仮説づくり、現地確認前の論点整理、複数レイヤーを重ねた探索的分析に向いています。

## 再現方法

公開用HTMLはすでに生成済みです。ローカルで再生成する場合は、元データをGit管理外の場所に置き、環境変数でパスを指定してください。

主な環境変数は次の通りです。

- `OKAYAMA_GTFS_ROOT`
- `OKAYAMA_JINRYU_CSV`
- `OKAYAMA_JINRYU_ROOT`
- `OKAYAMA_PARKING_ROOT`
- `OKAYAMA_PLATEAU_BLDG_DIR`

例:

```powershell
python 01_okayama/scripts/build_osm_overview.py --light --output docs/index.html
```

元データ、ローカルダウンロード、キャッシュ、作業ログは、再配布条件が明確でない限りコミットしないでください。

## リポジトリ構成

```text
.
|-- docs/
|   |-- index.html              # GitHub Pagesで公開する地図
|-- 01_okayama/
|   |-- okayama_osm_light.html  # 公開地図の作業用コピー
|   |-- scripts/                # 加工・分析・地図生成スクリプト
|   |-- data/                   # ローカル加工データ。原則Git管理外
|-- data/
|   |-- README.md               # データ公開方針
|-- AGENTS.md                   # 今後のCodex作業ルール
|-- requirements.txt
|-- LICENSE
```

## ライセンス

このリポジトリ内のコードとドキュメントは、特に明記がない限りMIT Licenseで公開します。

ただし、第三者データに由来する地物・属性・タイル・元データは、それぞれの提供元のライセンスや利用規約に従います。詳細は `data/README.md` を確認してください。

## 今後の改善予定

- 人流エリアの公式境界が入手できる場合は、代表点・参考範囲を置き換える
- 加工済みデータのメタデータを整理する
- 再現手順をより小さなサンプルデータで検証可能にする
- HTML内に埋め込んだデータ、スタイル、分析文を分離する
- 公共交通頻度、自転車利便性、駐車場アクセスの分析を精緻化する

---

# Okayama Urban Policy GIS

This repository publishes a lightweight web GIS for exploring relationships between people-flow patterns and urban conditions in central Okayama, Japan.

The main public artifact is `docs/index.html`. Enable GitHub Pages with `docs/` as the publishing source to view the map online.

## Purpose

This GIS is intended as an exploratory urban policy tool, not just a map of high people-flow locations. It helps examine why some areas attract people during the day or at night by overlaying people-flow rankings with planning and mobility conditions.

The map includes layers such as:

- pedestrian spaces and walkable streets
- rail, tram, and bus services
- stop frequency indicators and walk areas
- parking and car access
- commercial land use and large commercial facilities
- shopping streets, restaurants, cafes, and nightlife-related facilities
- parks and green spaces
- bicycle lanes, bicycle parking, and share-cycle ports

The map does not prove causality. It is designed for hypothesis building, discussion, and visual comparison of local city-center conditions.

## How To Read The Map

Start with the two analysis layers:

- Analysis: daytime high people-flow areas
- Analysis: nighttime high people-flow areas

Click a ranked point to read the interpretation for that area. The notes describe the area, mobility conditions, facility mix, possible user types, and urban policy implications.

Supporting layers such as parking, pedestrian spaces, green areas, commercial facilities, public transport, and bicycle-related features can be overlaid to compare possible people-flow drivers.

## Data Sources

This map uses processed and derived information from:

- Okayama City people-flow open data
- OpenStreetMap / Overpass API features
- GTFS public transport data
- PLATEAU / CityGML-derived land-use data
- public web map and aerial photo tiles

Raw source files whose redistribution terms are not fully confirmed are not included in this repository. The public HTML contains only processed or simplified information needed for map display.

## Important People-Flow Limitation

The people-flow data used here is area-level, time-of-day aggregate data. It does not provide official map geometry or official coordinates for each area.

Therefore:

- map points are representative display points, not official mesh centroids
- dashed polygons are reference ranges for interpretation, not official area boundaries
- this should not be read as strict 125 m mesh analysis
- this should not be used for strict density comparison by polygon area
- this should not be treated as an official boundary comparison

The map is suitable for exploratory urban policy discussion, hypothesis building, and visual comparison with surrounding urban features.

## Reproducibility

The published HTML is already generated. To rebuild it locally, place source data outside Git and point the scripts to that data with environment variables.

Common environment variables:

- `OKAYAMA_GTFS_ROOT`
- `OKAYAMA_JINRYU_CSV`
- `OKAYAMA_JINRYU_ROOT`
- `OKAYAMA_PARKING_ROOT`
- `OKAYAMA_PLATEAU_BLDG_DIR`

Example:

```powershell
python 01_okayama/scripts/build_osm_overview.py --light --output docs/index.html
```

Do not commit local raw data, local downloads, caches, or work logs unless redistribution is clearly allowed.

## Repository Structure

```text
.
|-- docs/
|   |-- index.html              # Public map for GitHub Pages
|-- 01_okayama/
|   |-- okayama_osm_light.html  # Working copy of the public map
|   |-- scripts/                # Processing, analysis, and map generation scripts
|   |-- data/                   # Local processed data, ignored by Git by default
|-- data/
|   |-- README.md               # Data publication policy
|-- AGENTS.md                   # Future Codex work rules
|-- requirements.txt
|-- LICENSE
```

## License

Code and documentation in this repository are released under the MIT License unless otherwise noted.

Data layers derived from third-party sources remain subject to the original source licenses. See `data/README.md` for details.

## Planned Improvements

- Replace approximate people-flow reference ranges with official geometries if available.
- Add clearer metadata for each processed layer.
- Add a repeatable data-preparation pipeline with sample inputs.
- Separate embedded data, styling, and analysis text from the HTML.
- Improve public transport frequency, bicycle mobility, and parking-access analysis.
