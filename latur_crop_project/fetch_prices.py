"""
Pulls historical mandi (market) price data for each crop, for every
district in config.py, from the data.gov.in Agmarknet dataset.

BEFORE RUNNING:
1. Register at https://data.gov.in (free) -> My Account -> Generate API Key
2. Paste that key into config.py as DATA_GOV_IN_API_KEY

Run AFTER init_db.py (fetches ALL districts, skipping ones already done):
    python fetch_prices.py

Or just one district (useful when adding a new district later):
    python fetch_prices.py --district Nagpur
"""
import sqlite3
import time
import argparse
import requests
from config import DB_PATH, CROPS, DISTRICTS, DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID, COMMODITY_NAME_MAP

BASE_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
PAGE_SIZE = 1000
TIMEOUT_SECONDS = 90
MAX_RETRIES = 3

# Some government APIs respond slowly/inconsistently to requests that don't
# look like they're coming from a real browser - adding a User-Agent header
# often fixes exactly this kind of intermittent timeout.
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def fetch_page(params, attempt=1):
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=TIMEOUT_SECONDS)
        r.raise_for_status()
        return r.json()
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
        if attempt < MAX_RETRIES:
            wait = attempt * 5
            print(f"    (attempt {attempt} failed: {e}; retrying in {wait}s...)")
            time.sleep(wait)
            return fetch_page(params, attempt + 1)
        raise


def fetch_prices_for_crop(district_name, commodity_name):
    """Fetches ALL records for one district+commodity, paginating."""
    all_records = []
    offset = 0
    while True:
        params = {
            "api-key": DATA_GOV_IN_API_KEY,
            "format": "json",
            "filters[district.keyword]": district_name,
            "filters[commodity.keyword]": commodity_name,
            "limit": PAGE_SIZE,
            "offset": offset,
        }
        payload = fetch_page(params)
        records = payload.get("records", [])
        if not records:
            break
        all_records.extend(records)
        offset += PAGE_SIZE
        if len(records) < PAGE_SIZE:
            break
        time.sleep(1)
    return all_records


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--district", help="Only fetch this district (default: all districts in config.py)")
    args = parser.parse_args()

    if DATA_GOV_IN_API_KEY == "PASTE_YOUR_KEY_HERE":
        print("ERROR: Set your data.gov.in API key in config.py first.")
        return

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    districts = [d for d in DISTRICTS if not args.district or d["name"] == args.district]

    for district in districts:
        district_name = district["name"]
        print(f"\n{'='*60}\nDistrict: {district_name}\n{'='*60}")

        for c in CROPS:
            # Skip if this district+crop combo already has price data -
            # lets you add a new district later without re-fetching
            # everything you already have for existing districts.
            crop_id = cur.execute(
                "SELECT crop_id FROM crops WHERE crop_name=?", (c["name"],)
            ).fetchone()[0]
            existing = cur.execute(
                "SELECT COUNT(*) FROM price_data WHERE crop_id=? AND district=?",
                (crop_id, district_name),
            ).fetchone()[0]
            if existing > 0:
                print(f"Skipping {c['name']} - already has {existing} records for {district_name}")
                continue

            # Uses the exact Agmarknet name from COMMODITY_NAME_MAP in config.py -
            # falls back to a simple guess if a crop wasn't added to that map.
            commodity_name = COMMODITY_NAME_MAP.get(c["name"], c["name"].split(" (")[0])

            print(f"Fetching prices for {commodity_name}...")
            try:
                records = fetch_prices_for_crop(district_name, commodity_name)
            except requests.RequestException as e:
                print(f"  FAILED for {commodity_name}: {e}")
                continue

            inserted = 0
            for rec in records:
                try:
                    min_raw = str(rec.get("Min_Price", 0) or 0).replace(",", "").strip()
                    max_raw = str(rec.get("Max_Price", 0) or 0).replace(",", "").strip()
                    modal_raw = str(rec.get("Modal_Price", 0) or 0).replace(",", "").strip()
                    min_p = float(min_raw) if min_raw else 0.0
                    max_p = float(max_raw) if max_raw else 0.0
                    modal_p = float(modal_raw) if modal_raw else 0.0
                except ValueError:
                    continue
                if modal_p == 0:
                    continue  # zero/blank prices are almost always bad data, not real zero prices

                cur.execute(
                    """INSERT INTO price_data
                       (crop_id, district, market_name, date, min_price, max_price, modal_price)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (crop_id, district_name, rec.get("Market"), rec.get("Arrival_Date"),
                     min_p, max_p, modal_p),
                )
                inserted += 1
            conn.commit()
            print(f"  Inserted {inserted} price records for {commodity_name} "
                  f"(found {len(records)} raw records)")

    conn.close()
    print("\nPrice fetch complete.")


if __name__ == "__main__":
    main()
