"""Fold freshly fetched raw daily weather into the shipped aggregate tables.

fetch_weather.py writes only to weather_data. The shipped database stores
per-season aggregates (weather_year / weather_summary) so ~1.7M daily rows do
not have to travel in git, and score_crops prefers raw rows when present. This
keeps the two representations consistent after a targeted re-fetch: it derives
the same yearly averages and seasonal totals from the raw rows, stores them,
then clears the raw rows.

Usage: python compact_weather.py
"""
import sqlite3
from config import SEASON_MONTHS

con = sqlite3.connect("latur_crops.db")
cur = con.cursor()
cols = [r[1] for r in cur.execute("PRAGMA table_info(weather_data)")]

def find(*needles):
    for name in cols:
        low = name.lower()
        if all(n in low for n in needles):
            return name
    return None

date_c = find("date")
tmax_c = find("max")
tmin_c = find("min")
rain_c = find("precip") or find("rain")
et0_c = find("et0") or find("evapo")
missing = [label for label, col in
           (("date", date_c), ("rain", rain_c)) if col is None]
if missing:
    raise SystemExit("weather_data is missing required columns: %s" % missing)
print("using columns:", date_c, tmax_c, tmin_c, rain_c, et0_c)

regions = [r[0] for r in cur.execute("SELECT DISTINCT region_id FROM weather_data")]
print("regions with raw weather:", len(regions))
if not regions:
    raise SystemExit("nothing to compact")

def value(row, index):
    return row[index] if index is not None else None

for region_id in regions:
    select = ", ".join(c for c in (date_c, tmax_c, tmin_c, rain_c, et0_c) if c)
    order = [date_c, tmax_c, tmin_c, rain_c, et0_c]
    rows = cur.execute(
        "SELECT %s FROM weather_data WHERE region_id=? ORDER BY date" % select,
        (region_id,),
    ).fetchall()
    idx = {name: (order.index(name) if name in order else None) for name in order}

    by_year = {}
    for row in rows:
        date_str = row[idx[date_c]]
        by_year.setdefault(int(date_str[:4]), []).append((
            date_str,
            value(row, idx[tmax_c]),
            value(row, idx[tmin_c]),
            value(row, idx[rain_c]),
            value(row, idx[et0_c]),
        ))

    year_rows = []
    for year, day_rows in by_year.items():
        tmaxs = [r[1] for r in day_rows if r[1] is not None]
        tmins = [r[2] for r in day_rows if r[2] is not None]
        rain_total = sum(r[3] for r in day_rows if r[3] is not None)
        year_rows.append((
            region_id, year,
            sum(tmaxs) / len(tmaxs) if tmaxs else None,
            sum(tmins) / len(tmins) if tmins else None,
            rain_total, len(day_rows),
        ))
    cur.executemany(
        "INSERT OR REPLACE INTO weather_year "
        "(region_id, year, tmax_avg, tmin_avg, rain_mm, days) VALUES (?,?,?,?,?,?)",
        year_rows,
    )

    summary_rows = []
    for season, months in SEASON_MONTHS.items():
        for year, day_rows in by_year.items():
            rain_sum = 0.0
            et0_sum = 0.0
            longest = streak = 0
            for date_str, _tmax, _tmin, rain, et0 in day_rows:
                if int(date_str[5:7]) not in months:
                    streak = 0          # a dry run must not cross seasons
                    continue
                if rain is not None:
                    rain_sum += rain
                if et0 is not None:
                    et0_sum += et0
                if rain is not None and rain < 1.0:
                    streak += 1
                    longest = max(longest, streak)
                else:
                    streak = 0
            summary_rows.append((region_id, season, year, rain_sum, et0_sum, longest))
    cur.executemany(
        "INSERT OR REPLACE INTO weather_summary "
        "(region_id, season, year, rain_mm, et0_mm, dry_days) VALUES (?,?,?,?,?,?)",
        summary_rows,
    )
    print("  region %s: %d years, %d season rows" % (region_id, len(year_rows), len(summary_rows)))

cur.execute("DELETE FROM weather_data")
con.commit()
cur.execute("VACUUM")
con.close()
print("raw weather folded into aggregates and cleared")
