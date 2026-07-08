import { loadCatalogItems } from "./catalog.js";

const ATTRIBUTION_TEXT = "地図: 地理院タイル / データ: (c) OpenStreetMap contributors (ODbL)";

function representativePoint(geometry) {
  if (geometry.type === "Point") return `${geometry.coordinates[1]},${geometry.coordinates[0]}`;
  if (geometry.type === "LineString") {
    const p = geometry.coordinates[0];
    return `${p[1]},${p[0]}`;
  }
  if (geometry.type === "Polygon") {
    const p = geometry.coordinates[0][0];
    return `${p[1]},${p[0]}`;
  }
  return "";
}

// OSMタグはユーザー入力由来の任意文字列。Excelで開いたときに
// "=", "+", "-", "@" で始まるセルが数式として評価されるのを防ぐ。
function sanitizeCell(value) {
  if (typeof value === "string" && /^[=+\-@]/.test(value)) {
    return "'" + value;
  }
  return value;
}

export async function exportFeaturesToExcel(featureCollection, filename) {
  const catalogItems = await loadCatalogItems();
  const labelById = Object.fromEntries(catalogItems.map((item) => [item.id, item.label_ja]));

  const rows = featureCollection.features.map((f) => {
    const { _category, _osmId, _osmType, ...tags } = f.properties;
    const row = {
      種別: labelById[_category] || _category,
      名称: sanitizeCell(tags.name || ""),
      緯度経度_代表点: representativePoint(f.geometry),
      OSM種類: _osmType,
      OSM_ID: _osmId,
    };
    for (const [key, value] of Object.entries(tags)) {
      row[key] = sanitizeCell(value);
    }
    return row;
  });
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "data");
  XLSX.writeFile(workbook, filename);
}

export function exportMapToPng(map, filename) {
  const mapCanvas = map.getCanvas();
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = mapCanvas.width;
  exportCanvas.height = mapCanvas.height;
  const ctx = exportCanvas.getContext("2d");
  ctx.drawImage(mapCanvas, 0, 0);

  const fontSize = Math.max(12, Math.round(exportCanvas.width / 90));
  ctx.font = `${fontSize}px sans-serif`;
  const padding = Math.round(fontSize * 0.5);
  const textWidth = ctx.measureText(ATTRIBUTION_TEXT).width;
  const boxHeight = fontSize + padding * 2;

  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(0, exportCanvas.height - boxHeight, textWidth + padding * 2, boxHeight);
  ctx.fillStyle = "#222";
  ctx.textBaseline = "middle";
  ctx.fillText(ATTRIBUTION_TEXT, padding, exportCanvas.height - boxHeight / 2);

  exportCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  });
}
