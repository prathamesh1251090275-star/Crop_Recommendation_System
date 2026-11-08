"""
Applies the stored soil + weather data against each crop's ideal ranges to
produce a suitability score, using the approved seven-factor formula:

    F = [0.25*R + 0.20*T + 0.25*So + 0.10*W + 0.10*G + 0.05*H + 0.05*M] * L

  R  = rainfall      = 0.60*season_fit + 0.25*distribution + 0.15*dry_spell
  T  = temperature   (growing-season fit)
  So = soil pH fit   (real soil_data ph where present, else external model)
  W  = irrigation,   district-level (ICRISAT crop irrigated-area fraction),
       applied to every tehsil in the district - so Latur's near-zero rice
       irrigation correctly kills rice everywhere in Latur.
  G  = growing-water adequacy = seasonal rainfall / seasonal ET0 against the
       crop's P/PET band (drought-hardy crops need a LOW ratio).
  H  = historical district crop-area share (ICRISAT APY) normalised within
       the district - "what farmers here actually grow" (soybean, not rice).
  M  = market        (real local market data present -> higher, else neutral)
  L  = land multiplier (neutral 1.0)

Keep the legacy columns (soil_score/rainfall_score/temp_score/overall_score)
populated so generate_frontend_data.py keeps working, and add the new factor
columns alongside.

Run AFTER fetch_weather.py, fetch_soil.py, fetch_prices.py, clean_data.py,
and fetch_district_data.py:
    python score_crops.py

Or filter to one district/tehsil:
    python score_crops.py --district Latur
"""
import sqlite3
import argparse
import datetime
import statistics
from config import (DB_PATH, SCORING_WEIGHTS, RAINFALL_SUB_WEIGHTS,
                    SEASON_MONTHS, CROP_IRRIGATION_NEED_MIN,
                    CROP_PPET_BAND, DEFAULT_PPET_BAND)


SUITABILITY_THRESHOLD = 60
# A crop scoring below this on the composite fit is genuinely a poor match
# for the region - showing it at all implies it's a real option when it isn't.

WEATHER_YEARS = None   # filled at runtime from the region's weather data


def score_range(value, ideal_min, ideal_max):
    """
    Returns 0-100 for how well a value fits a crop's ideal band.

    The inner 80% of the band scores 100 (a plateau - inside it the crop is
    genuinely comfortable). Outside that core the score falls linearly to 0 at
    the band edge plus half the band-width again.

    A hard step ("100 anywhere inside the band") made dozens of crops land on
    identical 0-100 sub-scores, which is why the composite collapsed onto a few
    repeated integers (1064 rows all scored exactly 75). A continuous decay
    keeps the ranking meaningful instead of quantising it.
    """
    if value is None or ideal_min is None or ideal_max is None:
        return None  # missing data - can't score, don't fake a number
    if ideal_max < ideal_min:
        ideal_min, ideal_max = ideal_max, ideal_min
    width = ideal_max - ideal_min
    if width <= 1e-9:
        return 100.0 if abs(value - ideal_min) <= 1e-9 else max(
            0.0, 100.0 - abs(value - ideal_min) * 10.0)
    core = width * 0.10                      # inner 80% is full marks
    inner_min, inner_max = ideal_min + core, ideal_max - core
    if inner_min <= value <= inner_max:
        return 100.0
    distance = (inner_min - value) if value < inner_min else (value - inner_max)
    tolerance = width * 0.5
    return max(0.0, 100.0 * (1.0 - distance / tolerance))


def parse_date(date_str):
    """
    Dates are stored as ISO YYYY-MM-DD so SQL ordering works. Older exports and
    raw Agmarknet payloads use DD/MM/YYYY, so both are accepted here.
    """
    if not date_str:
        return None
    for fmt in ("%Y-%m-%d", "%d/%m/%Y"):
        try:
            return datetime.datetime.strptime(date_str, fmt).date()
        except (ValueError, TypeError):
            continue
    return None


def get_market_info(cur, crop_id, district):
    """
    Returns (has_market_data, avg_price, trend_pct, record_count).
    trend_pct compares the most recent 90 days of prices against the
    90 days before that - positive means prices are rising.
    Honest about it: if there isn't enough real data, says so rather
    than faking a number.
    IMPORTANT: filtered by district - the same crop can have very different
    prices in different districts, and mixing them would be meaningless.
    """
    rows = cur.execute(
        "SELECT date, modal_price FROM price_data WHERE crop_id=? AND district=?",
        (crop_id, district),
    ).fetchall()
    if not rows:
        return False, None, None, 0

    parsed = [(parse_date(d), p) for d, p in rows]
    parsed = [(d, p) for d, p in parsed if d is not None]
    if not parsed:
        return False, None, None, 0

    avg_price = sum(p for _, p in parsed) / len(parsed)

    latest_date = max(d for d, _ in parsed)
    recent_cutoff = latest_date - datetime.timedelta(days=90)
    prior_cutoff = latest_date - datetime.timedelta(days=180)

    recent = [p for d, p in parsed if d > recent_cutoff]
    prior = [p for d, p in parsed if prior_cutoff < d <= recent_cutoff]

    trend_pct = None
    if recent and prior:
        recent_avg = sum(recent) / len(recent)
        prior_avg = sum(prior) / len(prior)
        if prior_avg > 0:
            trend_pct = ((recent_avg - prior_avg) / prior_avg) * 100

    return True, avg_price, trend_pct, len(parsed)


def estimate_profit_per_acre(has_market, avg_price, msp_price, yield_per_acre, input_cost):
    """
    Returns (net_profit, gross_revenue, price_used, price_source).
    Prefers real local market price; falls back to government MSP if no
    local data exists; returns None if neither is available.
    Net profit = (yield x price) - input cost.
    """
    if yield_per_acre is None:
        return None, None, None, None
    price_used, price_source = None, None
    if has_market and avg_price:
        price_used, price_source = avg_price, "local market avg"
    elif msp_price:
        price_used, price_source = msp_price, "Govt MSP (floor price)"
    else:
        return None, None, None, None

    gross_revenue = price_used * yield_per_acre
    net_profit = gross_revenue - (input_cost or 0)
    return round(net_profit), round(gross_revenue), price_used, price_source


def get_external_suitability(cur, region_id, crop_name):
    """
    Looks up the imported state-model suitability score for this
    region+crop, if any. Returns (score, rank) or (None, None).
    """
    row = cur.execute(
        "SELECT overall_score, rank_in_tehsil FROM external_suitability_scores "
        "WHERE region_id=? AND crop_name=?",
        (region_id, crop_name),
    ).fetchone()
    if row:
        return row[0], row[1]
    return None, None


def load_weather(cur, region_id):
    """
    Loads the region's daily weather into a list of (date, tmax, tmin, rain,
    humidity, sunshine, et0). Returns [] if the region has none.
    """
    return cur.execute(
        "SELECT date, temp_max, temp_min, rainfall_mm, humidity_mean, "
        "       sunshine_duration, et0 "
        "FROM weather_data WHERE region_id=? ORDER BY date",
        (region_id,),
    ).fetchall()


SEASON_BY_MONTHS = {frozenset(v): k for k, v in SEASON_MONTHS.items()}


def load_weather_summary(cur, region_id):
    """
    Rebuilds the weather_variables() structure from the precomputed
    weather_year / weather_summary aggregates.

    The shipped database stores per-season aggregates instead of ~1.7M raw
    daily rows. They are the same sums and averages those rows produced, so
    the derived scores are identical. Regions with raw daily weather still
    take the load_weather() path and ignore these tables.
    """
    years = cur.execute(
        "SELECT year, tmax_avg, tmin_avg, rain_mm FROM weather_year "
        "WHERE region_id=? ORDER BY year",
        (region_id,),
    ).fetchall()
    if not years:
        return None

    tm = [r[1] for r in years if r[1] is not None]
    tn = [r[2] for r in years if r[2] is not None]
    rains = [r[3] for r in years if r[3] is not None]

    season_map = {}
    for season, _year, rain_mm, et0_mm, dry in cur.execute(
        "SELECT season, year, rain_mm, et0_mm, dry_days FROM weather_summary "
        "WHERE region_id=? ORDER BY season, year",
        (region_id,),
    ):
        entry = season_map.setdefault(
            season, {"rain": [], "et0": [], "dry": []})
        if rain_mm and rain_mm > 0:
            entry["rain"].append(rain_mm)
        if et0_mm and et0_mm > 0:
            entry["et0"].append(et0_mm)
        entry["dry"].append(dry if dry is not None else 0)

    return {
        "tmax_avg": sum(tm) / len(tm) if tm else None,
        "tmin_avg": sum(tn) / len(tn) if tn else None,
        "annual_rain_avg": sum(rains) / len(rains) if rains else None,
        "annual_rain_by_year": {r[0]: r[3] for r in years},
        "rows_by_year": {r[0]: [] for r in years},
        "season_stats": season_map,
    }


def weather_variables(weather):
    """Returns (tmax_avg, tmin_avg, yearly_annual_rainfall, yearly_season,
    yearly_rain_season, yearly_ppet_season, longest_dry_spell_years, years).

    All rainfall aggregations are per-calendar-season using SEASON_MONTHS, and
    per-YEAR so a single freak year can't dominate the 15-yr average.
    """
    if not weather:
        return None

    year_rain = {}          # year -> annual rainfall mm
    year_max = {}           # year -> avg temp_max
    year_min = {}           # year -> avg temp_min
    rows_by_year = {}
    for date_str, tmax, tmin, rain, hum, sun, et0 in weather:
        year = int(date_str[:4])
        rows_by_year.setdefault(year, []).append(
            (date_str, tmax, tmin, rain, hum, sun, et0))

    tmax_avgs, tmin_avgs = [], []
    for year, rows in rows_by_year.items():
        tm = [r[1] for r in rows if r[1] is not None]
        tn = [r[2] for r in rows if r[2] is not None]
        if tm:
            tmax_avgs.append(sum(tm) / len(tm))
        if tn:
            tmin_avgs.append(sum(tn) / len(tn))
        year_rain[year] = sum(r[3] for r in rows if r[3] is not None)

    tmax_avg = sum(tmax_avgs) / len(tmax_avgs) if tmax_avgs else None
    tmin_avg = sum(tmin_avgs) / len(tmin_avgs) if tmin_avgs else None

    return {
        "tmax_avg": tmax_avg,
        "tmin_avg": tmin_avg,
        "annual_rain_avg": (sum(year_rain.values()) / len(year_rain)
                            if year_rain else None),
        "annual_rain_by_year": year_rain,
        "rows_by_year": rows_by_year,
    }


def season_stats(wv, months):
    """
    Per-year, within the given calendar months: seasonal rainfall total,
    seasonal ET0 total, and the longest consecutive dry spell (rain < 1 mm).
    Returns (season_rain_years, season_et0_years, dry_days_years).
    """
    season_rain_years, season_et0_years, dry_years = [], [], []
    for year, rows in wv["rows_by_year"].items():
        rain_sum = 0.0
        et0_sum = 0.0
        longest = 0
        streak = 0
        for date_str, tmax, tmin, rain, hum, sun, et0 in rows:
            if int(date_str[5:7]) not in months:
                # Reset the streak outside the season: a dry run must not
                # resume across the months the season skips over.
                streak = 0
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
        if rain_sum > 0:
            season_rain_years.append(rain_sum)
        if et0_sum > 0:
            season_et0_years.append(et0_sum)
        dry_years.append(longest)
    return season_rain_years, season_et0_years, dry_years


def weighted_avg(values, weights):
    vals = [v for v, w in zip(values, weights) if v is not None and w is not None]
    wts = [w for v, w in zip(values, weights) if v is not None and w is not None]
    if not vals:
        return None
    return sum(v * w for v, w in zip(vals, wts)) / sum(wts)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--district", help="Score only this district (default: all)")
    parser.add_argument("--tehsil", help="Score only this tehsil (default: all)")
    args = parser.parse_args()

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS crop_suitability_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        region_id INTEGER,
        crop_id INTEGER,
        soil_score REAL,
        rainfall_score REAL,
        temp_score REAL,
        water_score REAL,
        growing_score REAL,
        history_score REAL,
        market_factor REAL,
        land_multiplier REAL,
        overall_score REAL,
        has_market_data INTEGER,
        avg_market_price REAL,
        price_trend_pct REAL
    )
    """)
    # Migration: add new factor columns if table existed without them.
    s_cols = [r[1] for r in cur.execute("PRAGMA table_info(crop_suitability_scores)").fetchall()]
    for col in ("water_score", "growing_score", "history_score",
                "market_factor", "land_multiplier"):
        if col not in s_cols:
            cur.execute(f"ALTER TABLE crop_suitability_scores ADD COLUMN {col} REAL")
    cur.execute("DELETE FROM crop_suitability_scores")  # recompute fresh each run

    filters = []
    params = []
    if args.district:
        filters.append("district = ?")
        params.append(args.district)
    if args.tehsil:
        filters.append("tehsil = ?")
        params.append(args.tehsil)
    where_clause = ("WHERE " + " AND ".join(filters)) if filters else ""
    regions = cur.execute(
        f"SELECT region_id, district, tehsil FROM regions {where_clause}", params
    ).fetchall()

    crops = cur.execute(
        "SELECT crop_id, crop_name, ideal_ph_min, ideal_ph_max, "
        "ideal_rainfall_min, ideal_rainfall_max, ideal_temp_min, ideal_temp_max, "
        "crop_type, months_to_harvest, typical_yield_quintals_per_acre, msp_price, "
        "input_cost_per_acre, season FROM crops"
    ).fetchall()
    season_of_crop = {c[0]: c[13] for c in crops}

    # District-level factors (ICRISAT). Loaded once; shared across tehsils.
    district_factors = {}
    for district, crop_name, irr, share, src_years in cur.execute(
        "SELECT district, crop_name, irrigation_fraction, crop_area_share, "
        "source_years FROM district_factors"
    ).fetchall():
        district_factors.setdefault(district, {})[crop_name] = (irr, share, src_years)

    market_info_cache = {}

    def get_cached_market_info(crop_id, district):
        key = (crop_id, district)
        if key not in market_info_cache:
            market_info_cache[key] = get_market_info(cur, crop_id, district)
        return market_info_cache[key]

    for region_id, district, tehsil in regions:
        # --- Real fetched data (this region's own 15-yr weather + soil) ----
        soil_row = cur.execute(
            "SELECT ph FROM soil_data WHERE region_id=? ORDER BY recorded_date DESC LIMIT 1",
            (region_id,),
        ).fetchone()
        soil_ph = soil_row[0] if soil_row else None

        weather = load_weather(cur, region_id)
        if weather:
            wv = weather_variables(weather)
        else:
            wv = load_weather_summary(cur, region_id)

        season_stats_cache = {}
        def get_cached_season_stats(months):
            m_key = tuple(sorted(months))
            if m_key not in season_stats_cache:
                pre = None
                if wv and "season_stats" in wv:
                    name = SEASON_BY_MONTHS.get(frozenset(months))
                    pre = wv["season_stats"].get(name) if name else None
                if pre is not None:
                    season_stats_cache[m_key] = (
                        list(pre["rain"]), list(pre["et0"]), list(pre["dry"]))
                else:
                    season_stats_cache[m_key] = season_stats(wv, months)
            return season_stats_cache[m_key]

        district_row = district_factors.get(district, {})
        agg = district_row.get(None, (None, None, None))
        agg_irr = agg[0]

        print(f"\n=== {district} / {tehsil} ===  (soil pH={soil_ph}, "
              f"weather_years={len(wv['rows_by_year']) if wv else 0}, "
              f"annual_rain={wv['annual_rain_avg'] if wv else None}, "
              f"district_irr={agg_irr})")

        results = []
        for (crop_id, name, ph_min, ph_max, rain_min, rain_max,
             temp_min, temp_max, crop_type, months_to_harvest,
             yield_per_acre, msp_price, input_cost, _season) in crops:

            # -------- So: soil pH ----------
            soil_score = score_range(soil_ph, ph_min, ph_max)

            # -------- R: rainfall (seasonal, across years) ----------
            season_months = SEASON_MONTHS.get(season_of_crop.get(crop_id), set(range(1, 13)))
            rainfall_score = None
            if wv:
                season_rain_years, season_et0_years, dry_years = get_cached_season_stats(season_months)
                if season_rain_years:
                    avg_season_rain = sum(season_rain_years) / len(season_rain_years)
                    r_season = score_range(avg_season_rain, rain_min, rain_max)

                    # Distribution: coefficient of variation of the seasonal totals
                    # across years (low variability = reliable rain).
                    if len(season_rain_years) >= 2 and avg_season_rain > 0:
                        cv = statistics.stdev(season_rain_years) / avg_season_rain
                        r_dist = max(0.0, 100.0 - cv * 100.0)  # cv 1.0 -> 0
                    else:
                        r_dist = 50.0

                    # Dry spell: avg longest dry streak across years, capped.
                    if dry_years:
                        avg_dry = sum(dry_years) / len(dry_years)
                        r_dry = max(0.0, 100.0 - avg_dry * 5.0)  # 20d dry -> 0
                    else:
                        r_dry = 50.0

                    comps = [r_season, r_dist, r_dry]
                    wts = [RAINFALL_SUB_WEIGHTS["season"],
                           RAINFALL_SUB_WEIGHTS["distribution"],
                           RAINFALL_SUB_WEIGHTS["dry_spell"]]
                    rainfall_score = weighted_avg(comps, wts)

            # -------- T: temperature (growing season) ----------
            temp_score = None
            if wv and wv["tmax_avg"] is not None and wv["tmin_avg"] is not None:
                avg_temp = (wv["tmax_avg"] + wv["tmin_avg"]) / 2
                temp_score = score_range(avg_temp, temp_min, temp_max)

            # -------- G: growing-water adequacy (P/PET) ----------
            growing_score = None
            if wv:
                season_rain_years, season_et0_years, _ = get_cached_season_stats(season_months)
                if season_rain_years and season_et0_years:
                    pet = sum(season_et0_years) / len(season_et0_years)
                    rain = sum(season_rain_years) / len(season_rain_years)
                    if pet > 0:
                        ppet = rain / pet
                        ppet_min, _ = CROP_PPET_BAND.get(name, DEFAULT_PPET_BAND)
                        if ppet >= ppet_min:
                            growing_score = 100.0
                        else:
                            # Below the crop's moisture minimum -> linear decay.
                            growing_score = max(0.0, 100.0 * (ppet / ppet_min))

            # -------- W: district irrigation (per crop where known) ----------
            crop_df = district_row.get(name, (None, None, None))
            crop_irr = crop_df[0] if crop_df[0] is not None else agg_irr
            water_score = None
            if crop_irr is not None:
                need_min = CROP_IRRIGATION_NEED_MIN.get(name, 25)
                need_max = need_min + 60   # plenty of headroom past the need
                water_score = score_range(crop_irr * 100, need_min, need_max)

            # -------- H: historical district crop-area share ----------
            share = crop_df[1] if crop_df[1] is not None else None
            history_score = None
            if share is not None:
                # Normalise against the district's biggest crop share so the
                # district's #1 crop scores ~100 and rare crops score ~0.
                max_share = max((d[1] for d in district_row.values() if d[1] is not None),
                                default=None)
                history_score = round(100.0 * share / max_share, 1) if max_share else 50.0

            # -------- M: market factor ----------
            has_market, avg_price, trend_pct, n_records = get_cached_market_info(crop_id, district)
            if has_market:
                # Recent modal-price trend, clamped to +/-20 points around
                # neutral. A flat "100 when any data exists" just rewarded
                # being in a district with a price feed.
                market_score = 60.0 + max(-20.0, min(20.0, (trend_pct or 0.0) * 0.5))
            else:
                # No price records anywhere in this district: exclude the
                # factor instead of injecting a constant 60 into every crop,
                # which only shifted scores without ranking anything.
                market_score = None

            # -------- L: land multiplier (currently neutral) ----------
            land_mult = 1.0

            # -------- Combine: F = [wR + wT + wSo + wW + wG + wH + wM] * L ---
            components = {
                "R": rainfall_score, "T": temp_score, "So": soil_score,
                "W": water_score, "G": growing_score, "H": history_score,
                "M": market_score,
            }
            num_numerator = 0.0
            denom = 0.0
            factor_strs = []
            for key, score in components.items():
                if score is None:
                    factor_strs.append(f"{key}=None")
                    continue
                w = SCORING_WEIGHTS[key]
                num_numerator += w * score
                denom += w
                factor_strs.append(f"{key}={score:.0f}")
            local_overall = None
            # Only treat a tehsil as "locally verified" when we actually have
            # real weather (R and T). Without it, W+H+M alone would inflate
            # scores for tehsils that only carry district-level data.
            if denom > 0 and rainfall_score is not None and temp_score is not None:
                local_overall = (num_numerator / denom) * land_mult

            # Find crop season for the print/detail string
            season_name = season_of_crop.get(crop_id, "?")

            # Prefer our own real fetched data when we have it; otherwise fall
            # back to the imported state-model's precomputed suitability score.
            if local_overall is not None:
                overall = local_overall
                suitability_source = "locally verified (real 15-yr weather + district data)"
            else:
                external_overall, _ = get_external_suitability(cur, region_id, name)
                overall = external_overall
                suitability_source = "regional model estimate" if overall is not None else None

            # Provenance: how many of the 7 factors actually contributed, and
            # whether the number came from this pipeline or the imported model.
            factors_present = sum(1 for v in components.values() if v is not None)
            confidence = round(100.0 * factors_present / len(components), 1)
            score_source = ("local" if local_overall is not None
                            else ("external" if overall is not None else "none"))

            cur.execute(
                """INSERT INTO crop_suitability_scores
                   (region_id, crop_id, soil_score, rainfall_score, temp_score,
                    water_score, growing_score, history_score, market_factor,
                    land_multiplier, overall_score, score_source, confidence,
                    has_market_data, avg_market_price, price_trend_pct)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (region_id, crop_id, soil_score, rainfall_score, temp_score,
                 water_score, growing_score, history_score, market_score,
                 land_mult, overall, score_source, confidence, int(has_market),
                 avg_price, trend_pct),
            )
            if overall is not None:
                results.append((name, overall, has_market, avg_price,
                                trend_pct, n_records, crop_type, months_to_harvest,
                                *estimate_profit_per_acre(has_market, avg_price,
                                                          msp_price, yield_per_acre, input_cost),
                                suitability_source, factor_strs, season_name))

        def rank_key(r):
            profit = r[8]
            overall = r[1]
            return (profit is not None, profit if profit is not None else 0, overall)

        beneficial = [r for r in results if r[1] >= SUITABILITY_THRESHOLD]
        seasonal = sorted([r for r in beneficial if r[6] == "Seasonal"],
                          key=rank_key, reverse=True)
        long_term = sorted([r for r in beneficial if r[6] != "Seasonal"],
                           key=rank_key, reverse=True)

        def print_group(title, group, limit):
            print(f"  --- {title} ---")
            if not group:
                print(f"    No crops scored {SUITABILITY_THRESHOLD}+ suitability in this category.")
                return
            for r in group[:limit]:
                (name, overall, has_market, avg_price, trend_pct, n_records,
                 crop_type, months, net_profit, gross_revenue, price_used,
                 price_source, suitability_source, factor_strs, season_name) = r
                if has_market:
                    trend_str = (f"{trend_pct:+.1f}% vs prev quarter" if trend_pct is not None
                                 else "trend: not enough history yet")
                    market_str = f"Rs.{avg_price:.0f}/quintal ({trend_str}, {n_records} records)"
                else:
                    market_str = f"NO MARKET DATA available for {district} - suitability only"
                harvest_str = f"~{months}mo to first harvest" if months else ""
                cost_str = f"Rs.{input_cost:,.0f}/acre" if input_cost is not None else "N/A"
                if net_profit is not None:
                    profit_str = f"~Rs.{net_profit:,}/acre net (revenue Rs.{gross_revenue:,}, {price_source})"
                else:
                    profit_str = "insufficient data"
                print(f"    {name:25s} suit={overall:5.1f} [{suitability_source}]  "
                      f"[{crop_type}, {harvest_str}]  cost={cost_str}")
                print(f"      {'':25s} factors: {' | '.join(factor_strs)}")
                print(f"      {'':25s} {market_str}  |  Est. net profit: {profit_str}")

        print_group(f"Seasonal crops (suitability >= {SUITABILITY_THRESHOLD}, ranked by net profit)",
                    seasonal, len(seasonal))
        print_group(f"Long-term crops (suitability >= {SUITABILITY_THRESHOLD}, ranked by net profit)",
                    long_term, len(long_term))

        conn.commit()

    conn.close()
    print("\nScores saved to crop_suitability_scores table.")


if __name__ == "__main__":
    main()