"""
Tests SEVERAL possible spellings for each still-missing crop against
Agmarknet, so we can find the exact working name without guessing one by
one. Doesn't touch your database - just reports what it finds.

Run:
    python find_names.py
"""
import requests
import time
from config import DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID

BASE_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Multiple candidate spellings per crop - we'll test each and report hits.
CANDIDATES = {
    "Tur (Pigeonpea)": ["Arhar (Tur/Red Gram)(Whole)", "Arhar", "Tur", "Red Gram", "Arhar Dal(Tur Dal)"],
    "Udid (Black Gram)": ["Urad", "Black Gram (Urd) (Whole)", "Black Gram", "Urad Dal"],
    "Mung (Green Gram)": ["Moong", "Green Gram (Moong)(Whole)", "Green Gram", "Moong Dal"],
    "Cotton": ["Cotton", "Kapas", "Cotton (Unginned)", "Cotton Seed"],
    "Sugarcane": ["Sugarcane", "Sugar Cane"],
    "Pomegranate": ["Pomegranate", "Anar"],
    "Mango": ["Mango", "Mango (Raw-Ripe)", "Mango(Raw-Ripe)"],
    "Sapota": ["Sapota", "Chikoo(Sapota)", "Chikoo", "Chiku"],
    "Brinjal": ["Brinjal", "Brinjal(Egg Plant)"],
    "Tomato": ["Tomato"],
    "Onion": ["Onion", "Onion(White)"],
    "Papaya": ["Papaya", "Papaya (Raw)"],
    "Coriander": ["Coriander(Leaves)", "Coriander", "Coriander Seed", "Dry Coriander"],
}


def test_commodity(name):
    params = {
        "api-key": DATA_GOV_IN_API_KEY,
        "format": "json",
        "filters[district.keyword]": "Latur",
        "filters[commodity.keyword]": name,
        "limit": 1,
    }
    try:
        r = requests.get(BASE_URL, params=params, headers=HEADERS, timeout=60)
        r.raise_for_status()
        records = r.json().get("records", [])
        return len(records)
    except Exception as e:
        return f"ERROR: {e}"


print("Testing candidate names for each missing crop (this will take a few minutes)...\n")
working_names = {}

for crop, candidates in CANDIDATES.items():
    print(f"=== {crop} ===")
    found_any = False
    for candidate in candidates:
        result = test_commodity(candidate)
        status = "HIT" if isinstance(result, int) and result > 0 else "miss"
        print(f"  '{candidate}': {result} {'<-- ' + status if status == 'HIT' else ''}")
        if status == "HIT" and crop not in working_names:
            working_names[crop] = candidate
            found_any = True
        time.sleep(0.5)
    if not found_any:
        print(f"  NONE of the tried spellings worked for {crop}.")
    print()

print("="*60)
print("SUMMARY - working names found:")
print("="*60)
if working_names:
    for crop, name in working_names.items():
        print(f'  "{crop}": "{name}",')
else:
    print("  None found - these crops may genuinely have little/no")
    print("  Agmarknet-reported trading in Latur district.")

print("\nCrops with NO working name found (likely not meaningfully")
print("traded through regulated Latur mandis, or need manual lookup")
print("on agmarknet.gov.in directly):")
for crop in CANDIDATES:
    if crop not in working_names:
        print(f"  - {crop}")
