# Data pipeline — PikMitra Crop Recommendation

Collects soil, weather and mandi-price data for the districts in `config.py`,
scores every crop for every tehsil, and exports the result into the React app's
`src/data/*.js` files. The React app itself lives in `frontend/frontend/`.

## Setup

```bash
pip install requests
```

SQLite is built into Python — no database server needed.

## Before running

1. Get a free API key from **data.gov.in** (register → My Account → API key) and
   set it as an **environment variable** (never paste it into `config.py`):

   ```bash
   # Windows (PowerShell)
   $env:DATA_GOV_IN_API_KEY = "your-key"

   # macOS / Linux
   export DATA_GOV_IN_API_KEY="your-key"
   ```

2. Check the districts, tehsil coordinates and crop list in `config.py` — it is
   the single source of truth for the whole pipeline.

## Run everything

```bash
python run_all.py
```

This runs, in order:

1. `init_db.py` — creates `latur_crops.db` and seeds the `regions` (36 districts)
   and `crops` (54 crops) tables.
2. `fetch_weather.py` — daily 2010–2025 weather per tehsil from Open-Meteo
   (free, no key).
3. `fetch_soil.py` — soil pH / organic carbon / nitrogen per tehsil from ISRIC
   SoilGrids (free, no key). Coarse global modelled data — replace with real Soil
   Health Card data when you can.
4. `fetch_prices.py` — historical mandi prices per crop+district from the
   Agmarknet dataset on data.gov.in (needs the API key).
5. `clean_data.py` — flags statistical price outliers for manual review (deletes
   nothing) and prints a coverage report.

Any step can be re-run on its own, e.g. `python fetch_prices.py --district Nagpur`.
Steps that already have data are skipped, so re-running is safe.

Then build the scores and the frontend data:

```bash
python import_state_model.py      # import the Excel taluka suitability model
python score_crops.py             # score 54 crops x 362 regions (destructive: rewrites the table)
python generate_frontend_data.py  # write frontend/frontend/src/data/*.js
```

## Check the results

```bash
python check_data.py     # what is actually stored
python verify_data.py    # coverage and sanity checks
```

## Coverage notes

- Only Latur (10 tehsils) and Nagpur (14 tehsils) have real fetched weather; Latur
  additionally has real soil for most of its tehsils. Those regions get
  locally-computed scores.
- Everywhere else falls back to the imported state model's score for the 30 crops
  it covers. Missing inputs produce `NULL` factor scores, never invented numbers.
- A crop with 0 price records usually means the Agmarknet commodity spelling
  differs — check `COMMODITY_NAME_MAP` in `config.py`.

## Run the app

```bash
cd frontend/frontend
npm install
npm run dev
```

## Migrating to PostgreSQL later

The schema in `init_db.py` is plain SQL and maps directly to Postgres. Replace
`sqlite3.connect(DB_PATH)` with a `psycopg2` connection in each script, change
`INSERT OR IGNORE` to `INSERT ... ON CONFLICT DO NOTHING`, and fix the foreign
keys that currently point at the leftover `regions_old` name.
