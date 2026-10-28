"""
Quick sanity check — run this any time to see what's actually stored.
    python check_data.py
"""
import sqlite3
from config import DB_PATH

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("=== Regions (district/tehsil) ===")
for row in cur.execute("SELECT region_id, district, tehsil, latitude, longitude FROM regions ORDER BY district, tehsil"):
    print(row)

print("\n=== Sample weather rows (first tehsil found) ===")
for row in cur.execute("""
    SELECT date, temp_max, temp_min, rainfall_mm FROM weather_data
    WHERE region_id = (SELECT region_id FROM regions ORDER BY region_id LIMIT 1)
    ORDER BY date LIMIT 5
"""):
    print(row)

print("\n=== Sample soil row (first tehsil found) ===")
for row in cur.execute("""
    SELECT ph, nitrogen, organic_carbon, source FROM soil_data
    WHERE region_id = (SELECT region_id FROM regions ORDER BY region_id LIMIT 1)
"""):
    print(row)

print("\n=== Sample price rows for Soybean, by district ===")
for row in cur.execute("""
    SELECT district, market_name, date, modal_price FROM price_data
    WHERE crop_id = (SELECT crop_id FROM crops WHERE crop_name='Soybean')
    ORDER BY district, date DESC LIMIT 10
"""):
    print(row)

conn.close()
