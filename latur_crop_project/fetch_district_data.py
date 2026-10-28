"""
Pulls district-level agronomic factors from ICRISAT's DLDD API (free, no key)
and stores them in the district_factors table:

  irrigation_fraction : this crop's IRRIGATED area / its total AREA in the
                        district (from 'cropwise-irrigated-area' + APY), or the
                        district-wide aggregate for crops ICRISAT doesn't track.
  crop_area_share     : this crop's share of the district's total cropped area
                        (from 'area-production-yield') - "what farmers here
                        historically actually grow" = the H factor.

These are DISTRICT-level facts and (per the approved design) are applied to
EVERY tehsil within the district, because irrigation infrastructure and
regional crop history are district/shared properties, not per-tehsil ones.

Run AFTER init_db.py, BEFORE score_crops.py:
    python fetch_district_data.py

Re-runs cleanly: the table is wiped and rebuilt each time.
"""
import sqlite3
import requests
from config import (DB_PATH, ICRISAT_BASE_URL, ICRISAT_DISTRICT_MAP,
                    ICRISAT_CROP_MAP)

APY_URL = "unapportioned/area-production-yield/"
IRR_URL = "unapportioned/cropwise-irrigated-area/"

# ICRISAT spells the rape/mustard item differently between the two datasets.
IRR_ITEM_OVERRIDE = {"RAPESEED AND MUSTARD": "RAPE AND MUSTARD"}


def _num(v):
    """Parse a raw string cell; '-1.0' means missing in ICRISAT feeds."""
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return None if f < 0 else f


def fetch_table(cur, url):
    """GET one ICRISAT table, return (headers, items, data) with data rows
    parsed into floats. Rows where the metadata region/state/district are
    missing are skipped."""
    r = requests.get(ICRISAT_BASE_URL + url, timeout=300)
    r.raise_for_status()
    payload = r.json()

    items = payload.get("items", [])
    hdrs = [h["header"] for h in payload.get("headers", [])]
    data = payload.get("data", [])

    # Keep only rows where index 11 (State) and 13 (Dist Name) are readable.
    parsed = []
    for row in data:
        if len(row) < 16:
            continue
        state = str(row[11]).strip() if row[11] is not None else ""
        if state.lower() == "maharashtra":
            parsed.append(row)
    print(f"  {url}: {len(data)} total rows -> {len(parsed)} Maharashtra rows")
    return hdrs, items, parsed


def col_index(hdrs, header):
    return hdrs.index(header) if header in hdrs else None


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("DELETE FROM district_factors")

    print("Fetching ICRISAT area-production-yield...")
    apy_hdrs, apy_items, apy_rows = fetch_table(cur, APY_URL)
    print("Fetching ICRISAT cropwise-irrigated-area...")
    irr_hdrs, irr_items, irr_rows = fetch_table(cur, IRR_URL)

    # Column indexes for the AREA and IRRIGATED AREA of a given item.
    apy_area_col = {}
    for item in apy_items:
        apy_area_col[item] = col_index(apy_hdrs, f"{item} AREA")
    irr_col = {}
    for item in irr_items:
        irr_col[item] = col_index(irr_hdrs, f"{item} IRRIGATED AREA")

    # --- Aggregate APY area by (district, item) across all years -----------
    # total_crop_area[district][item] = area summed over years; skip -1 cells.
    total_crop_area = {}
    district_years = {}   # district -> set of years with APY data
    for row in apy_rows:
        dist = str(row[13]).strip()
        year = str(row[1]).strip()
        district_years.setdefault(dist, set()).add(year)
        for item in apy_items:
            c = apy_area_col.get(item)
            if c is None:
                continue
            v = _num(row[c])
            if v is None:
                continue
            total_crop_area.setdefault(dist, {}).setdefault(item, 0.0)
            total_crop_area[dist][item] += v

    # --- Aggregate irrigated area by (district, item) across all years -----
    total_irr_area = {}
    irr_district_years = {}
    for row in irr_rows:
        dist = str(row[13]).strip()
        year = str(row[1]).strip()
        irr_district_years.setdefault(dist, set()).add(year)
        for item in irr_items:
            c = irr_col.get(item)
            if c is None:
                continue
            v = _num(row[c])
            if v is None:
                continue
            total_irr_area.setdefault(dist, {}).setdefault(item, 0.0)
            total_irr_area[dist][item] += v

    # --- Build the per-district rows ---------------------------------------
    matched_districts = []
    for our_district, icr_district in ICRISAT_DISTRICT_MAP.items():
        if icr_district not in total_crop_area and icr_district not in total_irr_area:
            print(f"  NOTE: ICRISAT has no data for {our_district} (looked for '{icr_district}')")
            continue
        matched_districts.append(our_district)

    print()
    for our_district in matched_districts:
        icr_district = ICRISAT_DISTRICT_MAP[our_district]
        print(f"== {our_district} (ICRISAT: {icr_district}) ==")

        crop_areas = total_crop_area.get(icr_district, {})
        crop_irrs = total_irr_area.get(icr_district, {})

        # District aggregate: sum(irrigated) / sum(area) over common items.
        sum_area = sum(crop_areas.get(i, 0.0) for i in apy_items)
        sum_irr = sum(crop_irrs.get(i, 0.0) for i in irr_items)
        if sum_area > 0:
            y_apy = sorted(district_years.get(icr_district, set()))
            y_irr = sorted(irr_district_years.get(icr_district, set()))
            src = f"{y_apy[0]}-{y_apy[-1]}" if y_apy else ""
            frac = round(sum_irr / sum_area, 4)
            cur.execute(
                "INSERT INTO district_factors (district, crop_name, "
                "irrigation_fraction, crop_area_share, source_years) "
                "VALUES (?, NULL, ?, NULL, ?)",
                (our_district, frac, f"agg irr {y_irr[0]}-{y_irr[-1]}, area {src}" if y_irr else src),
            )
            print(f"  aggregate irrigation fraction: {frac:.2%}  ({src})")

        # Per-crop rows for the crops we can map to an ICRISAT item.
        max_share_district = 0.0
        shares = {}
        if sum_area > 0:
            for item, area in sorted(crop_areas.items(), key=lambda kv: -kv[1]):
                share = area / sum_area
                shares[item] = share
                if share > max_share_district:
                    max_share_district = share

        inserted_crop = 0
        for our_crop, item in ICRISAT_CROP_MAP.items():
            area = crop_areas.get(item)
            irr = crop_irrs.get(item)
            if area and area > 0:
                frac = (irr / area) if (irr and irr > 0) else 0.0
            else:
                frac = None
            share = shares.get(item, 0.0)
            cur.execute(
                "INSERT INTO district_factors (district, crop_name, "
                "irrigation_fraction, crop_area_share, source_years) "
                "VALUES (?, ?, ?, ?, ?)",
                (our_district, our_crop, frac, round(share, 4), None),
            )
            inserted_crop += 1
        print(f"  {inserted_crop} mapped crops written "
              f"(top crop: {max(shares, key=shares.get) if shares else '-'} @ "
              f"{max(shares.values(), default=0.0):.1%})")

    conn.commit()
    conn.close()
    print("\ndistrict_factors populated.")


if __name__ == "__main__":
    main()