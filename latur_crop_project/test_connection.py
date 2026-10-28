"""
Diagnostic tool - run this ALONE to figure out exactly what's going wrong
with your connection to the two APIs. Doesn't touch your database.

    python test_connection.py
"""
import time
import requests
from config import DATA_GOV_IN_API_KEY, AGMARKNET_RESOURCE_ID

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}


def test(name, url, params=None, timeout=60):
    print(f"\nTesting {name}...")
    print(f"  URL: {url}")
    start = time.time()
    try:
        r = requests.get(url, params=params, headers=HEADERS, timeout=timeout)
        elapsed = time.time() - start
        print(f"  SUCCESS in {elapsed:.1f} seconds - status code {r.status_code}")
        print(f"  First 200 chars of response: {r.text[:200]}")
        return True
    except requests.exceptions.Timeout:
        elapsed = time.time() - start
        print(f"  TIMED OUT after {elapsed:.1f} seconds (limit was {timeout}s)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"  CONNECTION ERROR: {e}")
        return False
    except Exception as e:
        print(f"  OTHER ERROR: {type(e).__name__}: {e}")
        return False


print("="*60)
print("CONNECTION DIAGNOSTIC - this will take a minute or two")
print("="*60)

# Test 1: a totally unrelated, always-reliable site - baseline check
test("baseline (google.com)", "https://www.google.com", timeout=15)

# Test 2: ISRIC SoilGrids, single point, generous timeout
test(
    "ISRIC SoilGrids",
    "https://rest.isric.org/soilgrids/v2.0/properties/query",
    params={"lon": 76.5604, "lat": 18.4088, "property": "phh2o", "depth": "0-5cm", "value": "mean"},
    timeout=60,
)

# Test 3: data.gov.in Agmarknet, generous timeout
test(
    "data.gov.in Agmarknet",
    f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE_ID}",
    params={"api-key": DATA_GOV_IN_API_KEY, "format": "json",
            "filters[district.keyword]": "Latur",
            "filters[commodity.keyword]": "Soybean", "limit": 5},
    timeout=60,
)

print("\n" + "="*60)
print("DONE. Read the results above:")
print("- If baseline FAILS: general internet problem, not this project's fault")
print("- If baseline SUCCEEDS but the others fail/timeout: those specific")
print("  services are slow/blocked - try a much longer timeout, a VPN off,")
print("  or a mobile hotspot to compare")
print("- If everything SUCCEEDS here: the original script's 30s timeout was")
print("  just too short - increase it")
print("="*60)
