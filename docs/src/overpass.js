// 公開Overpassエンドポイントは無償運営でフェアユース制限があるため、
// 429/5xx/remarkエラー時は次のエンドポイントへフォールバックする。
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

export async function runOverpassQuery(query, { signal } = {}) {
  let lastError = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal,
      });

      if (res.status === 429 || res.status >= 500) {
        lastError = new Error(
          `Overpass APIが混雑しています(${res.status})。しばらく時間をおいて再度お試しください。`
        );
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Overpass APIエラー (${res.status}): ${text.slice(0, 200)}`);
      }

      const json = await res.json();
      // OverpassはOverpass QLの実行時エラー(タイムアウト等)でもHTTP 200を返し、
      // remarkフィールドにエラー内容が入ることがある。
      if (json.remark) {
        lastError = new Error(`Overpassからエラー応答がありました: ${json.remark}`);
        continue;
      }

      return json;
    } catch (err) {
      if (err.name === "AbortError") throw err;
      lastError = err;
    }
  }

  throw lastError || new Error("Overpass APIに接続できませんでした。");
}
