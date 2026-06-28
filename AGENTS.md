# AGENTS.md

This repository is intended to be published as an open source urban policy GIS project.
All future Codex work must follow these rules.

## Most Important Rules

- Do not publish personal information, Windows user names, absolute local paths, email addresses, API keys, tokens, or credentials.
- Do not leave strings such as `C:\Users\...`, local user names, or local working paths in committed files.
- Do not include raw source datasets such as `kobetsuarea_time.csv` unless redistribution rights, license terms, and publication scope are clear.
- The people-flow source data used in this project does not provide official geometry or official point coordinates for each area. Points shown on the map are representative display points, not official mesh centroids.
- Do not describe the people-flow layer as a strict 125 m mesh analysis, strict density comparison, or official boundary comparison.
- When displaying approximate areas on the map, clearly label them as reference ranges, not official boundaries.
- The public map must be available through GitHub Pages at `docs/index.html`.
- Keep OSS repository basics current: `README.md`, `.gitignore`, `LICENSE`, `data/README.md`, `requirements.txt`, and public-facing documentation.
- Do not push to GitHub without first showing the user the changed files, important diffs, and publication risks.

## Repository Hygiene

- Prefer small, reviewable changes.
- Keep generated caches, raw downloads, local work logs, and large intermediate data out of Git.
- Use relative paths or environment variables for local source data.
- Before proposing publication, scan for:
  - local absolute paths
  - user names
  - email addresses
  - API keys and tokens
  - raw source data that may not be redistributable
- Do not remove user work unless explicitly asked.

## Analysis Language

- Separate observed facts from interpretation.
- Use cautious wording for inferred behavior, user types, travel modes, and stay purposes.
- Mention limitations where the map could be mistaken for official boundaries or exact density analysis.
