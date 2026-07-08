import { runOverpassQuery } from "./overpass.js";
import { loadCatalogItems } from "./catalog.js";

// データ取得の基盤。「取得ボタンを押した瞬間の表示範囲」に対して、候補の全要素を取得する。
// 体感速度のため、軽い点データ(render_type=circle)を先に取得して即座に描画し、
// 重い線・面データは続けて取得してマージする(二段階取得)。以降のレンズ/レイヤ操作は
// 取得済みデータの表示切替のみ(通信なし・即座)。地図を動かしても自動再取得はしない。
// 取得した範囲は点線の矩形で地図上に明示する。同じ範囲・同じ要素構成の再取得は
// sessionStorageのキャッシュから即座に復元する。

export const MIN_FETCH_ZOOM = 14;

const SOURCE_ID = "osm-data";
const EXTENT_SOURCE_ID = "fetch-extent";
const EMPTY_FC = { type: "FeatureCollection", features: [] };
const CACHE_PREFIX = "rmc-fetch-cache-v1:";
const CACHE_MAX_BYTES = 2_000_000;

function cacheKeyFor(b, categoryIds) {
  const round = (n) => n.toFixed(4);
  const configKey = categoryIds.slice().sort().join(",");
  return `${CACHE_PREFIX}${round(b.s)},${round(b.w)},${round(b.n)},${round(b.e)}|${configKey}`;
}

function loadFromCache(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToCache(key, fc) {
  try {
    const json = JSON.stringify(fc);
    if (json.length > CACHE_MAX_BYTES) return;
    sessionStorage.setItem(key, json);
  } catch {
    // sessionStorageが使えない・容量超過の場合は黙って諦める(通常フローに影響させない)
  }
}

// 要素ごとの分類。1本のクエリで取得した混合結果を、catalog.jsonのidに振り分ける。
// 順序に意味がある(例: highway=crossingはsidewalk判定より先に見る)。
function categorize(tags) {
  if (tags.amenity === "parking") {
    return tags.parking === "multi-storey" || tags.parking === "underground"
      ? "parking_structure"
      : "parking_surface";
  }
  if (tags.railway === "station") return "station";
  if (tags.highway === "bus_stop") return "bus_stop";
  if (tags.leisure === "park") return "park";
  if (tags.highway === "pedestrian") return "pedestrian_street";
  if (tags.highway === "crossing") return "crossing";
  if (tags.highway === "footway" && tags.footway === "sidewalk") return "sidewalk";
  if (tags.highway && /^(both|left|right)$/.test(tags.sidewalk || "")) return "sidewalk";
  if (tags.amenity === "cafe") return "cafe";
  if (tags.amenity === "restaurant" || tags.amenity === "fast_food" || tags.amenity === "izakaya") return "restaurant";
  if (tags.amenity === "bench") return "bench";
  if (tags.amenity === "bicycle_parking") return "bicycle_parking";
  if (/^(bicycle_rental|kick-scooter_rental)$/.test(tags.amenity || "")) return "bike_share";
  if (tags.highway === "cycleway") return "cycleway";
  if (tags.highway && /^(lane|track)$/.test(tags.cycleway || "")) return "cycleway";
  if (tags.shop === "books") return "bookstore";
  if (tags.amenity === "place_of_worship" || tags.historic) return "worship";
  if (tags.tourism === "museum" || tags.tourism === "gallery") return "museum";
  if (tags.shop === "mall" || tags.shop === "department_store") return "large_retail";
  return null;
}

// ---- アクセス性(徒歩圏)関連 ----
// 徒歩圏の目安: 駅800m / バス停300m (CLAUDE.mdの定義)。
// 円と距離判定は単純な球面近似で十分なため、外部ライブラリは使わない。
const STATION_RADIUS_M = 800;
const BUS_RADIUS_M = 300;

function distanceMeters([lon1, lat1], [lon2, lat2]) {
  const kx = 111320 * Math.cos((((lat1 + lat2) / 2) * Math.PI) / 180);
  const ky = 110574;
  const dx = (lon1 - lon2) * kx;
  const dy = (lat1 - lat2) * ky;
  return Math.sqrt(dx * dx + dy * dy);
}

function representativeCoord(geometry) {
  if (geometry.type === "Point") return geometry.coordinates;
  if (geometry.type === "LineString") return geometry.coordinates[0];
  if (geometry.type === "Polygon") return geometry.coordinates[0][0];
  return null;
}

// 複数の徒歩圏円を1つの図形に結合し、その外側輪郭線だけを返す(重なりの内側線は消える)。
function unionOutline(centers, radiusM) {
  if (centers.length === 0) return [];
  const circles = centers.map((c) => turf.circle(c, radiusM / 1000, { steps: 64, units: "kilometers" }));
  const merged = circles.length === 1 ? circles[0] : turf.union(turf.featureCollection(circles));
  if (!merged) return [];
  const lineResult = turf.polygonToLine(merged);
  return lineResult.type === "FeatureCollection" ? lineResult.features : [lineResult];
}

// お出かけ先(access_target)に徒歩圏内外フラグ(_access)を付与し、徒歩圏の輪郭線FCを返す。
function annotateAccess(fc, accessTargetIds) {
  const stations = [];
  const busStops = [];
  for (const f of fc.features) {
    if (f.properties._category === "station") stations.push(representativeCoord(f.geometry));
    if (f.properties._category === "bus_stop") busStops.push(representativeCoord(f.geometry));
  }

  for (const f of fc.features) {
    if (!accessTargetIds.includes(f.properties._category)) continue;
    const p = representativeCoord(f.geometry);
    const inside =
      stations.some((s) => distanceMeters(p, s) <= STATION_RADIUS_M) ||
      busStops.some((b) => distanceMeters(p, b) <= BUS_RADIUS_M);
    f.properties._access = inside ? "in" : "out";
  }

  const stationLines = unionOutline(stations, STATION_RADIUS_M).map((f) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: { kind: "station" },
  }));
  const busLines = unionOutline(busStops, BUS_RADIUS_M).map((f) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: { kind: "bus" },
  }));
  return { type: "FeatureCollection", features: [...stationLines, ...busLines] };
}

function bboxString(b) {
  return `${b.s},${b.w},${b.n},${b.e}`;
}

function boundsFromMap(map) {
  const b = map.getBounds();
  return { w: b.getWest(), s: b.getSouth(), e: b.getEast(), n: b.getNorth() };
}

function buildQuery(bbox, items) {
  const clauses = items
    .flatMap((item) => (Array.isArray(item.overpass_filter) ? item.overpass_filter : [item.overpass_filter]))
    .map((f) => `${f}(${bbox});`)
    .join("\n  ");
  return `[out:json][timeout:30];
(
  ${clauses}
);
out geom qt;`;
}

function elementsToFeatureCollection(elements) {
  const features = [];
  for (const el of elements) {
    const tags = el.tags || {};
    const category = categorize(tags);
    if (!category) continue;

    let geometry = null;
    if (el.type === "node") {
      geometry = { type: "Point", coordinates: [el.lon, el.lat] };
    } else if (el.type === "way" && Array.isArray(el.geometry)) {
      const coords = el.geometry.filter(Boolean).map((p) => [p.lon, p.lat]);
      if (coords.length < 2) continue;
      const isClosed =
        coords.length > 3 &&
        coords[0][0] === coords[coords.length - 1][0] &&
        coords[0][1] === coords[coords.length - 1][1];
      geometry = isClosed
        ? { type: "Polygon", coordinates: [coords] }
        : { type: "LineString", coordinates: coords };
    } else {
      continue; // relation(マルチポリゴン)はv0.1では未対応
    }

    features.push({
      type: "Feature",
      geometry,
      properties: { ...tags, _category: category, _osmId: el.id, _osmType: el.type },
    });
  }
  return { type: "FeatureCollection", features };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// 大規模商業施設などを塗りつぶしではなく斜線ハッチングで表示するための
// パターン画像をcanvasで生成し、MapLibreのスタイル画像として登録する。
function ensureHatchPattern(map, imageId, color) {
  if (map.hasImage(imageId)) return;
  const size = 8;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();
  map.addImage(imageId, ctx.getImageData(0, 0, size, size));
}

function addLayerForItem(map, item) {
  const layerId = `osm-${item.id}`;
  const filter = ["==", ["get", "_category"], item.id];

  if (item.render_type === "circle") {
    map.addLayer({
      id: layerId,
      type: "circle",
      source: SOURCE_ID,
      filter,
      paint: {
        "circle-color": item.style_draft["circle-color"],
        "circle-radius": item.style_draft["circle-radius"] ?? 4,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
    });
  } else if (item.render_type === "line") {
    map.addLayer({
      id: layerId,
      type: "line",
      source: SOURCE_ID,
      filter,
      paint: {
        "line-color": item.style_draft["line-color"],
        "line-width": item.style_draft["line-width"] ?? 2,
      },
    });
  } else if (item.render_type === "fill-pattern") {
    const patternId = `pattern-${item.id}`;
    ensureHatchPattern(map, patternId, item.style_draft["fill-color"]);
    map.addLayer({
      id: layerId,
      type: "fill",
      source: SOURCE_ID,
      filter,
      paint: {
        "fill-pattern": patternId,
      },
    });
  } else {
    map.addLayer({
      id: layerId,
      type: "fill",
      source: SOURCE_ID,
      filter,
      paint: {
        "fill-color": item.style_draft["fill-color"],
        "fill-opacity": item.style_draft["fill-opacity"] ?? 0.3,
      },
    });
  }

  let accessLayerId = null;
  if (item.access_target) {
    // 「お出かけ先」(アクセス性ボタン用)。同じsource+filterに対し、
    // 徒歩圏内=青/圏外=赤で塗り分けた別レイヤを重ねて用意する。
    accessLayerId = `osm-${item.id}-access`;
    map.addLayer({
      id: accessLayerId,
      type: "circle",
      source: SOURCE_ID,
      filter,
      layout: { visibility: "none" },
      paint: {
        "circle-color": ["case", ["==", ["get", "_access"], "out"], "#c0392b", "#2874a6"],
        "circle-radius": item.style_draft["circle-radius"] ?? 4,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
    });
  }

  return { layerId, accessLayerId };
}

export async function setupOsmData(
  map,
  categoryIds,
  { onData, onError, onLoadingChange, onZoomTooLow } = {},
  getFetchBounds,
  accessTargetIds = []
) {
  const catalogItems = await loadCatalogItems();
  const items = categoryIds.map((id) => catalogItems.find((i) => i.id === id)).filter(Boolean);
  if (items.length !== categoryIds.length) {
    console.warn("config/catalog.jsonに定義が不足している要素があります");
  }

  map.addSource(SOURCE_ID, { type: "geojson", data: EMPTY_FC });
  map.addSource(EXTENT_SOURCE_ID, { type: "geojson", data: EMPTY_FC });
  map.addSource("walk-circles", { type: "geojson", data: EMPTY_FC });

  map.addLayer({
    id: "fetch-extent-line",
    type: "line",
    source: EXTENT_SOURCE_ID,
    paint: {
      "line-color": "#1a1a1a",
      "line-width": 2,
      "line-dasharray": [2, 2],
      "line-opacity": 0.7,
    },
  });

  // 徒歩圏(駅800m/バス停300m)の輪郭のみ。塗りはしない(CLAUDE.md: 輪郭のみ)。
  // 駅=実線、バス停=破線で見分ける(line-dasharrayはデータ駆動にできないためレイヤを分ける)。
  map.addLayer({
    id: "walk-circles-station",
    type: "line",
    source: "walk-circles",
    filter: ["==", ["get", "kind"], "station"],
    layout: { visibility: "none" },
    paint: {
      "line-color": "#2874a6",
      "line-width": 2,
      "line-opacity": 0.8,
    },
  });
  map.addLayer({
    id: "walk-circles-bus",
    type: "line",
    source: "walk-circles",
    filter: ["==", ["get", "kind"], "bus"],
    layout: { visibility: "none" },
    paint: {
      "line-color": "#2874a6",
      "line-width": 1.5,
      "line-opacity": 0.8,
      "line-dasharray": [3, 2],
    },
  });

  const layerIdByCategory = {};
  const accessLayerIdByCategory = {};
  const labelByCategory = {};
  const allLayerIds = [];
  for (const item of items) {
    const { layerId, accessLayerId } = addLayerForItem(map, item);
    layerIdByCategory[item.id] = layerId;
    labelByCategory[item.id] = item.label_ja;
    map.setLayoutProperty(layerId, "visibility", "none");
    allLayerIds.push(layerId);
    if (accessLayerId) {
      accessLayerIdByCategory[item.id] = accessLayerId;
      allLayerIds.push(accessLayerId);
    }
  }

  for (const layerId of allLayerIds) {
    map.on("click", layerId, (e) => {
      const f = e.features[0];
      const name = f.properties.name || "(名称不明)";
      const label = labelByCategory[f.properties._category] || f.properties._category;
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<strong>${escapeHtml(label)}</strong><br>${escapeHtml(name)}`)
        .addTo(map);
    });
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  }

  let abortController = null;
  let fetchedBounds = null;
  let lastData = EMPTY_FC;

  const pointItems = items.filter((item) => item.render_type === "circle");
  const shapeItems = items.filter((item) => item.render_type !== "circle");

  function setExtentRectangle(b) {
    map.getSource(EXTENT_SOURCE_ID).setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [b.w, b.s],
          [b.e, b.s],
          [b.e, b.n],
          [b.w, b.n],
          [b.w, b.s],
        ],
      },
      properties: {},
    });
  }

  function renderData(fc) {
    lastData = fc;
    const circles = annotateAccess(lastData, accessTargetIds);
    map.getSource(SOURCE_ID).setData(lastData);
    map.getSource("walk-circles").setData(circles);
  }

  async function fetchNow() {
    if (map.getZoom() < MIN_FETCH_ZOOM) {
      onZoomTooLow?.(MIN_FETCH_ZOOM);
      return false;
    }

    const b = getFetchBounds ? getFetchBounds() : boundsFromMap(map);
    const cacheKey = cacheKeyFor(b, categoryIds);

    const cached = loadFromCache(cacheKey);
    if (cached) {
      renderData(cached);
      fetchedBounds = b;
      setExtentRectangle(b);
      onData?.(lastData);
      return true;
    }

    if (abortController) abortController.abort();
    abortController = new AbortController();
    const { signal } = abortController;
    onLoadingChange?.(true);
    try {
      // 第1段: 軽い点データを先に取得して即座に描画する(体感速度優先)。
      let merged = EMPTY_FC;
      if (pointItems.length > 0) {
        const json1 = await runOverpassQuery(buildQuery(bboxString(b), pointItems), { signal });
        merged = elementsToFeatureCollection(json1.elements || []);
        renderData(merged);
        onData?.(lastData);
      }

      // 第2段: 重い線・面データを続けて取得し、マージする。
      if (shapeItems.length > 0) {
        const json2 = await runOverpassQuery(buildQuery(bboxString(b), shapeItems), { signal });
        const shapeFc = elementsToFeatureCollection(json2.elements || []);
        merged = { type: "FeatureCollection", features: [...merged.features, ...shapeFc.features] };
        renderData(merged);
      }

      fetchedBounds = b;
      setExtentRectangle(b);
      saveToCache(cacheKey, lastData);
      onData?.(lastData);
      return true;
    } catch (err) {
      if (err.name !== "AbortError") {
        // 第1段が既に届いていれば、そのデータは表示したまま維持する
        // (fetchedBoundsは設定しないため、再取得ボタンでやり直せる状態のまま)。
        onError?.(err);
      }
      return false;
    } finally {
      onLoadingChange?.(false);
    }
  }

  return {
    fetch: fetchNow,
    clear() {
      lastData = EMPTY_FC;
      fetchedBounds = null;
      map.getSource(SOURCE_ID).setData(EMPTY_FC);
      map.getSource(EXTENT_SOURCE_ID).setData(EMPTY_FC);
      map.getSource("walk-circles").setData(EMPTY_FC);
      if (abortController) abortController.abort();
    },
    setVisibleCategories(visibleSet) {
      for (const [category, layerId] of Object.entries(layerIdByCategory)) {
        map.setLayoutProperty(layerId, "visibility", visibleSet.has(category) ? "visible" : "none");
      }
    },
    setAccessVisibleCategories(visibleSet) {
      for (const [category, layerId] of Object.entries(accessLayerIdByCategory)) {
        map.setLayoutProperty(layerId, "visibility", visibleSet.has(category) ? "visible" : "none");
      }
    },
    setCirclesVisible(visible) {
      const vis = visible ? "visible" : "none";
      map.setLayoutProperty("walk-circles-station", "visibility", vis);
      map.setLayoutProperty("walk-circles-bus", "visibility", vis);
    },
    hasData: () => lastData.features.length > 0 || fetchedBounds !== null,
    getFetchedBounds: () => fetchedBounds,
    getData: () => lastData,
  };
}
