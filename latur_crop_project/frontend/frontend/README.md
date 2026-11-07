# PikMitra frontend (React + Vite)

The mobile-style farmer app for the Crop Recommendation System. It is a **static
SPA**: all crop, score and mandi data is pre-generated into `src/data/*.js` by
`generate_frontend_data.py`, so there is no backend and no runtime API. The only
network request it makes is loading crop photos from Wikimedia.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production bundle -> dist/
npm run preview    # serve the built bundle locally
npm run lint       # eslint (should be clean)
```

## Where things live

| Path | What it is |
|------|------------|
| `src/App.jsx` | routes (`/`, `/find-crop`, `/recommendations`, `/crop/:name`, `/soil`, …) |
| `src/context/FarmContext.jsx` | global state: language, district/tehsil, soil type, water source, season, land size, bookmarks, history. Also computes the final ranked crop list. |
| `src/context/useFarm.js` | the `useFarm()` hook + the context object |
| `src/data/cropsData.js` | **generated** — crop catalog with bilingual copy and economics |
| `src/data/regionalScores.js` | **generated** — per district/tehsil suitability scores |
| `src/data/mandiPrices.js` | **generated** — latest APMC prices |
| `src/data/soilLabEngine.js` | Smart Soil Lab: scores crops against real pH/EC/OC/NPK lab values |
| `src/data/locations.js` | hand-written district + tehsil lists |
| `src/data/translations.js` | hand-written Marathi/English UI strings |
| `src/pages/*`, `src/components/*` | screens and shared UI |

Do not hand-edit the three generated files — change the database and re-run
`generate_frontend_data.py` instead.

## Scoring you see on screen

The Python pipeline produces a baseline score per tehsil. `FarmContext` then
adjusts it for what the farmer entered:

- GI / specialty belts (`REGIONAL_SPECIALTY_CROPS`) — e.g. Mahabaleshwar
  strawberry, Nashik grapes, Konkan cashew — get a boost, and crops that do not
  belong in that belt are capped.
- Soil type and water source (`CROP_AGRONOMY_MATRIX`) add or subtract points; a
  high-water crop on rainfed land is flagged as not suitable.
- Season and land size nudge the score, then the list is re-sorted and re-ranked.
- In Smart Soil Lab mode (`/soil`), the real lab values replace the soil factor
  and a severe pH/EC conflict can mark a crop as not suitable.
