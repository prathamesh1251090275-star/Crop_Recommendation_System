"""
Runs the full pipeline in the correct order, for all districts in config.py
(each fetch script skips regions/districts that already have data, so this
is also safe to re-run after adding a new district).
    python run_all.py

Or just one district:
    python run_all.py --district Nagpur
"""
import subprocess
import sys
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--district", help="Only run for this district (default: all)")
args = parser.parse_args()

district_args = ["--district", args.district] if args.district else []

STEPS = [
    ("init_db.py", "Creating database and seeding regions/crops", []),
    ("fetch_weather.py", "Fetching weather data (Open-Meteo)", district_args),
    ("fetch_soil.py", "Fetching soil data (SoilGrids)", district_args),
    ("fetch_prices.py", "Fetching price data (Agmarknet via data.gov.in)", district_args),
    ("clean_data.py", "Cleaning data and generating coverage report", []),
]

for script, description, extra_args in STEPS:
    print(f"\n{'='*60}\n{description}\n{'='*60}")
    result = subprocess.run([sys.executable, script] + extra_args)
    if result.returncode != 0:
        print(f"\nStopped: {script} failed. Fix the issue above before continuing.")
        sys.exit(1)

print("\nAll done. Check the coverage report above for any gaps.")
