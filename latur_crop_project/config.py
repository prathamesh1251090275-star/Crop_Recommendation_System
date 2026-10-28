"""
Config for the Maharashtra Crop Recommendation project.
Edit this file first — it's the single source of truth for which
district(s), region(s), and crops the whole pipeline works with.
"""

# --- Districts & regions ---------------------------------------------------
# Each district has its own tehsils with real coordinates. Adding a new
# district later = adding one more entry to this list; nothing else in
# this file needs to change (the fetch/scoring scripts read from here).
DISTRICTS = [
    {
        "name": "Latur",
        "state": "Maharashtra",
        "tehsils": [
            {"name": "Ahmadpur",       "latitude": 18.7167, "longitude": 76.6000},
            {"name": "Ausa",           "latitude": 18.2500, "longitude": 76.5000},
            {"name": "Chakur",         "latitude": 18.5333, "longitude": 76.8000},
            {"name": "Deoni",          "latitude": 18.5833, "longitude": 77.0833},
            {"name": "Jalkot",         "latitude": 18.6500, "longitude": 76.9333},
            {"name": "Latur",          "latitude": 18.4088, "longitude": 76.5604},
            {"name": "Nilanga",        "latitude": 18.1167, "longitude": 76.7500},
            {"name": "Renapur",        "latitude": 18.5167, "longitude": 76.4167},
            {"name": "Shirur Anantpal","latitude": 18.2333, "longitude": 76.9333},
            {"name": "Udgir",          "latitude": 18.3931, "longitude": 77.1122},
        ],
    },
    {
        "name": "Nagpur",
        "state": "Maharashtra",
        # Vidarbha region - hot sub-humid climate, shallow-to-deep black soil.
        # Known for Cotton, Soybean, Tur, Jowar, and famously "Nagpur Orange".
        "tehsils": [
            {"name": "Nagpur (Urban)", "latitude": 21.1458, "longitude": 79.0882},
            {"name": "Nagpur (Rural)", "latitude": 21.1000, "longitude": 79.0500},
            {"name": "Hingna",         "latitude": 21.0667, "longitude": 78.9333},
            {"name": "Kamptee",        "latitude": 21.2225, "longitude": 79.1943},
            {"name": "Katol",          "latitude": 21.2667, "longitude": 78.5833},
            {"name": "Narkhed",        "latitude": 21.4352, "longitude": 79.1235},
            {"name": "Savner",         "latitude": 21.3833, "longitude": 78.9167},
            {"name": "Kalmeshwar",     "latitude": 21.2273, "longitude": 78.9298},
            {"name": "Ramtek",         "latitude": 21.3963, "longitude": 79.3319},
            {"name": "Mouda",          "latitude": 21.3833, "longitude": 79.3667},
            {"name": "Parseoni",       "latitude": 21.4667, "longitude": 79.2667},
            {"name": "Umred",         "latitude": 20.8492, "longitude": 79.3286},
            {"name": "Kuhi",           "latitude": 20.9833, "longitude": 79.4667},
            {"name": "Bhiwapur",       "latitude": 20.6167, "longitude": 79.5667},
        ],
    },
    # --- Remaining 32 agricultural districts of Maharashtra --------------
    # These use ONE representative point (district headquarters) each for
    # now, rather than the full taluka-by-taluka detail Latur and Nagpur
    # have - a reasonable starting granularity for district-level
    # recommendations. Any of these can be expanded to full taluka lists
    # later the same way Latur/Nagpur were, if more local precision is
    # wanted for a specific district.
    # Mumbai City and Mumbai Suburban are intentionally excluded - they are
    # fully urban districts with no meaningful farmland to recommend crops for.
    {"name": "Pune", "state": "Maharashtra",
     "tehsils": [{"name": "Pune (HQ)", "latitude": 18.5204, "longitude": 73.8567}]},
    {"name": "Satara", "state": "Maharashtra",
     "tehsils": [{"name": "Satara (HQ)", "latitude": 17.6805, "longitude": 74.0183}]},
    {"name": "Sangli", "state": "Maharashtra",
     # Known for Turmeric ("Turmeric City") and Grapes alongside Jowar/Sugarcane.
     "tehsils": [{"name": "Sangli (HQ)", "latitude": 16.8524, "longitude": 74.5815}]},
    {"name": "Solapur", "state": "Maharashtra",
     "tehsils": [{"name": "Solapur (HQ)", "latitude": 17.6599, "longitude": 75.9064}]},
    {"name": "Kolhapur", "state": "Maharashtra",
     "tehsils": [{"name": "Kolhapur (HQ)", "latitude": 16.6912, "longitude": 74.2450}]},
    {"name": "Akola", "state": "Maharashtra",
     "tehsils": [{"name": "Akola (HQ)", "latitude": 20.7096, "longitude": 77.0082}]},
    {"name": "Amravati", "state": "Maharashtra",
     "tehsils": [{"name": "Amravati (HQ)", "latitude": 20.9374, "longitude": 77.7796}]},
    {"name": "Buldhana", "state": "Maharashtra",
     "tehsils": [{"name": "Buldhana (HQ)", "latitude": 20.5293, "longitude": 76.1809}]},
    {"name": "Yavatmal", "state": "Maharashtra",
     "tehsils": [{"name": "Yavatmal (HQ)", "latitude": 20.3888, "longitude": 78.1204}]},
    {"name": "Washim", "state": "Maharashtra",
     "tehsils": [{"name": "Washim (HQ)", "latitude": 20.1097, "longitude": 77.1333}]},
    {"name": "Chhatrapati Sambhajinagar", "state": "Maharashtra",
     # Renamed from Aurangabad (official rename, matches current usage)
     "tehsils": [{"name": "Chh. Sambhajinagar (HQ)", "latitude": 19.8762, "longitude": 75.3433}]},
    {"name": "Beed", "state": "Maharashtra",
     "tehsils": [{"name": "Beed (HQ)", "latitude": 18.9894, "longitude": 75.7601}]},
    {"name": "Jalna", "state": "Maharashtra",
     "tehsils": [{"name": "Jalna (HQ)", "latitude": 19.8410, "longitude": 75.8864}]},
    {"name": "Dharashiv", "state": "Maharashtra",
     # Renamed from Osmanabad (official rename, matches current usage)
     "tehsils": [{"name": "Dharashiv (HQ)", "latitude": 18.1856, "longitude": 76.0367}]},
    {"name": "Nanded", "state": "Maharashtra",
     "tehsils": [{"name": "Nanded (HQ)", "latitude": 19.1383, "longitude": 77.3210}]},
    {"name": "Parbhani", "state": "Maharashtra",
     "tehsils": [{"name": "Parbhani (HQ)", "latitude": 19.2704, "longitude": 76.7601}]},
    {"name": "Hingoli", "state": "Maharashtra",
     "tehsils": [{"name": "Hingoli (HQ)", "latitude": 19.7147, "longitude": 77.1445}]},
    {"name": "Bhandara", "state": "Maharashtra",
     "tehsils": [{"name": "Bhandara (HQ)", "latitude": 21.1667, "longitude": 79.6500}]},
    {"name": "Chandrapur", "state": "Maharashtra",
     "tehsils": [{"name": "Chandrapur (HQ)", "latitude": 19.9615, "longitude": 79.2961}]},
    {"name": "Gadchiroli", "state": "Maharashtra",
     "tehsils": [{"name": "Gadchiroli (HQ)", "latitude": 20.1809, "longitude": 80.0021}]},
    {"name": "Gondia", "state": "Maharashtra",
     "tehsils": [{"name": "Gondia (HQ)", "latitude": 21.4602, "longitude": 80.1922}]},
    {"name": "Wardha", "state": "Maharashtra",
     "tehsils": [{"name": "Wardha (HQ)", "latitude": 20.7453, "longitude": 78.6022}]},
    {"name": "Ahilyanagar", "state": "Maharashtra",
     # Renamed from Ahmednagar (official rename, matches current usage)
     "tehsils": [{"name": "Ahilyanagar (HQ)", "latitude": 19.0948, "longitude": 74.7480}]},
    {"name": "Dhule", "state": "Maharashtra",
     "tehsils": [{"name": "Dhule (HQ)", "latitude": 20.9042, "longitude": 74.7749}]},
    {"name": "Jalgaon", "state": "Maharashtra",
     # India's "Banana City" - Jalgaon alone grows a huge share of India's banana.
     "tehsils": [{"name": "Jalgaon (HQ)", "latitude": 21.0077, "longitude": 75.5626}]},
    {"name": "Nandurbar", "state": "Maharashtra",
     "tehsils": [{"name": "Nandurbar (HQ)", "latitude": 21.3661, "longitude": 74.2432}]},
    {"name": "Nashik", "state": "Maharashtra",
     # India's "Grape Capital" / wine capital - Grapes are the signature crop here.
     "tehsils": [{"name": "Nashik (HQ)", "latitude": 19.9975, "longitude": 73.7898}]},
    {"name": "Thane", "state": "Maharashtra",
     "tehsils": [{"name": "Thane (HQ)", "latitude": 19.2183, "longitude": 72.9781}]},
    {"name": "Palghar", "state": "Maharashtra",
     "tehsils": [{"name": "Palghar (HQ)", "latitude": 19.6970, "longitude": 72.7712}]},
    {"name": "Raigad", "state": "Maharashtra",
     "tehsils": [{"name": "Alibag (HQ)", "latitude": 18.6414, "longitude": 72.8722}]},
    {"name": "Ratnagiri", "state": "Maharashtra",
     # Konkan coast - Cashew, Coconut, and Alphonso Mango country.
     "tehsils": [{"name": "Ratnagiri (HQ)", "latitude": 16.9902, "longitude": 73.3120}]},
    {"name": "Sindhudurg", "state": "Maharashtra",
     # Konkan coast - Cashew, Coconut, and Alphonso Mango country.
     "tehsils": [{"name": "Sindhudurgnagari (HQ)", "latitude": 16.1667, "longitude": 73.6833}]},
]

# --- Crop list --------------------------------------------------------
# Ideal ranges sourced from ICAR/state agri-dept crop guides — treat these
# as a starting point and refine with local agronomist input where possible.
# This same crop list is used for EVERY district - a crop's own ideal ranges
# don't change by location, only whether a given district's soil/climate
# falls inside those ranges (which the scoring engine checks per-region).
# rainfall in mm (seasonal total), temp in Celsius.
#
# crop_type: "Seasonal" = harvested within the same season/year, farmer can
#            switch crops next season based on new conditions.
#            "Semi-Perennial" = 1-2 year cycle before harvest/ongoing yield.
#            "Perennial" = multi-year investment before first harvest, then
#            productive for many years - a fundamentally different decision
#            than an annual crop, not a "next season" choice.
# months_to_harvest: approximate months until FIRST harvest.
# typical_yield_quintals_per_acre: rough typical yield under average Indian
#            farming conditions - varies a lot by variety, irrigation, and
#            practices, so treat as a ballpark for income estimation, not
#            a guarantee.
# msp_price: Government Minimum Support Price (Rs/quintal) where one exists
#            for this crop (2025-26/2026-27 season figures) - used as an
#            income-estimate fallback ONLY when no real local market price
#            is available. None if the crop has no MSP (most fruits/veg).
# input_cost_per_acre: rough total cost of cultivation per acre for ONE
#            harvest cycle (seed/sapling, fertilizer, pesticide, labour,
#            irrigation) - for perennials this is the ANNUAL maintenance
#            cost during a producing year, not the multi-year establishment
#            cost before first harvest. Sourced from general Indian cost-of-
#            cultivation ranges (cereals/pulses lowest, vegetables highest,
#            cash crops like cotton and sugarcane in between). Real costs
#            vary a lot by irrigation access and local labour rates -
#            treat this as a ballpark for comparing crops, not a budget.
CROPS = [
    {"name": "Soybean",    "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1000, "temp_min": 20, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 9, "msp_price": 5708, "input_cost_per_acre": 15000},
    {"name": "Jowar (Sorghum)", "season": "Kharif", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 400,  "rainfall_max": 750,  "temp_min": 25, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 8, "msp_price": 3421, "input_cost_per_acre": 12000},
    {"name": "Tur (Pigeonpea)", "season": "Kharif", "ph_min": 5.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1000, "temp_min": 20, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 6,
     "typical_yield_quintals_per_acre": 5.5, "msp_price": 8450, "input_cost_per_acre": 14000},
    {"name": "Udid (Black Gram)", "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 900,  "temp_min": 25, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 4.5, "msp_price": 8200, "input_cost_per_acre": 12000},
    {"name": "Mung (Green Gram)", "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 400,  "rainfall_max": 700,  "temp_min": 25, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 4, "msp_price": 8780, "input_cost_per_acre": 11000},
    {"name": "Cotton",     "season": "Kharif", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 500,  "rainfall_max": 1000, "temp_min": 21, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 6,
     "typical_yield_quintals_per_acre": 7, "msp_price": 8267, "input_cost_per_acre": 28000},
    {"name": "Wheat",      "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 300,  "rainfall_max": 600,  "temp_min": 10, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 5,
     "typical_yield_quintals_per_acre": 15, "msp_price": 2425, "input_cost_per_acre": 18000},
    {"name": "Gram (Chana)", "season": "Rabi", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 250,  "rainfall_max": 500,  "temp_min": 10, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 7, "msp_price": 5650, "input_cost_per_acre": 13000},
    {"name": "Safflower",  "season": "Rabi",   "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 250,  "rainfall_max": 500,  "temp_min": 15, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 5,
     "typical_yield_quintals_per_acre": 4.5, "msp_price": 5940, "input_cost_per_acre": 12000},
    {"name": "Sunflower",  "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 400,  "rainfall_max": 700,  "temp_min": 18, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 5.5, "msp_price": 8343, "input_cost_per_acre": 14000},
    {"name": "Sugarcane",  "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 1000, "rainfall_max": 1500, "temp_min": 20, "temp_max": 35,
     "crop_type": "Semi-Perennial", "months_to_harvest": 14,
     "typical_yield_quintals_per_acre": 350, "msp_price": None, "input_cost_per_acre": 65000},
    {"name": "Pomegranate","season": "Annual", "ph_min": 6.5, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 800,  "temp_min": 15, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 30,
     "typical_yield_quintals_per_acre": 50, "msp_price": None, "input_cost_per_acre": 45000},
    {"name": "Mango",      "season": "Annual", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 750,  "rainfall_max": 2500, "temp_min": 24, "temp_max": 30,
     "crop_type": "Perennial", "months_to_harvest": 48,
     "typical_yield_quintals_per_acre": 40, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Sapota",     "season": "Annual", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 750,  "rainfall_max": 2500, "temp_min": 20, "temp_max": 33,
     "crop_type": "Perennial", "months_to_harvest": 48,
     "typical_yield_quintals_per_acre": 70, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Brinjal",    "season": "Kharif", "ph_min": 5.5, "ph_max": 6.5,
     "rainfall_min": 600,  "rainfall_max": 1000, "temp_min": 21, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 90, "msp_price": None, "input_cost_per_acre": 35000},
    {"name": "Tomato",     "season": "Kharif", "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 600,  "rainfall_max": 1250, "temp_min": 18, "temp_max": 27,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 175, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Onion",      "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 350,  "rainfall_max": 600,  "temp_min": 13, "temp_max": 28,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 90, "msp_price": None, "input_cost_per_acre": 38000},
    {"name": "Papaya",     "season": "Annual", "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 1000, "rainfall_max": 1500, "temp_min": 22, "temp_max": 32,
     "crop_type": "Semi-Perennial", "months_to_harvest": 11,
     "typical_yield_quintals_per_acre": 300, "msp_price": None, "input_cost_per_acre": 42000},
    {"name": "Coriander",  "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 250,  "rainfall_max": 450,  "temp_min": 10, "temp_max": 27,
     "crop_type": "Seasonal", "months_to_harvest": 2,
     "typical_yield_quintals_per_acre": 4.5, "msp_price": None, "input_cost_per_acre": 9000},
    {"name": "Tamarind",   "season": "Annual", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 500,  "rainfall_max": 1500, "temp_min": 20, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 84,
     "typical_yield_quintals_per_acre": 18, "msp_price": None, "input_cost_per_acre": 15000},
    {"name": "Orange",     "season": "Annual", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1200, "temp_min": 13, "temp_max": 37,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 80, "msp_price": None, "input_cost_per_acre": 35000},
    {"name": "Rice (Paddy)", "season": "Kharif", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 900,  "rainfall_max": 1600, "temp_min": 20, "temp_max": 37,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 20, "msp_price": 2369, "input_cost_per_acre": 22000},
    {"name": "Groundnut",  "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 1000, "temp_min": 20, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 7, "msp_price": 7263, "input_cost_per_acre": 19000},
    {"name": "Linseed (Alsi)", "season": "Rabi", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 350,  "rainfall_max": 600,  "temp_min": 10, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 3, "msp_price": None, "input_cost_per_acre": 10000},
    {"name": "Grapes",     "season": "Annual", "ph_min": 6.5, "ph_max": 8.5,
     # Grapes actually prefer a DRY climate with controlled irrigation -
     # excess rainfall promotes fungal disease. Nashik's semi-arid climate
     # plus canal/well irrigation is exactly why it became India's grape hub.
     "rainfall_min": 400,  "rainfall_max": 700,  "temp_min": 15, "temp_max": 40,
     "crop_type": "Perennial", "months_to_harvest": 24,
     "typical_yield_quintals_per_acre": 100, "msp_price": None, "input_cost_per_acre": 80000},
    {"name": "Banana",     "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 2500, "temp_min": 15, "temp_max": 35,
     "crop_type": "Semi-Perennial", "months_to_harvest": 12,
     "typical_yield_quintals_per_acre": 350, "msp_price": None, "input_cost_per_acre": 60000},
    {"name": "Cashew",     "season": "Annual", "ph_min": 5.0, "ph_max": 6.5,
     "rainfall_min": 1000, "rainfall_max": 3000, "temp_min": 20, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 5, "msp_price": None, "input_cost_per_acre": 20000},
    {"name": "Coconut (Copra)", "season": "Annual", "ph_min": 5.5, "ph_max": 8.0,
     "rainfall_min": 1000, "rainfall_max": 3000, "temp_min": 20, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 60,
     "typical_yield_quintals_per_acre": 8, "msp_price": 12027, "input_cost_per_acre": 25000},
    {"name": "Turmeric",   "season": "Kharif", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 2500, "temp_min": 20, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 9,
     "typical_yield_quintals_per_acre": 20, "msp_price": None, "input_cost_per_acre": 45000},
    {"name": "Mosambi (Sweet Lime)", "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1200, "temp_min": 15, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 60, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Custard Apple (Sitaphal)", "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     # Genuinely drought-tolerant - the Beed GI listing specifically notes
     # it grows even in rocky, waterless land, hence the low rainfall need.
     "rainfall_min": 400,  "rainfall_max": 900,  "temp_min": 20, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 24,
     "typical_yield_quintals_per_acre": 40, "msp_price": None, "input_cost_per_acre": 15000},
    {"name": "Strawberry", "season": "Rabi", "ph_min": 5.5, "ph_max": 6.5,
     # Needs a genuinely COOL climate (Mahabaleshwar's hill-station
     # temperatures) - this is the actual differentiator, not rainfall,
     # since it's grown irrigated regardless of natural rainfall.
     "rainfall_min": 400,  "rainfall_max": 1500, "temp_min": 10, "temp_max": 28,
     "crop_type": "Seasonal", "months_to_harvest": 5,
     "typical_yield_quintals_per_acre": 60, "msp_price": None, "input_cost_per_acre": 90000},
    {"name": "Guava",       "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 2500, "temp_min": 15, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 24,
     "typical_yield_quintals_per_acre": 80, "msp_price": None, "input_cost_per_acre": 20000},
    # --- Added from the state-wide 358-taluka dataset's 30-crop model -----
    # Thresholds sourced directly from that dataset's Crop Requirements
    # sheet for consistency with the imported suitability scores.
    {"name": "Bajra (Pearl Millet)", "season": "Kharif", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 250,  "rainfall_max": 600,  "temp_min": 20, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 8, "msp_price": 2900, "input_cost_per_acre": 10000},
    {"name": "Maize",        "season": "Kharif", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 900,  "temp_min": 18, "temp_max": 32,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 16, "msp_price": 2410, "input_cost_per_acre": 16000},
    {"name": "Sesame (Til)",  "season": "Kharif", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 400,  "rainfall_max": 800,  "temp_min": 23, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 2.5, "msp_price": 10346, "input_cost_per_acre": 10000},
    {"name": "Potato",       "season": "Rabi",   "ph_min": 5.0, "ph_max": 6.5,
     "rainfall_min": 500,  "rainfall_max": 750,  "temp_min": 10, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 90, "msp_price": None, "input_cost_per_acre": 45000},
    {"name": "Ginger",       "season": "Kharif", "ph_min": 5.5, "ph_max": 7.0,
     "rainfall_min": 1000, "rainfall_max": 2500, "temp_min": 20, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 8,
     "typical_yield_quintals_per_acre": 70, "msp_price": None, "input_cost_per_acre": 120000},
    {"name": "Chilli",       "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 1200, "temp_min": 18, "temp_max": 32,
     "crop_type": "Seasonal", "months_to_harvest": 5,
     "typical_yield_quintals_per_acre": 18, "msp_price": None, "input_cost_per_acre": 50000},
    {"name": "Garlic",       "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 400,  "rainfall_max": 800,  "temp_min": 13, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 5,
     "typical_yield_quintals_per_acre": 35, "msp_price": None, "input_cost_per_acre": 40000},
    # --- Extended catalog: more perennials + high-demand vegetables ----------
    # Added so the catalog covers the common fruit/veg a Marathwada/Konkan
    # farmer expects (lemon, fig, jackfruit, amla, ber are perennials; the
    # rest are short-cycle vegetables). They get real rule-based scores in
    # Latur/Nagpur (where live soil+weather data exists); elsewhere they fall
    # back to the 30-crop external model's districts like any other crop.
    {"name": "Lemon",       "season": "Annual", "ph_min": 5.5, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1500, "temp_min": 15, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 60, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Fig (Anjeer)", "season": "Annual", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 500,  "rainfall_max": 1000, "temp_min": 15, "temp_max": 38,
     "crop_type": "Perennial", "months_to_harvest": 24,
     "typical_yield_quintals_per_acre": 40, "msp_price": None, "input_cost_per_acre": 35000},
    {"name": "Jackfruit",   "season": "Annual", "ph_min": 5.0, "ph_max": 7.0,
     "rainfall_min": 1500, "rainfall_max": 4000, "temp_min": 22, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 60,
     "typical_yield_quintals_per_acre": 80, "msp_price": None, "input_cost_per_acre": 15000},
    {"name": "Amla (Aonla)", "season": "Annual", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 500,  "rainfall_max": 1200, "temp_min": 10, "temp_max": 35,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 60, "msp_price": None, "input_cost_per_acre": 12000},
    {"name": "Ber (Jujube)", "season": "Annual", "ph_min": 6.0, "ph_max": 8.0,
     "rainfall_min": 250,  "rainfall_max": 600,  "temp_min": 15, "temp_max": 40,
     "crop_type": "Perennial", "months_to_harvest": 36,
     "typical_yield_quintals_per_acre": 45, "msp_price": None, "input_cost_per_acre": 12000},
    {"name": "Cabbage",     "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 500,  "rainfall_max": 1000, "temp_min": 12, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 200, "msp_price": None, "input_cost_per_acre": 35000},
    {"name": "Cauliflower", "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 500,  "rainfall_max": 1000, "temp_min": 12, "temp_max": 24,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 180, "msp_price": None, "input_cost_per_acre": 38000},
    {"name": "Carrot",      "season": "Rabi",   "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 400,  "rainfall_max": 800,  "temp_min": 13, "temp_max": 25,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 140, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "Cucumber",    "season": "Kharif", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 600,  "rainfall_max": 1200, "temp_min": 22, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 100, "msp_price": None, "input_cost_per_acre": 30000},
    {"name": "French Beans","season": "Rabi",   "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 600,  "rainfall_max": 1000, "temp_min": 18, "temp_max": 30,
     "crop_type": "Seasonal", "months_to_harvest": 2,
     "typical_yield_quintals_per_acre": 40, "msp_price": None, "input_cost_per_acre": 25000},
    {"name": "Peas (Matar)", "season": "Rabi",  "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 300,  "rainfall_max": 600,  "temp_min": 10, "temp_max": 22,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 40, "msp_price": None, "input_cost_per_acre": 22000},
    {"name": "Capsicum (Shimla Mirch)", "season": "Kharif", "ph_min": 6.0, "ph_max": 7.0,
     "rainfall_min": 600,  "rainfall_max": 1000, "temp_min": 18, "temp_max": 28,
     "crop_type": "Seasonal", "months_to_harvest": 4,
     "typical_yield_quintals_per_acre": 60, "msp_price": None, "input_cost_per_acre": 50000},
    {"name": "Watermelon",  "season": "Summer", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 300,  "rainfall_max": 600,  "temp_min": 25, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 150, "msp_price": None, "input_cost_per_acre": 25000},
    {"name": "Muskmelon (Kharbooja)", "season": "Summer", "ph_min": 6.0, "ph_max": 7.5,
     "rainfall_min": 300,  "rainfall_max": 600,  "temp_min": 25, "temp_max": 35,
     "crop_type": "Seasonal", "months_to_harvest": 3,
     "typical_yield_quintals_per_acre": 100, "msp_price": None, "input_cost_per_acre": 22000},
]

# --- Data pull settings -----------------------------------------------
# 15-year window: Open-Meteo's archive API serves daily data back to 1940,
# so the full 2010-2025 span is fetchable. A 15-year window smooths out
# single-year anomalies (e.g. a wet La Nina year) and captures the long-term
# normal, which is what suitability should reflect.
WEATHER_START_DATE = "2010-01-01"
WEATHER_END_DATE = "2025-12-31"

# Get a free key at https://data.gov.in (register -> My Account -> API key)
DATA_GOV_IN_API_KEY = "579b464db66ec23bdd000001a2da4d09062e4142656227258751c594"
AGMARKNET_RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"

DB_PATH = "latur_crops.db"   # SQLite file — zero setup, swap for Postgres later

# --- Exact Agmarknet commodity name mapping ---------------------------
# Agmarknet's dataset uses its own specific spellings that often differ
# from everyday crop names - this maps your CROPS list above to the exact
# strings their API expects. This mapping is national (same commodity name
# regardless of district) - if a crop returns 0 records for a NEW district,
# it usually means that district genuinely doesn't report that commodity,
# not that the name is wrong (we confirmed this pattern with Latur).
COMMODITY_NAME_MAP = {
    "Soybean": "Soyabean",
    "Jowar (Sorghum)": "Jowar(Sorghum)",
    "Tur (Pigeonpea)": "Arhar (Tur/Red Gram)(Whole)",
    "Udid (Black Gram)": "Urad",
    "Mung (Green Gram)": "Moong",
    "Cotton": "Cotton",
    "Wheat": "Wheat",
    "Gram (Chana)": "Bengal Gram(Gram)(Whole)",
    "Safflower": "Safflower",
    "Sunflower": "Sunflower",
    "Sugarcane": "Sugarcane",
    "Pomegranate": "Pomegranate",
    "Mango": "Mango",
    "Sapota": "Sapota",
    "Brinjal": "Brinjal",
    "Tomato": "Tomato",
    "Onion": "Onion",
    "Papaya": "Papaya",
    "Coriander": "Coriander(Leaves)",
    "Tamarind": "Tamarind Fruit",
    "Orange": "Orange",
    "Rice (Paddy)": "Paddy(Dhan)(Common)",
    "Groundnut": "Groundnut",
    "Linseed (Alsi)": "Linseed",
    "Grapes": "Grapes",
    "Banana": "Banana",
    "Cashew": "Cashewnuts",
    "Coconut (Copra)": "Copra",
    "Turmeric": "Turmeric",
    "Mosambi (Sweet Lime)": "Mousambi(Sweet Lime)",
    "Custard Apple (Sitaphal)": "Custard Apple",
    "Strawberry": "Strawberry",
    "Guava": "Guava",
    "Bajra (Pearl Millet)": "Bajra(Pearl Millet/Cumbu)",
    "Maize": "Maize",
    "Sesame (Til)": "Sesamum(Sesame,Gingelly,Til)",
    "Potato": "Potato",
    "Ginger": "Ginger(Green)",
    "Chilli": "Green Chilli",
    "Garlic": "Garlic",
    "Lemon": "Lemon",
    "Fig (Anjeer)": "Fig",
    "Jackfruit": "Jackfruit",
    "Amla (Aonla)": "Aonla",
    "Ber (Jujube)": "Ber",
    "Cabbage": "Cabbage",
    "Cauliflower": "Cauliflower",
    "Carrot": "Carrot",
    "Cucumber": "Cucumber",
    "French Beans": "French Beans",
    "Peas (Matar)": "Peas",
    "Capsicum (Shimla Mirch)": "Capsicum",
    "Watermelon": "Watermelon",
    "Muskmelon (Kharbooja)": "Muskmelon",
}

# --- Maps the imported state-model dataset's crop names to OUR crop names
# (their sheet uses short names like "Rice", "Chickpea", "Green gram" -
# ours are more specific like "Rice (Paddy)", "Gram (Chana)", "Mung (Green
# Gram)"). Used only during import so external_suitability_scores stores
# scores under our canonical crop_name for simple lookups later.
EXTERNAL_CROP_NAME_MAP = {
    "Rice": "Rice (Paddy)",
    "Wheat": "Wheat",
    "Jowar": "Jowar (Sorghum)",
    "Bajra": "Bajra (Pearl Millet)",
    "Maize": "Maize",
    "Soybean": "Soybean",
    "Cotton": "Cotton",
    "Tur": "Tur (Pigeonpea)",
    "Chickpea": "Gram (Chana)",
    "Green gram": "Mung (Green Gram)",
    "Black gram": "Udid (Black Gram)",
    "Groundnut": "Groundnut",
    "Sunflower": "Sunflower",
    "Safflower": "Safflower",
    "Sesame": "Sesame (Til)",
    "Sugarcane": "Sugarcane",
    "Onion": "Onion",
    "Tomato": "Tomato",
    "Potato": "Potato",
    "Grapes": "Grapes",
    "Pomegranate": "Pomegranate",
    "Banana": "Banana",
    "Orange": "Orange",
    "Mango": "Mango",
    "Cashew": "Cashew",
    "Coconut": "Coconut (Copra)",
    "Turmeric": "Turmeric",
    "Ginger": "Ginger",
    "Chilli": "Chilli",
    "Garlic": "Garlic",
}

# ============================================================
# SCORING ENGINE CONFIGURATION  (new F formula, approved)
# ============================================================
# F = [0.25*R + 0.20*T + 0.25*So + 0.10*W + 0.10*G + 0.05*H + 0.05*M] * L
#   R  = rainfall      (0.60*season-fit + 0.25*distribution + 0.15*dry-spell)
#   T  = temperature   (growing-season fit)
#   So = soil pH fit   (real soil_data ph where present, else external model)
#   W  = irrigation    (district-level: ICRISAT crop irrigated area / crop area;
#                       applied to EVERY tehsil in that district, per design)
#   G  = growing-water adequacy (seasonal rainfall / seasonal ET0 against the
#        crop's P/PET band - drought-hardy crops need a LOW ratio, water-hungry
#        crops a HIGH one). Computed from the freshly fetched 15-yr ET0 data.
#   H  = historical    (district crop-area share from ICRISAT APY, normalised
#                       within the district - what farmers already grow here)
#   M  = market        (real local market data present -> higher, else neutral)
#   L  = land multiplier (neutral 1.0 by default; override per-district if needed)

SCORING_WEIGHTS = {"R": 0.25, "T": 0.20, "So": 0.25, "W": 0.10,
                   "G": 0.10, "H": 0.05, "M": 0.05}
RAINFALL_SUB_WEIGHTS = {"season": 0.60, "distribution": 0.25, "dry_spell": 0.15}

# Crops' growing-season calendar months (1-12). Annual crops use all months.
SEASON_MONTHS = {
    "Kharif": {6, 7, 8, 9, 10},
    "Rabi":   {11, 12, 1, 2, 3},
    "Summer": {3, 4, 5, 6},
    "Annual": set(range(1, 13)),
}

# How much of the crop's water must come from irrigation in a semi-arid
# district (0-100 %). Rainfed/drought crops want ~0 (so even a dry district
# scores high for them); water-hungry crops need a high value (so dry
# districts correctly score them low). Defaults to 25 for any crop not listed.
CROP_IRRIGATION_NEED_MIN = {
    "Soybean": 0,   "Jowar (Sorghum)": 0, "Tur (Pigeonpea)": 0,
    "Udid (Black Gram)": 0, "Mung (Green Gram)": 0, "Bajra (Pearl Millet)": 0,
    "Safflower": 5, "Sesame (Til)": 5, "Linseed (Alsi)": 10,
    "Groundnut": 15, "Sunflower": 15, "Maize": 20, "Cotton": 20,
    "Gram (Chana)": 10, "Coriander": 15, "Custard Apple (Sitaphal)": 0,
    "Tamarind": 5,
    "Rice (Paddy)": 70, "Sugarcane": 75, "Banana": 60, "Wheat": 50,
    "Grapes": 60, "Onion": 45, "Potato": 45, "Strawberry": 50,
    "Tomato": 45, "Brinjal": 40, "Cabbage": 45, "Cauliflower": 45,
    "Capsicum (Shimla Mirch)": 50, "Cucumber": 40, "French Beans": 35,
    "Peas (Matar)": 30, "Ginger": 60, "Turmeric": 55, "Chilli": 40,
    "Garlic": 45, "Carrot": 40, "Watermelon": 35, "Muskmelon (Kharbooja)": 35,
    "Pomegranate": 45, "Orange": 45, "Mosambi (Sweet Lime)": 45,
    "Lemon": 45, "Papaya": 50, "Guava": 40, "Mango": 25, "Sapota": 35,
    "Amla (Aonla)": 10, "Ber (Jujube)": 5, "Fig (Anjeer)": 40,
    "Jackfruit": 15, "Cashew": 10, "Coconut (Copra)": 15,
}

# Range of seasonal P/PET (rainfall / evapotranspiration) the crop prefers.
# Low ratio = dry-adapted, high ratio = water-hungry. If ET0 data is missing
# for a region, G scores neutral 75 instead of guessing.
CROP_PPET_BAND = {
    "Soybean": (0.35, 0.65),        "Jowar (Sorghum)": (0.25, 0.55),
    "Tur (Pigeonpea)": (0.40, 0.70), "Udid (Black Gram)": (0.35, 0.65),
    "Mung (Green Gram)": (0.30, 0.60), "Bajra (Pearl Millet)": (0.20, 0.50),
    "Safflower": (0.25, 0.55),      "Sesame (Til)": (0.30, 0.60),
    "Linseed (Alsi)": (0.30, 0.60), "Groundnut": (0.40, 0.70),
    "Sunflower": (0.40, 0.70),      "Maize": (0.55, 0.85),
    "Cotton": (0.45, 0.80),         "Gram (Chana)": (0.25, 0.50),
    "Coriander": (0.30, 0.60),      "Custard Apple (Sitaphal)": (0.25, 0.55),
    "Tamarind": (0.30, 0.60),       "Amla (Aonla)": (0.30, 0.60),
    "Ber (Jujube)": (0.20, 0.50),   "Wheat": (0.45, 0.75),
    "Potato": (0.55, 0.85),         "Onion": (0.50, 0.80),
    "Strawberry": (0.60, 0.95),     "Cabbage": (0.60, 0.90),
    "Cauliflower": (0.60, 0.90),    "Carrot": (0.55, 0.85),
    "Peas (Matar)": (0.50, 0.80),   "Tomato": (0.55, 0.85),
    "Brinjal": (0.55, 0.85),        "Capsicum (Shimla Mirch)": (0.60, 0.90),
    "Cucumber": (0.55, 0.85),       "French Beans": (0.55, 0.85),
    "Garlic": (0.45, 0.75),         "Ginger": (0.70, 1.10),
    "Turmeric": (0.70, 1.05),       "Chilli": (0.50, 0.85),
    "Watermelon": (0.50, 0.80),     "Muskmelon (Kharbooja)": (0.50, 0.80),
    "Pomegranate": (0.45, 0.80),    "Orange": (0.50, 0.85),
    "Mosambi (Sweet Lime)": (0.50, 0.85), "Lemon": (0.50, 0.85),
    "Papaya": (0.65, 1.00),         "Guava": (0.60, 0.90),
    "Mango": (0.60, 1.10),          "Sapota": (0.60, 1.00),
    "Fig (Anjeer)": (0.45, 0.80),   "Jackfruit": (0.75, 1.30),
    "Cashew": (0.70, 1.25),         "Coconut (Copra)": (0.75, 1.40),
    "Rice (Paddy)": (1.00, 1.60),   "Sugarcane": (1.00, 1.50),
    "Banana": (0.80, 1.30),
}
DEFAULT_PPET_BAND = (0.45, 0.85)   # sensible default for any crop not listed

# --- ICRISAT district-level data (DLDD API, no key needed) --------------
ICRISAT_BASE_URL = "http://data.icrisat.org/dldAPI/"
# Maps OUR district names (post-renaming) to ICRISAT's district spelling in
# the 'unapportioned' boundary set (36 districts incl. Latur). The fetch
# script fuzzy-matches against the live API's own district list as a safety
# net, so add/rename entries here only if a district stops matching.
ICRISAT_DISTRICT_MAP = {
    "Latur": "Latur", "Nagpur": "Nagpur", "Pune": "Pune",
    "Satara": "Satara", "Sangli": "Sangli", "Solapur": "Solapur",
    "Kolhapur": "Kolhapur", "Akola": "Akola", "Amravati": "Amarawati",
    "Buldhana": "Buldhana", "Yavatmal": "Yeotmal", "Washim": "Washim",
    "Chhatrapati Sambhajinagar": "Aurangabad", "Beed": "Bid",
    "Jalna": "Jalna", "Dharashiv": "Osmanabad", "Nanded": "Nanded",
    "Parbhani": "Parbhani", "Hingoli": "Hingoli", "Bhandara": "Bhandara",
    "Chandrapur": "Chandrapur", "Gadchiroli": "Gadchiroli",
    "Gondia": "Gondia", "Wardha": "Wardha", "Ahilyanagar": "Ahmednagar",
    "Dhule": "Dhule", "Jalgaon": "Jalgaon", "Nandurbar": "Nandurbar",
    "Nashik": "Nasik", "Thane": "Thane", "Palghar": "Palghar",
    "Raigad": "Raigarh", "Ratnagiri": "Ratnagiri",
    "Sindhudurg": "Sindhudurg",
}

# Maps OUR crop_name to the ICRISAT item name used in BOTH the
# 'cropwise-irrigated-area' and 'area-production-yield' datasets. Crops not
# listed here get their W from the district's aggregate irrigation fraction
# and their H from a neutral 50 (no historical distortion).
ICRISAT_CROP_MAP = {
    "Soybean": "SOYABEAN", "Jowar (Sorghum)": "SORGHUM",
    "Tur (Pigeonpea)": "PIGEONPEA", "Udid (Black Gram)": "MINOR PULSES",
    "Mung (Green Gram)": "MINOR PULSES", "Cotton": "COTTON",
    "Wheat": "WHEAT", "Gram (Chana)": "CHICKPEA", "Safflower": "SAFFLOWER",
    "Sunflower": "SUNFLOWER", "Sugarcane": "SUGARCANE",
    "Groundnut": "GROUNDNUT", "Linseed (Alsi)": "LINSEED",
    "Sesame (Til)": "SESAMUM", "Bajra (Pearl Millet)": "PEARL MILLET",
    "Maize": "MAIZE", "Rice (Paddy)": "RICE",
}

# ============================================================
# COMPLETE MAHARASHTRA TEHSIL MASTER DATA
# ============================================================

STATE = "Maharashtra"

TEHSILS_BY_DISTRICT = {
    "Ahilyanagar": {
        "division": "Nashik",
        "tehsils": [
            {"name": "Ahilyanagar", "latitude": 19.093, "longitude": 74.7493},
            {"name": "Akole", "latitude": 19.5419, "longitude": 74.0093},
            {"name": "Jamkhed", "latitude": 18.6688, "longitude": 75.3524},
            {"name": "Karjat", "latitude": 18.5798, "longitude": 75.0015},
            {"name": "Kopargaon", "latitude": 19.837, "longitude": 74.4829},
            {"name": "Newasa", "latitude": 19.3658, "longitude": 75.2061},
            {"name": "Parner", "latitude": 19.0932, "longitude": 74.3941},
            {"name": "Pathardi", "latitude": 19.1717, "longitude": 75.1746},
            {"name": "Rahata", "latitude": 19.7171, "longitude": 74.48},
            {"name": "Rahuri", "latitude": 19.4032, "longitude": 74.6106},
            {"name": "Sangamner", "latitude": 19.4906, "longitude": 74.2467},
            {"name": "Shevgaon", "latitude": 19.3797, "longitude": 75.2955},
            {"name": "Shrigonda", "latitude": 18.6764, "longitude": 74.6709},
            {"name": "Shrirampur", "latitude": 19.642, "longitude": 74.7007},
        ],
    },
    "Akola": {
        "division": "Amravati",
        "tehsils": [
            {"name": "Akola", "latitude": 20.7117, "longitude": 77.0026},
            {"name": "Akot", "latitude": 21.0475, "longitude": 77.0553},
            {"name": "Balapur", "latitude": 20.7327, "longitude": 76.8363},
            {"name": "Barshitakli", "latitude": 20.5226, "longitude": 77.158},
            {"name": "Murtizapur", "latitude": 20.6919, "longitude": 77.017},
            {"name": "Patur", "latitude": 20.4229, "longitude": 76.8632},
            {"name": "Telhara", "latitude": 21.0378, "longitude": 76.8671},
        ],
    },
    "Amravati": {
        "division": "Amravati",
        "tehsils": [
            {"name": "Achalpur", "latitude": 21.2408, "longitude": 77.4278},
            {"name": "Amravati", "latitude": 21.0857, "longitude": 77.667},
            {"name": "Anjangaon Surji", "latitude": 21.1214, "longitude": 77.3003},
            {"name": "Bhatkuli", "latitude": 20.9868, "longitude": 77.5906},
            {"name": "Chandur Bazar", "latitude": 21.2376, "longitude": 77.7479},
            {"name": "Chandur Railway", "latitude": 20.7649, "longitude": 77.973},
            {"name": "Chikhaldara", "latitude": 21.4764, "longitude": 77.2758},
            {"name": "Daryapur", "latitude": 20.9645, "longitude": 77.334},
            {"name": "Dhamangaon Railway", "latitude": 20.7934, "longitude": 78.178},
            {"name": "Dharni", "latitude": 21.5624, "longitude": 76.8905},
            {"name": "Morshi", "latitude": 21.2799, "longitude": 77.9448},
            {"name": "Nandgaon Khandeshwar", "latitude": 20.6966, "longitude": 77.7635},
            {"name": "Tivsa", "latitude": 21.0848, "longitude": 78.0635},
            {"name": "Warud", "latitude": 21.4714, "longitude": 78.2829},
        ],
    },
    "Beed": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Ambajogai", "latitude": 18.7318, "longitude": 76.3855},
            {"name": "Ashti", "latitude": 18.8875, "longitude": 75.0655},
            {"name": "Beed", "latitude": 18.9904, "longitude": 75.7542},
            {"name": "Dharur", "latitude": 18.8827, "longitude": 76.1366},
            {"name": "Georai", "latitude": 19.2621, "longitude": 75.7396},
            {"name": "Kaij", "latitude": 18.7231, "longitude": 76.0379},
            {"name": "Majalgaon", "latitude": 19.1551, "longitude": 76.2099},
            {"name": "Parli", "latitude": 18.8486, "longitude": 76.5297},
            {"name": "Patoda", "latitude": 18.8388, "longitude": 75.4635},
            {"name": "Shirur", "latitude": 19.0666, "longitude": 75.427},
            {"name": "Wadwani", "latitude": 19.0019, "longitude": 76.089},
        ],
    },
    "Bhandara": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Bhandara", "latitude": 21.1707, "longitude": 79.6566},
            {"name": "Lakhandur", "latitude": 20.7549, "longitude": 79.8838},
            {"name": "Lakhani", "latitude": 21.0721, "longitude": 79.8261},
            {"name": "Mohadi", "latitude": 21.3083, "longitude": 79.6745},
            {"name": "Pauni", "latitude": 20.7926, "longitude": 79.636},
            {"name": "Sakoli", "latitude": 21.0874, "longitude": 79.9974},
            {"name": "Tumsar", "latitude": 21.382, "longitude": 79.75},
        ],
    },
    "Buldhana": {
        "division": "Amravati",
        "tehsils": [
            {"name": "Buldhana", "latitude": 20.4548, "longitude": 76.0956},
            {"name": "Chikhli", "latitude": 20.3439, "longitude": 76.3229},
            {"name": "Deulgaon Raja", "latitude": 20.0717, "longitude": 76.1588},
            {"name": "Jalgaon Jamod", "latitude": 21.0597, "longitude": 76.4955},
            {"name": "Khamgaon", "latitude": 20.6502, "longitude": 76.5592},
            {"name": "Lonar", "latitude": 19.9831, "longitude": 76.4911},
            {"name": "Malkapur", "latitude": 20.892, "longitude": 76.204},
            {"name": "Mehkar", "latitude": 20.2547, "longitude": 76.6333},
            {"name": "Motala", "latitude": 20.685, "longitude": 76.1529},
            {"name": "Nandura", "latitude": 20.8386, "longitude": 76.4603},
            {"name": "Sangrampur", "latitude": 21.0975, "longitude": 76.7077},
            {"name": "Shegaon", "latitude": 20.8008, "longitude": 76.6905},
            {"name": "Sindkhed Raja", "latitude": 20.0566, "longitude": 76.389},
        ],
    },
    "Chandrapur": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Ballarpur", "latitude": 19.8568, "longitude": 79.348},
            {"name": "Bhadravati", "latitude": 20.1065, "longitude": 79.1157},
            {"name": "Bramhapuri", "latitude": 20.6084, "longitude": 79.8586},
            {"name": "Chandrapur", "latitude": 19.9508, "longitude": 79.2987},
            {"name": "Chimur", "latitude": 20.4942, "longitude": 79.3738},
            {"name": "Gondpipri", "latitude": 19.7175, "longitude": 79.6867},
            {"name": "Jiwati", "latitude": 19.6102, "longitude": 79.0674},
            {"name": "Korpana", "latitude": 19.7406, "longitude": 78.9894},
            {"name": "Mul", "latitude": 20.0651, "longitude": 79.6767},
            {"name": "Nagbhir", "latitude": 20.5802, "longitude": 79.7002},
            {"name": "Pombhurna", "latitude": 19.8768, "longitude": 79.6339},
            {"name": "Rajura", "latitude": 19.7793, "longitude": 79.3657},
            {"name": "Saoli", "latitude": 20.0825, "longitude": 79.7857},
            {"name": "Sindewahi", "latitude": 20.2922, "longitude": 79.6567},
            {"name": "Warora", "latitude": 20.2343, "longitude": 79.0028},
        ],
    },
    "Chhatrapati Sambhajinagar": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Chhatrapati Sambhajinagar", "latitude": 19.8773, "longitude": 75.339},
            {"name": "Gangapur", "latitude": 19.7954, "longitude": 75.0667},
            {"name": "Kannad", "latitude": 20.2455, "longitude": 75.1438},
            {"name": "Khultabad", "latitude": 20.0124, "longitude": 75.1929},
            {"name": "Paithan", "latitude": 19.5836, "longitude": 75.4303},
            {"name": "Phulambri", "latitude": 20.1305, "longitude": 75.4909},
            {"name": "Sillod", "latitude": 20.3549, "longitude": 75.6105},
            {"name": "Soegaon", "latitude": 20.5487, "longitude": 75.317},
            {"name": "Vaijapur", "latitude": 19.9489, "longitude": 74.8332},
        ],
    },
    "Dharashiv": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Bhum", "latitude": 18.5493, "longitude": 75.6191},
            {"name": "Dharashiv", "latitude": 18.1854, "longitude": 76.042},
            {"name": "Kalamb", "latitude": 18.573, "longitude": 76.0225},
            {"name": "Lohara", "latitude": 17.9926, "longitude": 76.327},
            {"name": "Paranda", "latitude": 18.2683, "longitude": 75.4508},
            {"name": "Tuljapur", "latitude": 18.0087, "longitude": 76.0708},
            {"name": "Umarga", "latitude": 17.8365, "longitude": 76.625},
            {"name": "Vashi", "latitude": 19.0632, "longitude": 72.9988},
        ],
    },
    "Dhule": {
        "division": "Nashik",
        "tehsils": [
            {"name": "Dhule", "latitude": 20.898, "longitude": 74.7732},
            {"name": "Sakri", "latitude": 20.9911, "longitude": 74.3154},
            {"name": "Shindkheda", "latitude": 21.2709, "longitude": 74.7457},
            {"name": "Shirpur", "latitude": 21.3528, "longitude": 74.8842},
        ],
    },
    "Gadchiroli": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Aheri", "latitude": 19.4132, "longitude": 80.004},
            {"name": "Armori", "latitude": 20.4711, "longitude": 79.9795},
            {"name": "Bhamragad", "latitude": 19.4252, "longitude": 80.5984},
            {"name": "Chamorshi", "latitude": 19.9371, "longitude": 79.8894},
            {"name": "Desaiganj", "latitude": 20.6238, "longitude": 79.9626},
            {"name": "Dhanora", "latitude": 20.271, "longitude": 80.3095},
            {"name": "Etapalli", "latitude": 19.5985, "longitude": 80.2275},
            {"name": "Gadchiroli", "latitude": 20.1854, "longitude": 80.0035},
            {"name": "Korchi", "latitude": 20.7119, "longitude": 80.4715},
            {"name": "Kurkheda", "latitude": 20.2275, "longitude": 80.1411},
            {"name": "Mulchera", "latitude": 19.6797, "longitude": 80.0052},
            {"name": "Sironcha", "latitude": 18.8482, "longitude": 79.9639},
        ],
    },
    "Gondia": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Amgaon", "latitude": 21.3912, "longitude": 80.3422},
            {"name": "Arjuni Morgaon", "latitude": 20.8264, "longitude": 80.0178},
            {"name": "Deori", "latitude": 21.0011, "longitude": 80.3617},
            {"name": "Gondia", "latitude": 21.4612, "longitude": 80.1932},
            {"name": "Goregaon", "latitude": 21.2808, "longitude": 80.1964},
            {"name": "Sadak Arjuni", "latitude": 21.1012, "longitude": 80.1788},
            {"name": "Salekasa", "latitude": 21.2866, "longitude": 80.5434},
            {"name": "Tirora", "latitude": 21.414, "longitude": 79.9166},
        ],
    },
    "Hingoli": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Aundha Nagnath", "latitude": 19.5645, "longitude": 77.0661},
            {"name": "Basmath", "latitude": 19.3122, "longitude": 77.1069},
            {"name": "Hingoli", "latitude": 19.8035, "longitude": 77.1793},
            {"name": "Kalamnuri", "latitude": 19.5723, "longitude": 77.3475},
            {"name": "Sengaon", "latitude": 19.82, "longitude": 76.7942},
        ],
    },
    "Jalgaon": {
        "division": "Nashik",
        "tehsils": [
            {"name": "Amalner", "latitude": 21.0493, "longitude": 75.0573},
            {"name": "Bhadgaon", "latitude": 20.6603, "longitude": 75.1305},
            {"name": "Bhusawal", "latitude": 20.9946, "longitude": 75.8396},
            {"name": "Bodwad", "latitude": 20.9035, "longitude": 76.0174},
            {"name": "Chalisgaon", "latitude": 20.5024, "longitude": 74.9656},
            {"name": "Chopda", "latitude": 21.2472, "longitude": 75.299},
            {"name": "Dharangaon", "latitude": 21.0062, "longitude": 75.2863},
            {"name": "Erandol", "latitude": 20.8674, "longitude": 75.352},
            {"name": "Jalgaon", "latitude": 21.0101, "longitude": 75.5696},
            {"name": "Jamner", "latitude": 20.7323, "longitude": 75.8024},
            {"name": "Muktainagar", "latitude": 21.086, "longitude": 76.0653},
            {"name": "Pachora", "latitude": 20.6563, "longitude": 75.4011},
            {"name": "Parola", "latitude": 20.8313, "longitude": 75.1149},
            {"name": "Raver", "latitude": 21.2222, "longitude": 76.0444},
            {"name": "Yawal", "latitude": 21.226, "longitude": 75.6951},
        ],
    },
    "Jalna": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Ambad", "latitude": 19.5654, "longitude": 75.7757},
            {"name": "Badnapur", "latitude": 19.9004, "longitude": 75.7441},
            {"name": "Bhokardan", "latitude": 20.2928, "longitude": 75.804},
            {"name": "Ghansawangi", "latitude": 19.4925, "longitude": 76.0196},
            {"name": "Jafrabad", "latitude": 20.207, "longitude": 76.004},
            {"name": "Jalna", "latitude": 19.8318, "longitude": 75.8909},
            {"name": "Mantha", "latitude": 19.7302, "longitude": 76.3347},
            {"name": "Partur", "latitude": 19.4883, "longitude": 76.2607},
        ],
    },
    "Kolhapur": {
        "division": "Pune",
        "tehsils": [
            {"name": "Ajra", "latitude": 16.1577, "longitude": 74.1881},
            {"name": "Bhudargad", "latitude": 16.2539, "longitude": 74.1129},
            {"name": "Chandgad", "latitude": 15.9014, "longitude": 74.2406},
            {"name": "Gadhinglaj", "latitude": 16.1409, "longitude": 74.4037},
            {"name": "Gaganbawda", "latitude": 16.5458, "longitude": 73.8311},
            {"name": "Hatkanangale", "latitude": 16.7477, "longitude": 74.4212},
            {"name": "Kagal", "latitude": 16.5751, "longitude": 74.3153},
            {"name": "Karvir", "latitude": 16.6603, "longitude": 74.196},
            {"name": "Panhala", "latitude": 16.8067, "longitude": 74.1126},
            {"name": "Radhanagari", "latitude": 16.4278, "longitude": 73.9862},
            {"name": "Shahuwadi", "latitude": 16.9617, "longitude": 73.893},
            {"name": "Shirol", "latitude": 16.7104, "longitude": 74.5812},
        ],
    },
    "Latur": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Ahmedpur", "latitude": 18.6962, "longitude": 76.9425},
            {"name": "Ausa", "latitude": 18.251, "longitude": 76.501},
            {"name": "Chakur", "latitude": 18.5175, "longitude": 76.8766},
            {"name": "Deoni", "latitude": 18.2644, "longitude": 77.0821},
            {"name": "Jalkot", "latitude": 18.6291, "longitude": 77.1783},
            {"name": "Latur", "latitude": 18.3982, "longitude": 76.5626},
            {"name": "Nilanga", "latitude": 18.0838, "longitude": 76.7992},
            {"name": "Renapur", "latitude": 18.5264, "longitude": 76.5968},
            {"name": "Shirur Anantpal", "latitude": 18.3286, "longitude": 76.8186},
            {"name": "Udgir", "latitude": 18.3921, "longitude": 77.1196},
        ],
    },
    "Mumbai City": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Mumbai City", "latitude": 18.922, "longitude": 72.8346},
        ],
    },
    "Mumbai Suburban": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Andheri", "latitude": 19.1197, "longitude": 72.8464},
            {"name": "Borivali", "latitude": 19.2291, "longitude": 72.8574},
            {"name": "Kurla", "latitude": 19.0653, "longitude": 72.8794},
        ],
    },
    "Nagpur": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Bhiwapur", "latitude": 20.7638, "longitude": 79.5199},
            {"name": "Hingna", "latitude": 20.9916, "longitude": 78.8732},
            {"name": "Kalmeshwar", "latitude": 21.2374, "longitude": 78.9082},
            {"name": "Kamthi", "latitude": 21.378, "longitude": 78.8557},
            {"name": "Katol", "latitude": 21.2752, "longitude": 78.5866},
            {"name": "Kuhi", "latitude": 21.014, "longitude": 79.3663},
            {"name": "Mouda", "latitude": 21.1476, "longitude": 79.4138},
            {"name": "Nagpur City", "latitude": 21.1498, "longitude": 79.0821},
            {"name": "Nagpur Rural", "latitude": 21.1382, "longitude": 78.8107},
            {"name": "Narkhed", "latitude": 21.4713, "longitude": 78.5337},
            {"name": "Parseoni", "latitude": 21.4265, "longitude": 79.1355},
            {"name": "Ramtek", "latitude": 21.3936, "longitude": 79.2999},
            {"name": "Savner", "latitude": 21.432, "longitude": 78.8876},
            {"name": "Umred", "latitude": 20.8485, "longitude": 79.2305},
        ],
    },
    "Nanded": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Ardhapur", "latitude": 19.2693, "longitude": 77.415},
            {"name": "Bhokar", "latitude": 19.1948, "longitude": 77.6834},
            {"name": "Biloli", "latitude": 18.7653, "longitude": 77.6968},
            {"name": "Deglur", "latitude": 18.468, "longitude": 77.4999},
            {"name": "Dharmabad", "latitude": 18.9217, "longitude": 77.7623},
            {"name": "Hadgaon", "latitude": 19.4786, "longitude": 77.6068},
            {"name": "Himayatnagar", "latitude": 19.4112, "longitude": 77.8438},
            {"name": "Kandhar", "latitude": 18.8425, "longitude": 77.2511},
            {"name": "Kinwat", "latitude": 19.5775, "longitude": 78.244},
            {"name": "Loha", "latitude": 18.9361, "longitude": 77.1015},
            {"name": "Mahur", "latitude": 19.848, "longitude": 77.9218},
            {"name": "Mudkhed", "latitude": 19.1394, "longitude": 77.5014},
            {"name": "Naigaon", "latitude": 18.8767, "longitude": 77.5119},
            {"name": "Nanded", "latitude": 19.1726, "longitude": 77.2914},
            {"name": "Umri", "latitude": 19.0217, "longitude": 77.589},
        ],
    },
    "Nandurbar": {
        "division": "Nashik",
        "tehsils": [
            {"name": "Akkalkuwa", "latitude": 21.7006, "longitude": 74.0002},
            {"name": "Akrani", "latitude": 21.8498, "longitude": 74.281},
            {"name": "Nandurbar", "latitude": 21.3738, "longitude": 74.2446},
            {"name": "Navapur", "latitude": 21.1666, "longitude": 73.7725},
            {"name": "Shahada", "latitude": 21.5409, "longitude": 74.4717},
            {"name": "Taloda", "latitude": 21.5628, "longitude": 74.2123},
        ],
    },
    "Nashik": {
        "division": "Nashik",
        "tehsils": [
            {"name": "Baglan", "latitude": 20.6902, "longitude": 74.1287},
            {"name": "Chandwad", "latitude": 20.2781, "longitude": 74.2129},
            {"name": "Deola", "latitude": 20.461, "longitude": 74.1828},
            {"name": "Dindori", "latitude": 20.2037, "longitude": 73.8326},
            {"name": "Igatpuri", "latitude": 19.6944, "longitude": 73.5639},
            {"name": "Kalwan", "latitude": 20.4909, "longitude": 74.0241},
            {"name": "Malegaon", "latitude": 20.5576, "longitude": 74.5247},
            {"name": "Nandgaon", "latitude": 20.3094, "longitude": 74.6598},
            {"name": "Nashik", "latitude": 20.0112, "longitude": 73.7902},
            {"name": "Niphad", "latitude": 20.0797, "longitude": 74.1071},
            {"name": "Peth", "latitude": 20.2588, "longitude": 73.5037},
            {"name": "Sinnar", "latitude": 19.8453, "longitude": 74.0},
            {"name": "Surgana", "latitude": 20.5592, "longitude": 73.6376},
            {"name": "Trimbakeshwar", "latitude": 19.9321, "longitude": 73.5308},
            {"name": "Yeola", "latitude": 20.0429, "longitude": 74.488},
        ],
    },
    "Palghar": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Dahanu", "latitude": 19.9887, "longitude": 72.7338},
            {"name": "Jawhar", "latitude": 19.9125, "longitude": 73.2252},
            {"name": "Mokhada", "latitude": 19.9354, "longitude": 73.3408},
            {"name": "Palghar", "latitude": 19.6979, "longitude": 72.7719},
            {"name": "Talasari", "latitude": 20.1222, "longitude": 72.9164},
            {"name": "Vasai", "latitude": 19.3428, "longitude": 72.8054},
            {"name": "Vikramgad", "latitude": 19.7971, "longitude": 73.0957},
            {"name": "Wada", "latitude": 19.6547, "longitude": 73.148},
        ],
    },
    "Parbhani": {
        "division": "Chhatrapati Sambhajinagar",
        "tehsils": [
            {"name": "Gangakhed", "latitude": 18.9131, "longitude": 76.7557},
            {"name": "Jintur", "latitude": 19.6109, "longitude": 76.7438},
            {"name": "Manwath", "latitude": 19.2436, "longitude": 76.5592},
            {"name": "Palam", "latitude": 19.0101, "longitude": 76.9517},
            {"name": "Parbhani", "latitude": 19.2447, "longitude": 76.7761},
            {"name": "Pathri", "latitude": 19.2195, "longitude": 76.4284},
            {"name": "Purna", "latitude": 19.181, "longitude": 76.994},
            {"name": "Sailu", "latitude": 19.4549, "longitude": 76.4388},
            {"name": "Sonpeth", "latitude": 18.98, "longitude": 76.5729},
        ],
    },
    "Pune": {
        "division": "Pune",
        "tehsils": [
            {"name": "Ambegaon", "latitude": 19.0317, "longitude": 73.95},
            {"name": "Baramati", "latitude": 18.2199, "longitude": 74.4534},
            {"name": "Bhor", "latitude": 18.2128, "longitude": 73.8164},
            {"name": "Daund", "latitude": 18.4834, "longitude": 74.3622},
            {"name": "Haveli", "latitude": 18.5105, "longitude": 74.0609},
            {"name": "Indapur", "latitude": 18.1125, "longitude": 74.9239},
            {"name": "Junnar", "latitude": 19.2007, "longitude": 73.9768},
            {"name": "Khed", "latitude": 18.8501, "longitude": 73.838},
            {"name": "Mawal", "latitude": 18.7434, "longitude": 73.4264},
            {"name": "Mulshi", "latitude": 18.5, "longitude": 73.5137},
            {"name": "Pune City", "latitude": 18.5214, "longitude": 73.8545},
            {"name": "Purandar", "latitude": 18.2801, "longitude": 73.9743},
            {"name": "Shirur", "latitude": 18.7611, "longitude": 74.2095},
            {"name": "Velhe", "latitude": 18.3036, "longitude": 73.5825},
        ],
    },
    "Raigad": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Alibag", "latitude": 18.6498, "longitude": 72.8765},
            {"name": "Karjat", "latitude": 18.9128, "longitude": 73.3228},
            {"name": "Khalapur", "latitude": 18.8322, "longitude": 73.2852},
            {"name": "Mahad", "latitude": 18.0808, "longitude": 73.4244},
            {"name": "Mangaon", "latitude": 18.2474, "longitude": 73.2754},
            {"name": "Mhasla", "latitude": 18.132, "longitude": 73.1068},
            {"name": "Murud", "latitude": 18.322, "longitude": 72.9605},
            {"name": "Panvel", "latitude": 18.9895, "longitude": 73.1222},
            {"name": "Pen", "latitude": 18.7354, "longitude": 73.0868},
            {"name": "Poladpur", "latitude": 17.985, "longitude": 73.4672},
            {"name": "Roha", "latitude": 18.4466, "longitude": 73.1239},
            {"name": "Shrivardhan", "latitude": 18.0557, "longitude": 73.0335},
            {"name": "Sudhagad", "latitude": 18.5404, "longitude": 73.3206},
            {"name": "Tala", "latitude": 18.2922, "longitude": 73.1402},
            {"name": "Uran", "latitude": 18.8808, "longitude": 72.9386},
        ],
    },
    "Ratnagiri": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Chiplun", "latitude": 17.5253, "longitude": 73.5156},
            {"name": "Dapoli", "latitude": 17.758, "longitude": 73.1887},
            {"name": "Guhagar", "latitude": 17.4838, "longitude": 73.1911},
            {"name": "Khed", "latitude": 17.7126, "longitude": 73.4107},
            {"name": "Lanja", "latitude": 16.859, "longitude": 73.5487},
            {"name": "Mandangad", "latitude": 17.9888, "longitude": 73.2583},
            {"name": "Rajapur", "latitude": 16.6533, "longitude": 73.5149},
            {"name": "Ratnagiri", "latitude": 16.9934, "longitude": 73.2954},
            {"name": "Sangameshwar", "latitude": 17.2016, "longitude": 73.5464},
        ],
    },
    "Sangli": {
        "division": "Pune",
        "tehsils": [
            {"name": "Atpadi", "latitude": 17.4227, "longitude": 74.9391},
            {"name": "Jat", "latitude": 17.0719, "longitude": 75.3331},
            {"name": "Kadegaon", "latitude": 17.276, "longitude": 74.3755},
            {"name": "Kavathe Mahankal", "latitude": 17.0068, "longitude": 74.8651},
            {"name": "Khanapur", "latitude": 17.2913, "longitude": 74.6152},
            {"name": "Miraj", "latitude": 16.8585, "longitude": 74.7109},
            {"name": "Palus", "latitude": 17.045, "longitude": 74.4366},
            {"name": "Shirala", "latitude": 17.0801, "longitude": 74.0269},
            {"name": "Tasgaon", "latitude": 17.0905, "longitude": 74.6833},
            {"name": "Walwa", "latitude": 17.0196, "longitude": 74.2806},
        ],
    },
    "Satara": {
        "division": "Pune",
        "tehsils": [
            {"name": "Jaoli", "latitude": 17.7258, "longitude": 73.6989},
            {"name": "Karad", "latitude": 17.2852, "longitude": 74.1822},
            {"name": "Khandala", "latitude": 18.0584, "longitude": 74.0148},
            {"name": "Khatav", "latitude": 17.637, "longitude": 74.4018},
            {"name": "Koregaon", "latitude": 17.692, "longitude": 74.1491},
            {"name": "Mahabaleshwar", "latitude": 17.9243, "longitude": 73.6576},
            {"name": "Man", "latitude": 17.6796, "longitude": 74.6522},
            {"name": "Patan", "latitude": 17.3565, "longitude": 73.8634},
            {"name": "Phaltan", "latitude": 17.9579, "longitude": 74.4142},
            {"name": "Satara", "latitude": 17.6883, "longitude": 74.0042},
            {"name": "Wai", "latitude": 17.9424, "longitude": 73.9193},
        ],
    },
    "Sindhudurg": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Deogad", "latitude": 19.7335, "longitude": 79.0247},
            {"name": "Dodamarg", "latitude": 15.6806, "longitude": 73.9686},
            {"name": "Kankavli", "latitude": 16.3742, "longitude": 73.7452},
            {"name": "Kudal", "latitude": 16.0172, "longitude": 73.6781},
            {"name": "Malvan", "latitude": 16.0606, "longitude": 73.4669},
            {"name": "Sawantwadi", "latitude": 15.908, "longitude": 73.8205},
            {"name": "Vaibhavwadi", "latitude": 16.4986, "longitude": 73.7441},
            {"name": "Vengurla", "latitude": 15.862, "longitude": 73.6322},
        ],
    },
    "Solapur": {
        "division": "Pune",
        "tehsils": [
            {"name": "Akkalkot", "latitude": 17.5152, "longitude": 76.2123},
            {"name": "Barshi", "latitude": 18.2341, "longitude": 75.6875},
            {"name": "Karmala", "latitude": 18.3214, "longitude": 75.1169},
            {"name": "Madha", "latitude": 18.0713, "longitude": 75.3623},
            {"name": "Malshiras", "latitude": 17.8096, "longitude": 74.9347},
            {"name": "Mangalvedhe", "latitude": 17.4027, "longitude": 75.4594},
            {"name": "Mohol", "latitude": 17.771, "longitude": 75.6435},
            {"name": "Pandharpur", "latitude": 17.7256, "longitude": 75.3002},
            {"name": "Sangola", "latitude": 17.4368, "longitude": 75.1882},
            {"name": "Solapur North", "latitude": 17.7764, "longitude": 75.8754},
            {"name": "Solapur South", "latitude": 17.6047, "longitude": 76.0347},
        ],
    },
    "Thane": {
        "division": "Konkan",
        "tehsils": [
            {"name": "Ambernath", "latitude": 19.2016, "longitude": 73.2005},
            {"name": "Bhiwandi", "latitude": 19.3026, "longitude": 73.0588},
            {"name": "Kalyan", "latitude": 19.2397, "longitude": 73.1366},
            {"name": "Murbad", "latitude": 19.2571, "longitude": 73.3907},
            {"name": "Shahapur", "latitude": 19.4518, "longitude": 73.3266},
            {"name": "Thane", "latitude": 19.1943, "longitude": 72.9702},
            {"name": "Ulhasnagar", "latitude": 19.2236, "longitude": 73.1672},
        ],
    },
    "Wardha": {
        "division": "Nagpur",
        "tehsils": [
            {"name": "Arvi", "latitude": 20.9362, "longitude": 78.2892},
            {"name": "Ashti", "latitude": 21.2057, "longitude": 78.1828},
            {"name": "Deoli", "latitude": 20.6311, "longitude": 78.3972},
            {"name": "Hinganghat", "latitude": 20.5426, "longitude": 78.8332},
            {"name": "Karanja", "latitude": 21.1044, "longitude": 78.4325},
            {"name": "Samudrapur", "latitude": 20.6131, "longitude": 79.024},
            {"name": "Seloo", "latitude": 20.8636, "longitude": 78.7057},
            {"name": "Wardha", "latitude": 20.7465, "longitude": 78.5998},
        ],
    },
    "Washim": {
        "division": "Amravati",
        "tehsils": [
            {"name": "Karanja", "latitude": 20.4821, "longitude": 77.4892},
            {"name": "Malegaon", "latitude": 20.2585, "longitude": 76.9766},
            {"name": "Mangrulpir", "latitude": 20.2759, "longitude": 77.3261},
            {"name": "Manora", "latitude": 20.2247, "longitude": 77.5502},
            {"name": "Risod", "latitude": 20.0338, "longitude": 76.834},
            {"name": "Washim", "latitude": 20.1029, "longitude": 77.1354},
        ],
    },
    "Yavatmal": {
        "division": "Amravati",
        "tehsils": [
            {"name": "Arni", "latitude": 20.0539, "longitude": 77.9942},
            {"name": "Babhulgaon", "latitude": 20.5566, "longitude": 78.1657},
            {"name": "Darwha", "latitude": 20.3249, "longitude": 77.7779},
            {"name": "Digras", "latitude": 20.0968, "longitude": 77.7628},
            {"name": "Ghatanji", "latitude": 20.0194, "longitude": 78.2747},
            {"name": "Kalamb", "latitude": 20.3714, "longitude": 78.3433},
            {"name": "Kelapur", "latitude": 20.0211, "longitude": 78.5336},
            {"name": "Mahagaon", "latitude": 19.8336, "longitude": 77.7583},
            {"name": "Maregaon", "latitude": 20.1518, "longitude": 78.7945},
            {"name": "Ner", "latitude": 20.4906, "longitude": 77.8119},
            {"name": "Pusad", "latitude": 19.8858, "longitude": 77.4846},
            {"name": "Ralegaon", "latitude": 20.3278, "longitude": 78.6037},
            {"name": "Umarkhed", "latitude": 19.5982, "longitude": 77.9141},
            {"name": "Wani", "latitude": 20.0574, "longitude": 78.9565},
            {"name": "Yavatmal", "latitude": 20.3903, "longitude": 78.1329},
            {"name": "Zari Jamni", "latitude": 19.861, "longitude": 78.7277},
        ],
    },
}


DISTRICTS = []

for district_name, district_info in TEHSILS_BY_DISTRICT.items():
    DISTRICTS.append({
        "name": district_name,
        "state": STATE,
        "tehsils": district_info["tehsils"]
    })