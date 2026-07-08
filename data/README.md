# Data Publication Policy

This repository is public. Raw source data should only be included when redistribution rights are clear.

## Included In The Public Site

`docs/index.html` and related files may include selected processed information needed for visualization, such as:

- OpenStreetMap-derived features
- simplified display metadata
- layer configuration
- text prepared for the public map

## Not Included

The repository should not include:

- raw datasets with unclear redistribution rights
- local caches and temporary exports
- Overpass cache files unless intentionally prepared for publication
- files containing personal information
- files containing local absolute paths
- secrets, tokens, or API keys

## OSM And Interpretation

OpenStreetMap coverage varies by place. The amount of information visible on the public map may differ from area to area depending on local mapping activity.

If the project includes approximate display areas or representative points, they must be described as reference geometry, not official boundaries.

## Source Licenses

Anyone reusing this repository should check the original license or terms for each external source.

- OpenStreetMap: Open Database License
- aerial photo and base map tiles: original provider terms
- other imported datasets: original provider terms

When redistribution is uncertain, do not commit the raw file. Point users to the original source instead.
