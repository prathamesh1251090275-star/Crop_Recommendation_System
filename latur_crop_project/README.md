# Latur Crop Recommendation — Data Collection Starter

Phase 1 of the project: collect and store soil, weather, and market price
data for Latur district (10 tehsils, 20 starting crops) into a local
database, cleaned and ready for building the recommendation engine next.

## Setup

```bash
pip install requests
```

(SQLite is built into Python — no separate database server needed for this phase.)

## Before running

1. Open `config.py` and get a free API key from **data.gov.in**:
   - Register → My Account → Generate API Key
   - Paste it into `DATA_GOV_IN_API_KEY`
2. Double check the crop list and tehsil coordinates in `config.py` match
   what you actually want to track — this file is your single source of
   truth for the whole pipeline.

## Run everything

```bash
python run_all.py
```

This runs, in order:
1. `init_db.py` — creates `latur_crops.db` (SQLite file) and seeds the
   `regions` and `crops` tables.
2. `fetch_weather.py` — pulls 2020–2025 daily weather per tehsil from
   Open-Meteo (free, no key).
3. `fetch_soil.py` — pulls soil pH/organic carbon/nitrogen per tehsil from
   ISRIC SoilGrids (free, no key). This is coarse global modeled data —
   swap in real Soil Health Card data as soon as you can get it.
4. `fetch_prices.py` — pulls historical Latur mandi prices per crop from
   the Agmarknet dataset on data.gov.in.
5. `clean_data.py` — flags statistical price outliers for manual review
   (doesn't auto-delete anything) and prints a coverage report showing
   exactly what data you have and what's missing.

You can also run any script individually if one step fails and you want
to retry just that piece, e.g. `python fetch_prices.py`.

## After running

Check the coverage report printed by `clean_data.py`:
- Any crop with 0 price records usually means the Agmarknet commodity name
  doesn't exactly match your crop name — check the real name on
  agmarknet.gov.in's commodity dropdown and adjust `fetch_prices.py`.
- Any tehsil with 0 weather/soil records means that API call failed —
  check your internet connection and re-run just that script.
- Review flagged rows in the `price_outliers_review` table before trusting
  the price history for any crop with several flags.

## What's next (Phase 2)

Once coverage looks solid:
- Replace SoilGrids estimates with real Soil Health Card data where available.
- Build the rule-based suitability scoring engine using the ideal ranges
  already stored in the `crops` table.
- Layer in price trend analysis from `price_data` to estimate expected
  price at harvest time per crop.

## Migrating to PostgreSQL later

The schema in `init_db.py` is plain SQL and maps directly to Postgres.
When ready: create a Postgres database, replace `sqlite3.connect(DB_PATH)`
calls with a `psycopg2.connect(...)` connection in each script, and adjust
`INSERT OR IGNORE` → `INSERT ... ON CONFLICT DO NOTHING`.

## Applying the stored data (Phase 2 starter)

Once `run_all.py` has populated the database:

```bash
python check_data.py          # sanity-check what's actually stored
python score_crops.py         # score every crop for every tehsil
python score_crops.py --tehsil Latur   # score just one tehsil
```

`score_crops.py` reads each tehsil's stored soil pH and average annual
rainfall/temperature, compares them against the ideal ranges already
seeded in the `crops` table, and writes a 0-100 suitability score per
crop per tehsil into `crop_suitability_scores`. This is your working
recommendation engine — a farmer in a given tehsil can now be shown
their top 5 suited crops, ranked.

Next refinements from here: layer in the price/demand data from
`price_data` to turn "suitable" into "suitable AND profitable", and
weight soil vs rainfall vs temp differently per crop type if some
factors matter more than others agronomically.
