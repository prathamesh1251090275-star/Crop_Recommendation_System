# Crop Recommendation System (Maharashtra)

Recommends what a farmer should grow in a given tehsil (taluka) of Maharashtra,
in Marathi and English, from real soil, rainfall, temperature and mandi-price
data plus a state-wide crop suitability model.

Two parts:

| Part | Stack | What it does |
|------|-------|--------------|
| `latur_crop_project/` | Python 3 + SQLite | Fetches weather / soil / mandi data, scores 54 crops for every tehsil, and exports the result to JavaScript modules |
| `latur_crop_project/frontend/frontend/` | React 19 + Vite | The mobile-style farmer app. Fully static — all data is pre-generated |

## Run the app

```bash
cd latur_crop_project/frontend/frontend
npm install
npm run dev
```

Open http://localhost:5173. The generated data files are committed, so the app
runs with no database and no API keys.

## Re-generate the data (optional)

Only needed for fresh numbers. Requires Python 3 and `pip install requests`.

```bash
cd latur_crop_project
export DATA_GOV_IN_API_KEY="your-key"   # free key from https://data.gov.in
                                        # PowerShell: $env:DATA_GOV_IN_API_KEY="your-key"
python run_all.py                       # create the DB + fetch weather/soil/prices
python import_state_model.py            # import the Excel suitability model
python score_crops.py                   # recompute suitability scores
python generate_frontend_data.py         # rewrite src/data/*.js
```

`latur_crops.db` is git-ignored, so a fresh clone must run the pipeline before
`generate_frontend_data.py` can work. The frontend does not need the database.

The Agmarknet API key is read from the `DATA_GOV_IN_API_KEY` environment
variable — never hard-code it in `config.py`, because this repository is public.

## Docs

- `latur_crop_project/ARCHITECTURE.md` — full technical reference: schema, scoring engine, data flow
- `latur_crop_project/README.md` — data pipeline setup in detail
- `latur_crop_project/frontend/frontend/README.md` — app structure and on-screen scoring
