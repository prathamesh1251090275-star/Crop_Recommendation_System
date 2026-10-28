"""
Pulls soil properties (pH, organic carbon, nitrogen) per Latur tehsil from
ISRIC SoilGrids — a free global soil API, no key required.

This is a FALLBACK/starting point. It's coarse-resolution (250m grid) global
modeled data, not a real soil test. Replace/supplement with actual Soil
Health Card data for your tehsils as soon as you can get it (check
data.gov.in or your state agriculture department) since real test data will
be far more accurate than modeled estimates for actual farmer recommendations.

Run AFTER init_db.py:
    python fetch_soil.py
"""
import sqlite3
import time
import datetime
import argparse
import requests
from config import DB_PATH

BASE_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
TIMEOUT_SECONDS = 90
MAX_RETRIES = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# SoilGrids returns values in unusual scaled units - conversion factors below
# phh2o is pH*10, soc is organic carbon in dg/kg -> divide by 10 for g/kg, nitrogen in cg/kg -> /100 for g/kg
PROPERTIES = ["phh2o", "soc", "nitrogen"]


def fetch_soil_for(lat, lon, attempt=1):
    params = {
        "lon": lon,
        "lat": lat,
        "property": PROPERTIES,
        "depth": "0-5cm",
        "value": "mean",
    }
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=TIMEOUT_SECONDS)
        r.raise_for_status()
        return r.json()
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
        if attempt < MAX_RETRIES:
            wait = attempt * 5
            print(f"    (attempt {attempt} failed: {e}; retrying in {wait}s...)")
            time.sleep(wait)
            return fetch_soil_for(lat, lon, attempt + 1)
        raise


def extract_value(data, prop_name):
    for layer in data["properties"]["layers"]:
        if layer["name"] == prop_name:
            return layer["depths"][0]["values"]["mean"]
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--district", help="Only fetch this district (default: all districts in the DB)")
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    today = datetime.date.today().isoformat()

    district_filter = "WHERE district = ?" if args.district else ""
    params = (args.district,) if args.district else ()
    regions = cur.execute(
        f"SELECT region_id, district, tehsil, latitude, longitude FROM regions {district_filter}",
        params,
    ).fetchall()

    for region_id, district, tehsil, lat, lon in regions:
        # Skip tehsils that already have a valid (non-null) soil reading -
        # avoids re-fetching what already worked and avoids duplicate rows.
        existing = cur.execute(
            "SELECT ph FROM soil_data WHERE region_id=? AND ph IS NOT NULL "
            "ORDER BY recorded_date DESC LIMIT 1",
            (region_id,),
        ).fetchone()
        if existing:
            print(f"Skipping {district}/{tehsil} - already has valid soil data (pH={existing[0]})")
            continue

        print(f"Fetching soil data for {district}/{tehsil}...")
        try:
            data = fetch_soil_for(lat, lon)
        except requests.RequestException as e:
            print(f"  FAILED for {district}/{tehsil}: {e}")
            continue

        # Remove any earlier failed (all-None) row for this region before inserting the good one
        cur.execute("DELETE FROM soil_data WHERE region_id=? AND ph IS NULL", (region_id,))

        ph_raw = extract_value(data, "phh2o")
        soc_raw = extract_value(data, "soc")
        n_raw = extract_value(data, "nitrogen")

        ph = ph_raw / 10.0 if ph_raw is not None else None
        organic_carbon = soc_raw / 10.0 if soc_raw is not None else None  # g/kg
        nitrogen = n_raw / 100.0 if n_raw is not None else None            # g/kg

        cur.execute(
            """INSERT INTO soil_data
               (region_id, ph, nitrogen, organic_carbon, source, recorded_date)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (region_id, ph, nitrogen, organic_carbon, "SoilGrids", today),
        )
        conn.commit()
        print(f"  pH={ph}, N={nitrogen} g/kg, organic_carbon={organic_carbon} g/kg")
        # ISRIC's own fair-use policy states a limit of 5 calls per minute.
        # 1 second wasn't a problem at 2 districts, but would get you rate
        # limited or blocked when fetching a full state's worth of tehsils.
        time.sleep(13)

    conn.close()
    print("Soil fetch complete. Remember: replace with real Soil Health Card data when available.")


if __name__ == "__main__":
    main()
