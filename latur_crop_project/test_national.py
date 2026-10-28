"""
Checks whether Onion/Cotton/Tur exist ANYWHERE in the dataset (no district
filter), and if so, prints exactly how the district field is spelled for
those records - to catch a possible "Latur" vs "LATUR" vs "Latur " mismatch.

Run:
    python test_national.py
"""
import requests
from config import DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID

BASE_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

TEST_COMMODITIES = ["Onion", "Cotton", "Tomato", "Arhar", "Sugarcane"]

for commodity in TEST_COMMODITIES:
    print(f"\n=== Testing '{commodity}' with NO district filter (national search) ===")
    params = {
        "api-key": DATA_GOV_IN_API_KEY,
        "format": "json",
        "filters[commodity.keyword]": commodity,
        "limit": 10,
    }
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=60)
        r.raise_for_status()
        records = r.json().get("records", [])
        print(f"  Found {len(records)} records nationally")
        if records:
            districts_seen = set()
            for rec in records:
                districts_seen.add(repr(rec.get("District")))
            print(f"  Sample district values seen: {districts_seen}")
            # Specifically check if any Maharashtra records show up
            mh_records = [r for r in records if r.get("State") == "Maharashtra"]
            print(f"  Of these, {len(mh_records)} are in Maharashtra state")
        else:
            print(f"  '{commodity}' doesn't appear ANYWHERE in this dataset - "
                  f"this commodity likely isn't tracked by this specific resource at all.")
    except Exception as e:
        print(f"  ERROR: {e}")

print("\n\nAlso checking: how does Latur district appear for a commodity that WORKED (Soyabean)?")
params = {
    "api-key": DATA_GOV_IN_API_KEY,
    "format": "json",
    "filters[commodity.keyword]": "Soyabean",
    "filters[state.keyword]": "Maharashtra",
    "limit": 5,
}
r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=60)
records = r.json().get("records", [])
districts = set(repr(rec.get("District")) for rec in records)
print(f"  District values for working Soyabean records: {districts}")
