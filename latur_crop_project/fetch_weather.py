"""
Pulls historical daily weather for every tehsil in every district from
Open-Meteo's free archive API (no key required) and stores it in
weather_data.

Variables fetched per day:
    - temperature_2m_max / temperature_2m_min
    - precipitation_sum
    - relative_humidity_2m_mean      (new: G factor)
    - sunshine_duration              (new: G factor)
    - et0_fao_evapotranspiration     (new: G factor)

The window comes from config.WEATHER_START_DATE/WEATHER_END_DATE (now a
15-year window, 2010-2025, so the long-term normal drives suitability).

Run AFTER init_db.py:
    python fetch_weather.py

Or limit to one district (useful when adding a new district later without
re-fetching everything you already have):
    python fetch_weather.py --district Nagpur

Force a full re-fetch of every tehsil (replaces existing rows so the new
columns + wider window take effect everywhere):
    python fetch_weather.py --force
"""
import sqlite3
import time
import argparse
import requests
from config import DB_PATH, WEATHER_START_DATE, WEATHER_END_DATE

BASE_URL = "https://archive-api.open-meteo.com/v1/archive"


def fetch_weather_for(lat, lon, max_retries=40):
    """Fetch 15-yr daily weather. On 429 the whole service is throttled, so
    keep stalling with a growing backoff instead of giving up the region (a
    missed region loses a full 15-yr climatology)."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": WEATHER_START_DATE,
        "end_date": WEATHER_END_DATE,
        "daily": ("temperature_2m_max,temperature_2m_min,precipitation_sum,"
                  "relative_humidity_2m_mean,sunshine_duration,"
                  "et0_fao_evapotranspiration"),
        "timezone": "Asia/Kolkata",
    }
    last_err = None
    for attempt in range(max_retries):
        try:
            r = requests.get(BASE_URL, params=params, timeout=60)
            if r.status_code == 429:
                # Throttled at the IP level: wait longer on each attempt so a
                # single process naturally spaces itself out of the window.
                wait = min(30 * (attempt + 1), 600)
                print(f"    rate-limited (429), stalling {wait}s...", flush=True)
                time.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()["daily"]
        except requests.RequestException as e:
            last_err = e
            wait = min(5 * (attempt + 1), 60)
            print(f"    request error ({e}), retrying in {wait}s...", flush=True)
            time.sleep(wait)
    raise last_err or requests.RequestException("unknown fetch failure")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--district", help="Only fetch this district (default: all districts in the DB)")
    parser.add_argument("--force", action="store_true",
                        help="Re-fetch tehsils that already have weather data "
                             "(deletes their old rows first, so the new columns "
                             "and 15-yr window replace them cleanly)")
    parser.add_argument("--resume", action="store_true",
                        help="Skip tehsils that already have 15-yr weather "
                             "(rows with humidity_mean/et0 filled) - safe to "
                             "re-run after an interruption")
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    district_filter = "WHERE district = ?" if args.district else ""
    params = (args.district,) if args.district else ()
    regions = cur.execute(
        f"SELECT region_id, district, tehsil, latitude, longitude FROM regions {district_filter}",
        params,
    ).fetchall()

    fetched_any = False
    for region_id, district, tehsil, lat, lon in regions:
        existing = cur.execute(
            "SELECT COUNT(*) FROM weather_data WHERE region_id=?", (region_id,)
        ).fetchone()[0]
        if args.resume:
            complete = cur.execute(
                "SELECT COUNT(*) FROM weather_data WHERE region_id=? "
                "AND humidity_mean IS NOT NULL AND et0 IS NOT NULL",
                (region_id,),
            ).fetchone()[0]
            if complete > 0:
                print(f"Skipping {district}/{tehsil} - already has 15-yr data ({complete} rows)")
                continue
        elif existing > 0 and not args.force:
            # Skip tehsils that already have weather data - lets you add a new
            # district later without re-fetching everything you already have.
            print(f"Skipping {district}/{tehsil} - already has {existing} weather records")
            continue

        print(f"Fetching weather for {district}/{tehsil}...", flush=True)
        try:
            daily = fetch_weather_for(lat, lon)
        except requests.RequestException as e:
            print(f"  FAILED for {district}/{tehsil}: {e}")
            continue

        if existing > 0:
            cur.execute("DELETE FROM weather_data WHERE region_id=?", (region_id,))

        rows = list(zip(
            daily["time"], daily["temperature_2m_max"], daily["temperature_2m_min"],
            daily["precipitation_sum"], daily["relative_humidity_2m_mean"],
            daily["sunshine_duration"], daily["et0_fao_evapotranspiration"]))
        inserted = 0
        for date, tmax, tmin, rain, humidity, sunshine, et0 in rows:
            if tmax is None or tmin is None:
                continue  # skip incomplete records rather than inserting nulls silently
            cur.execute(
                """INSERT OR IGNORE INTO weather_data
                   (region_id, date, temp_max, temp_min, rainfall_mm,
                    humidity_mean, sunshine_duration, et0)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (region_id, date, tmax, tmin, rain or 0, humidity, sunshine, et0),
            )
            inserted += 1
        conn.commit()
        fetched_any = True
        print(f"  Inserted {inserted} daily records for {district}/{tehsil}", flush=True)
        time.sleep(2)  # be polite to the free API

    conn.close()
    if fetched_any or args.force:
        print("Weather fetch complete.")
    else:
        print("Nothing to fetch (all tehsils already have data). Use --force to re-fetch.")


if __name__ == "__main__":
    main()