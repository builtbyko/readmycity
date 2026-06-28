# データ公開方針 / Data Publication Policy

English version is available below the Japanese section.

## 日本語

このリポジトリでは、再配布条件が明確でない元データを公開しません。

### 公開地図に含まれるもの

`docs/index.html` には、地図表示に必要な加工済み・簡略化済みの情報が含まれる場合があります。

- 人流の代表点
- 分析メモ
- OpenStreetMap由来の選択的な地物
- PLATEAU由来の商業用地などの加工済み地物
- 公共交通の集約情報
- 駐車場、歩行者空間、緑地、自転車関連の表示用レイヤー

### リポジトリに含めないもの

- 人流の元CSV
- 再配布条件が未確認のGTFS元データ
- PLATEAU CityGMLの生データ
- Overpass APIのキャッシュ
- ローカル中間ファイル
- 作業ログ
- 個人PCの絶対パスやユーザー固有情報を含むファイル

### 人流データの地理表現について

このプロジェクトで使っている人流データには、各エリアの正式な地理境界や公式座標が含まれていません。

地図上の点は代表点です。点線範囲は分析用の参考範囲であり、公式境界ではありません。厳密な125mメッシュ単位の分析や密度比較には使用しないでください。

### 元データのライセンス

再利用者は、必ず各元データ提供元の利用条件を確認してください。

- OpenStreetMap: Open Database License
- PLATEAU / CityGML: 提供元の利用条件
- 岡山市人流オープンデータ: 提供元の利用条件
- GTFSデータ: 提供元の利用条件
- 背景地図・航空写真タイル: 提供元の利用条件

不明な場合は、元データを再配布せず、提供元から取得する手順を示してください。

---

## English

This repository does not publish raw source datasets unless redistribution rights are clear.

### Included In The Public Map

`docs/index.html` may contain selected processed and simplified information needed for visualization, such as:

- representative people-flow display points
- analysis notes
- selected OpenStreetMap-derived features
- selected PLATEAU-derived commercial land-use features
- public transport summary features
- parking, pedestrian, green-space, and bicycle-related display layers

### Not Included

The repository should not include:

- raw people-flow CSV files
- raw GTFS downloads unless redistribution terms are confirmed
- raw PLATEAU CityGML downloads
- Overpass API cache files
- local intermediate files
- work logs
- files containing local absolute paths or user-specific information

### People-Flow Geometry Notice

The people-flow source used in this project does not provide official geometry or official coordinates for each area.

Map points are representative display points. Dashed areas are approximate reference ranges prepared for interpretation. They are not official boundaries and should not be used as strict 125 m mesh geometry.

### Source Licenses

Users who reuse this repository must check the original terms for each source dataset.

- OpenStreetMap: Open Database License
- PLATEAU / CityGML: original provider terms
- Okayama City people-flow open data: original provider terms
- GTFS data: original provider terms
- Base map and aerial photo tiles: original provider terms

When in doubt, do not redistribute the raw source file. Provide instructions for users to download it from the original provider instead.
