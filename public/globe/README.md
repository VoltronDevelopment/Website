# Globe geography

Land outlines: Natural Earth, 1:110m land, public domain.
Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson
Terms: https://www.naturalearthdata.com/about/terms-of-use/

`node scripts/build-globe-land.mjs` prepares a continuous 2048 × 1024 equirectangular alpha mask, deterministic land sample coordinates and compact coastline segments. The globe runtime requests land-mask.png and coastlines.bin; land-points.json is retained as a derived reference and is no longer downloaded by the globe. Network nodes are illustrative artwork, not a map of operating sites or live data flows.

The mask retains the source polygon holes and clipped dateline edges. It supplies the theme's continuous land/sea contrast and shallow bump relief. Sphere UV longitude is aligned to the same coordinate convention as the coastlines and illustrative nodes. The outer polygon envelope remains the approved shared topology; no route arcs are rendered.
