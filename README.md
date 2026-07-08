# Read My City

`Read My City` is a public web map that helps people read their city through OpenStreetMap.

The public GitHub Pages entry point is `docs/index.html`.

Public URL:

[https://builtbyko.github.io/readmycity/](https://builtbyko.github.io/readmycity/)

## Purpose

This project has two main goals:

- help people quickly understand the character of a place through map layers
- share the richness and public value of OpenStreetMap with a wider audience

It is meant to be easy to open, easy to use, and useful even for people who do not usually work with GIS.

## What The Map Shows

The public map combines selected OpenStreetMap-based layers such as:

- sidewalks
- pedestrian streets
- parks and green spaces
- bicycle parking and bike-share ports
- cycleways
- parking
- large retail and other everyday urban features

Users can search for a place, adjust the visible area, and re-fetch data for the current map extent.

## OSM Notice

The amount and type of information shown on the map can vary by area because OpenStreetMap coverage is not equally detailed everywhere.

That difference is part of the point of this project. Places become easier to read when local map data is enriched and maintained.

## Data Policy

This repository is intended for public release.

- do not publish personal information, local absolute paths, API keys, or credentials
- do not commit raw source datasets unless redistribution rights are clearly confirmed
- do not describe approximate display geometry as official boundaries

See `data/README.md` for the publication policy for data and derived layers.

## Repository Structure

```text
.
|-- docs/
|   |-- index.html
|   |-- about.html
|   |-- osm-about.html
|   |-- css/
|   |-- src/
|   `-- config/
|-- data/
|   `-- README.md
|-- AGENTS.md
|-- LICENSE
`-- README.md
```

## Notes

The public site is already built in `docs/`.

Local working folders, source caches, temporary exports, and non-public materials should stay out of Git unless they are explicitly prepared for publication.
