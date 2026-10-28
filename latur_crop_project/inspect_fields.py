"""
Prints ONE full raw record from Agmarknet so we can see the EXACT field
names it actually uses (they sometimes differ from what you'd guess).

Run:
    python inspect_fields.py
"""
import requests
from config import DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

params = {
    "api-key": DATA_GOV_IN_API_KEY,
    "format": "json",
    "filters[district.keyword]": "Latur",
    "filters[commodity.keyword]": "Wheat",
    "limit": 1,
}

r = requests.get(f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}",
                  params=params, headers=HEADERS, timeout=90)
r.raise_for_status()
records = r.json().get("records", [])

if not records:
    print("No records returned - can't inspect fields.")
else:
    print("Full raw record (exact field names and values):\n")
    for key, value in records[0].items():
        print(f"  {key!r}: {value!r}")
