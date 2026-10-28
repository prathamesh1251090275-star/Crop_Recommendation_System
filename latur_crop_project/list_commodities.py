"""
Lists every commodity name that actually exists in Agmarknet's data for
Latur district - use this to find the EXACT spelling for crops that showed
"0 raw records" so you can fix fetch_prices.py's commodity_name mapping.

Run:
    python list_commodities.py
"""
import requests
import time
from config import DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID

BASE_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_page(offset, attempt=1):
    params = {
        "api-key": DATA_GOV_IN_API_KEY,
        "format": "json",
        "filters[district.keyword]": "Latur",
        "limit": 1000,
        "offset": offset,
    }
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=90)
        r.raise_for_status()
        return r.json()
    except (requests.exceptions.Timeout, requests.exceptions.ConnectionError):
        if attempt < 3:
            time.sleep(attempt * 5)
            return fetch_page(offset, attempt + 1)
        raise

print("Pulling all commodity names Agmarknet has for Latur district...")
commodities = set()
offset = 0
while True:
    payload = fetch_page(offset)
    records = payload.get("records", [])
    if not records:
        break
    for rec in records:
        name = rec.get("commodity")
        if name:
            commodities.add(name)
    offset += 1000
    if len(records) < 1000:
        break
    time.sleep(1)

print(f"\nFound {len(commodities)} distinct commodity names in Latur's Agmarknet data:\n")
for name in sorted(commodities):
    print(f"  {name}")

print("\nCompare these exact spellings against your CROPS list in config.py,")
print("then update the commodity_name line in fetch_prices.py for any crop")
print("that didn't match (e.g. change 'Gram' to whatever exact name is shown above).")
