"""
Rebuild latur_crops.db into a clean, shippable database.

What it fixes:
  * duplicate price rows (same crop/market/date/price) are collapsed
  * price_data.region_id is dropped - it was NULL for every row, while the
    district column holds the real link used by score_crops.py
  * 1.7M raw daily weather rows are replaced by the per-season aggregates
    that score_crops.py actually derives from them (same numbers, ~95% less
    space). Raw weather_data is kept as an empty table: fetch_weather.py
    refills it locally and scoring prefers it when present.
  * score rows with no data behind them keep overall_score NULL instead of a
    fake value; the frontend generator already skips NULL scores
  * every foreign key now points at the real regions table (some still
    referenced a dropped "regions_old" table)

Usage:
    python clean_database.py <source.db> <output.db>
"""
import os
import sqlite3
import sys

from config import SEASON_MONTHS
from score_crops import load_weather, weather_variables, season_stats

SCHEMA = """
PRAGMA foreign_keys = OFF;

CREATE TABLE regions (
    region_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    state       TEXT NOT NULL,
    district    TEXT NOT NULL,
    tehsil      TEXT NOT NULL,
    latitude    REAL,
    longitude   REAL,
    profile_confidence TEXT,
    UNIQUE(district, tehsil)
);

CREATE TABLE crops (
    crop_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_name       TEXT NOT NULL UNIQUE,
    season          TEXT,
    ideal_ph_min    REAL,
    ideal_ph_max    REAL,
    ideal_rainfall_min INTEGER,
    ideal_rainfall_max INTEGER,
    ideal_temp_min  REAL,
    ideal_temp_max  REAL,
    crop_type       TEXT,
    months_to_harvest INTEGER,
    typical_yield_quintals_per_acre REAL,
    msp_price       REAL,
    input_cost_per_acre REAL
);

CREATE TABLE soil_data (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id       INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    ph              REAL,
    nitrogen        REAL,
    phosphorus      REAL,
    potassium       REAL,
    organic_carbon  REAL,
    source          TEXT,
    recorded_date   TEXT
);

CREATE TABLE weather_data (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id   INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    date        TEXT NOT NULL,
    temp_max    REAL,
    temp_min    REAL,
    rainfall_mm REAL,
    humidity_mean REAL,
    sunshine_duration REAL,
    et0 REAL,
    UNIQUE(region_id, date)
);

CREATE TABLE weather_year (
    region_id INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    year      INTEGER NOT NULL,
    tmax_avg  REAL,
    tmin_avg  REAL,
    rain_mm   REAL,
    days      INTEGER NOT NULL,
    PRIMARY KEY (region_id, year)
);

CREATE TABLE weather_summary (
    region_id INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    season    TEXT NOT NULL,
    year      INTEGER NOT NULL,
    rain_mm   REAL,
    et0_mm    REAL,
    dry_days  INTEGER,
    PRIMARY KEY (region_id, season, year)
);

CREATE TABLE district_factors (
    district            TEXT NOT NULL,
    crop_name           TEXT,
    irrigation_fraction REAL,
    crop_area_share     REAL,
    source_years        TEXT,
    PRIMARY KEY (district, crop_name)
);

CREATE TABLE external_suitability_scores (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id       INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
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

CREATE TABLE price_data (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    crop_id      INTEGER NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
    district     TEXT NOT NULL,
    market_name  TEXT,
    date         TEXT NOT NULL CHECK (date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
    min_price    REAL,
    max_price    REAL,
    modal_price  REAL,
    UNIQUE(crop_id, district, market_name, date, modal_price)
);

CREATE TABLE crop_suitability_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region_id INTEGER NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
    crop_id INTEGER NOT NULL REFERENCES crops(crop_id) ON DELETE CASCADE,
    soil_score REAL,
    rainfall_score REAL,
    temp_score REAL,
    water_score REAL,
    growing_score REAL,
    history_score REAL,
    market_factor REAL,
    land_multiplier REAL,
    overall_score REAL,  -- NULL = not enough data to score this crop here
    score_source TEXT,   -- 'local' = own weather, 'external' = regional model
    confidence REAL,     -- % of the 7 factors actually present
    has_market_data INTEGER,
    avg_market_price REAL,
    price_trend_pct REAL,
    UNIQUE(region_id, crop_id)
);

CREATE INDEX idx_weather_summary_region ON weather_summary(region_id);
CREATE INDEX idx_weather_year_region ON weather_year(region_id);
CREATE INDEX idx_soil_region ON soil_data(region_id);
CREATE INDEX idx_price_crop ON price_data(crop_id);
CREATE INDEX idx_price_district ON price_data(district);
CREATE INDEX idx_scores_region ON crop_suitability_scores(region_id);
CREATE INDEX idx_scores_crop ON crop_suitability_scores(crop_id);
CREATE INDEX idx_scores_overall ON crop_suitability_scores(overall_score);
CREATE INDEX idx_external_region ON external_suitability_scores(region_id);
"""


def to_iso_date(value):
    """Normalises DD/MM/YYYY (Agmarknet) to ISO YYYY-MM-DD so SQL sorting works."""
    if not value:
        return value
    v = value.strip()
    parts = v.replace("-", "/").split("/")
    if len(parts) == 3:
        if len(parts[0]) == 4:        # already YYYY-MM-DD (maybe unpadded)
            y, m, d = parts
        elif len(parts[2]) == 4:      # DD/MM/YYYY from Agmarknet
            d, m, y = parts
        else:
            return v
        return "%s-%s-%s" % (y.zfill(4), m.zfill(2), d.zfill(2))
    return v


def to_iso_date(value):
    """Normalises DD/MM/YYYY (Agmarknet) to ISO YYYY-MM-DD so SQL sorting works."""
    if not value:
        return value
    v = value.strip()
    parts = v.replace("-", "/").split("/")
    if len(parts) == 3:
        if len(parts[0]) == 4:        # already YYYY-MM-DD (maybe unpadded)
            y, m, d = parts
        elif len(parts[2]) == 4:      # DD/MM/YYYY from Agmarknet
            d, m, y = parts
        else:
            return v
        return "%s-%s-%s" % (y.zfill(4), m.zfill(2), d.zfill(2))
    return v


def copy_simple(src, dst, table, cols):
    rows = src.execute("SELECT %s FROM %s" % (", ".join(cols), table)).fetchall()
    dst.executemany("INSERT INTO %s (%s) VALUES (%s)" % (
        table, ", ".join(cols), ", ".join("?" * len(cols))), rows)
    return len(rows)


def summarize_weather(src, dst):
    """Turn per-region daily rows into the aggregates score_crops.py needs."""
    n_years = n_season = 0
    regions = src.execute("SELECT region_id FROM regions ORDER BY region_id").fetchall()
    for (region_id,) in regions:
        rows = load_weather(src.cursor(), region_id)
        if not rows:
            continue
        wv = weather_variables(rows)

        # per-year temperature + annual rainfall (what weather_variables used)
        by_year = {}
        for date_str, tmax, tmin, rain, _h, _s, _e in rows:
            y = int(date_str[:4])
            acc = by_year.setdefault(y, {"tm": [], "tn": [], "rain": 0.0, "days": 0})
            acc["days"] += 1
            if tmax is not None:
                acc["tm"].append(tmax)
            if tmin is not None:
                acc["tn"].append(tmin)
            if rain is not None:
                acc["rain"] += rain

        years_sorted = sorted(wv["rows_by_year"])
        for y in years_sorted:
            acc = by_year[y]
            dst.execute(
                "INSERT INTO weather_year (region_id, year, tmax_avg, tmin_avg,"
                " rain_mm, days) VALUES (?,?,?,?,?,?)",
                (region_id, y,
                 sum(acc["tm"]) / len(acc["tm"]) if acc["tm"] else None,
                 sum(acc["tn"]) / len(acc["tn"]) if acc["tn"] else None,
                 acc["rain"], acc["days"]))
            n_years += 1

        for season_name, months in SEASON_MONTHS.items():
            _rain, _et0, dry_years = season_stats(wv, months)
            for i, y in enumerate(years_sorted):
                rain_total = 0.0
                et0_total = 0.0
                for r in wv["rows_by_year"][y]:
                    month = int(r[0][5:7])
                    if month not in months:
                        continue
                    if r[3] is not None:
                        rain_total += r[3]
                    if r[6] is not None:
                        et0_total += r[6]
                dst.execute(
                    "INSERT INTO weather_summary (region_id, season, year, rain_mm,"
                    " et0_mm, dry_days) VALUES (?,?,?,?,?,?)",
                    (region_id, season_name, y, rain_total, et0_total, dry_years[i]))
                n_season += 1
    return n_years, n_season


def main():
    src_path = sys.argv[1] if len(sys.argv) > 1 else "latur_crops_source.db"
    dst_path = sys.argv[2] if len(sys.argv) > 2 else "latur_crops_clean.db"
    if os.path.exists(dst_path):
        os.remove(dst_path)

    src = sqlite3.connect("file:%s?mode=ro" % src_path, uri=True)
    dst = sqlite3.connect(dst_path)
    dst.executescript(SCHEMA)

    copy_simple(src, dst, "regions",
                ["region_id", "state", "district", "tehsil", "latitude",
                 "longitude", "profile_confidence"])
    copy_simple(src, dst, "crops",
                ["crop_id", "crop_name", "season", "ideal_ph_min", "ideal_ph_max",
                 "ideal_rainfall_min", "ideal_rainfall_max", "ideal_temp_min",
                 "ideal_temp_max", "crop_type", "months_to_harvest",
                 "typical_yield_quintals_per_acre", "msp_price",
                 "input_cost_per_acre"])
    copy_simple(src, dst, "district_factors",
                ["district", "crop_name", "irrigation_fraction",
                 "crop_area_share", "source_years"])

    soil = src.execute("""SELECT s.region_id, s.ph, s.nitrogen, s.phosphorus,
            s.potassium, s.organic_carbon, s.source, s.recorded_date
            FROM soil_data s JOIN regions r ON r.region_id = s.region_id""").fetchall()
    dst.executemany("""INSERT INTO soil_data (region_id, ph, nitrogen, phosphorus,
            potassium, organic_carbon, source, recorded_date)
            VALUES (?,?,?,?,?,?,?,?)""", soil)

    ext = src.execute("""SELECT s.region_id, s.crop_name, s.overall_score,
            s.rank_in_tehsil, s.soil_score, s.rainfall_score, s.temperature_score,
            s.irrigation_score, s.market_score
            FROM external_suitability_scores s
            JOIN regions r ON r.region_id = s.region_id
            GROUP BY s.region_id, s.crop_name""").fetchall()
    dst.executemany("""INSERT OR IGNORE INTO external_suitability_scores
            (region_id, crop_name, overall_score, rank_in_tehsil, soil_score,
             rainfall_score, temperature_score, irrigation_score, market_score)
            VALUES (?,?,?,?,?,?,?,?,?)""", ext)

    prices = src.execute("""SELECT crop_id, district, market_name, date,
            min_price, max_price, modal_price FROM price_data
            WHERE district IS NOT NULL
            GROUP BY crop_id, district, market_name, date, modal_price""").fetchall()
    prices = [(c[0], c[1], c[2], to_iso_date(c[3]), c[4], c[5], c[6])
              for c in prices]
    prices = [(c[0], c[1], c[2], to_iso_date(c[3]), c[4], c[5], c[6])
              for c in prices]
    dst.executemany("""INSERT OR IGNORE INTO price_data
            (crop_id, district, market_name, date, min_price, max_price, modal_price)
            VALUES (?,?,?,?,?,?,?)""", prices)

    # Older databases predate the provenance columns, so derive them: a row
    # built from its own weather is 'local', anything else came from the model.
    scores = src.execute("""SELECT s.region_id, s.crop_id, s.soil_score,
            s.rainfall_score, s.temp_score, s.water_score, s.growing_score,
            s.history_score, s.market_factor, s.land_multiplier, s.overall_score,
            CASE WHEN s.rainfall_score IS NOT NULL AND s.temp_score IS NOT NULL
                 THEN 'local' ELSE 'external' END,
            ROUND(100.0 * ((s.soil_score IS NOT NULL) +
                           (s.rainfall_score IS NOT NULL) +
                           (s.temp_score IS NOT NULL) +
                           (s.water_score IS NOT NULL) +
                           (s.growing_score IS NOT NULL) +
                           (s.history_score IS NOT NULL) +
                           (s.market_factor IS NOT NULL)) / 7.0, 1),
            s.has_market_data, s.avg_market_price, s.price_trend_pct
            FROM crop_suitability_scores s
            GROUP BY s.region_id, s.crop_id""").fetchall()
    dst.executemany("""INSERT OR IGNORE INTO crop_suitability_scores
            (region_id, crop_id, soil_score, rainfall_score, temp_score,
             water_score, growing_score, history_score, market_factor,
             land_multiplier, overall_score, score_source, confidence,
             has_market_data, avg_market_price, price_trend_pct)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", scores)

    n_years, n_season = summarize_weather(src, dst)

    dst.commit()
    dst.execute("VACUUM")
    dst.commit()

    def count(sql):
        return dst.execute(sql).fetchone()[0]

    print("regions                :", count("SELECT COUNT(*) FROM regions"))
    print("crops                  :", count("SELECT COUNT(*) FROM crops"))
    print("soil rows              :", count("SELECT COUNT(*) FROM soil_data"))
    print("price rows (deduped)   :", count("SELECT COUNT(*) FROM price_data"))
    print("external scores        :", count("SELECT COUNT(*) FROM external_suitability_scores"))
    print("weather_year rows      :", n_years)
    print("weather_summary rows   :", n_season)
    print("suitability scores     :", count("SELECT COUNT(*) FROM crop_suitability_scores"))
    print("regions needing weather:", count(
        "SELECT COUNT(*) FROM regions r WHERE NOT EXISTS "
        "(SELECT 1 FROM weather_year w WHERE w.region_id=r.region_id)"))
    dst.close()
    print("wrote %s (%.1f MB)" % (dst_path, os.path.getsize(dst_path) / 1048576.0))


if __name__ == "__main__":
    main()
