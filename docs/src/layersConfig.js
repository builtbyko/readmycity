// レンズ(主張ボタン)と個別レイヤの構成定義。
// 要素そのもののクエリ・スタイルはconfig/catalog.jsonが持ち、ここでは組み合わせだけを決める。

// 一括取得の対象(取得ボタン1回でこの全要素を取る)。並び順=描画順(塗り→線→点)。
// 建物はオーナー判断で除外(航空写真ベースでは自明なため。CLAUDE.mdのボタン4定義からの変更)。
// 車道(roadway)もv0.1では取得しない(航空写真で道路は自明なため回遊性の背景線は不要と判断)。
export const FETCH_CATEGORY_IDS = [
  "park",
  "parking_surface",
  "parking_structure",
  "pedestrian_street",
  "sidewalk",
  "crossing",
  "bicycle_parking",
  "cafe",
  "restaurant",
  "bookstore",
  "worship",
  "museum",
  "bench",
  "station",
  "bus_stop",
  "bike_share",
  "cycleway",
  "large_retail",
];

// 主張ボタン: 1ボタン=表示するカテゴリの集合(取得済みデータの表示切替のみ)。
// 注: 歩行者専用道路はプレイス性(緑)と回遊性の両方に登場するが、v0.1では色は緑で固定
// (1データソース1スタイルのため。CLAUDE.mdでは回遊性で青の想定)。
// アクセス性の対象は「お出かけ先」(飲食店・カフェ・書店・神社仏閣歴史・美術館博物館)。
// スーパー・コンビニ・病院・薬局はオーナー判断で対象から外した。
export const LENS_SETS = {
  place: ["park", "pedestrian_street", "cafe", "restaurant", "bench"],
  mobility: ["sidewalk", "pedestrian_street", "crossing"],
  access: [
    "station",
    "bus_stop",
    "bike_share",
    "cycleway",
    "large_retail",
    "cafe",
    "restaurant",
    "bookstore",
    "worship",
    "museum",
  ],
  car: ["parking_surface", "parking_structure"],
};

// アクセス性ボタンで「徒歩圏内=青/圏外=赤」の色分け対象になる要素(=「お出かけ先」)。
export const ACCESS_TARGET_IDS = ["cafe", "restaurant", "bookstore", "worship", "museum"];

// 個別レイヤ(要素カタログ)。主要素(歩道・駐車場・歩行者専用道路)を先頭に。
// ベンチ・横断歩道・建物はオーナー判断で単独レイヤから除外
// (ベンチはデータが薄い・横断歩道は単独では意味が薄い・建物は航空写真で自明)。
export const LAYER_TOGGLES = [
  { key: "sidewalk", label: "歩道", ids: ["sidewalk"] },
  { key: "parking", label: "駐車場", ids: ["parking_surface", "parking_structure"] },
  { key: "pedestrian_street", label: "歩行者専用道路", ids: ["pedestrian_street"] },
  { key: "park", label: "公園・緑地", ids: ["park"] },
  { key: "cafe", label: "カフェ", ids: ["cafe"] },
  { key: "restaurant", label: "飲食店", ids: ["restaurant"] },
  { key: "bicycle_parking", label: "駐輪場", ids: ["bicycle_parking"] },
  { key: "bike_share", label: "シェアモビリティポート", ids: ["bike_share"] },
  { key: "cycleway", label: "自転車専用道", ids: ["cycleway"] },
  { key: "large_retail", label: "大規模商業施設", ids: ["large_retail"] },
];
