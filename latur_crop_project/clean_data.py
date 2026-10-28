"""
Runs AFTER all three fetch scripts. Does two things:
1. Flags likely bad price records (statistical outliers) into a review table
   instead of silently deleting them — you decide what to do with each.
2. Prints a coverage report so you know what's actually missing before
   moving on to building the recommendation engine.

Run:
    python clean_data.py
"""
import sqlite3
import statistics
from config import DB_PATH

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# --- 1. Outlier flagging on price_data (per crop, z-score > 3) -----------
cur.execute("""
CREATE TABLE IF NOT EXISTS price_outliers_review (
    id INTEGER PRIMARY KEY,
    price_data_id INTEGER,
    crop_id INTEGER,
    modal_price REAL,
    z_score REAL
)
""")
cur.execute("DELETE FROM price_outliers_review")  # re-run clean each time

crop_ids = [row[0] for row in cur.execute("SELECT crop_id FROM crops").fetchall()]
flagged = 0
for crop_id in crop_ids:
    rows = cur.execute(
        "SELECT id, modal_price FROM price_data WHERE crop_id=?", (crop_id,)
    ).fetchall()
    prices = [r[1] for r in rows]
    if len(prices) < 5:
        continue  # not enough data to judge outliers
    mean = statistics.mean(prices)
    stdev = statistics.pstdev(prices) or 1  # avoid div-by-zero
    for row_id, price in rows:
        z = (price - mean) / stdev
        if abs(z) > 3:
            cur.execute(
                "INSERT INTO price_outliers_review (price_data_id, crop_id, modal_price, z_score) "
                "VALUES (?, ?, ?, ?)",
                (row_id, crop_id, price, z),
            )
            flagged += 1
conn.commit()
print(f"Flagged {flagged} potential price outliers for manual review "
      f"(see price_outliers_review table) — not deleted automatically.")

# --- 2. Coverage report ---------------------------------------------------
print("\n=== DATA COVERAGE REPORT ===")

n_weather = cur.execute("SELECT COUNT(*) FROM weather_data").fetchone()[0]
n_soil = cur.execute("SELECT COUNT(*) FROM soil_data").fetchone()[0]
n_prices = cur.execute("SELECT COUNT(*) FROM price_data").fetchone()[0]
print(f"Weather records: {n_weather}")
print(f"Soil records:    {n_soil}")
print(f"Price records:   {n_prices}")

print("\nPrice records per crop per district (0 means no data found - check commodity name spelling):")
rows = cur.execute("""
    SELECT crops.crop_name, regions.district, COUNT(price_data.id) as cnt
    FROM crops
    CROSS JOIN (SELECT DISTINCT district FROM regions) regions
    LEFT JOIN price_data ON crops.crop_id = price_data.crop_id AND price_data.district = regions.district
    GROUP BY crops.crop_id, regions.district
    ORDER BY regions.district, cnt ASC
""").fetchall()
for crop_name, district, cnt in rows:
    flag = "  <-- NEEDS ATTENTION" if cnt == 0 else ""
    print(f"  [{district}] {crop_name:25s} {cnt:6d}{flag}")

print("\nWeather records per district/tehsil:")
rows = cur.execute("""
    SELECT regions.district, regions.tehsil, COUNT(weather_data.id) as cnt
    FROM regions
    LEFT JOIN weather_data ON regions.region_id = weather_data.region_id
    GROUP BY regions.region_id
    ORDER BY regions.district, cnt ASC
""").fetchall()
for district, tehsil, cnt in rows:
    flag = "  <-- NEEDS ATTENTION" if cnt == 0 else ""
    print(f"  [{district}] {tehsil:25s} {cnt:6d}{flag}")

conn.close()
print("\nDone. Review flagged outliers and any zero-coverage rows before "
      "moving on to the recommendation engine.")
