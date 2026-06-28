# -*- coding: utf-8 -*-
"""parking GeoJSON のプロパティ構造を確認する"""
import json, os, sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PARKING_ROOT = Path(os.environ.get("OKAYAMA_PARKING_ROOT", PROJECT_ROOT / "99_sonota" / "00_parking"))

files = {
    "parking": PARKING_ROOT / "parking.geojson",
    "parking_osm_flagged": PARKING_ROOT / "parking_osm_flagged.geojson",
}

for name, path in files.items():
    try:
        with open(path, encoding="utf-8") as f:
            geo = json.load(f)
        feats = geo.get("features", [])
        print(f"=== {name} ===")
        print(f"  件数: {len(feats)}")
        if feats:
            props = feats[0].get("properties", {})
            print(f"  プロパティキー: {list(props.keys())}")
            print(f"  最初の要素: {json.dumps(props, ensure_ascii=False)[:300]}")
            geom_type = feats[0].get("geometry", {}).get("type", "?")
            print(f"  ジオメトリ型: {geom_type}")
        print()
    except Exception as e:
        print(f"  ERROR: {e}")
        print()
