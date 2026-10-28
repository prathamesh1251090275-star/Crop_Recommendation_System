# Latur Crop Recommendation — Complete Architecture & Technical Reference

This document describes the entire project: every file, what it does, how the
files connect to each other, the SQLite schema (with ER diagram), the scoring
engine, and the frontend runtime flow.

> Project root: `C:\Users\Prathamesh\OneDrive\Desktop\Crop_Recommendation_system\latur_crop_project\`

---

## 1. Overview

The project recommends which crops a farmer should grow in a given tehsil
(taluka) of Maharashtra, in Marathi and English.

- **Data side (Python):** collects weather, soil, and mandi price data from
  free public APIs, combines it with a state-wide crop suitability model and
  expert ideal-ranges for 54 crops, and scores every crop for every tehsil.
- **Scoring logic (Python):** compares each tehsil's *real* soil/rainfall/
  temperature against each crop's *ideal* range and produces a 0–100
  suitability score, plus estimated profit using local market / MSP prices.
- **Frontend (React + Vite):** a mobile-style SPA. All data is precomputed
  into static JS files during the build — **there is no backend and no
  runtime API**. The only network request the app makes is loading crop
  photos from Wikimedia's CDN.

**One-sentence architecture:** a Python ETL + scoring pipeline reads from a
SQLite database and writes three JavaScript data modules; Vite bundles those
modules with the React app into a static website.

---

## 2. Technology Stack

| Layer      | Technology                        | Notes |
|------------|-----------------------------------|-------|
| Language   | Python 3 (stdlib + `requests`)    | No pandas / Django needed for the pipeline. `requests` is the only third-party lib (used only by the fetch scripts). |
| Database   | SQLite (`sqlite3` built-in)       | Single file `latur_crops.db`. No server, zero setup. Schema is plain SQL → can migrate to Postgres later. |
| APIs       | Open-Meteo, ISRIC SoilGrids, data.gov.in (Agmarknet) | All free; only Agmarknet needs an API key. |
| Model data | `Maharashtra_Tehsil_Level_Crop_Suitability_Model.xlsx` | Imported once via pandas/openpyxl (the two extra libs). |
| Frontend   | React 19 + Vite + React Router    | Mobile-frame SPA; builds to static files. |
| Data format| JS modules exported from JSON     | `cropsData.js`, `regionalScores.js`, `mandiPrices.js` are `export const X = {…};` |

---

## 3. Big Picture — Data Flow

```
                 PUBLIC APIs (internet)
   ┌───────────────┬──────────────────┬───────────────┐
   │  Open-Meteo   │  ISRIC SoilGrids │  data.gov.in  │
   │  (weather)    │  (soil)          │  (agmarknet)  │
   └───────┬───────┴─────────┬────────┴───────┬───────┘
           │                 │                │
           ▼                 ▼                ▼
   ┌──────────────────────────────────────────────────────────┐
   │                    latur_crops.db (SQLite)               │
   │                                                          │
   │  regions  crops  soil_data  weather_data  price_data     │
   │  external_suitability_scores  crop_suitability_scores     │
   │  price_outliers_review                                   │
   └───────────────┬──────────────────────────────────────────┘
                   │  (read-only)          generate_frontend_data.py
                   ▼
   ┌──────────────────────────────────────────────────────────┐
   │  generated JS data modules (frontend/frontend/src/data)  │
   │  cropsData.js  regionalScores.js  mandiPrices.js         │
   └───────────────┬──────────────────────────────────────────┘
                   │  import
                   ▼
   ┌──────────────────────────────────────────────────────────┐
   │      React SPA (frontend/frontend)  →  npm run build     │
   │      → static dist/ (HTML/CSS/JS)  →  served by npm dev  │
   └──────────────────────────────────────────────────────────┘
```

**What the farmer sees:** pick district + tehsil → 54 crops sorted by score,
badges (Best / Good / Consider), a red “not suitable” warning, factor bars
(soil / rain / temp / irrigation / market), economics (₹/acre), bilingual
agronomy advice, and a live mandi-price tab.

---

## 4. Full File & Folder Reference

### 4.1 Python scripts (root of `latur_crop_project\`)

| File | Purpose | Reads | Writes |
|------|---------|-------|--------|
| `config.py` | **Single source of truth**: dists, tehsils + lat/lon, crop ideal ranges, market prices, API keys/endpoints, DB path. Every script imports it. | — | — |
| `run_all.py` | Orchestrator: runs `init_db → fetch_weather → fetch_soil → fetch_prices → clean_data` in order, stops on first failure. Supports `--district`. | — | runs other scripts |
| `init_db.py` | Creates schema (idempotent), runs migrations, seeds `regions` (from `TEHSILS_BY_DISTRICT`) and `crops` (from `CROPS`), creates indexes. | `config.py` | `latur_crops.db` |
| `fetch_weather.py` | Daily rainfall + temp max/min per tehsil (2020–2025) from Open-Meteo archive. Skips tehsils that already have data. | regions | `weather_data` |
| `fetch_soil.py` | Soil pH / organic carbon / nitrogen per tehsil from ISRIC SoilGrids (coarse 250 m modeled data — best-effort fallback, see README). | regions | `soil_data` |
| `fetch_prices.py` | Historical mandi price rows (min/max/modal) per crop+district from data.gov.in Agmarknet, paginated 1000/request. Uses `COMMODITY_NAME_MAP` to match agmarknet spellings. | crops, districts | `price_data` |
| `clean_data.py` | Flags statistical price outliers (z-score) into `price_outliers_review` (never deletes) and prints a coverage report. | `price_data` | `price_outliers_review` |
| `import_state_model.py` | Imports the 358-taluka / 36-district / 30-crop suitability Excel model. Reconciles Latur/Nagpur tehsil names with existing region rows; replaces single-HQ placeholders in other districts with real taluka lists; imports model scores. | `Maharashtra_Tehsil_Level_Crop_Suitability_Model.xlsx` | `regions`, `external_suitability_scores` |
| `score_crops.py` | **The scoring engine.** Recomputes `crop_suitability_scores` for every region×crop (deletes + rewrites the table each run). | regions, crops, soil, weather, price, external scores | `crop_suitability_scores` |
| `generate_frontend_data.py` | **Read-only exporter.** Builds `cropsData.js`, `regionalScores.js`, `mandiPrices.js` from the DB (crops, external scores, rule scores, prices). Idempotent. | DB | JS files in `frontend/frontend/src/data/` |
| `check_data.py` | Sanity printer — “what is actually stored”. | DB | console |
| `verify_data.py` | Verifies DB coverage/sanity (supplementary). | DB | console |
| `build_tehsils_config.py` | Writes the `TEHSILS_BY_DISTRICT` block into `config.py` from `geocoded_tehsils.json` (backs up `config.py.bak`). | `geocoded_tehsils.json` | `config.py` |
| `geocode_tehsils.py` | Geocodes tehsil names → lat/lon into `geocoded_tehsils.json`, failures to `geocode_failures.csv`. | `tehsil_list.json` | `geocoded_tehsils.json`, `geocode_failures.csv` |
| `list_commodities.py`, `find_names.py`, `inspect_fields.py`, `test_connection.py`, `test_national.py` | One-off exploratory utilities (list agmarknet commodities, inspect API fields, test connectivity). | API / DB | console |
| `app.py`, `app (4).py` | **Empty (0 bytes) placeholder files** — unused leftovers, safe to delete. | — | — |

Run order for first-time setup (also see §8):

```
run_all.py ─► import_state_model.py ─► score_crops.py ─► generate_frontend_data.py ─► npm run build
```

### 4.2 Data / artifact files (root)

| File | Contents |
|------|----------|
| `latur_crops.db` | The SQLite database (single file, ~6.5 MB). |
| `Maharashtra_Tehsil_Level_Crop_Suitability_Model.xlsx` | Imported state-wide model (source for `external_suitability_scores`). |
| `geocoded_tehsils.json` | Tehsil → lat/lon used to build `config.py`. |
| `tehsil_list.json` | Raw tehsil name list. |
| `geocode_failures.csv` | Tehsils that failed auto-geocoding. |
| `config_tehsils_block.py.txt` | Backup/draft of the generated `TEHSILS_BY_DISTRICT` block. |

### 4.3 Frontend (`latur_crop_project\frontend\frontend\`)

```
frontend/frontend/
├─ package.json / vite.config.js / index.html   Vite + React setup
├─ src/
│  ├─ main.jsx             React root, mounts <App/>
│  ├─ App.jsx              BrowserRouter + all routes + <BottomNav/> + <LocationModal/>
│  ├─ App.css / index.css  styling (mobile frame)
│  ├─ context/FarmContext.jsx   Global state: language, district/tehsil, merge
│  │                           of regional scores into crops, bookmarks, history
│  ├─ data/
│  │  ├─ cropsData.js      GENERATED — 55 crops, bilingual catalog + economics
│  │  ├─ regionalScores.js GENERATED — per district/tehsil scores & factors
│  │  ├─ mandiPrices.js    GENERATED — latest APMC prices per district/crop
│  │  ├─ locations.js      Hand-written — 36 districts + 362 tehsils (names)
│  │  ├─ translations.js   Hand-written — Marathi/English UI strings
│  │  └─ crops.js          (legacy / unused flat crop list)
│  ├─ pages/               Home, FindCropForm, Recommendations, CropDetails,
│  │                       CheckCrop, Compare, CropFacts, Profile, History, …
│  └─ components/          CropCard, Header, BottomNav, LocationModal,
│                          RadialGauge, StatCard
```

**How the frontend pages consume the data:**

| Page | Data used |
|------|-----------|
| Home / Recommendations / FindCropForm | `dynamicCrops` from `FarmContext` (score-sorted) |
| CropDetails (`/crop/:name`) | single crop + factors, not-suitable banner, mandi tab |
| Compare | two crops side-by-side from `dynamicCrops` |
| Market | `MANDI_PRICES[district]` |
| LocationModal | `locations.js` district/tehsil lists |
| Everything | `translations.js` for mr/en text |

---

## 5. Database — ER Diagram & Schema

### 5.1 ER Diagram (logical relationships)

```
                                 ┌────────────┐
                 ┌──────────────►│   crops    │◄──────────────┐
                 │      crop_id  │            │  crop_id      │
                 │               └────────────┘               │
                 │  crop_id                     crop_id        │
                 │                                            │
┌────────────┐   │   ┌─────────────────────┐                 ┌──────────────────┐
│  regions   │   │   │ crop_suitability_   │                 │ price_data       │
│ (362 rows) │◄──┼───│ scores              │                 │ (15,257 rows)    │
└─────┬──────┘   │   │ (19,548 rows)       │                 └────────┬─────────┘
      │ region_id│   └─────────────────────┘                          │ price_data_id
      │          │                                                  ┌─▼───────────────┐
      │          │                         ┌─────────────────────── │ price_outliers_ │
      │          │                         │                        │ review (107)    │
      │          │ crop_id                 │                        └─────────────────┘
      │          ▼                         │
      │   ┌─────────────────────┐          │
      └──►│ external_suitability│          │
      │   │ _scores (10,740)    │          │
      │   └────────┬────────────┘          │
      │            │  region_id            │
      └────────────┴───────────────────────┘
      │  region_id
      ├──────► soil_data (12)
      ├──────► weather_data (52,608)
      └──────► price_data.region_id
```

Every numeric table hangs off `regions.region_id`; `price_data` additionally
links to `crops.crop_id`. There are no junction tables.

> ⚠️ Note: the `CREATE TABLE` DDL declares foreign keys, but pointing them
> to `regions_old` (a leftover name from an early migration somewhere) in the
> `PRAGMA foreign_key_list` output. Since `PRAGMA foreign_keys` is **off** by
> default in SQLite and nothing relies on them, the real relationships are the
> logical joins on `region_id` / `crop_id` shown above. When migrating to
> Postgres, fix the FK targets to `regions`.

### 5.2 Table-by-table technical details (row counts as of last pipeline run)

**`regions`** (362 rows) — every scoring unit.
| Column | Type | Notes |
|--------|------|-------|
| region_id | INTEGER PK AUTOINCREMENT | referenced everywhere |
| state | TEXT NOT NULL | `Maharashtra` |
| district | TEXT NOT NULL | 36 districts |
| tehsil | TEXT NOT NULL | 362 tehsils; `UNIQUE(district, tehsil)` |
| latitude / longitude | REAL | precise for Latur/Nagpur (10+14), HQ point for other 32 districts |
| profile_confidence | TEXT | `High/Medium/Low/urban` from imported model |

**`crops`** (54 rows) — every crop’s agronomic envelope.
| Column | Type | Notes |
|--------|------|-------|
| crop_id | INTEGER PK AUTOINCREMENT | |
| crop_name | TEXT NOT NULL UNIQUE | e.g. `Soybean`, `Lemon`, `Capsicum (Shimla Mirch)` |
| season | TEXT | Kharif / Rabi / Summer / Annual |
| ideal_ph_min / ideal_ph_max | REAL | soil pH band |
| ideal_rainfall_min / ideal_rainfall_max | INTEGER | annual mm band |
| ideal_temp_min / ideal_temp_max | REAL | °C band |
| crop_type | TEXT | `Seasonal` / `Perennial` |
| months_to_harvest | INTEGER | months to first harvest |
| typical_yield_quintals_per_acre | REAL | for income estimation |
| msp_price | REAL | MSP ₹/quintal, NULL if none |
| input_cost_per_acre | REAL | ₹/acre cultivation cost |

**`soil_data`** (12 rows) — actually fetched soil pH; **only 12 tehsils**
(all 10 of Latur except…: Ahmadpur, Ausa, Chakur, Deoni, Jalkot, Latur,
Nilanga, Renapur, Shirur Anantpal, Udgir + Nagpur/Narkhed). This is why most
tehsils get `soil_score = NULL`.
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| region_id | INTEGER | → regions (via logical join) |
| ph, nitrogen, phosphorus, potassium, organic_carbon | REAL | unit-converted from SoilGrids |
| source | TEXT | `SoilGrids` / `SoilHealthCard` |
| recorded_date | TEXT | |

**`weather_data`** (52,608 rows) — daily records (2020→2025), 24 tehsils × ~2,192 days.
| Column | Type |
|--------|------|
| id | INTEGER PK |
| region_id | INTEGER |
| date | TEXT NOT NULL, `UNIQUE(region_id, date)` |
| temp_max / temp_min / rainfall_mm | REAL |

**`price_data`** (15,257 rows) — historical APMC prices.
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| region_id | INTEGER | nullable (prices are district-level) |
| crop_id | INTEGER NOT NULL | → crops |
| district | TEXT | which district the record belongs to |
| market_name | TEXT | APMC market |
| date | TEXT | stored as `DD/MM/YYYY` (Agmarknet format) |
| min_price / max_price / modal_price | REAL | ₹/quintal |

**`price_outliers_review`** (107 rows) — flagged by `clean_data.py` for manual review (never auto-deleted).
| Column | Type |
|--------|------|
| id | INTEGER PK |
| price_data_id | INTEGER → price_data |
| crop_id | INTEGER |
| modal_price / z_score | REAL |

**`external_suitability_scores`** (10,740 rows = 30 crops × 358 talukas) —
imported once from the Excel state model. Model-derived composite
(soil/rainfall/temp/irrigation/historical pattern/market demand), used as the
**fallback** for any tehsil without our own real fetched data.
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| region_id | INTEGER NOT NULL | → regions |
| crop_name | TEXT NOT NULL | `UNIQUE(region_id, crop_name)` |
| overall_score | REAL | 0–100 |
| rank_in_tehsil | INTEGER | the model’s own rank in that tehsil |
| soil/rainfall/temperature/irrigation/market_score | REAL | the model’s 5 factors |

**`crop_suitability_scores`** (19,548 rows = 54 crops × 362 regions) — the
**output of `score_crops.py`**; deleted and recomputed on every run.
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | |
| region_id / crop_id | INTEGER | logical → regions / crops |
| soil_score / rainfall_score / temp_score | REAL | rule-based factor scores (may be NULL = no data) |
| overall_score | REAL | mean of available factor scores, OR external fallback |
| has_market_data | INTEGER | 0/1 |
| avg_market_price | REAL | ₹/quintal |
| price_trend_pct | REAL | +% = prices rising (last 90d vs prior 90d) |

**Indexes:** `idx_price_crop(crop_id)`, `idx_price_district(district)`,
`idx_soil_region(region_id)`, `idx_weather_region(region_id)` — created by
`init_db.py` to keep lookups fast.

---

## 6. The Scoring Engine (`score_crops.py`) — how “suitable” is computed

For every `region × crop`:

1. **Gather the tehsil’s numbers:**
   - `soil_ph` = latest soil row for the region (usually None → see §6.3).
   - `avg_temp` = mean over all days of (temp_max + temp_min)/2.
   - `avg_annual_rainfall` = `SUM(rainfall_mm) / COUNT(DISTINCT year)`.

2. **Factor score** — map a value onto the crop’s ideal range:

   ```
   score_range(value, min, max):
       value is None or range missing        → None   (honest “no data”)
       min ≤ value ≤ max                     → 100
       below min:  distance = min - value
       above max:  distance = value - max
       penalty = (distance / ((max-min) * 0.5)) * 100
       score   = max(0, 100 - penalty)
   ```
   So a value needs to be within **50% of the range-width** from the nearest
   edge to score above 0; it decays linearly.

3. **Overall score:**
   - `local_overall` = mean of whatever factor scores are present
     (soil, rainfall, temp). If any exist → this is the score.
   - Otherwise fall back to `external_suitability_scores.overall_score`
     (model estimate). If neither → `overall = NULL` (counted in the table
     but never recommended).

4. **Market layer** (`get_market_info`, cached per crop+district):
   - avg modal price across all records;
   - `price_trend_pct` = (avg of last 90 days − avg of prior 90 days) ÷ prior × 100.

5. **Profit estimate** (never fabricates): price = local avg mandi price,
   else MSP, else None. `net_profit = (yield/acre × price) − input_cost/acre`.
   Because net profit is used, low-cost grains/pulses compete fairly against
   high-cost vegetables.

6. **Filter & rank:** only crops with `overall ≥ SUITABILITY_THRESHOLD (60)`
   are “beneficial”; they’re split into **Seasonal** vs **Long-term**
   (Perennial) and ranked by **net profit** for the console report.

### 6.1 Data-coverage honesty
- `score_range` returns `None` for missing inputs rather than guessing.
- The console labels each score’s source: `locally verified (real soil+weather data)`
  vs `regional model estimate`.

### 6.2 Which regions get real vs model scores
- **Latur (10 tehsils) + Nagpur (14 tehsils):** real weather; Latur has real
  soil for 11 of those tehsils → locally-verified scores possible.
- **All other districts:** no fetched soil/weather → model (`external`) scores,
  i.e. the state model’s composite.

---

## 7. The Frontend Export + Runtime Merge

### 7.1 `generate_frontend_data.py` (DB → JS)

- **`build_crops_data`** — one entry per crop (54) + a manually-appended
  legacy “Bhendi (Okra)” entry = **55 catalog items**. Each entry carries:
  bilingual META (sow/harvest/peak/soil/water/seed/fertilizer/tips/advice),
  economics (yield ±15%, cost ±15%, revenue, profit, MSP/price),
  `image` = Wikimedia `https://commons.wikimedia.org/wiki/Special:FilePath/<percent-encoded file>?width=600`,
  and `factors` averaged from the external model over all districts (75 fallback).
  Agronomy numbers come from the DB `crops` table; text from the `META` dict.

- **`build_regional_scores`** — per (district, tehsil):
  - **30 model crops**: emit the external row with its **model rank intact**
    (this keeps the app’s top-20 “suitable” behaviour stable).
  - **Rule-scored additions** (only Latur/Nagpur ↔ live data): crops not in the
    external model (e.g. Lemon, Cabbage, Sapota…) get their local
    `crop_suitability_scores` figures with `irrigation/market = None`, ranked
    **after** the model crops by their own score (ranks 31+).
  - **All other districts**: exactly the external 30 crops.
  - Alias mapping so frontend locations resolve to DB tehsil names:
    `Ahmedpur→Ahmadpur` (Latur), `Kamthi→Kamptee`, `Nagpur City→Nagpur (Urban)`,
    `Nagpur Rural→Nagpur (Rural)`.

- **`build_mandi_prices`** — for Latur & Nagpur only (the only districts with
  price_data): latest date per crop, `avgModal / minModal / maxModal`,
  `marketCount`, and top-4 markets by modal price. Dates parsed from `DD/MM/YYYY`.

### 7.2 `FarmContext.jsx` — what the app actually does at runtime

1. Defaults: language `mr`, district `Latur`, tehsil `Ausa` (persisted to
   `localStorage`, keys `pm_*`).
2. `dynamicCrops = useMemo(...)`:
   - look up `REGIONAL_SCORES[district][tehsil]`;
   - if absent → raw `CROPS_DATA` (base state);
   - else override each matching crop’s `score`, `rank`, `factors`, `scoreMap`.
3. Badge logic: `score ≥ 90 → Best`, `≥ 80 → Good`, `≥ 70 → Consider`.
4. **`notSuitable = score < 60 || rank > 20`** → red “Do not grow” banner on
   CropDetails (this is the hard gate that the rank-preservation in
   `build_regional_scores` protects).
5. `MANDI_PRICES[district][cropId]` feeds the “Live Mandi Price” tab on the
   crop detail screen.

---

## 8. Build & Run Commands

```bash
# --- data pipeline (run from latur_crop_project root) -------------------
python run_all.py                # init + fetch weather/soil/prices + clean
python import_state_model.py     # import the Excel suitability model
python score_crops.py            # recompute suitability scores (Latur/Nagpur real data)
python generate_frontend_data.py # write the 3 JS data files

# --- frontend (run in frontend/frontend) ---------------------------------
npm install                      # first time
npm run dev                      # local dev server
npm run build                    # production build → dist/
```

> Idempotency: `init_db.py`, the fetch scripts, and the generator are all safe
> to re-run (INSERT OR IGNORE / skip-if-exists / read-only). `score_crops.py`
> is the only destructive writer — it clears and rewrites
> `crop_suitability_scores` on every run.

---

## 9. Configuration Reference (`config.py`)

| Constant | Meaning |
|----------|---------|
| `DB_PATH` | `"latur_crops.db"` (relative — run scripts from the project root) |
| `STATE` | `"Maharashtra"` |
| `DISTRICTS` / `TEHSILS_BY_DISTRICT` | 36 districts; Latur 10 tehsils, Nagpur 14, others = single HQ point |
| `CROPS` | 54 crops with ideal ranges / season / type / yield / MSP / cost |
| `WEATHER_START_DATE` / `WEATHER_END_DATE` | `2020-01-01` → `2025-12-31` |
| `DATA_GOV_IN_API_KEY` | Agmarknet API key (data.gov.in). **Do not commit/share.** |
| `AGMARKNET_RESOURCE_ID` | `35985678-0d79-46b4-9ed6-6f13308a1d24` |
| `COMMODITY_NAME_MAP` | our crop name → agmarknet dropdown spelling |

---

## 10. Key Design Decisions & Tradeoffs

1. **Static beats live.** All recommendations are precomputed → the app is a
   static bundle: cheap to host, fast, and works offline. The cost: data
   changes require a full regeneration (`score_crops.py` + generator + build).
2. **SQLite now, Postgres later.** Schema is plain SQL; FKs need fixing
   (currently point at `regions_old`), and `INSERT OR IGNORE` becomes
   `INSERT … ON CONFLICT DO NOTHING`.
3. **30 model crops keep their model ranks.** Even though Latur/Nagpur now
   score 54 crops, the top-20 “suitable” gate (`rank > 20`) that the model
   crops were verified against is preserved; extended crops rank after them.
4. **No fabricated numbers.** Missing soil/weather → NULL factor scores;
   missing price data → explicit absence everywhere, from the console to the
   UI fallbacks.
5. **Bilingual by construction.** Every crop stores Marathi and English text
   in parallel tuples, so no translation lookup logic is needed in the UI.
6. **Two sources of truth, deliberately.** `config.py` for the pipeline;
   the React `META` table in `generate_frontend_data.py` for UI copy. Agronomy
   numbers live only in the DB (`crops`), text only in the generator.

---

## 11. Extension Checklist

- **New crop:** add to `config.py CROPS` + `META`/`MARKET_PRICES`/`COMMODITY_NAME_MAP`,
  run `init_db.py` → `score_crops.py` → `generate_frontend_data.py` → build.
- **New district:** add to `TEHSILS_BY_DISTRICT`; fetch real weather/soil if
  wanted, else it automatically uses the external model fallback.
- **Better soil:** replace SoilGrids with Soil Health Card rows (same table).
- **Try a crop for a farmer:** the `CheckCrop` page + regional factors.
- **Scale:** move to Postgres, fix FK targets, add a real backend when live
  updates are needed.