"""
Imports the state-wide 358-taluka / 36-district / 30-crop suitability
model (Maharashtra_Tehsil_Level_Crop_Suitability_Model.xlsx) into the
database.

What this does:
1. For Latur and Nagpur (where we already fetched REAL soil/weather data
   tehsil-by-tehsil from ISRIC/Open-Meteo), matches the imported tehsils to
   our EXISTING region rows by name (handling a couple of spelling
   differences), so we don't create duplicate regions for the same place.
2. For every other district, REPLACES the single-HQ-point placeholder we
   started with, with the full real taluka list from this dataset.
3. Imports that dataset's own precomputed suitability scores (a
   soil/rainfall/temperature/irrigation/historical-pattern/market-demand
   composite - see the dataset's own README/Sources sheet for methodology)
   into external_suitability_scores, used as a suitability fallback
   wherever we don't have our own real fetched soil/weather data.

BEFORE RUNNING:
    pip install pandas openpyxl

Run AFTER init_db.py:
    python import_state_model.py
"""
import sqlite3
import pandas as pd
from config import DB_PATH, EXTERNAL_CROP_NAME_MAP

XLSX_PATH = "Maharashtra_Tehsil_Level_Crop_Suitability_Model.xlsx"

# Name differences between our own hand-entered Latur/Nagpur tehsils and
# this dataset's spelling - maps (district, FILE's tehsil name) -> OUR name.
TEHSIL_NAME_FIXUPS = {
    ("Latur", "Ahmedpur"): "Ahmadpur",
    ("Nagpur", "Nagpur City"): "Nagpur (Urban)",
    ("Nagpur", "Nagpur Rural"): "Nagpur (Rural)",
    ("Nagpur", "Kamthi"): "Kamptee",
}

# Keep our existing tehsil rows (with real fetched soil/weather data) for
# these two districts, rather than replacing them with the imported set.
DISTRICTS_WITH_REAL_DATA = {"Latur", "Nagpur"}


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print("Reading Tehsil Master sheet...")
    tehsil_df = pd.read_excel(XLSX_PATH, sheet_name="Tehsil Master")

    region_id_map = {}  # (file_district, file_tehsil) -> region_id
    unmatched = []

    for _, row in tehsil_df.iterrows():
        district = row["District"]
        tehsil = row["Tehsil/Taluka"]
        confidence = row["Profile Confidence"]

        if district in DISTRICTS_WITH_REAL_DATA:
            our_tehsil = TEHSIL_NAME_FIXUPS.get((district, tehsil), tehsil)
            existing = cur.execute(
                "SELECT region_id FROM regions WHERE district=? AND tehsil=?",
                (district, our_tehsil),
            ).fetchone()
            if existing:
                region_id_map[(district, tehsil)] = existing[0]
                cur.execute(
                    "UPDATE regions SET profile_confidence=? WHERE region_id=?",
                    (confidence, existing[0]),
                )
            else:
                unmatched.append(f"{district}/{tehsil} (tried matching '{our_tehsil}')")
            continue

        # Every other district: insert as a new region (lat/long unknown -
        # not needed since we use this dataset's own suitability scores
        # instead of live weather/soil API calls for these tehsils).
        cur.execute(
            "INSERT OR IGNORE INTO regions (state, district, tehsil, latitude, longitude, profile_confidence) "
            "VALUES (?, ?, ?, NULL, NULL, ?)",
            ("Maharashtra", district, tehsil, confidence),
        )
        region_id = cur.execute(
            "SELECT region_id FROM regions WHERE district=? AND tehsil=?", (district, tehsil)
        ).fetchone()[0]
        region_id_map[(district, tehsil)] = region_id

    conn.commit()

    if unmatched:
        print(f"WARNING: {len(unmatched)} Latur/Nagpur tehsils couldn't be matched:")
        for u in unmatched:
            print(f"    {u}")

    # Remove the old single-HQ-point placeholder rows for districts that
    # just received their full taluka list - e.g. "Pune (HQ)" is redundant
    # once "Pune", "Haveli", "Baramati", etc. all exist as real entries.
    for district in tehsil_df["District"].unique():
        if district in DISTRICTS_WITH_REAL_DATA:
            continue
        cur.execute("DELETE FROM regions WHERE district=? AND tehsil LIKE '%(HQ)'", (district,))
    conn.commit()

    print(f"Regions ready: {len(region_id_map)} tehsils mapped/created.")

    print("Reading Scored Recommendations sheet (10,740 rows - may take a moment)...")
    scores_df = pd.read_excel(XLSX_PATH, sheet_name="Scored Recommendations")

    inserted = 0
    skipped_no_region = 0
    skipped_unknown_crop = 0
    unknown_crops_seen = set()

    for _, row in scores_df.iterrows():
        key = (row["District"], row["Tehsil/Taluka"])
        region_id = region_id_map.get(key)
        if region_id is None:
            skipped_no_region += 1
            continue

        our_crop_name = EXTERNAL_CROP_NAME_MAP.get(row["Crop"])
        if our_crop_name is None:
            skipped_unknown_crop += 1
            unknown_crops_seen.add(row["Crop"])
            continue

        cur.execute(
            """INSERT OR REPLACE INTO external_suitability_scores
               (region_id, crop_name, overall_score, rank_in_tehsil,
                soil_score, rainfall_score, temperature_score, irrigation_score, market_score)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (region_id, our_crop_name, row["Overall Score"], row["Rank in Tehsil"],
             row["Soil Score"], row["Rainfall Score"], row["Temperature Score"],
             row["Irrigation Score"], row["Market/Demand Score"]),
        )
        inserted += 1

    conn.commit()

    print(f"Inserted {inserted} suitability score rows.")
    if skipped_no_region:
        print(f"  Skipped {skipped_no_region} rows - no matching region found.")
    if skipped_unknown_crop:
        print(f"  Skipped {skipped_unknown_crop} rows - crop name not in EXTERNAL_CROP_NAME_MAP: "
              f"{sorted(unknown_crops_seen)}")

    n_regions = cur.execute("SELECT COUNT(*) FROM regions").fetchone()[0]
    n_districts = cur.execute("SELECT COUNT(DISTINCT district) FROM regions").fetchone()[0]
    n_scores = cur.execute("SELECT COUNT(*) FROM external_suitability_scores").fetchone()[0]
    print(f"\nFinal state: {n_regions} regions across {n_districts} districts, "
          f"{n_scores} external suitability scores loaded.")

    conn.close()


if __name__ == "__main__":
    main()
