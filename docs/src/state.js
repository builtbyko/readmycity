// 画面状態をURLパラメータで再現する(庁内でのメール+URL転送を想定)。
// city: 市町村名 / lens: 主張ボタンID / bbox: west,south,east,north / zoom

export function readStateFromUrl() {
  const params = new URLSearchParams(location.search);
  const bboxParam = params.get("bbox");
  const bboxNums = bboxParam ? bboxParam.split(",").map(Number) : null;
  const bbox = bboxNums && bboxNums.length === 4 && bboxNums.every(Number.isFinite) ? bboxNums : null;

  const zoomNum = params.get("zoom") ? Number(params.get("zoom")) : null;
  const zoom = Number.isFinite(zoomNum) ? zoomNum : null;

  const layersParam = params.get("layers");
  const layers = layersParam ? layersParam.split(",").filter(Boolean) : [];

  return {
    city: params.get("city") || "",
    lens: params.get("lens") || "",
    layers,
    bbox,
    zoom,
  };
}

export function writeStateToUrl(state) {
  const params = new URLSearchParams();
  if (state.city) params.set("city", state.city);
  if (state.lens) params.set("lens", state.lens);
  if (state.layers && state.layers.length > 0) params.set("layers", state.layers.join(","));
  if (state.bbox) params.set("bbox", state.bbox.map((n) => n.toFixed(5)).join(","));
  if (state.zoom != null) params.set("zoom", state.zoom.toFixed(2));
  const query = params.toString();
  const url = query ? `${location.pathname}?${query}` : location.pathname;
  history.replaceState(null, "", url);
}
