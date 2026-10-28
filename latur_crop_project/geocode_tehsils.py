"""
Geocodes all 358 Maharashtra tehsils (from tehsil_list.json) to a
lat/lon centroid using Nominatim (OpenStreetMap's free geocoder).

BEFORE RUNNING:
1. Edit NOMINATIM_USER_AGENT below - Nominatim's usage policy requires a
   real identifying User-Agent with contact info, and will silently block
   generic/browser-looking ones. Something like:
   "MaharashtraCropProject/1.0 (your_email@example.com)"
2. Make sure tehsil_list.json is in this same folder (it has the 358
   district/tehsil name pairs extracted from the crop suitability
   spreadsheet - no coordinates yet, that's what this script adds).

Run:
    python geocode_tehsils.py

This is a LONG-RUNNING script - 358 tehsils x ~1.1s between requests
(Nominatim's usage policy caps free use at 1 request/second) = roughly
7-15 minutes for a clean run, longer if fallback queries are needed.

RESUMABLE: results are saved to geocoded_tehsils.json after EVERY
successful lookup, not just at the end. If this script crashes, gets
rate-limited, or you Ctrl-C it, just run it again - it skips anything
already geocoded and only retries what's missing or previously failed.

HONESTY: if none of the query strategies find a confident match, the
tehsil is written to geocode_failures.csv instead of being given a
guessed/fabricated coordinate. Check that file and fill those in by hand
(e.g. look up the taluka HQ town on Google Maps) before moving on.
"""
import json
import time
import csv
import requests

INPUT_FILE = "tehsil_list.json"
OUTPUT_FILE = "geocoded_tehsils.json"
FAILURES_FILE = "geocode_failures.csv"

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
# REQUIRED by Nominatim's usage policy - replace with something that
# identifies your project and a real contact. Requests with a generic
# or missing User-Agent get silently blocked.
NOMINATIM_USER_AGENT = "MaharashtraCropSuitabilityProject/1.0 (prathamesh.1251090275@vit.edu)"

RATE_LIMIT_SECONDS = 1.1  # Nominatim free tier: max 1 req/sec, add a small buffer
MAX_RETRIES = 3
TIMEOUT_SECONDS = 20


def query_nominatim(params, attempt=1):
    headers = {"User-Agent": NOMINATIM_USER_AGENT}
    try:
        r = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=TIMEOUT_SECONDS)
        r.raise_for_status()
        return r.json()
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError) as e:
        if attempt < MAX_RETRIES:
            wait = attempt * 5
            print(f"    (attempt {attempt} failed: {e}; retrying in {wait}s...)")
            time.sleep(wait)
            return query_nominatim(params, attempt + 1)
        raise
    except requests.exceptions.HTTPError as e:
        if r.status_code == 403:
            print("    HTTP 403 - Nominatim likely rejected the User-Agent. "
                  "Edit NOMINATIM_USER_AGENT at the top of this script.")
        raise


def try_geocode(tehsil, district):
    """
    Tries a few query strategies, most specific first, and returns
    (lat, lon, match_type) for the first one that gets a hit, or
    (None, None, None) if nothing matched.
    """
    strategies = [
        ("structured", {
            "q": tehsil,
            "county": district,
            "state": "Maharashtra",
            "country": "India",
            "format": "jsonv2",
            "limit": 1,
        }),
        ("freeform_district", {
            "q": f"{tehsil}, {district} district, Maharashtra, India",
            "format": "jsonv2",
            "limit": 1,
        }),
        ("freeform_taluka", {
            "q": f"{tehsil} taluka, Maharashtra, India",
            "format": "jsonv2",
            "limit": 1,
        }),
        # Some taluka HQs share the district name (e.g. district "Latur",
        # tehsil "Latur") - a bare town-name search is the last resort.
        ("bare_name", {
            "q": f"{tehsil}, Maharashtra, India",
            "format": "jsonv2",
            "limit": 1,
        }),
    ]

    for match_type, params in strategies:
        try:
            results = query_nominatim(params)
        except requests.RequestException as e:
            print(f"    query failed ({match_type}): {e}")
            time.sleep(RATE_LIMIT_SECONDS)
            continue
        time.sleep(RATE_LIMIT_SECONDS)
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"]), match_type

    return None, None, None


def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return default


def save_results(results):
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)


def main():
    tehsils = load_json(INPUT_FILE, None)
    if tehsils is None:
        print(f"ERROR: {INPUT_FILE} not found. Run the extraction step first.")
        return

    if "REPLACE_WITH_YOUR_EMAIL" in NOMINATIM_USER_AGENT:
        print("ERROR: Edit NOMINATIM_USER_AGENT at the top of this script "
              "before running - Nominatim requires a real contact identifier.")
        return

    # Resume support: key on (district, tehsil), keep anything already
    # successfully geocoded, only (re)attempt what's missing.
    existing = load_json(OUTPUT_FILE, [])
    done = {(r["district"], r["tehsil"]): r for r in existing if r.get("latitude") is not None}
    print(f"Resuming: {len(done)} tehsils already geocoded, "
          f"{len(tehsils) - len(done)} remaining.")

    results = list(done.values())
    failures = []

    for i, t in enumerate(tehsils, 1):
        key = (t["district"], t["tehsil"])
        if key in done:
            continue

        print(f"[{i}/{len(tehsils)}] Geocoding {t['tehsil']}, {t['district']}...")
        lat, lon, match_type = try_geocode(t["tehsil"], t["district"])

        if lat is not None:
            record = {
                "state": t["state"],
                "division": t["division"],
                "district": t["district"],
                "tehsil": t["tehsil"],
                "latitude": lat,
                "longitude": lon,
                "match_type": match_type,
            }
            results.append(record)
            save_results(results)  # save after EVERY success - crash-safe
            print(f"    -> ({lat:.4f}, {lon:.4f}) via '{match_type}'")
        else:
            print(f"    -> NOT FOUND after all strategies - flagging for manual review")
            failures.append(t)

    # Write/refresh the failures file every run so it always reflects
    # current state (some earlier failures may have succeeded this run).
    still_failed_keys = {(t["district"], t["tehsil"]) for t in failures}
    if still_failed_keys:
        with open(FAILURES_FILE, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["state", "division", "district", "tehsil",
                              "latitude", "longitude", "notes"])
            for t in failures:
                writer.writerow([t["state"], t["division"], t["district"],
                                  t["tehsil"], "", "", "fill in manually"])

    print(f"\nDone. {len(results)}/{len(tehsils)} tehsils geocoded successfully.")
    if still_failed_keys:
        print(f"{len(still_failed_keys)} tehsils need manual coordinates - "
              f"see {FAILURES_FILE}. Fill in latitude/longitude there, "
              f"then run merge_manual_geocodes.py (or just re-run this "
              f"script after adding better name hints).")
    print(f"Results saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
