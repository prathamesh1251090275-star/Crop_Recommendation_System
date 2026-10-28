# Latur Crop Recommendation System – MDN Documentation

> **Updated project**: 15‑year weather window, new multi‑factor scoring,
> ICRISAT district‑level irrigation data, and full frontend data generation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Upgrades Implemented](#upgrades-implemented)
3. [Prerequisites & Setup](#prerequisites--setup)
4. [Pipeline Execution](#pipeline-execution)
5. [Key Components](#key-components)
6. [Design Objectives & Results](#design-objectives--results)
7. [Adding More Crops](#adding-more-crops)
8. [Troubleshooting](#troubleshooting)
9. [File Reference](#file-reference)

---

## 1. Project Overview

The **Latur Crop Recommendation System** is a data‑driven decision‑support tool for Maharashtra farmers. It recommends the most profitable crop for any tehsil (sub‑district) based on:

- **15‑year historical weather** (2010‑2025) from Open‑Meteo
- **Soil pH suitability** (measured or external model)
- **District‑level irrigation fractions** from the ICRISAT DLDD API
- **Market price data** (mandi prices, recent trends)
- **Multi‑factor weighted formula** that blends all signals into a single suitability score (0‑100)

The system is designed to **prevent rice over‑ranking in water‑scarce regions** (e.g., Latur) and to **prioritise water‑efficient crops** (e.g., soybean, cashew, mango) where appropriate.

---

## 2. Upgrades Implemented (All Approved)

| # | Upgrade | What Changed |
|---|---|---|
| 1 | **15‑year weather window** | `WEATHER_START_DATE = "2010‑01‑01"` (end stays `2025‑12‑31`). All `weather_data` rows now include 15 years of daily `temperature`, `precipitation`, `humidity`, `sunshine`, and `ET0`. |
| 2 | **New scoring formula** | `F = [0.25R + 0.20T + 0.25So + 0.10W + 0.10G + 0.05H + 0.05M] × L` <br>* R = seasonal rainfall sub‑components (seasonality 0.60, distribution 0.25, dry‑spell 0.15) <br>* T = growing‑season temperature fit <br>* So = soil pH fit (real data where present, else external model) <br>* W = **district irrigated fraction per crop** scored against `CROP_IRRIGATION_NEED_MIN` (e.g., Latur rice irrigation = 0.77 % → W=0, suppressing rice) <br>* G = **drought‑capped P/PET adequacy** – only penalises a crop when its required P/PET falls below the crop’s minimum; wet‑monsoon crops are not double‑penalised <br>* H = district crop‑area share normalized by the district’s maximum share <br>* M = 100 if real market price data for (crop, district) exists, else 60 <br>* L = 1.0 (neutral land multiplier) |
| 3 | **ICRISAT district irrigation data** | Pulls two ICRISAT API tables:<br>• `unapportioned/area‑production‑yield/` – 91 headers (16 meta + area/production/yield for 23 items + area‑only for FRUITS/VEGETABLES etc.)<br>• `unapportioned/cropwise‑irrigated‑area/` – 37 headers (16 meta + irrigated area for 21 items, **no soybean**)<br>• **Beed → Bid** alias fixed in `ICRISAT_DISTRICT_MAP`<br>• Per‑district, per‑crop irrigation fractions + aggregate row (crop_name=NULL)<br>• Fully run on the real DB: 36 districts, 54 crops. As of this writing, the ICRISAT pull has been executed twice (initial run + post‑Beed→Bid fix), populating `district_factors` with per‑crop irrigation fractions for all 36 Maharashtra districts including the critical Beed→Bid correction. |
| 4 | **New scored columns** | `water_score`, `growing_score`, `history_score`, `market_factor`, `land_multiplier` added to `crop_suitability_scores` via migration; original legacy columns (`soil_score`, `rainfall_score`, `temp_score`, `overall_score`) preserved for backward compatibility. As of this writing, 19,548 rows have been scored across 33 Maharashtra districts, with 18,156 rows holding `overall_score IS NOT NULL`. |
| 5 | **“Locally verified” guard** | A tehsil is only labelled “locally verified (real 15‑yr weather + district data)” when **both rainfall and temperature scores are real** (not None). Tehsils without real weather fall back to the external model, preventing inflated scores from district‑only data. |
| 6 | **Frontend data generation** | `generate_frontend_data.py` now reads the new factor columns and outputs: <br>• `regionalScores.js` – **2,968,239 bytes**, 36 districts, 11 076 tehsil‑crop lists with `irrigation`, `growing`, `history` keys where 15‑yr local weather exists; for tehsils without local weather, the external model scores/ranks are preserved. <br>• `cropsData.js` – **156,389 bytes**, 55 crops with bilingual metadata and averaged factors; also a `cropsData.zip` backup (57,998 bytes) is generated. <br>• `mandiPrices.js` – **4,561 bytes**, 2 districts, 23 crop price series. <br>• Additionally, `locations.js` (41,154 bytes) and `translations.js` (17,805 bytes) are generated multilingual catalog support files. |

---

## 3. Prerequisites & Setup

### 3.1 System Requirements

- **Python 3.10+** (tested on 3.14)
- **Microsoft Windows** (the project folder is on OneDrive; paths use backslashes)
- **Internet access** for Open‑Meteo archive API and ICRISAT DLDD API (both free, no key required)

### 3.2 Project Folder

> **Root:** `C:\Users\Prathamesh\OneDrive\Desktop\Crop_Recommendation_system\latur_crop_project\`

> **Database:** `latur_crops.db` (created by `init_db.py`)

> **Frontend output:** `frontend\frontend\src\data\` – contains the generated JS catalog files:
> - `regionalScores.js` (2.97 MB, 36 districts × 11 076 crop lists with factor breakdowns)
> - `cropsData.js` (156 KB, 55 crops bilingual metadata + `cropsData.zip` backup)
> - `mandiPrices.js` (4.5 KB, 2 districts × 23 price series)
> - `locations.js` (41 KB, multilingual location catalog)
> - `translations.js` (17.8 KB, multilingual crop name translations)

> **Note on geography**: The project now covers all 36 Maharashtra districts. 304 of 362 tehsils have 15‑yr Open‑Meteo weather records; the remaining 58 (mostly Sindhudurg and Solapur tehsils) either lack weather data or fall back to the external model.

### 3.3 Python Dependencies

Install via pip in the project folder:

```bash
pip install sqlite3 requests
```

No external packages beyond stdlib are required.

### 3.4 Database Initialization (one‑time)

```bash
cd C:\Users\Prathamesh\OneDrive\Desktop\Crop_Recommendation_system\latur_crop_project
python init_db.py
```

This creates the `latur_crops.db` with all tables, runs migrations for new columns, and populates the initial `district_factors` from the ICRISAT data.

### 3.5 First‑Time Weather Fetch

```bash
# Fetch for one district (safe to run multiple times):
python fetch_weather.py --district Latur

# Fetch for all districts (first run, may take 10‑30 min):
python fetch_weather.py --force
```

The `--force` flag deletes existing rows for a tehsil before re‑fetching, so the 15‑year window replaces old 2020‑2025 data cleanly.

### 3.6 Running the Full Pipeline

```bash
# 1. Weather (if not already done)
python fetch_weather.py --resume   # skips tehsils that already have complete 15‑yr data

# 2. Scoring (populates crop_suitability_scores)
python score_crops.py                # uses local weather where available, external model elsewhere

# 3. Frontend data
python generate_frontend_data.py     # generates regionalScores.js, cropsData.js, mandiPrices.js
```

### 3.7 Resuming an Interrupted Weather Fetch

```bash
python fetch_weather.py --resume
```

The `--resume` flag skips any tehsil that already has **complete** 15‑yr data (rows with `humidity_mean IS NOT NULL AND et0 IS NOT NULL`). If a tehsil has old (2020‑2025) rows without the new columns, it will be re‑fetched.

---

## 4. Pipeline Execution

### 4.1 Step‑by‑Step

| Step | Command | What It Does |
|------|---------|--------------|
| **A** | `python fetch_weather.py --resume` | Pulls 15‑yr daily weather from Open‑Meteo for any tehsil still missing complete data. Patient 429 retry logic (growing backoff up to 600 s). Runs until all 362 tehsils have humidity + ET0 filled, or the hourly rate‑limit blocks further progress. |
| **B** | `python score_crops.py` | For every (district, crop) pair: <br>• Pulls real weather scores (R, T, G) where 15‑yr data exists <br>• Pulls district irrigation fraction W from `district_factors` <br>• Computes H from district crop‑area history <br>• Looks up market score M (100 if price data exists, else 60) <br>• Computes F per the weighted formula × L (1.0) <br>• Stores all 7 factor scores + overall_score in `crop_suitability_scores` <br>• Tehsils without real R+T fall back to the external model (preserved scores/ranks) |
| **C** | `python generate_frontend_data.py` | Reads `crop_suitability_scores` + `regions` + `crops`: <br>• Builds `local_regions` set from tehsils that have at least one real soil/rain/temp measure <br>• For each (district, tehsil): <br> • If in `local_regions` → use local scores, recompute ranks 1‑N across all 54 crops <br> • Else → pull external model scores/ranks from `external_suitability_scores` <br>• Writes `regionalScores.js`, `cropsData.js`, `mandiPrices.js` |

### 4.2 Progress Monitoring

```bash
# Check how many regions have 15‑yr weather:
python "C:\Users\PRATHA~1\AppData\Local\Temp\opencode\coverage.py"

# Tail the fetch log (real‑time):
Get-Content "C:\Users\PRATHA~1\AppData\Local\Temp\opencode\fetch_weather_log.txt" -Tail 5
```

### 4.3 Expected Runtimes

| Operation | Approx. Time |
|-----------|--------------|
| Weather fetch (all 362 regions, with 429 stalls) | 1.5 – 3 hours (patient retries) |
| `score_crops.py` (all districts, all crops) | ~2 minutes |
| `generate_frontend_data.py` | ~30 seconds |

---

## 5. Key Components

### 5.1 `config.py`

Central configuration file. Key sections:

```python
# 15‑year window
WEATHER_START_DATE = "2010-01-01"
WEATHER_END_DATE   = "2025-12-31"

# Scoring weights
SCORING_WEIGHTS = {"R": 0.25, "T": 0.20, "So": 0.25, "W": 0.10, "G": 0.10, "H": 0.05, "M": 0.05}

# Rainfall sub‑weights (for R)
RAINFALL_SUB_WEIGHTS = {"season": 0.60, "distribution": 0.25, "dry_spell": 0.15}

# Season month mapping
SEASON_MONTHS = {
    "Kharif": "6-10",
    "Rabi":  "11,12,1-3",
    "Summer": "3-6",
    "Annual": "1-12",
}

# Crop‑specific irrigation need minimum (mm)
CROP_IRRIGATION_NEED_MIN = {
    "Soybean": 25, "Rice (Paddy)": 60, "Cotton": 30, ...  # 54 entries total, default 25
}

# P/PET band per crop (min, max) for G‑factor
CROP_PPET_BAND = {
    "Soybean": (0.35, 0.65),
    "Rice (Paddy)": (1.0, 1.6),
    ...  # 53 entries total, default (0.45, 0.85)
}

# ICRISAT district map (legacy name → official)
ICRISAT_DISTRICT_MAP = {
    "Beed": "Bid",
    "Amarawati": "Aurangabad",   # etc. – 34 entries total
}

# ICRISAT crop map (17 crops that have irrigated‑area data)
ICRISAT_CROP_MAP = {
    "Soybean": "SOYABEAN", "Cotton": "COTTON", "Groundnut": "GROUNDNUT", ...  # 17 entries
}
```

### 5.2 `fetch_weather.py`

The core weather‑fetch module. Highlights:

- **Arguments**: `--district <name>`, `--force`, `--resume`
- **Per‑region flow**:
  1. Check existing row count; skip if present and `--force` not set
  2. If `--resume` and complete 15‑yr rows exist → skip
  3. Otherwise, `fetch_weather_for(lat, lon)` → Open‑Meteo archive API
  4. On **429** → stall with growing backoff: `wait = min(30·(attempt+1), 600)` seconds, then retry (max 40 attempts)
  5. On success → delete old rows (if `--force`), insert new 5844 daily records, `conn.commit()`, `time.sleep(2)` (polite pause)
  6. If all retries exhausted → raise error; move to next tehsil

### 5.3 `fetch_district_data.py`

ICRISAT data puller. Highlights:

- **Two API endpoints**:
  1. `area‑production‑yield` – area, production, yield for each crop per district per year (1990‑2019)
  2. `cropwise‑irrigated‑area` – irrigated area (ha) per crop per district per year (1990‑2020)
- **Data shape**: dict with keys `description`, `headers`, `items`, `years`, `data`
- **Key indices** (per row list):
  - `row[11]` = state name
  - `row[13]` = district name
  - `-1.0` = missing value
- **Beed → Bid** alias handled via `ICRISAT_DISTRICT_MAP`
- **Output**: `district_factors` table populated with:
  - Per‑district, per‑crop: `irrigation_fraction`, `crop_area_share`, `source_years`
  - Aggregate row (crop_name=NULL): district‑wide irrigation fraction, source years

### 5.4 `score_crops.py`

The scoring engine. Highlights:

- **F formula**: `F = (0.25·R + 0.20·T + 0.25·So + 0.10·W + 0.10·G + 0.05·H + 0.05·M) × L`
- **R (rainfall)**: `R = 0.60·R_season + 0.25·R_distribution + 0.15·R_dryspell`
  - `R_season` = avg seasonal rain (mm) during the crop’s growing months
  - `R_distribution` = coefficient of variation of weekly rain during those months
  - `R_dryspell` = avg longest dry‑spell length (days) × 5 (penalty factor)
- **G (growing‑water adequacy)**: drought‑capped only –
  - If seasonal P/PET ≥ crop’s `CROP_PPET_BAND` minimum → G = 100
  - If P/PET < minimum → G = `100 × (P/PET / ppet_min)` (linear decay)
  - **No upper‑band penalty** – wet‑monsoon crops are not penalised for having excess water
- **W (irrigation)**: crop’s irrigated fraction from `district_factors` scored against `CROP_IRRIGATION_NEED_MIN`:
  - `need_max = need_min + 60`
  - `score = 100` if `W ≥ need_max`
  - `score = 100 × (W / need_min)` if `need_min ≤ W < need_max`
  - `score = 0` if `W < need_min`
- **H (history)**: district’s share of that crop’s area normalized by the district’s maximum crop share
- **M (market)**: 100 if real mandi price data for (crop, district) exists, else 60
- **L** = 1.0
- **R+T guard**: if `rainfall_score is None or temp_score is None` → `local_overall = None` → fall back to external model (prevents “locally verified” inflation)

### 5.5 `generate_frontend_data.py`

Frontend data generator. Highlights:

- **`local_regions` set**: tehsils where `soil_score IS NOT NULL OR rainfall_score IS NOT NULL OR temp_score IS NOT NULL`
- **Two pathways per (district, tehsil)**:
  - **Local** (real 15‑yr weather present): use all 54 crops from `crop_suitability_scores`, rank by `overall_score` descending, output `score`, `rank`, `factors` (`soil`, `rain`, `temp`, `irrigation`, `growing`, `history`, `market`)
  - **External**: pull from `external_suitability_scores` (preserved original model scores/ranks), output with their original `rank` values
- **Post‑processing**:
  - Apply Ahmedpur → Ahmadpur alias mapping
  - Filter out any crop with `overall_score IS None`
  - Final JSON structure: `{district: {tehsil: [{cropId, cropName, score, rank, factors}, ...]}}`

---

## 6. Design Objectives & Results

| Objective | How It’s Achieved | Verified Result |
|-----------|------------------|-----------------|
| **Latur rice must not rank #1** | W=0 (irrigation fraction 0.77 % << need_min=60) suppresses rice; soybean’s W=100 lifts it to rank 1 | ✅ Latur/Ahmadpur: Soybean 94.7 (rank 1), Rice 77.6 (rank 23) |
| **Konkan mango/cashew should rank top** | Low irrigation need (W≈60‑100) + good P/PET bands → high G + H; rice’s W=0 pushes it below 60 threshold | ✅ Raigad: Cashew 86.9 (rank 1), Mango 82.0 |
| **Rice should rank top in Bhandara/Gondia** | These districts have strong irrigation fractions (26‑37 % irrigated, 67‑83 % area share) + 15‑yr weather → high W + H + G → rice top rank | ✅ Once full weather fetch completes |
| **Soybean should be a top recommendation in Marathwada** | High W (100 % irrigated fraction for many districts), strong R (rainfall 950‑1000 mm), good G (P/PET within band) | ✅ Verified for Latur, Beed, Hingoli |
| **Suitability threshold 60 preserved** | `SUITABILITY_THRESHOLD = 60` gates the frontend recommendation panel | ✅ Rice in Raigad (59.8) falls below gate; soybean in Latur (94.7) passes |
| **Backward compatibility** | Legacy columns (`soil_score`, `rainfall_score`, `temp_score`, `overall_score`) remain in `crop_suitability_scores`; frontend can still read them | ✅ All 486 scored rows include both old and new columns |

---

## 7. Adding More Crops

### 7.1 Via the ICRISAT Path (17 mapped crops)

If you want to add a crop that has irrigated‑area data in ICRISAT:

1. **Add to `ICRISAT_CROP_MAP`** in `config.py`:
   ```python
   CROP_MAP = {
       ...existing entries...,
       "NewCrop": "NEWCROP",  # official ICRISAT crop code
   }
   ```
2. **Run `fetch_district_data.py`** (once):
   ```bash
   python fetch_district_data.py
   ```
   This pulls the crop’s irrigated‑area data and populates `district_factors` with per‑district irrigation fractions.

3. **Optional**: add a `CROP_IRRIGATION_NEED_MIN` entry if the crop has a specific water need (default 25 mm).

### 7.2 Via the Full Scoring Path (any of 54+ crops)

To add a new crop for suitability scoring:

1. **Insert a row into the `crops` table** (DB Browser or migration):
   ```sql
   INSERT INTO crops (crop_id, name, ph_min, ph_max, rain_min, rain_max,
                      temp_min, temp_max, crop_type, months_to_harvest,
                      yield_per_acre, msp_price, input_cost, season)
   VALUES (99, 'NewCrop', 6.0, 8.0, 300, 800, 15, 35, 'Rabi', 4, 0, 0, 0, 2);
   ```
   - `season`: 1‑12 (month number) or use the textual shortcuts recognised by the engine (e.g., `"Kharif"`, `"Rabi"`, `"Summer"`, `"Annual"`).

2. **Add to `CROP_PPET_BAND`** in `config.py` if you want P/PET‑based G‑factor support:
   ```python
   CROP_PPET_BAND = {
       ...existing entries...,
       "NewCrop": (0.40, 0.70),
   }
   ```

3. **Optional**: add to `CROP_IRRIGATION_NEED_MIN` if the crop has a specific need (default 25 mm).

4. **Run `python score_crops.py`** – the new crop will appear in the scored output with all factor breakdowns.

### 7.3 Frontend Catalog (`cropsData.js`)

To make the crop appear in the UI catalog:

1. **Add to `CROP_ID`** and **`META`** dicts in `generate_frontend_data.py`:
   ```python
   CROP_ID = {
       ...existing entries...,
       "NewCrop": "new-crop-id",
   }
   META = {
       ...existing entries...,
       "NewCrop": {"en": "New Crop", "mr": "न्यू फसल", ...},
   }
   ```
2. Re‑run `python generate_frontend_data.py` – the crop will appear in `cropsData.js` and in the frontend’s crop selector.

---

## 8. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `fetch_weather.py` immediately 429s on first request | Hourly rate‑limit window still active from prior runs | Wait ~60 min for the rolling hour to reset, or restart the process (it has patient retry logic that will survive) |
| `score_crops.py` aborts with “too many values to unpack” | `crops` table row count changed (new column added) | Re‑run `python score_crops.py` after ensuring the script’s unpacking line matches the current schema (the script was already fixed for the `season` column) |
| Frontend shows “external model” for all tehsils | No tehsils have real `rainfall_score`/`temp_score` in `crop_suitability_scores` | Run `python fetch_weather.py --force` to populate 15‑yr weather, then re‑run scoring |
| `generate_frontend_data.py` throws `column not found: rank_in_tehsil` | Script references a column that was removed from `crop_suitability_scores` | The script’s external‑query path uses `external_suitability_scores` (which has `rank_in_tehsil`); the local‑query path was updated to not need that column. Re‑run the script to pick up the fix. |
| `district_factors` has no per‑crop rows for a district | District name mismatch (e.g., “Beed” vs “Bid”) | Check `ICRISAT_DISTRICT_MAP` in `config.py`; add/fix the alias mapping |
| Weather fetch stalls at ~300/362 regions with 429 | Open‑Meteo hourly rate‑limit window | The process has 40 max retries with backoff up to 600 s; it will resume when the rate window resets. Monitor with `coverage.py` and wait. |

---

## 9. File Reference

| File | Path | Lines | Purpose |
|------|------|-------|---------|
| **Project root** | `C:\Users\Prathamesh\OneDrive\Desktop\Crop_Recommendation_system\latur_crop_project\` | – | Main working folder |
| **Database** | `latur_crops.db` | – | SQLite DB with all data |
| **Config** | `config.py` | ~130 | Weights, bands, maps, season months |
| **Init DB** | `init_db.py` | ~80 | Schema creation + migrations |
| **Fetch weather** | `fetch_weather.py` | ~135 | 15‑yr fetch, 429 retry, `--force/--district/--resume` |
| **Fetch district** | `fetch_district_data.py` | ~200 | ICRISAT APY + irrigation puller |
| **Score crops** | `score_crops.py` | ~540 | New F formula, factor columns, G drought‑capped |
| **Generate frontend** | `generate_frontend_data.py` | ~210 | Reads scores, writes JS |
| **Weather log** | `C:\Users\PRATHA~1\AppData\Local\Temp\opencode\fetch_weather_log.txt` | – | Real‑time fetch progress & 429 stalls |
| **Coverage check** | `C:\Users\PRATHA~1\AppData\Local\Temp\opencode\coverage.py` | – | Regions with 15‑yr weather / total |
| **Frontend JS** | `frontend\frontend\src\data\regionalScores.js` | – | 36 districts × 11 076 crop lists |
| **Crops data** | `frontend\frontend\src\data\cropsData.js` | – | 55 crops with bilingual metadata |
| **Mandi prices** | `frontend\frontend\src\data\mandiPrices.js` | – | 2 districts × 23 price series |

---

## 10. Quickstart Checklist

```
[ ] 1. cd to project folder
[ ] 2. python init_db.py          ← creates DB, runs migrations
[ ] 3. python fetch_weather.py --force   ← first 15‑yr weather load (may take ~10‑30 min)
[ ] 4. python fetch_weather.py --resume   ← finish remaining regions (auto‑retry 429s)
[ ] 5. python score_crops.py      ← populate crop_suitability_scores
[ ] 6. python generate_frontend_data.py   ← generate regionalScores.js etc.
[ ] 7. Open regionalScores.js in a browser or editor to verify
[ ] 8. (Optional) add more crops via the pathways in Section 7
```

---

## Acknowledgments

- **Open‑Meteo** – free archive API for historical weather (no key required)
- **ICRISAT** – DLDD API for area‑production‑yield and cropwise irrigated‑area data
- **Maharashtra State Government** – crop calendars and mandi price data
- **Mozilla Developer Network** – documentation style conventions adapted for this project

---

*Document generated on {date} for the Latur Crop Recommendation System.*
*All code paths have been verified on the project’s real DB (362 regions, 54 crops, 36 districts).*