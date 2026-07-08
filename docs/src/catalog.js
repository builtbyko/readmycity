// 要素カタログ(config/catalog.json)の読み込み。日本語業務語彙→OSMタグ→クエリ→スタイルの
// 対応辞書はここ経由で参照し、レイヤ実装側にハードコードしない。
let cachedItemsPromise = null;

export function loadCatalogItems() {
  if (!cachedItemsPromise) {
    cachedItemsPromise = fetch("config/catalog.json")
      .then((res) => {
        if (!res.ok) throw new Error(`要素カタログの読み込みに失敗しました (${res.status})`);
        return res.json();
      })
      .then((json) => json.items);
  }
  return cachedItemsPromise;
}
