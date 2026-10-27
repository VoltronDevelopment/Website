# Globe geography

Land outlines: Natural Earth, 1:110m land, public domain.
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
Terms: https://www.naturalearthdata.com/about/terms-of-use/

`node scripts/build-globe-land.mjs` prepares deterministic land sample coordinates. The runtime requests only land-points.json. Network nodes and routes are illustrative artwork, not a map of operating sites or live data flows.

The runtime also requests compact coastlines.bin for clear continent boundaries beneath the polygon envelope. Sphere UV longitude is aligned to the same coordinate convention as the coastlines and illustrative nodes.
