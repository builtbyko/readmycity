import { runOverpassQuery } from "./overpass.js";

const CACHE_PREFIX = "rmc-hub-cache-v3:";
const STATION_MIN_NEARBY_POI = 5; // 主要駅とみなすには駅周辺500mにこれ以上の商業POIが必要
const STATION_NEARBY_RADIUS_M = 500;
const HUB_MIN_POI = 10; // これ未満は密度計算が意味をなさない

function distanceMeters([lon1, lat1], [lon2, lat2]) {
  const kx = 111320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const ky = 110574;
  const dx = (lon1 - lon2) * kx;
  const dy = (lat1 - lat2) * ky;
  return Math.sqrt(dx * dx + dy * dy);
}

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function setCached(key, value) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch {
    // sessionStorageが使えない環境(プライベートブラウズ等)では黙って諦める
  }
}

// 市区町村名をNominatim(OSM公式の地名検索)で検索し、即座にbbox・中心を返す。
// Overpassのarea/relationクエリより大幅に高速なため、検索直後にジャンプできる。
export async function searchCityNominatim(rawInput) {
  const query = rawInput.trim();
  const cacheKey = "nominatim:" + query;
  const cached = getCached(cacheKey);
  if (cached !== undefined) {
    if (cached === null) throw new Error(`「${query}」が見つかりませんでした。正式名称(例: 盛岡市)でご確認ください。`);
    return cached;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=jp&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "ja" } });
  if (!res.ok) {
    throw new Error(`検索サービスへの接続に失敗しました (${res.status})`);
  }
  const results = await res.json();

  const adminResults = results.filter((r) => r.class === "boundary" && r.type === "administrative");
  const candidates = adminResults.length > 0 ? adminResults : results;

  if (candidates.length === 0) {
    setCached(cacheKey, null);
    throw new Error(`「${query}」が見つかりませんでした。正式名称(例: 盛岡市)でご確認ください。`);
  }

  // 同名市区町村(例: 府中市が東京都・広島県に存在)の曖昧性チェック。
  // 都道府県名が入力に含まれていない状態で、遠く離れた複数の行政界候補があれば
  // 誤った街に飛ぶ危険があるため、再入力を促す。
  const hasPrefectureHint = /[ 　]/.test(query);
  if (adminResults.length > 1 && !hasPrefectureHint) {
    const far = adminResults.some((r, i) =>
      adminResults
        .slice(i + 1)
        .some((r2) => distanceMeters([Number(r.lon), Number(r.lat)], [Number(r2.lon), Number(r2.lat)]) > 50000)
    );
    if (far) {
      throw new Error(
        `「${query}」という名称の自治体が複数見つかりました。同名の市区町村が別の都道府県に存在する可能性があります。` +
          `「都道府県名 ${query}」の形式で入力し直してください(例: 東京都 ${query})。`
      );
    }
  }

  const best = candidates[0];
  const [south, north, west, east] = best.boundingbox.map(Number);
  const bounds = [
    [west, south],
    [east, north],
  ];
  const center = [Number(best.lon), Number(best.lat)];

  const result = { center, bounds, displayName: best.display_name };
  setCached(cacheKey, result);
  return result;
}

// 検索でジャンプした後、裏側で「拠点(主要駅)」を推定する。重い処理(Overpass)のため
// UIをブロックしない。呼び出し側は、ユーザーがまだ地図を操作していなければ結果を採用する。
//
// 「拠点」は駅ではなく実際に賑わいが存在する場所とみなす。OSMには乗降者数のデータがない
// ため、駅周辺500mの商業POI件数が最も多い駅を主要駅の近似とする(多くの街で中心駅と一致)。
// これはUIに数値・スコアとして出さない、初期カメラ位置の目安に過ぎない内部処理。
export async function refineHubInBackground(bounds) {
  const [[minlon, minlat], [maxlon, maxlat]] = bounds;
  const cacheKey = "hub:" + bounds.flat().join(",");
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  const query = `[out:json][timeout:15];
(
  node["amenity"~"^(cafe|restaurant|fast_food)$"](${minlat},${minlon},${maxlat},${maxlon});
  node["shop"="convenience"](${minlat},${minlon},${maxlat},${maxlon});
  node["railway"="station"](${minlat},${minlon},${maxlat},${maxlon});
);
out;`;

  const json = await runOverpassQuery(query);
  const elements = json.elements || [];
  const stations = elements
    .filter((e) => e.tags?.railway === "station" && Number.isFinite(e.lon) && Number.isFinite(e.lat))
    .map((e) => ({ coord: [e.lon, e.lat], name: e.tags?.name || "(名称不明の駅)" }));
  const poiPoints = elements
    .filter((e) => e.tags?.railway !== "station")
    .map((e) => [e.lon, e.lat])
    .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));

  let best = null;
  for (const st of stations) {
    const nearby = poiPoints.filter((p) => distanceMeters(p, st.coord) <= STATION_NEARBY_RADIUS_M).length;
    if (!best || nearby > best.nearby) best = { ...st, nearby };
  }

  let result;
  if (best && best.nearby >= STATION_MIN_NEARBY_POI) {
    result = { center: best.coord, stationName: best.name };
  } else if (poiPoints.length >= HUB_MIN_POI) {
    const sum = poiPoints.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    result = { center: [sum[0] / poiPoints.length, sum[1] / poiPoints.length], stationName: null };
  } else {
    result = null;
  }

  setCached(cacheKey, result);
  return result;
}
