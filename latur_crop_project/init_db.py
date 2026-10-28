"""
Creates the SQLite database and all tables.
Run this FIRST, before any fetch script.

    python init_db.py

Using SQLite here because it needs zero setup — just a file.
When you're ready to scale to a full app, swap the sqlite3.connect() calls
in every script for a psycopg2/SQLAlchemy Postgres connection; the schema
below is written in plain SQL so the migration is mostly copy-paste.
"""
import sqlite3
from config import DB_PATH, TEHSILS_BY_DISTRICT, CROPS, STATE

SCHEMA = """
CREATE TABLE IF NOT EXISTS regions (
    region_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    state       TEXT NOT NULL,
    district    TEXT NOT NULL,
    tehsil      TEXT NOT NULL,
    latitude    REAL,
    longitude   REAL,
    profile_confidence TEXT,   -- e.g. 'High', 'Medium', 'Low / urban' - from imported state model
    UNIQUE(district, tehsil)
);

CREATE TABLE IF NOT EXISTS crops (
    crop_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name       TEXT NOT NULL UNIQUE,
    season          TEXT,
    ideal_ph_min    REAL,
    ideal_ph_max    REAL,
    ideal_rainfall_min INTEGER,
    ideal_rainfall_max INTEGER,
    ideal_temp_min  REAL,
    ideal_temp_max  REAL,
    crop_type       TEXT,       -- 'Seasonal', 'Semi-Perennial', or 'Perennial'
    months_to_harvest INTEGER,  -- months until FIRST harvest
    typical_yield_quintals_per_acre REAL,  -- rough typical yield, for income estimation
    msp_price       REAL,       -- Govt Minimum Support Price (Rs/quintal), NULL if none exists
    input_cost_per_acre REAL    -- rough cost of cultivation per acre, for net profit calculation
);

CREATE TABLE IF NOT EXISTS soil_data (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id       INTEGER NOT NULL REFERENCES regions(region_id),
    ph              REAL,
    nitrogen        REAL,
    phosphorus      REAL,
    potassium       REAL,
    organic_carbon  REAL,
    source          TEXT,          -- e.g. 'SoilGrids' or 'SoilHealthCard'
    recorded_date   TEXT
);

CREATE TABLE IF NOT EXISTS weather_data (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id   INTEGER NOT NULL REFERENCES regions(region_id),
    date        TEXT NOT NULL,
    temp_max    REAL,
    temp_min    REAL,
    rainfall_mm REAL,
    humidity_mean REAL,       -- daily mean relative humidity (%) - added for the G (growing-water) factor
    sunshine_duration REAL,   -- daily sunshine duration (hours) - added for the G (growing-water) factor
    et0 REAL,                 -- daily FAO reference evapotranspiration (mm) - added for the G factor
    UNIQUE(region_id, date)
);

CREATE TABLE IF NOT EXISTS district_factors (
    -- District-level agronomic factors pulled from ICRISAT's DLDD API.
    -- Applied to EVERY tehsil within the district (per design decision:
    -- a district's irrigation infrastructure / crop-area history is shared
    -- across all its tehsils, so a city like Latur town isn't penalised by
    -- its own dense urban tehsil cell - the district value is the real one).
    --   irrigation_fraction : net irrigated area / net cropped area (0-1)
    --                         from 'cropwise-irrigated-area', averaged over
    --                         the years where the district reports real data.
    --   crop_area_share     : this crop's avg area / total cropped area (0-1)
    --                         from 'area-production-yield' (APY). What farmers
    --                         historically actually grow here = the H factor.
    --   source_years        : e.g. '1990-2008' - the years actually averaged
    --                         (ICRISAT irrigation data is gaps in recent years).
    district            TEXT NOT NULL,
    crop_name           TEXT,             -- our canonical crop name; NULL = district aggregate row
    irrigation_fraction REAL,
    crop_area_share     REAL,
    source_years        TEXT,
    PRIMARY KEY (district, crop_name)
);

CREATE TABLE IF NOT EXISTS price_data (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id    INTEGER REFERENCES regions(region_id),
    crop_id      INTEGER NOT NULL REFERENCES crops(crop_id),
    district     TEXT,          -- which district this price record belongs to
    market_name  TEXT,
    date         TEXT NOT NULL,
    min_price    REAL,
    max_price    REAL,
    modal_price  REAL
);

CREATE TABLE IF NOT EXISTS external_suitability_scores (
    -- Imported from the state-wide 358-taluka/36-district crop suitability
    -- dataset. This is a MODEL-DERIVED estimate (soil/rainfall/temp/
    -- irrigation/historical-pattern/market-demand composite), not from our
    -- own fetched ISRIC/Open-Meteo/Agmarknet data. Used as a suitability
    -- fallback for regions where we don't have real fetched soil/weather
    -- data (i.e. everywhere except the Latur/Nagpur tehsils fetched earlier).
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id       INTEGER NOT NULL REFERENCES regions(region_id),
    crop_name       TEXT NOT NULL,
    overall_score   REAL,
    rank_in_tehsil  INTEGER,
    soil_score      REAL,
    rainfall_score  REAL,
    temperature_score REAL,
    irrigation_score REAL,
    market_score    REAL,
    UNIQUE(region_id, crop_name)
);
"""

def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(SCHEMA)

    # Migration: if this DB was created before crop_type/months_to_harvest
    # existed, add them now without losing any of your existing data.
    existing_cols = [row[1] for row in cur.execute("PRAGMA table_info(crops)").fetchall()]
    if "crop_type" not in existing_cols:
        cur.execute("ALTER TABLE crops ADD COLUMN crop_type TEXT")
        print("Migrated: added crop_type column to existing crops table")
    if "months_to_harvest" not in existing_cols:
        cur.execute("ALTER TABLE crops ADD COLUMN months_to_harvest INTEGER")
        print("Migrated: added months_to_harvest column to existing crops table")
    if "typical_yield_quintals_per_acre" not in existing_cols:
        cur.execute("ALTER TABLE crops ADD COLUMN typical_yield_quintals_per_acre REAL")
        print("Migrated: added typical_yield_quintals_per_acre column")
    if "msp_price" not in existing_cols:
        cur.execute("ALTER TABLE crops ADD COLUMN msp_price REAL")
        print("Migrated: added msp_price column")
    if "input_cost_per_acre" not in existing_cols:
        cur.execute("ALTER TABLE crops ADD COLUMN input_cost_per_acre REAL")
        print("Migrated: added input_cost_per_acre column")
    conn.commit()

    # Migration: older regions tables required NOT NULL lat/long, but
    # imported state-model tehsils don't have precise coordinates (they're
    # not needed for those, since we use the imported suitability scores
    # instead of live weather/soil API calls for them). SQLite can't drop a
    # NOT NULL constraint directly, so recreate the table if needed,
    # preserving all existing region_ids (other tables reference them via FK).
    region_cols = cur.execute("PRAGMA table_info(regions)").fetchall()
    lat_col = next((c for c in region_cols if c[1] == "latitude"), None)
    has_confidence_col = any(c[1] == "profile_confidence" for c in region_cols)
    if (lat_col and lat_col[3] == 1) or not has_confidence_col:
        cur.execute("ALTER TABLE regions RENAME TO regions_old")
        cur.execute("""CREATE TABLE regions (
            region_id   INTEGER PRIMARY KEY AUTOINCREMENT,
            state       TEXT NOT NULL,
            district    TEXT NOT NULL,
            tehsil      TEXT NOT NULL,
            latitude    REAL,
            longitude   REAL,
            profile_confidence TEXT,
            UNIQUE(district, tehsil)
        )""")
        old_cols = [c[1] for c in region_cols if c[1] != "region_id"]
        copy_cols = ", ".join(old_cols)
        cur.execute(f"INSERT INTO regions (region_id, {copy_cols}) "
                     f"SELECT region_id, {copy_cols} FROM regions_old")
        cur.execute("DROP TABLE regions_old")
        print("Migrated: regions table now allows NULL lat/long "
              "(for imported tehsils) and has a profile_confidence column")
    conn.commit()

    # Migration: price_data needs a district column so multiple districts'
    # prices for the same crop don't get mixed together. Any existing rows
    # (from before this column existed) were all Latur data, so backfill them.
    price_cols = [row[1] for row in cur.execute("PRAGMA table_info(price_data)").fetchall()]
    if "district" not in price_cols:
        cur.execute("ALTER TABLE price_data ADD COLUMN district TEXT")
        cur.execute("UPDATE price_data SET district='Latur' WHERE district IS NULL")
        print("Migrated: added district column to price_data, backfilled existing rows as 'Latur'")
    conn.commit()

    # Migration: weather_data had only temp_max/temp_min/rainfall_mm. The new
    # G (growing-water) factor needs humidity/sunshine/ET0, and the 15-yr
    # refetch (WEATHER_START_DATE=2010) replaces rows wholesale. Add the new
    # columns if they don't already exist.
    weather_cols = [row[1] for row in cur.execute("PRAGMA table_info(weather_data)").fetchall()]
    for col, decl in (("humidity_mean", "REAL"), ("sunshine_duration", "REAL"), ("et0", "REAL")):
        if col not in weather_cols:
            cur.execute(f"ALTER TABLE weather_data ADD COLUMN {col} {decl}")
            print(f"Migrated: added {col} column to weather_data")
    conn.commit()

    # Seed regions for every district defined in config.py
    for district, info in TEHSILS_BY_DISTRICT.items():
      for t in info["tehsils"]:
         cur.execute(
            """
            INSERT OR IGNORE INTO regions
            (state, district, tehsil, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                STATE,
                district,
                t["name"],
                t["latitude"],
                t["longitude"],
            ),
        )

    # Seed crops with their ideal agronomic ranges
    for c in CROPS:
        cur.execute(
            """INSERT OR IGNORE INTO crops
               (crop_name, season, ideal_ph_min, ideal_ph_max,
                ideal_rainfall_min, ideal_rainfall_max, ideal_temp_min, ideal_temp_max,
                crop_type, months_to_harvest, typical_yield_quintals_per_acre, msp_price,
                input_cost_per_acre)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (c["name"], c["season"], c["ph_min"], c["ph_max"],
             c["rainfall_min"], c["rainfall_max"], c["temp_min"], c["temp_max"],
             c["crop_type"], c["months_to_harvest"],
             c["typical_yield_quintals_per_acre"], c["msp_price"], c["input_cost_per_acre"]),
        )
        # If this crop already existed (e.g. from before crop_type existed),
        # make sure it still gets the new classification filled in.
        cur.execute(
            "UPDATE crops SET crop_type=?, months_to_harvest=?, "
            "typical_yield_quintals_per_acre=?, msp_price=?, input_cost_per_acre=? WHERE crop_name=?",
            (c["crop_type"], c["months_to_harvest"],
             c["typical_yield_quintals_per_acre"], c["msp_price"],
             c["input_cost_per_acre"], c["name"]),
        )

    conn.commit()
    n_regions = cur.execute("SELECT COUNT(*) FROM regions").fetchone()[0]
    n_crops = cur.execute("SELECT COUNT(*) FROM crops").fetchone()[0]

    # Indexes - without these, every price/soil/weather lookup does a full
    # table scan, which gets noticeably slow as your data grows (this is
    # likely why the web app feels sluggish).
    cur.execute("CREATE INDEX IF NOT EXISTS idx_price_crop ON price_data(crop_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_price_district ON price_data(district)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_soil_region ON soil_data(region_id)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_weather_region ON weather_data(region_id)")
    conn.commit()
    print("Indexes created/verified on price_data, soil_data, weather_data")

    print(f"Database ready at {DB_PATH}")
    print(f"  {n_regions} regions (tehsils) seeded across "
      f"{len(TEHSILS_BY_DISTRICT)} district(s): "
      f"{', '.join(TEHSILS_BY_DISTRICT.keys())}")
    print(f"  {n_crops} crops seeded")
    conn.close()

if __name__ == "__main__":
    main()
