import sqlite3

conn = sqlite3.connect("latur_crops.db")
cur = conn.cursor()

print("\n===== DATABASE VERIFICATION =====")

# Overall
print("Regions:", cur.execute(
    "SELECT COUNT(*) FROM regions"
).fetchone()[0])

print("Districts:", cur.execute(
    "SELECT COUNT(DISTINCT district) FROM regions"
).fetchone()[0])

print("Suitability Scores:", cur.execute(
    "SELECT COUNT(*) FROM external_suitability_scores"
).fetchone()[0])

# Pune
print("\n===== PUNE =====")

print("Pune regions:", cur.execute(
    "SELECT COUNT(*) FROM regions WHERE district = 'Pune'"
).fetchone()[0])

# Baramati
print("\n===== BARAMATI =====")

baramati = cur.execute("""
    SELECT region_id, district, tehsil, latitude, longitude
    FROM regions
    WHERE district = 'Pune'
    AND tehsil = 'Baramati'
""").fetchall()

for row in baramati:
    print(row)

# Baramati scores
print("\nBaramati crop scores:", cur.execute("""
    SELECT COUNT(*)
    FROM external_suitability_scores e
    JOIN regions r ON e.region_id = r.region_id
    WHERE r.district = 'Pune'
    AND r.tehsil = 'Baramati'
""").fetchone()[0])

conn.close()