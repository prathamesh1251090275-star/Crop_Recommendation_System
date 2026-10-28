"""
Regenerates the frontend data files from latur_crops.db:

  1. cropsData.js        -> bilingual catalog entries for ALL crops (with avg factors)
  2. regionalScores.js   -> per-district/per-tehsil suitability scores for ALL 30
                            scored crops (previously only 11 crops were exported,
                            which is why Raigad/Konkan crops like Mango, Cashew,
                            Coconut and Rice never showed up).

Run:
    python generate_frontend_data.py

Only ever reads the DB - never writes to it. Idempotent.
"""
import sqlite3
import json
import os
from urllib.parse import quote

DB_PATH = "latur_crops.db"
OUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "frontend", "frontend", "src", "data",
)

# ---------------------------------------------------------------------------
# Bilingual + presentation metadata for every crop (catalog / detail screen).
# agronomy ranges & economics are taken from the DB crops table, so this table
# only carries the human-facing text. Keys = DB crop_name.
# ---------------------------------------------------------------------------

MARKET_PRICES = {  # Rs/quintal typical modal mandi estimate (fallback where no MSP)
    "Sugarcane": 3000, "Pomegranate": 15000, "Mango": 9000, "Sapota": 5000,
    "Brinjal": 2500, "Papaya": 2500, "Coriander": 9000, "Tamarind": 7000,
    "Orange": 5500, "Mosambi (Sweet Lime)": 4500, "Linseed (Alsi)": 6500,
    "Grapes": 8000, "Banana": 3000, "Cashew": 18000, "Turmeric": 14000,
    "Custard Apple (Sitaphal)": 6000, "Strawberry": 15000, "Guava": 4500,
    "Ginger": 15000, "Garlic": 25000, "Tomato": 1100, "Onion": 1600,
    "Potato": 1300, "Chilli": 8000, "Bajra (Pearl Millet)": 2900, "Maize": 2410,
    "Sesame (Til)": 10346, "Rice (Paddy)": 2369, "Groundnut": 7263,
    "Lemon": 5500, "Fig (Anjeer)": 12000, "Jackfruit": 5000,
    "Amla (Aonla)": 9000, "Ber (Jujube)": 4000, "Cabbage": 1800,
    "Cauliflower": 2200, "Carrot": 3000, "Cucumber": 2000,
    "French Beans": 3500, "Peas (Matar)": 2800, "Capsicum (Shimla Mirch)": 8000,
    "Watermelon": 1800, "Muskmelon (Kharbooja)": 2000,
}

META = {
    "Soybean": dict(cat="oilseeds", icon="🌱", mr="सोयाबीन", en="Soybean",
        sow=("जून - जुलै", "June - July"), har=("ऑक्टोबर - नोव्हेंबर", "October - November"),
        peak=("ऑक्टोबर ते डिसेंबर", "October to December"),
        soil=("काळी व मध्यम काळी जमीन", "Black and Medium Black Loamy Soil"),
        water=("मध्यम (पावसावर आधारित)", "Moderate (Rainfed)"),
        seed=("25 - 30 किलो / एकर", "25 - 30 kg / Acre"),
        fert=("NPK (20:60:20 किलो/हेक्टर)", "NPK (20:60:20 kg/ha)"),
        tips=(["पहिल्या 25-30 दिवसात तण नियंत्रण अत्यंत आवश्यक.", "शेतात पाणी साचू देऊ नये.", "पेरणीपूर्वी ट्रायकोडर्माने बीजप्रक्रिया करा."],
              ["Weed control in the first 25-30 days is critical.", "Avoid water stagnation.", "Treat seeds with Trichoderma before sowing."]),
        adv=("सोयाबीन मराठवाड्यातील प्रमुख नगदी पीक आहे. कमी कालावधीत खात्रीशीर उत्पन्न मिळते.",
             "Soybean is a leading cash crop of Marathwada with reliable short-duration returns.")),
    "Jowar (Sorghum)": dict(cat="cereals", icon="🌾", mr="ज्वारी", en="Jowar (Sorghum)",
        sow=("सप्टेंबर - ऑक्टोबर (रब्बी)", "September - October (Rabi)"), har=("जानेवारी - फेब्रुवारी", "January - February"),
        peak=("फेब्रुवारी ते एप्रिल", "February to April"),
        soil=("मध्यम ते भारी काळी जमीन", "Medium to deep black soil"),
        water=("कमी (दुष्काळ सहन करणारे)", "Low (Drought tolerant)"),
        seed=("4 - 5 किलो / एकर", "4 - 5 kg / Acre"), fert=("NPK (80:40:40 किलो/हेक्टर)", "NPK (80:40:40 kg/ha)"),
        tips=(["कमी पाण्यातही उत्तम उत्पादन देते.", "जनावरांसाठी चांगला चारा मिळतो.", "खोडमाशी नियंत्रणासाठी वेळेवर पेरणी करा."],
              ["Gives good yield even with low water.", "Provides quality cattle fodder.", "Timely sowing prevents shoot fly."]),
        adv=("ज्वारी दुष्काळसहनशील असून धान्यासोबत पशुखाद्यही देते.",
             "Jowar is drought resilient and provides grain plus fodder.")),
    "Tur (Pigeonpea)": dict(cat="pulses", icon="🫘", mr="तूर", en="Tur (Pigeonpea)",
        sow=("जून - जुलै", "June - July"), har=("डिसेंबर - जानेवारी", "December - January"),
        peak=("जानेवारी ते मार्च", "January to March"),
        soil=("मध्यम ते भारी, उत्तम निचऱ्याची जमीन", "Medium to heavy well-drained soils"),
        water=("मध्यम", "Moderate"), seed=("5 - 6 किलो / एकर", "5 - 6 kg / Acre"),
        fert=("NPK (25:50:00 किलो/हेक्टर)", "NPK (25:50:00 kg/ha)"),
        tips=(["सोयाबीनमध्ये आंतरपीक म्हणून तूर घेणे फायदेशीर.", "फुलधारणेच्या वेळी पाण्याचा ताण पडू देऊ नका.", "मर रोगासाठी ट्रायकोडर्मा वापरा."],
              ["Intercrop with soybean for extra returns.", "Avoid moisture stress at flowering.", "Use Trichoderma against wilt."]),
        adv=("तूर मराठवाड्यातील प्रमुख कडधान्य असून हमीभाव खात्रीशीर आहे.",
             "Tur is a staple pulse of Marathwada with assured MSP.")),
    "Udid (Black Gram)": dict(cat="pulses", icon="🫘", mr="उडीद", en="Udid (Black Gram)",
        sow=("जून - जुलै", "June - July"), har=("ऑगस्ट - सप्टेंबर", "August - September"),
        peak=("सप्टेंबर ते नोव्हेंबर", "September to November"),
        soil=("मध्यम काळी व मुरमाड जमीन", "Medium black & laterite soils"),
        water=("कमी ते मध्यम", "Low to moderate"), seed=("8 - 10 किलो / एकर", "8 - 10 kg / Acre"),
        fert=("NPK (20:40:00 किलो/हेक्टर)", "NPK (20:40:00 kg/ha)"),
        tips=(["कमी कालावधीचे (75-80 दिवस) पीक.", "पावसाचा जोर जास्त असेल तर चढणीवर पेरणी करा.", "पिवळा मोझॅक रोगावर प्रतिकारक वाण निवडा."],
              ["Short duration crop (75-80 days).", "Sow on slopes if heavy rains expected.", "Use YMV resistant varieties."]),
        adv=("उडीद हे कमी कालावधीचे नगदी पीक असून त्वरित रोख उत्पन्न देते.",
             "Udid is a short-duration cash crop giving quick income.")),
    "Mung (Green Gram)": dict(cat="pulses", icon="🫘", mr="मूग", en="Mung (Green Gram)",
        sow=("जून - जुलै", "June - July"), har=("सप्टेंबर", "September"),
        peak=("सप्टेंबर ते नोव्हेंबर", "September to November"),
        soil=("हलकी ते मध्यम जमीन", "Light to medium soils"),
        water=("कमी (2 - 3 पाणी)", "Low (2-3 irrigations)"), seed=("8 - 10 किलो / एकर", "8 - 10 kg / Acre"),
        fert=("NPK (20:40:00 किलो/हेक्टर)", "NPK (20:40:00 kg/ha)"),
        tips=(["पदपथधारीत पिकांमध्ये आंतरपीक म्हणून उत्तम.", "कमी कालावधीमुळे जमीन लवकर मोकळी होते.", "रिंग स्पॉट व बुरशी रोगांवर देखरेख ठेवा."],
              ["Good as an intercrop in cotton/sugarcane rows.", "Frees land early due to short duration.", "Watch for ring spot and fungal diseases."]),
        adv=("मूग कमी कालावधीत काढून माती सुधारणारे पीक आहे.",
             "Mung improves soil while giving a quick harvest.")),
    "Cotton": dict(cat="cashcrops", icon="☁️", mr="कापूस", en="Cotton",
        sow=("जून - जुलै", "June - July"), har=("नोव्हेंबर - फेब्रुवारी", "November - February"),
        peak=("नोव्हेंबर ते जानेवारी", "November to January"),
        soil=("खोल ते मध्यम काळी जमीन", "Deep to medium black soils"),
        water=("मध्यम ते जास्त (ठिबक सिंचन उत्तम)", "Moderate to high (Drip ideal)"),
        seed=("2 - 3 किलो / एकर", "2 - 3 kg / Acre"), fert=("NPK (100:50:50 किलो/हेक्टर)", "NPK (100:50:50 kg/ha)"),
        tips=(["बोंडअळी व शोषक कीड नियंत्रणावर सतत लक्ष ठेवा.", "पाण्याचा निचरा चांगला ठेवा.", "पिंक बॉल वर्म प्रतिकारक वाण निवडा."],
              ["Monitor bollworm and sucking pests.", "Ensure good drainage.", "Choose pink bollworm tolerant hybrids."]),
        adv=("कापूस हे प्रमुख नगदी पीक असून हमीभावावर खात्रीशीर विक्री होते.",
             "Cotton is a major cash crop with assured MSP.")),
    "Wheat": dict(cat="cereals", icon="🌾", mr="गहू", en="Wheat",
        sow=("नोव्हेंबर", "November"), har=("मार्च - एप्रिल", "March - April"),
        peak=("मार्च ते मे", "March to May"),
        soil=("मध्यम ते भारी, निचरा होणारी जमीन", "Medium to heavy well-drained loam"),
        water=("मध्यम (4 - 5 पाणी)", "Moderate (4-5 irrigations)"), seed=("40 - 50 किलो / एकर", "40 - 50 kg / Acre"),
        fert=("NPK (120:60:40 किलो/हेक्टर)", "NPK (120:60:40 kg/ha)"),
        tips=(["मुकुट मुळे अवस्थेत (CRI) पहिले पाणी अत्यंत आवश्यक.", "21 नोव्हेंबरपर्यंत पेरणी पूर्ण करा.", "करपा प्रतिबंधासाठी योग्य वाण निवडा."],
              ["First irrigation at Crown Root Initiation is critical.", "Sow by late November.", "Select rust resistant varieties."]),
        adv=("सिंचनाची सोय असल्यास गहू खात्रीशीर अन्नधान्य व उत्पन्न देते.",
             "With irrigation assured, wheat is a reliable food + income crop.")),
    "Gram (Chana)": dict(cat="pulses", icon="🥣", mr="हरभरा", en="Gram (Chana)",
        sow=("ऑक्टोबर - नोव्हेंबर (रब्बी)", "October - November (Rabi)"), har=("फेब्रुवारी - मार्च", "February - March"),
        peak=("फेब्रुवारी ते मे", "February to May"),
        soil=("मध्यम ते भारी, निचरा होणारी जमीन", "Medium to heavy well-drained soil"),
        water=("कमी (2 - 3 पाणी)", "Low (2-3 irrigations)"), seed=("30 - 35 किलो / एकर", "30 - 35 kg / Acre"),
        fert=("NPK (20:40:00 किलो/हेक्टर)", "NPK (20:40:00 kg/ha)"),
        tips=(["सोयाबीन नंतर रब्बीत हरभरा उत्तम पर्याय.", "घाटे अळीसाठी कामगंध सापळे लावा.", "फुलोऱ्यात जास्त पाणी देऊ नका."],
              ["Great rabi follow-up after soybean.", "Use pheromone traps for pod borer.", "Avoid excess irrigation at flowering."]),
        adv=("हरभरा हमीभाव व बाजार मागणी असलेले स्थिर पीक आहे.",
             "Chana has stable MSP and market demand.")),
    "Safflower": dict(cat="oilseeds", icon="🌻", mr="करडई", en="Safflower",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("मार्च - एप्रिल", "March - April"),
        peak=("मार्च ते मे", "March to May"),
        soil=("हलकी ते मध्यम जमीन", "Light to medium soils"),
        water=("कमी (दुष्काळसहनशील)", "Low (drought tolerant)"), seed=("8 - 10 किलो / एकर", "8 - 10 kg / Acre"),
        fert=("NPK (40:30:00 किलो/हेक्टर)", "NPK (40:30:00 kg/ha)"),
        tips=(["कडक सूर्यप्रकाश व थंड हवामान उत्तम.", "कमी उपजाऊ जमिनीतही येते.", "हमीभावाचा लाभ घेता येतो."],
              ["Needs bright sun and cool climate.", "Grows in low fertility soils.", "MSP procurement available."]),
        adv=("करडई कमी पाण्यात येणारे तेलबिया पीक आहे.",
             "Safflower is a low-water oilseed crop.")),
    "Sunflower": dict(cat="oilseeds", icon="🌻", mr="सूर्यफूल", en="Sunflower",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("फेब्रुवारी - मार्च", "February - March"),
        peak=("मार्च ते एप्रिल", "March to April"),
        soil=("निचरा होणारी जिरायती जमीन", "Well-drained loam"),
        water=("मध्यम (3 - 4 पाणी)", "Moderate (3-4 irrigations)"), seed=("2 - 2.5 किलो / एकर", "2 - 2.5 kg / Acre"),
        fert=("NPK (60:40:40 किलो/हेक्टर)", "NPK (60:40:40 kg/ha)"),
        tips=(["खोलपर्यंत मुळे जाण्यासाठी जमीन भुसभुशीत ठेवा.", "तणनियंत्रण आवश्यक.", "बुरशीजन्य रोगांवर लक्ष ठेवा."],
              ["Keep soil friable for deep taproot.", "Control weeds early.", "Watch for fungal diseases."]),
        adv=("सूर्यफूल लवकर 90-100 दिवसांत तयार होणारे तेलबिया पीक आहे.",
             "Sunflower matures in ~90-100 days for quick returns.")),
    "Sugarcane": dict(cat="cashcrops", icon="🎋", mr="ऊस", en="Sugarcane",
        sow=("डिसेंबर - फेब्रुवारी (साळी) / जून - जुलै (पेरणी)", "Dec-Feb (Adsali) / Jun-Jul (Suru)"),
        har=("14 - 18 महिन्यांनंतर", "After 14-18 months"),
        peak=("ऑक्टोबर ते मे", "October to May"),
        soil=("खोल काळी, मध्यम मुरमाड, धारण क्षमता असलेली", "Deep black / medium with water holding capacity"),
        water=("जास्त (नियमित सिंचन)", "High (regular irrigation)"),
        seed=("100 - 125 किलो / एकर (खोडकंड)", "100 - 125 kg / Acre (setts)"),
        fert=("NPK (250:115:115 किलो/हेक्टर)", "NPK (250:115:115 kg/ha)"),
        tips=(["साखर कारखान्याजवळील भागातच ऊस लागवड फायदेशीर.", "ठिबक सिंचनाने खर्च व पाणी वाचते.", "खोडकंड बीजप्रक्रिया करा."],
              ["Grow near sugar mills for best economics.", "Drip irrigation saves water & cost.", "Treat setts before planting."]),
        adv=("ऊस दीर्घ कालावधीचे पीक असून साखर कारखान्यांकडून खात्रीशीर खरेदी होते.",
             "Sugarcane is a long-duration crop with assured mill procurement.")),
    "Pomegranate": dict(cat="fruits", icon="🔴", mr="डाळिंब", en="Pomegranate",
        sow=("जून - जुलै (मुख्य), फेब्रुवारी - मार्च (हस्तबहार)", "Jun-Jul (main), Feb-Mar (hasta bahar)"),
        har=("लागवडीनंतर 2.5 वर्षांनी आणि वर्षातून 2 हार", "From 2.5 yrs, 2 bahars/year"),
        peak=("दिवाळी व उन्हाळी हार", "Diwali & summer bahars"),
        soil=("निचरा होणारी काळी ते मध्यम, pH 6.5-7.5", "Well-drained, pH 6.5-7.5"),
        water=("मध्यम (ठिबक सिंचन 8-10 दिवसांनी)", "Moderate (drip every 8-10 days)"),
        seed=("400 - 450 रोपे / एकर", "400 - 450 plants / Acre"),
        fert=("NPK (600:400:300 ग्रॅम/झाड/वर्ष)", "NPK (600:400:300 g/tree/yr)"),
        tips=(["फळधारणेच्या वेळी पाण्याचा ताण पडू देऊ नका.", "काळवीट रोगासाठी बुरशीनाशक फवारणी करा.", "ठिबक सिंचनासह सालाभरणी महत्त्वाची."],
              ["Avoid water stress during fruiting.", "Spray fungicide for wilt/anthracnose.", "Combine drip with basin mulching."]),
        adv=("डाळिंब मराठवाड्याचे हस्तबहार नगदी पीक असून निर्यातीला मागणी आहे.",
             "Pomegranate is Marathwada's signature cash fruit with export demand.")),
    "Mango": dict(cat="fruits", icon="🥭", mr="आंबा", en="Mango",
        sow=("जून - ऑगस्ट", "June - August"), har=("मार्च - जून (हापूस एप्रिल-जून)", "March - June (Alphonso Apr-Jun)"),
        peak=("एप्रिल ते जून", "April to June"),
        soil=("खोल, निचरा होणारी जमीन, pH 5.5-7.5", "Deep well-drained soil, pH 5.5-7.5"),
        water=("फुलोऱ्यापूर्वी कमी, फळधारणेत नियमित", "Low before flowering, regular at fruit set"),
        seed=("60 - 70 रोपे / एकर", "60 - 70 plants / Acre"),
        fert=("NPK (1200:600:600 ग्रॅम/झाड/वर्ष वाढत्या वयानुसार)", "NPK (1200:600:600 g/tree/yr, age-scaled)"),
        tips=(["कोकणातील लालमुरमाड जमीन हापूससाठी उत्तम.", "फुलोऱ्याच्या वेळी फवारणी व पाणी व्यवस्थापन करा.", "मेलीगोन रोगावर वेळेवर उपाय करा."],
              ["Konkan red/medium soil suits Alphonso.", "Manage sprays & water at flowering.", "Control mealy bug early."]),
        adv=("आंबा कोकण, सिंधुदुर्ग-रत्नागिरी-रायगडचा सर्वात लोकप्रिय बहुवर्षीय पीक असून हापूस आंबा निर्यात होतो.",
             "Mango is Konkan's flagship perennial crop; Alphonso is exported worldwide.")),
    "Sapota": dict(cat="fruits", icon="🍐", mr="चिकू", en="Sapota",
        sow=("जून - ऑगस्ट", "June - August"), har=("वर्षातून दोन हार (सप्टेंबर-नोव्हेंबर, फेब्रुवारी-मे)", "Two crops (Sep-Nov, Feb-May)"),
        peak=("फेब्रुवारी ते मे", "February to May"),
        soil=("खोल, धारण क्षमता असलेली जमीन", "Deep water-retentive soils"),
        water=("मध्यम (ठिबक सिंचन)", "Moderate (drip)"),
        seed=("80 - 90 रोपे / एकर", "80 - 90 plants / Acre"),
        fert=("NPK (800:400:400 ग्रॅम/झाड/वर्ष)", "NPK (800:400:400 g/tree/yr)"),
        tips=(["नियमित आधार देणे (स्टेकिंग) आवश्यक.", "फळे काढणीनंतर ग्रेडिंग करा.", "कायफळ दंश (पूंजी) रोगावर उपाय करा."],
              ["Stake young trees.", "Grade fruit after harvest.", "Manage fruit borer."]),
        adv=("चिकू द्विहारी उत्पादन देणारे बहुवर्षीय फळबाग पीक आहे.",
             "Sapota yields twice a year as a perennial orchard crop.")),
    "Brinjal": dict(cat="vegetables", icon="🍆", mr="वांगी", en="Brinjal (Eggplant)",
        sow=("जून - जुलै / ऑक्टोबर - नोव्हेंबर", "Jun-Jul / Oct-Nov"),
        har=("लागवडीनंतर 70-90 दिवसांनी नियमित तोडणी", "Regular picking 70-90 days after planting"),
        peak=("तोडणी सुरू झाल्यावर वर्षभर", "Year-round after start"),
        soil=("सुपीक, निचरा होणारी गाळ-पोयटा जमीन", "Fertile well-drained loam"),
        water=("मध्यम नियमित", "Moderate regular"), seed=("150 - 200 ग्रॅम / एकर (रोपवाटिका)", "150 - 200 g / Acre (nursery)"),
        fert=("NPK (120:60:60 किलो/हेक्टर)", "NPK (120:60:60 kg/ha)"),
        tips=(["फळ पोखरणाऱ्या अळीवर नियमित उपाय करा.", "काढणीनंतर त्वरित बाजारात पाठवा.", "प्रतिकारक वाण निवडा."],
              ["Control fruit borer regularly.", "Send to market immediately after harvest.", "Pick tolerant varieties."]),
        adv=("वांगी भाजीपाला पिकांत नियमित उत्पन्न देणारे पीक आहे.",
             "Brinjal is a vegetable crop offering regular income.")),
    "Tomato": dict(cat="vegetables", icon="🍅", mr="टोमॅटो", en="Tomato",
        sow=("ऑगस्ट - सप्टेंबर किंवा जानेवारी", "August - September or January"),
        har=("लागवडीनंतर 70-90 दिवसांनी", "70-90 days after planting"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("सुपीक, निचरा होणारी काळी जमीन", "Fertile well-drained loam"),
        water=("नियमित (ठिबक सिंचन)", "Regular via drip"), seed=("100 - 150 ग्रॅम / एकर", "100 - 150 g / Acre"),
        fert=("NPK (150:100:100 किलो/हेक्टर)", "NPK (150:100:100 kg/ha)"),
        tips=(["स्टेकिंगने फळाचा दर्जा सुधारतो.", "नागअळी व फळ अळीवर लक्ष ठेवा.", "गरम हवामानात आच्छादन करा."],
              ["Staking improves fruit quality.", "Control leaf miner & fruit borer.", "Mulch in hot weather."]),
        adv=("टोमॅटो चांगल्या बाजारभावात उच्च नफा देणारे पीक आहे.",
             "Tomato gives high returns when market rates are good.")),
    "Onion": dict(cat="vegetables", icon="🧅", mr="कांदा", en="Onion",
        sow=("रोपवाटिका सप्टेंबर, लागवड नोव्हेंबर-डिसेंबर", "Nursery Sep, planted Nov-Dec"),
        har=("मार्च - एप्रिल", "March - April"), peak=("एप्रिल ते जून", "April to June"),
        soil=("मध्यम काळी व पोयट्याची जमीन", "Medium black & sandy loam"),
        water=("नियमित हलके पाणी", "Frequent light irrigation"),
        seed=("2 - 3 किलो / एकर (रोपवाटिका)", "2 - 3 kg / Acre (nursery)"),
        fert=("NPK (100:50:50) + गंधक", "NPK (100:50:50) + Sulphur"),
        tips=(["सल्फर दिल्यास चव व साठवण सुधारते.", "काढणीपूर्वी 10-15 दिवस पाणी थांबवा.", "कांदा साठवणीचा योग्य व्यवस्थापन करा."],
              ["Sulphur improves pungency & storage.", "Stop watering 10-15 days pre-harvest.", "Manage storage well."]),
        adv=("कांदा हे नगदी पीक असून लातूर-नाशिक बाजारांना मोठी मागणी आहे.",
             "Onion is a cash crop with strong Nashik/Latur market demand.")),
    "Papaya": dict(cat="fruits", icon="🍈", mr="पपई", en="Papaya",
        sow=("फेब्रुवारी - मार्च / ऑक्टोबर - नोव्हेंबर", "Feb-Mar / Oct-Nov"),
        har=("लागवडीनंतर 10-12 महिन्यांनी", "10-12 months after planting"),
        peak=("वर्षभर (द्विहारी)", "Year-round"),
        soil=("सुपीक, निचरा होणारी जमीन", "Fertile well-drained soil"),
        water=("नियमित (ठिबक सिंचन)", "Regular (drip)"),
        seed=("450 - 500 रोपे / एकर", "450 - 500 plants / Acre"),
        fert=("NPK (400:200:200 ग्रॅम/झाड/वर्ष)", "NPK (400:200:200 g/tree/yr)"),
        tips=(["कागदी पिशवीने फळे सुरक्षित करा.", "मोझॅक विषाणू प्रतिकारक वाण निवडा.", "पानांचे नियमित निरीक्षण करा."],
              ["Bag fruits to protect from pests.", "Choose mosaic resistant varieties.", "Inspect foliage regularly."]),
        adv=("पपई लवकर (10-12 महिन्यांत) उत्पादन देणारे पीक आहे.",
             "Papaya fruits quickly (10-12 months).")),
    "Coriander": dict(cat="vegetables", icon="🌿", mr="कोथिंबीर", en="Coriander",
        sow=("ऑक्टोबर - नोव्हेंबर (धणे)", "October - November (seed crop)"),
        har=("रोपवाटिका 30-40 दिवसांनी, धणे 90-100 दिवसांत", "Leaves in 30-40 days, seed in 90-100"),
        peak=("नोव्हेंबर ते मार्च", "November to March"),
        soil=("हलकी ते मध्यम जमीन", "Light to medium soils"),
        water=("नियमित हलके पाणी", "Regular light irrigation"),
        seed=("10 - 12 किलो / एकर", "10 - 12 kg / Acre"),
        fert=("NPK (40:30:20 किलो/हेक्टर)", "NPK (40:30:20 kg/ha)"),
        tips=(["शेतात पाणी साचू देऊ नका.", "रोपे 6-8 इंच झाल्यावर तोडणी करा.", "कडुनिंब तेलाने कीड नियंत्रण."],
              ["Avoid waterlogging.", "Harvest leaves when 6-8 inches.", "Use neem oil for pest control."]),
        adv=("कोथिंबीर कमी कालावधीत (30-40 दिवसांत भाजी) उत्पन्न देते.",
             "Coriander gives leafy produce in just 30-40 days.")),
    "Tamarind": dict(cat="fruits", icon="🌳", mr="चिंच", en="Tamarind",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 4-6 वर्षांनी", "From 4-6 years after planting"),
        peak=("फेब्रुवारी ते मे", "February to May"),
        soil=("व्यापक श्रेणी, खडकाळ जमिनीतही", "Wide range, even rocky soils"),
        water=("अत्यंत कमी (बहुवर्षीय)", "Very low (perennial)"),
        seed=("40 - 50 रोपे / एकर", "40 - 50 plants / Acre"),
        fert=("कंपोस्ट 10 किलो/झाड/वर्ष", "Compost 10 kg/tree/yr"),
        tips=(["दुष्काळसहिष्णू, मोकळ्या जागेत निसर्गतः वाढते.", "मीठ-बोर कलम वापरून लवकर उत्पादन.", "बोरफुट नियंत्रण करा."],
              ["Drought hardy; grows naturally in open land.", "Graft salt-tolerant types for early fruiting.", "Manage pod borers."]),
        adv=("चिंच अत्यंत दुष्काळसहनशील बहुवर्षीय पीक आहे.",
             "Tamarind is a highly drought-tolerant perennial.")),
    "Orange": dict(cat="fruits", icon="🍊", mr="संत्री", en="Orange (Nagpur)",
        sow=("जुलै - ऑगस्ट (हस्तबहार)", "July - August (mrig bahar)"),
        har=("लागवडीनंतर 3 वर्षांनी, नोव्हेंबर - जानेवारी", "From 3 years, November - January"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("जिरायती, निचरा होणारी, pH 5.5-7.5", "Well-drained loam, pH 5.5-7.5"),
        water=("हस्तबहारात नियमित, उन्हाळीत कमी", "Regular in mrig bahar, less in summer"),
        seed=("80 - 100 रोपे / एकर", "80 - 100 plants / Acre"),
        fert=("NPK (600:300:300 ग्रॅम/झाड/वर्ष)", "NPK (600:300:300 g/tree/yr)"),
        tips=(["नागपूर-विदर्भ संत्रा रसाळ व गोड असतो.", "ट्रिस्टेझा विषाणूवर योग्य आधार रोपे.", "ठिबक सिंचन फायदेशीर."],
              ["Nagpur oranges are juicy & sweet.", "Use certified virus-free plants.", "Drip irrigation pays off."]),
        adv=("संत्रा हे विदर्भातील प्रसिद्ध बहुवर्षीय फळ पीक आहे.",
             "Orange is Vidarbha's famous perennial fruit crop.")),
    "Rice (Paddy)": dict(cat="cereals", icon="🌾", mr="भात (धान)", en="Rice (Paddy)",
        sow=("जून - जुलै (खरीप)", "June - July (Kharif)"),
        har=("ऑक्टोबर - नोव्हेंबर", "October - November"),
        peak=("ऑक्टोबर ते डिसेंबर", "October to December"),
        soil=("चिकणमाती, पाणी धारण करणारी जमीन", "Clay-loam, water-retentive soils"),
        water=("जास्त (उभे पाणी 2-3 दिवस nested)", "High (standing water)"),
        seed=("20 - 25 किलो / एकर (रोपवाटिका)", "20 - 25 kg / Acre (nursery)"),
        fert=("NPK (100:50:50 किलो/हेक्टर) + जस्त", "NPK (100:50:50 kg/ha) + Zinc"),
        tips=(["भाताला भरपूर पाणी व खोल चिकणमाती लागते.", "कोकण व विदर्भाच्या जोरदार पावसाच्या भागात उत्तम.", "जास्त पाण्याची सोय नसेल तर योग्यता कमी."],
              ["Rice needs abundant water & clay soil.", "Best in high-rainfall Konkan/Vidarbha belts.", "Low suitability where irrigation is scarce."]),
        adv=("भात (धान) कोकण, रत्नागिरी-रायगड-सिंधुदुर्ग येथील मुख्य पीक असून मराठवाड्यासारख्या कमी पावसाच्या भागात सिंचनाशिवाय योग्यता कमी आहे.",
             "Paddy is Konkan's staple crop; in low-rainfall Marathwada it needs irrigation to be viable.")),
    "Groundnut": dict(cat="oilseeds", icon="🥜", mr="भुईमूग", en="Groundnut",
        sow=("खरीप जून - जुलै; उन्हाळी जानेवारी - फेब्रुवारी", "Kharif Jun-Jul; Summer Jan-Feb"),
        har=("115 - 130 दिवसांत", "In 115-130 days"),
        peak=("ऑक्टोबर ते नोव्हेंबर", "October to November"),
        soil=("हलकी रेती, मुरमाड जमीन", "Sandy-loam & friable soils"),
        water=("मध्यम (पाणी साचणे टाळा)", "Moderate (avoid stagnation)"),
        seed=("35 - 40 किलो / एकर", "35 - 40 kg / Acre"),
        fert=("NPK (20:60:40 किलो/हेक्टर) + जिप्सम", "NPK (20:60:40 kg/ha) + Gypsum"),
        tips=(["शेंगा भरण्यासाठी जिप्सम उपयुक्त.", "पाणी साचल्यास कुजणे येते.", "फोरलीफ़ रोगावर नियंत्रण ठेवा."],
              ["Gypsum boosts pod filling.", "Avoid waterlogging to prevent rot.", "Control leaf spot diseases."]),
        adv=("भुईमूग जिरायती भागांसाठी महत्त्वाचे तेलबिया पीक आहे.",
             "Groundnut is a key oilseed for rainfed regions.")),
    "Linseed (Alsi)": dict(cat="oilseeds", icon="🌸", mr="जवस (अळशी)", en="Linseed (Alsi)",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("मार्च - एप्रिल", "March - April"),
        peak=("मार्च ते एप्रिल", "March to April"),
        soil=("हलकी ते मध्यम जमीन", "Light to medium soils"),
        water=("कमी", "Low"), seed=("20 - 25 किलो / एकर", "20 - 25 kg / Acre"),
        fert=("NPK (40:30:20 किलो/हेक्टर)", "NPK (40:30:20 kg/ha)"),
        tips=(["थंड हवामान उत्तम.", "रब्बीत कमी पाण्यात येते.", "गंज रोगावर लक्ष ठेवा."],
              ["Needs cool climate.", "Grows with low water in rabi.", "Watch for rust."]),
        adv=("जवस कमी खर्चातील रब्बी तेलबिया पीक आहे.",
             "Linseed is a low-cost rabi oilseed.")),
    "Grapes": dict(cat="fruits", icon="🍇", mr="द्राक्षे", en="Grapes",
        sow=("डिसेंबर - जानेवारी (रोपे)", "December - January (vines)"),
        har=("फेब्रुवारी - एप्रिल (हार)", "February - April (crop)"),
        peak=("मार्च ते मे", "March to May"),
        soil=("मुरमाड, निचरा होणारी जमीन", "Friable well-drained soils"),
        water=("ठिबक सिंचन, नियंत्रित", "Controlled drip"),
        seed=("550 - 600 वेल / एकर", "550 - 600 vines / Acre"),
        fert=("NPK (250:150:250 किलो/हेक्टर)", "NPK (250:150:250 kg/ha)"),
        tips=(["नाशिकचा कोरडा उन्हाळा द्राक्षांसाठी उत्तम.", "जास्त पाऊस बुरशी रोग आणतो.", "छाटणी (मीठहार) काळ योग्य ठेवा."],
              ["Nashik's dry summer suits grapes.", "Excess rain promotes fungus.", "Time the pruning (bahar) correctly."]),
        adv=("द्राक्षे नाशिकचे प्रसिद्ध पीक असून निर्यातक्षम आहेत.",
             "Grapes are Nashik's flagship export crop.")),
    "Banana": dict(cat="fruits", icon="🍌", mr="केळी", en="Banana",
        sow=("जून - जुलै व सप्टेंबर - ऑक्टोबर", "Jun-Jul and Sep-Oct"),
        har=("11 - 14 महिन्यांत", "In 11-14 months"),
        peak=("वर्षभर", "Year-round"),
        soil=("खोल, धारण क्षमता असलेली गाळ-चिकणमाती", "Deep loam with moisture retention"),
        water=("जास्त नियमित (ठिबक)", "High regular (drip)"),
        seed=("800 - 900 रोपे / एकर", "800 - 900 plants / Acre"),
        fert=("NPK (300:115:330 ग्रॅम/रोप/वर्ष)", "NPK (300:115:330 g/plant/yr)"),
        tips=(["जळगाव हे केळी उत्पादनाचे प्रमुख केंद्र.", "दोन नजर (लुक) ठेवण्यासाठी क्वार्टर रोपे वापरा.", "सिगाटोका रोगावर फवारणी करा."],
              ["Jalgaon is the major banana hub.", "Use quarter plants for consistent bunches.", "Spray against sigatoka."]),
        adv=("केळी जळगाव-नाशिकचे वर्षभर उत्पादन देणारे पीक आहे.",
             "Banana gives year-round returns in Jalgaon/Nashik.")),
    "Cashew": dict(cat="fruits", icon="🥜", mr="काजू", en="Cashew",
        sow=("जून - सप्टेंबर", "June - September"), har=("जानेवारी - मे", "January - May"),
        peak=("फेब्रुवारी ते एप्रिल", "February to April"),
        soil=("हलकी मुरमाड, मध्यम जमीन", "Light/medium well-drained soils"),
        water=("खरीप पावसावर आधारित", "Rainfed (konkan)"),
        seed=("80 - 100 रोपे / एकर", "80 - 100 plants / Acre"),
        fert=("कंपोस्ट + NPK (500:250:250 ग्रॅम/झाड)", "Compost + NPK (500:250:250 g/tree)"),
        tips=(["काजूला भरपूर पाऊस (1000+ मिमी) लागतो.", "कोकणचा जोरदार पाऊस काजूसाठी उत्तम.", "काजू (आवका) फळ व बियाणे दोन्ही उपयुक्त."],
              ["Cashew needs high rainfall (1000+ mm).", "Konkan's heavy monsoon suits cashew.", "Both cashew apple & nut are valuable."]),
        adv=("काजू हे कोकण, रायगड-रत्नागिरी-सिंधुदुर्ग-पालघरचे प्रमुख बहुवर्षीय पीक असून निर्यातक्षम आहे.",
             "Cashew is Konkan's leading perennial crop (Raigad-Ratnagiri-Sindhudurg-Palghar) with export value.")),
    "Coconut (Copra)": dict(cat="fruits", icon="🥥", mr="नारळ", en="Coconut (Copra)",
        sow=("वर्षभर (जून - ऑगस्ट उत्तम)", "Year-round (best Jun-Aug)"),
        har=("लागवडीनंतर 5 वर्षांनी, वर्षातून 6-8 वेळा", "From 5 yrs, 6-8 pickings/yr"),
        peak=("वर्षभर", "Year-round"),
        soil=("वालुकामय, निचरा होणारी जमीन", "Sandy, well-drained coastal soils"),
        water=("जास्त (दर 4-6 दिवसांनी)", "High (every 4-6 days)"),
        seed=("70 - 80 रोपे / एकर (ड्वार्फ हायब्रीड 100+)", "70 - 80 / Acre (dwarf hybrids 100+)"),
        fert=("NPK (500:320:1200 ग्रॅम/झाड/वर्ष)", "NPK (500:320:1200 g/tree/yr)"),
        tips=(["समुद्रकिनारी व कोकणच्या जमिनीत उत्तम.", "नारळाला हमीभाव आहे.", "रोगग्रस्त रोपे न वापरता सकस रोपे लावा."],
              ["Thrives in coastal & Konkan soils.", "Copra has MSP.", "Use disease-free tall/dwarf hybrids."]),
        adv=("नारळ हे कोकणपट्टीचे बहुवर्षीय पीक असून खोबरे व नारळपाणी यांना मागणी आहे.",
             "Coconut is a Konkan perennial; copra & tender coconut have strong demand.")),
    "Turmeric": dict(cat="cashcrops", icon="🟡", mr="हळद", en="Turmeric",
        sow=("मे - जून", "May - June"), har=("जानेवारी - फेब्रुवारी (8-9 महिने)", "January - February (8-9 months)"),
        peak=("फेब्रुवारी ते एप्रिल", "February to April"),
        soil=("जिरायती, निचरा होणारी जमीन", "Well-drained loam"),
        water=("मध्यम ते जास्त", "Moderate to high"),
        seed=("800 - 1000 किलो / एकर (खोडकंड)", "800 - 1000 kg / Acre (rhizomes)"),
        fert=("NPK (60:75:120 किलो/हेक्टर) + गोबर", "NPK (60:75:120 kg/ha) + FYM"),
        tips=(["सांगली हे हळद उत्पादनाचे प्रसिद्ध केंद्र.", "तांबेर (उकळी) रोगावर उपाय करा.", "सावलीत वाळवून रंग गडद ठेवा."],
              ["Sangli is the famous turmeric hub.", "Manage rhizome rot disease.", "Dry in shade for better colour."]),
        adv=("हळद हे सांगली परिसरातील प्रमुख पीक असून उत्पन्न खात्रीशीर आहे.",
             "Turmeric is Sangli's signature crop with reliable returns.")),
    "Mosambi (Sweet Lime)": dict(cat="fruits", icon="🍊", mr="मोसंबी", en="Mosambi (Sweet Lime)",
        sow=("जुलै - ऑगस्ट", "July - August"), har=("लागवडीनंतर 3 वर्षांनी, वर्षातून 2 हार", "From 3 yrs, 2 crops/yr"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("हलकी ते मध्यम, निचरा होणारी", "Light/medium well-drained"),
        water=("நियमित ठिबक", "Regular drip"),
        seed=("80 - 100 रोपे / एकर", "80 - 100 plants / Acre"),
        fert=("NPK (600:300:300 ग्रॅम/झाड/वर्ष)", "NPK (600:300:300 g/tree/yr)"),
        tips=(["अहमदपूर-लातूर व मराठवाडा परिसर मोसंबीसाठी प्रसिद्ध.", "रसशोषक असणाऱ्या खोडावर बांधणी करा.", "काळीवट मर येऊ नये म्हणून निचरा."],
              ["Ahmedpur-Latur belt is famous for mosambi.", "Girdling helps juice content.", "Ensure drainage to avoid wilt."]),
        adv=("मोसंबी मराठवाड्यातील (विशेषतः अहमदपूर-लातूर) महत्त्वाचे बहुवर्षीय फळ पीक आहे.",
             "Mosambi is a key perennial fruit of Marathwada (Ahmedpur-Latur belt).")),
    "Custard Apple (Sitaphal)": dict(cat="fruits", icon="🍏", mr="सिताफळ", en="Custard Apple (Sitaphal)",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 3 वर्षांनी (ऑगस्ट - नोव्हेंबर)", "From 3 yrs (August - November)"),
        peak=("ऑक्टोबर ते नोव्हेंबर", "October to November"),
        soil=("खडकाळ, पाण्याशिवाय जमीनही चालते", "Even rocky, waterless land"),
        water=("अत्यंत कमी (दुष्काळसहनशील)", "Very low (drought hardy)"),
        seed=("60 - 70 रोपे / एकर", "60 - 70 plants / Acre"),
        fert=("कंपोस्ट 5 - 10 किलो/झाड", "Compost 5-10 kg/tree"),
        tips=(["बीड GI सिताफळ विशेष प्रसिद्ध.", "पाणी कमी लागते, कोरडवाहू शेतीत येते.", "फळ पोखरणाऱ्या अळीवर लक्ष."],
              ["Beed's GI sitaphal is famous.", "Needs little water; grows rainfed.", "Control fruit borer."]),
        adv=("सिताफळ दुष्काळसहनशील बहुवर्षीय पीक असून बीड गिरीचे उत्पादन प्रसिद्ध आहे.",
             "Custard apple is drought hardy; Beed's GI sitaphal is renowned.")),
    "Strawberry": dict(cat="fruits", icon="🍓", mr="स्ट्रॉबेरी", en="Strawberry",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("नोव्हेंबर - मार्च", "November - March"),
        peak=("नोव्हेंबर ते मार्च", "November to March"),
        soil=("भुसभुशीत, सेंद्रिय रसायनी जमीन", "Friable rich loam"),
        water=("ठिबक सिंचन", "Drip irrigation"),
        seed=("12,000 - 15,000 रोपे / एकर", "12,000 - 15,000 plants / Acre"),
        fert=("NPK (150:100:100 किलो/हेक्टर) + पालापाचोळा", "NPK (150:100:100 kg/ha) + mulch"),
        tips=(["महाबळेश्वर-सातारा थंड हवामान आवश्यक.", "मल्चिंगने फळ स्वच्छ राहते.", "रोपे लवकर बदलावीत."],
              ["Needs cool Mahabaleshwar climate.", "Mulching keeps fruit clean.", "Replace plants frequently."]),
        adv=("स्ट्रॉबेरी थंड हवामानातील (महाबळेश्वर) उच्च मूल्य पीक आहे.",
             "Strawberry is a high-value cool-climate (Mahabaleshwar) crop.")),
    "Guava": dict(cat="fruits", icon="🍏", mr="पेरू", en="Guava",
        sow=("जून - ऑगस्ट", "June - August"), har=("वर्षातून 2 हार (ऑगस्ट - सप्टेंबर, डिसेंबर - एप्रिल)", "2 crops/yr (Aug-Sep, Dec-Apr)"),
        peak=("डिसेंबर ते एप्रिल", "December to April"),
        soil=("व्यापक श्रेणीची जमीन", "Wide soil range"),
        water=("कमी ते मध्यम", "Low to moderate"),
        seed=("80 - 90 रोपे / एकर", "80 - 90 plants / Acre"),
        fert=("NPK (500:250:250 ग्रॅम/झाड/वर्ष)", "NPK (500:250:250 g/tree/yr)"),
        tips=(["पेरू जवळपास सर्व जमिनीत येतो.", "फळ माशीवर उपाय करा.", "नियमित छाटणी करा."],
              ["Guava grows in almost any soil.", "Control fruit fly.", "Prune regularly."]),
        adv=("पेरू सर्वसमावेशक व कमी देखभालीचे बहुवर्षीय पीक आहे.",
             "Guava is a low-maintenance perennial for any farm.")),
    "Bajra (Pearl Millet)": dict(cat="cereals", icon="🌾", mr="बाजरी", en="Bajra (Pearl Millet)",
        sow=("जून - जुलै", "June - July"), har=("सप्टेंबर - ऑक्टोबर", "September - October"),
        peak=("ऑक्टोबर ते नोव्हेंबर", "October to November"),
        soil=("हलकी रेती, मुरमाड जमीन", "Sandy & light soils"),
        water=("अत्यंत कमी (कोरडवाहू)", "Very low (rainfed)"),
        seed=("2 - 2.5 किलो / एकर", "2 - 2.5 kg / Acre"),
        fert=("NPK (40:20:20 किलो/हेक्टर)", "NPK (40:20:20 kg/ha)"),
        tips=(["बाजरी अत्यंत दुष्काळसहनशील.", "खोडमाशी नियंत्रणासाठी योग्य वेळी पेरणी.", "धान्य व चारा दोन्ही मिळतो."],
              ["Bajra is extremely drought tolerant.", "Timely sowing avoids shoot fly.", "Gives grain plus fodder."]),
        adv=("बाजरी कोरडवाहू भागांसाठी सर्वात सुरक्षित धान्य पीक आहे.",
             "Bajra is the safest grain for dry rainfed areas.")),
    "Maize": dict(cat="cereals", icon="🌽", mr="मका", en="Maize",
        sow=("जून - जुलै किंवा ऑक्टोबर", "June - July or October"),
        har=("100 - 115 दिवसांत", "In 100-115 days"),
        peak=("ऑक्टोबर ते डिसेंबर", "October to December"),
        soil=("मध्यम ते खोल काळी, सुपीक जमीन", "Fertile loamy black soil"),
        water=("मध्यम", "Moderate"), seed=("7 - 8 किलो / एकर", "7 - 8 kg / Acre"),
        fert=("NPK (120:60:40 किलो/हेक्टर)", "NPK (120:60:40 kg/ha)"),
        tips=(["लष्करी अळीवर सुरुवातीपासून लक्ष.", "कणीस भरताना पाणी वेळेत द्या.", "पोल्ट्री/स्टार्च उद्योगाला मागणी."],
              ["Scout early for fall armyworm.", "Irrigate at cob filling.", "Strong poultry/starch demand."]),
        adv=("मका पोल्ट्री व स्टार्च उद्योगासाठी मोठी मागणी असलेले पीक आहे.",
             "Maize has strong demand from poultry & starch industries.")),
    "Sesame (Til)": dict(cat="oilseeds", icon="🌼", mr="तीळ", en="Sesame (Til)",
        sow=("जून - जुलै", "June - July"), har=("सप्टेंबर - ऑक्टोबर", "September - October"),
        peak=("ऑक्टोबर ते नोव्हेंबर", "October to November"),
        soil=("हलकी ते मध्यम जमीन", "Light to medium soils"),
        water=("कमी", "Low"), seed=("2 - 2.5 किलो / एकर", "2 - 2.5 kg / Acre"),
        fert=("NPK (40:20:20 किलो/हेक्टर)", "NPK (40:20:20 kg/ha)"),
        tips=(["तीळाला हमीभाव व निर्यात मागणी आहे.", "जास्त पाऊस टाळावा.", "करपा रोगावर उपाय."],
              ["Til has MSP & export demand.", "Avoid heavy rain.", "Manage blight."]),
        adv=("तीळ कमी कालावधीचे नगदी तेलबिया पीक आहे.",
             "Sesame is a short-duration cash oilseed.")),
    "Potato": dict(cat="vegetables", icon="🥔", mr="बटाटा", en="Potato",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("जानेवारी - फेब्रुवारी", "January - February"),
        peak=("फेब्रुवारी ते एप्रिल", "February to April"),
        soil=("भुसभुशीत, वाळूमिश्रित पोयटा", "Loose friable sandy loam"),
        water=("नियमित हलके पाणी", "Regular light watering"),
        seed=("6 - 8 क्विंटल / एकर", "6 - 8 Quintals / Acre"),
        fert=("NPK (120:60:120 किलो/हेक्टर)", "NPK (120:60:120 kg/ha)"),
        tips=(["थंड रात्री व भुसभुशीत जमीन आवश्यक.", "करपा रोगावर बुरशीनाशक.", "गड्ड्यांवर भर देऊन आकार वाढवा."],
              ["Needs cool nights & aerated soil.", "Spray against blight.", "Earth up for bigger tubers."]),
        adv=("बटाटा रब्बीतील थंड हवामानात येणारे भाजीपाला पीक आहे.",
             "Potato is a rabi vegetable for cool regions.")),
    "Ginger": dict(cat="cashcrops", icon="🫚", mr="आले", en="Ginger",
        sow=("मे - जून", "May - June"), har=("जानेवारी - फेब्रुवारी (7-8 महिने)", "January - February (7-8 months)"),
        peak=("जानेवारी ते मार्च", "January to March"),
        soil=("सुपीक, निचरा होणारी जमीन", "Fertile well-drained loam"),
        water=("नियमित (छाटलेल्या ठिबक)", "Regular (drip)"),
        seed=("800 - 1000 किलो / एकर", "800 - 1000 kg / Acre"),
        fert=("NPK (75:50:75 किलो/हेक्टर) + गोबर", "NPK (75:50:75 kg/ha) + FYM"),
        tips=(["आल्याला सावली आवडते, आंतरपीक चालते.", "मुळकुजण्यावर उपाय.", "ताज्या आल्याला रोजची मागणी."],
              ["Ginger prefers shade; good as intercrop.", "Manage rhizome rot.", "Fresh ginger has daily demand."]),
        adv=("आले उच्च मूल्याचे पीक असून मसाला व औषधी म्हणून मागणी आहे.",
             "Ginger is high-value, with spice & medicinal demand.")),
    "Chilli": dict(cat="vegetables", icon="🌶️", mr="मिरची", en="Chilli",
        sow=("जून - जुलै किंवा ऑक्टोबर", "June - July or October"),
        har=("150 - 180 दिवसांत नियमित तोडणी", "Regular picking from 150-180 days"),
        peak=("सप्टेंबर ते मार्च", "September to March"),
        soil=("हलकी ते मध्यम काळी जमीन", "Light to medium black soil"),
        water=("मध्यम नियमित", "Moderate regular"),
        seed=("300 - 400 ग्रॅम / एकर", "300 - 400 g / Acre"),
        fert=("NPK (100:50:50 किलो/हेक्टर)", "NPK (100:50:50 kg/ha)"),
        tips=(["थ्रिप्स व चुरडा-मुरडा रोगावर फवारणी.", "ठिबक सिंचनाने पाणी वाचते.", "हिरवी व सुकी दोन्ही मागणी."],
              ["Spray against thrips & leaf curl.", "Drip saves water.", "Demand for both green & dry chilli."]),
        adv=("मिरची वर्षभर मागणी असलेले नगदी पीक आहे.",
             "Chilli is a cash crop with year-round demand.")),
    "Garlic": dict(cat="vegetables", icon="🧄", mr="लसूण", en="Garlic",
        sow=("सप्टेंबर - ऑक्टोबर", "September - October"), har=("मार्च - एप्रिल", "March - April"),
        peak=("मार्च ते मे", "March to May"),
        soil=("मुरमाड, निचरा होणारी जमीन", "Friable well-drained loam"),
        water=("थंड हवामानात नियमित", "Regular in cool season"),
        seed=("300 - 350 किलो / एकर", "300 - 350 kg / Acre"),
        fert=("NPK (80:60:60 किलो/हेक्टर) + गंधक", "NPK (80:60:60 kg/ha) + Sulphur"),
        tips=(["लसणाला थंड हवामान लागते.", "कुजणे टाळण्यासाठी निचरा महत्त्वाचा.", "सुकवण्यास वेळ लागतो."],
              ["Garlic needs cool climate.", "Good drainage prevents rot.", "Curing takes time."]),
        adv=("लसूण उच्च मूल्याचे मसाला पीक असून बाजारभाव चांगला मिळतो.",
             "Garlic is high-value with good market rates.")),
    "Lemon": dict(cat="fruits", icon="🍋", mr="लिंबू", en="Lemon",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 3 वर्षांनी, वर्षातून 2 हार", "From 3 yrs, 2 crops/yr"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("निचरा होणारी, pH 5.5 - 7.5", "Well-drained, pH 5.5 - 7.5"),
        water=("मध्यम (ठिबक सिंचन)", "Moderate (drip)"),
        seed=("60 - 70 रोपे / एकर", "60 - 70 plants / Acre"),
        fert=("NPK (600:250:250 ग्रॅम/झाड/वर्ष)", "NPK (600:250:250 g/tree/yr)"),
        tips=(["लिंबू जवळपास वर्षभर फळझाडांपासून उत्पन्न देते.", "ट्रिस्टेझा-प्रतिरोधक आधाररोपे वापरा.", "काळीवट मर टाळण्यासाठी निचरा ठेवा."],
              ["Lemon fruits almost year-round.", "Use tristeza-tolerant rootstocks.", "Keep drainage to avoid wilt."]),
        adv=("लिंबू मराठवाडा व विदर्भात सर्वत्र घेता येणारे बहुवर्षीय फळपीक आहे.",
             "Lemon is a versatile perennial fruit across Marathwada & Vidarbha.")),
    "Fig (Anjeer)": dict(cat="fruits", icon="🍈", mr="अंजीर", en="Fig (Anjeer)",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर सुमारे 2 वर्षांनी", "From ~2 years after planting"),
        peak=("मे ते जुलै व ऑक्टोबर - नोव्हेंबर", "May-Jul and Oct-Nov"),
        soil=("निचरा होणारी, कमी पाणी धारणारी जमीन", "Well-drained, low water-holding soils"),
        water=("मध्यम, नियंत्रित", "Moderate, controlled"),
        seed=("120 - 150 रोपे / एकर", "120 - 150 plants / Acre"),
        fert=("NPK (300:150:300 ग्रॅम/झाड/वर्ष)", "NPK (300:150:300 g/tree/yr)"),
        tips=(["पुणे-पुरंदरचे अंजीर विशेष प्रसिद्ध.", "फळधारणेच्या काळात पाणी नियंत्रित करा.", "अंजीर फुलपाखरू रोगावर वेळीच उपाय करा."],
              ["Pune-Purandar figs are famous.", "Control water during fruiting.", "Manage fig moth early."]),
        adv=("अंजीर पुणे-पुरंदर परिसराचे प्रसिद्ध बहुवर्षीय फळपीक आहे.",
             "Fig is Pune-Purandar's famous perennial fruit crop.")),
    "Jackfruit": dict(cat="fruits", icon="🥭", mr="फणस", en="Jackfruit",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 4-5 वर्षांनी", "From 4-5 years after planting"),
        peak=("एप्रिल ते जून (उन्हाळा)", "April to June (summer)"),
        soil=("खोल, निचरा होणारी जमीन", "Deep well-drained soils"),
        water=("कमी ते मध्यम", "Low to moderate"),
        seed=("30 - 40 रोपे / एकर", "30 - 40 plants / Acre"),
        fert=("गोबरखत 20 किलो/झाड/वर्ष", "FYM 20 kg/tree/yr"),
        tips=(["कोकण व पश्चिम घाटात उत्तम.", "कच्च्या व पिकलेल्या दोन्ही फळांना मागणी.", "फळे वजनामुळे दांडीरोटी उचलत नाहीत म्हणून त्याला आधार बांधा."],
              ["Best in Konkan & Western Ghats.", "Demand for both raw & ripe fruit.", "Support heavy fruits to avoid snapping."]),
        adv=("फणस कोकण व घाटमाथ्यावरील बहुवर्षीय फळपीक असून मागणी झपाट्याने वाढत आहे.",
             "Jackfruit is a Konkan/Ghat perennial with rapidly rising demand.")),
    "Amla (Aonla)": dict(cat="fruits", icon="🫒", mr="आवळा", en="Amla (Aonla)",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 3 वर्षांनी", "From 3 years after planting"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("व्यापक श्रेणी, खडकाळ जमिनीतही", "Wide range, even rocky soils"),
        water=("कमी (दुष्काळसहनशील)", "Low (drought hardy)"),
        seed=("60 - 70 रोपे / एकर", "60 - 70 plants / Acre"),
        fert=("कंपोस्ट 10 किलो/झाड/वर्ष", "Compost 10 kg/tree/yr"),
        tips=(["आवळा रस, मुरंबा व औषधी म्हणून मागणी आहे.", "नवे वाण (NA-7, BSR-1) उच्च उत्पादन देतात.", "उष्ण व कोरडे हवामान आवडते."],
              ["Juice, murumba & medicinal demand.", "NA-7, BSR-1 are high yielders.", "Likes hot, dry summers."]),
        adv=("आवळा दुष्काळसहनशील व कमी देखभालीचे बहुवर्षीय पीक आहे.",
             "Amla is a drought-hardy, low-maintenance perennial.")),
    "Ber (Jujube)": dict(cat="fruits", icon="🫐", mr="बोर", en="Ber (Jujube)",
        sow=("जून - ऑगस्ट", "June - August"), har=("लागवडीनंतर 3 वर्षांनी (नोव्हेंबर - फेब्रुवारी)", "From 3 yrs (Nov-Feb)"),
        peak=("फेब्रुवारी ते मार्च", "February to March"),
        soil=("हलकी ते खडकाळ, कोरडवाहू जमीन", "Light to rocky, rainfed soils"),
        water=("अत्यंत कमी (दुष्काळसहनशील)", "Very low (drought tolerant)"),
        seed=("40 - 50 रोपे / एकर", "40 - 50 plants / Acre"),
        fert=("कंपोस्ट 5-10 किलो/झाड/वर्ष", "Compost 5-10 kg/tree/yr"),
        tips=(["बोर अत्यंत दुष्काळसहनशील.", "उमराण व धुमश्री वाण फायदेशीर.", "रिंग इन्सिजनने फळधारणा लवकर होते."],
              ["Ber is extremely drought tolerant.", "Umran & Dhumshree varieties pay.", "Ring incising hastens fruiting."]),
        adv=("बोर कोरडवाहू व कमी पावसाच्या भागातही उत्पन्न देणारे बहुवर्षीय पीक आहे.",
             "Ber fruits even in rainfed, low-rainfall belts.")),
    "Cabbage": dict(cat="vegetables", icon="🥬", mr="कोबी", en="Cabbage",
        sow=("सप्टेंबर - ऑक्टोबर (रोपवाटिका)", "September - October (nursery)"), har=("90 - 100 दिवसांत", "In 90-100 days"),
        peak=("नोव्हेंबर ते मार्च", "November to March"),
        soil=("सुपीक, निचरा होणारी जमीन", "Fertile well-drained soil"),
        water=("नियमित हलके पाणी", "Regular light irrigation"),
        seed=("120 - 150 ग्रॅम / एकर (रोपवाटिका)", "120 - 150 g / Acre (nursery)"),
        fert=("NPK (150:80:80 किलो/हेक्टर) + गोबर", "NPK (150:80:80 kg/ha) + FYM"),
        tips=(["कटवर्म व मावा या कीडींवर नियमित उपाय.", "रोपवाटिकेत दाटपणा टाळा.", "थंड हवामानातील हिवाळीत मागणी वाढते."],
              ["Control cutworm & aphids regularly.", "Avoid crowded nurseries.", "Winter demand rises in cool season."]),
        adv=("कोबी थंड हवामानात चांगला परतावा देणारे भाजीपाला पीक आहे.",
             "Cabbage gives good returns in the cool season.")),
    "Cauliflower": dict(cat="vegetables", icon="🥦", mr="फ्लॉवर", en="Cauliflower",
        sow=("सप्टेंबर - नोव्हेंबर (रोपवाटिका)", "September - November (nursery)"), har=("85 - 100 दिवसांत", "In 85-100 days"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("सुपीक, निचरा होणारी जमीन", "Fertile well-drained soil"),
        water=("नियमित पाणी", "Regular irrigation"),
        seed=("150 - 200 ग्रॅम / एकर (रोपवाटिका)", "150 - 200 g / Acre (nursery)"),
        fert=("NPK (150:80:80 किलो/हेक्टर) + बोरॉन", "NPK (150:80:80 kg/ha) + Boron"),
        tips=(["बोरॉन अभावाने फण पोकळ होतो.", "फण गोरा राहण्यासाठी पाने वर बांधा.", "थंड रात्री व नियमित पाणी आवश्यक."],
              ["Boron deficiency hollows the curd.", "Tie leaves over curd to keep it white.", "Needs cool nights & regular water."]),
        adv=("फ्लॉवर थंड हवामानातील उच्च मागणीचे भाजीपाला पीक आहे.",
             "Cauliflower is a high-demand cool-season vegetable.")),
    "Carrot": dict(cat="vegetables", icon="🥕", mr="गाजर", en="Carrot",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("90 - 110 दिवसांत", "In 90-110 days"),
        peak=("जानेवारी ते मार्च", "January to March"),
        soil=("भुसभुशीत, वाळूमिश्रित जमीन", "Friable sandy-loam"),
        water=("नियमित हलके पाणी", "Regular light irrigation"),
        seed=("2 - 3 किलो / एकर", "2 - 3 kg / Acre"),
        fert=("NPK (80:60:60 किलो/हेक्टर) + पोटॅश", "NPK (80:60:60 kg/ha) + Potash"),
        tips=(["खोल भुसभुशीत जमिनीत गाजर लांब व गोड होते.", "ओलसरपणा सातत्याने राखा.", "रब्बीतील गोड वाण निवडा."],
              ["Deep friable soil grows long sweet roots.", "Keep moisture consistent.", "Choose sweet rabi varieties."]),
        adv=("गाजर हिवाळी भाजीपाला असून बाजारात उत्तम मागणी आहे.",
             "Carrot is a winter vegetable with strong market demand.")),
    "Cucumber": dict(cat="vegetables", icon="🥒", mr="काकडी", en="Cucumber",
        sow=("जून - जुलै किंवा फेब्रुवारी", "June - July or February"), har=("60 - 70 दिवसांत", "In 60-70 days"),
        peak=("उन्हाळा व खरीप", "Summer & kharif"),
        soil=("हलकी, निचरा होणारी जमीन", "Light well-drained soil"),
        water=("नियमित पाणी", "Regular irrigation"),
        seed=("1.5 - 2 किलो / एकर", "1.5 - 2 kg / Acre"),
        fert=("NPK (60:40:40 किलो/हेक्टर)", "NPK (60:40:40 kg/ha)"),
        tips=(["वेलीला आधार द्या किंवा जमिनीवर पसरवा.", "मुळकुजणे टाळण्यासाठी निचरा ठेवा.", "कडू चवीचे वाण टाळा."],
              ["Support vines or spread on ground.", "Drain well to avoid root rot.", "Avoid bitter varieties."]),
        adv=("काकडी कमी कालावधीत नियमित रोख उत्पन्न देणारे पीक आहे.",
             "Cucumber gives quick, regular income.")),
    "French Beans": dict(cat="vegetables", icon="🫛", mr="फरसबीन", en="French Beans",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("60 - 75 दिवसांत", "In 60-75 days"),
        peak=("डिसेंबर ते फेब्रुवारी", "December to February"),
        soil=("निचरा होणारी सुपीक जमीन", "Well-drained fertile soil"),
        water=("मध्यम नियमित", "Moderate regular"),
        seed=("25 - 30 किलो / एकर", "25 - 30 kg / Acre"),
        fert=("NPK (40:60:40 किलो/हेक्टर)", "NPK (40:60:40 kg/ha)"),
        tips=(["वेलासाठी आधार उभारावा.", "नियमित तोडणीने शेंगा कोवळ्या राहतात.", "शेंगा तोडताना झाडाला इजा करू नका."],
              ["Provide trellis/stakes.", "Regular picking keeps pods tender.", "Avoid damaging the plant while picking."]),
        adv=("फरसबीन थंड हवामानातील नगदी भाजीपाला पीक आहे.",
             "French beans are a cool-season cash vegetable.")),
    "Peas (Matar)": dict(cat="vegetables", icon="🫛", mr="वाटाणा", en="Peas (Matar)",
        sow=("ऑक्टोबर - नोव्हेंबर", "October - November"), har=("70 - 80 दिवसांत", "In 70-80 days"),
        peak=("जानेवारी ते मार्च", "January to March"),
        soil=("निचरा होणारी जमीन", "Well-drained soil"),
        water=("कमी ते मध्यम", "Low to moderate"),
        seed=("20 - 25 किलो / एकर", "20 - 25 kg / Acre"),
        fert=("NPK (20:60:40 किलो/हेक्टर)", "NPK (20:60:40 kg/ha)"),
        tips=(["वाटाण्याला नायट्रोजन फार कमी लागते.", "शेंगा तोडणी नियमित करा.", "रब्बीत कमी पाणी पुरे."],
              ["Peas need very little nitrogen.", "Pick pods regularly.", "Low water is enough in rabi."]),
        adv=("वाटाणा रब्बीतील थंड हवामानाचे नगदी भाजीपाला पीक आहे.",
             "Peas are a profitable rabi vegetable for cool weather.")),
    "Capsicum (Shimla Mirch)": dict(cat="vegetables", icon="🫑", mr="ढोबळी मिरची", en="Capsicum (Shimla Mirch)",
        sow=("जून - जुलै (रोपवाटिका)", "June - July (nursery)"), har=("75 - 90 दिवसांनी नियमित तोडणी", "Regular picking from 75-90 days"),
        peak=("नोव्हेंबर ते फेब्रुवारी", "November to February"),
        soil=("सुपीक, निचरा होणारी जमीन", "Fertile well-drained soil"),
        water=("ठिबक सिंचन", "Drip irrigation"),
        seed=("100 ग्रॅम / एकर (रोपवाटिका)", "100 g / Acre (nursery)"),
        fert=("NPK (150:100:100 किलो/हेक्टर) + सूक्ष्म अन्नद्रव्ये", "NPK (150:100:100 kg/ha) + Micronutrients"),
        tips=(["ठिबक + आच्छादनाने दर्जा सुधारतो.", "चुरडा व थ्रिप्सवर नियमित फवारणी.", "हॉटेल व निर्यात बाजारांना मागणी."],
              ["Drip + mulch improves quality.", "Spray regularly against thrips/leaf curl.", "Hotel & export demand is strong."]),
        adv=("ढोबळी मिरची उच्च मूल्याचे भाजीपाला पीक असून निर्यातक्षम आहे.",
             "Capsicum is high-value and exportable.")),
    "Watermelon": dict(cat="vegetables", icon="🍉", mr="कलिंगड", en="Watermelon",
        sow=("फेब्रुवारी - मार्च", "February - March"), har=("80 - 90 दिवसांत", "In 80-90 days"),
        peak=("एप्रिल ते जून", "April to June"),
        soil=("हलकी वाळूमिश्रित जमीन", "Light sandy soils"),
        water=("नियंत्रित (कमी ते मध्यम)", "Controlled (low to moderate)"),
        seed=("1.5 - 2 किलो / एकर", "1.5 - 2 kg / Acre"),
        fert=("NPK (60:40:40 किलो/हेक्टर) + पोटॅश", "NPK (60:40:40 kg/ha) + Potash"),
        tips=(["गोडपणासाठी पोटॅश व उन्हाळी उष्णता महत्त्वाची.", "जास्त पाऊस नको.", "पेरोनोस्पोरा रोगावर उपाय करा."],
              ["Potash & hot sun boost sweetness.", "Avoid heavy rain.", "Control downy mildew."]),
        adv=("कलिंगड उन्हाळ्यात उत्तम मागणी असलेले नगदी पीक आहे.",
             "Watermelon is a summer cash crop with high demand.")),
    "Muskmelon (Kharbooja)": dict(cat="vegetables", icon="🍈", mr="खरबूज", en="Muskmelon (Kharbooja)",
        sow=("फेब्रुवारी - मार्च", "February - March"), har=("85 - 95 दिवसांत", "In 85-95 days"),
        peak=("एप्रिल ते जून", "April to June"),
        soil=("वाळूमिश्रित हलकी जमीन", "Light sandy-loam"),
        water=("नियंत्रित पाणी", "Controlled irrigation"),
        seed=("1.5 - 2 किलो / एकर", "1.5 - 2 kg / Acre"),
        fert=("NPK (50:40:40 किलो/हेक्टर) + गंधक", "NPK (50:40:40 kg/ha) + Sulphur"),
        tips=(["फळमाशीसाठी सापळे (स्टिकी) लावा.", "गोडपणासाठी पोटॅश व गंधक द्या.", "वेलीचे नियमित व्यवस्थापन करा."],
              ["Use sticky traps for fruit fly.", "Potash & sulphur improve sweetness.", "Manage vines regularly."]),
        adv=("खरबूज उन्हाळी मागणी असलेले नगदी भाजीपाला पीक आहे.",
             "Muskmelon is a profitable summer vegetable.")),
}

# Minor legacy crops kept from the old frontend catalog that have no DB entry
LEGACY = {
    "Bhendi (Okra)": dict(id="bhendi", cat="vegetables", icon="🥒", mr="भेंडी", en="Bhendi (Okra)",
        sow=("जून - जुलै किंवा फेब्रुवारी", "June - July or February"),
        har=("90 - 100 दिवसांत", "In 90-100 days"),
        peak=("वर्षभर नियमित", "Year-round steady"),
        soil=("मध्यम काळी, निचरा होणारी", "Well-drained medium black soil"),
        water=("मध्यम", "Moderate"), seed=("4 - 5 किलो / एकर", "4 - 5 kg / Acre"),
        fert=("NPK (100:50:50 किलो/हेक्टर)", "NPK (100:50:50 kg/ha)"),
        tips=(["पिवळा मोझॅक प्रतिकारक वाण निवडा.", "दर 2-3 दिवसांनी तोडणी करा.", "नियमित रोख उत्पन्न मिळते."],
              ["Choose YVMV resistant varieties.", "Harvest every 2-3 days.", "Provides regular cash flow."]),
        adv=("भेंडी दर 2-3 दिवसांनी रोख उत्पन्न देणारे पीक आहे.",
             "Okra gives regular cash every 2-3 days.")),
}

CROP_ID = {
    "Soybean": "soybean", "Jowar (Sorghum)": "jowar", "Tur (Pigeonpea)": "tur",
    "Udid (Black Gram)": "udid", "Mung (Green Gram)": "mung", "Cotton": "cotton",
    "Wheat": "wheat", "Gram (Chana)": "gram", "Safflower": "safflower",
    "Sunflower": "sunflower", "Sugarcane": "sugarcane", "Pomegranate": "pomegranate",
    "Mango": "mango", "Sapota": "sapota", "Brinjal": "brinjal", "Tomato": "tomato",
    "Onion": "onion", "Papaya": "papaya", "Coriander": "coriander",
    "Tamarind": "tamarind", "Orange": "orange", "Rice (Paddy)": "rice",
    "Groundnut": "groundnut", "Linseed (Alsi)": "linseed", "Grapes": "grapes",
    "Banana": "banana", "Cashew": "cashew", "Coconut (Copra)": "coconut",
    "Turmeric": "turmeric", "Mosambi (Sweet Lime)": "mosambi",
    "Custard Apple (Sitaphal)": "custard_apple", "Strawberry": "strawberry",
    "Guava": "guava", "Bajra (Pearl Millet)": "bajra", "Maize": "maize",
    "Sesame (Til)": "sesame", "Potato": "potato", "Ginger": "ginger",
    "Chilli": "chilli", "Garlic": "garlic",
    "Lemon": "lemon", "Fig (Anjeer)": "fig", "Jackfruit": "jackfruit",
    "Amla (Aonla)": "amla", "Ber (Jujube)": "ber", "Cabbage": "cabbage",
    "Cauliflower": "cauliflower", "Carrot": "carrot", "Cucumber": "cucumber",
    "French Beans": "french_beans", "Peas (Matar)": "peas",
    "Capsicum (Shimla Mirch)": "capsicum", "Watermelon": "watermelon",
    "Muskmelon (Kharbooja)": "muskmelon",
}

def factor_status(value, kind="factor"):
    if value is None:
        return ("—", "—")
    if kind == "market":
        if value >= 80:
            return ("चांगला बाजार", "Good Market")
        if value >= 70:
            return ("मध्यम", "Moderate")
        return ("कमी", "Weak")
    if value >= 80:
        return ("योग्य", "Suitable")
    if value >= 65:
        return ("लक्ष द्या", "Pay Attention")
    return ("कमी योग्य", "Limited")


def badge(score):
    if score >= 90:
        return "badgeBest", "#1B5E20", "#E8F5E9"
    if score >= 80:
        return "badgeGood", "#2E7D32", "#E8F5E9"
    if score >= 70:
        return "badgeConsider", "#E65100", "#FFF3E0"
    return "badgeLimited", "#F57F17", "#FFFDE7"


def build_crops_data(cur):
    crops = cur.execute(
        "SELECT crop_name, season, ideal_ph_min, ideal_ph_max, ideal_rainfall_min, "
        "ideal_rainfall_max, ideal_temp_min, ideal_temp_max, crop_type, "
        "months_to_harvest, typical_yield_quintals_per_acre, msp_price, "
        "input_cost_per_acre FROM crops ORDER BY crop_id"
    ).fetchall()

    avg_scores = {}
    for row in cur.execute(
        "SELECT crop_name, AVG(overall_score), AVG(soil_score), AVG(rainfall_score), "
        "AVG(temperature_score), AVG(irrigation_score), AVG(market_score) "
        "FROM external_suitability_scores GROUP BY crop_name"
    ).fetchall():
        avg_scores[row[0]] = row[1:]

    _WC = "https://commons.wikimedia.org/wiki/Special:FilePath/"
    images = {
        "soybean": _WC + quote("Soybean.USDA.jpg") + "?width=600",
        "cotton": _WC + quote("CottonPlant.JPG") + "?width=600",
        "tur": _WC + quote("Arhar crop (Pigeon pea) in village Bahga, Punjab.jpg") + "?width=600",
        "jowar": _WC + quote("Sorghum_bicolor03.jpg") + "?width=600",
        "gram": _WC + quote("Chickpea_BNC.jpg") + "?width=600",
        "maize": _WC + quote("Zea_mays_-_Köhler–s_Medizinal-Pflanzen-283.jpg") + "?width=600",
        "onion": _WC + quote("Mixed_onions.jpg") + "?width=600",
        "tomato": _WC + quote("Tomato_je.jpg") + "?width=600",
        "bhendi": _WC + quote("Hong_Kong_Okra_Aug_25_2012.JPG") + "?width=600",
        "chilli": _WC + quote("Madame_Jeanette_and_other_chillies.jpg") + "?width=600",
        "potato": _WC + quote("Patates.jpg") + "?width=600",
        "rice": _WC + quote("20201102.Hengnan.Hybrid_rice_Sanyou-1.6.jpg") + "?width=600",
        "wheat": _WC + quote("Vehnäpelto_6.jpg") + "?width=600",
        "mango": _WC + quote("Mangos_-_single_and_halved.jpg") + "?width=600",
        "cashew": _WC + quote("Cashew_apples.jpg") + "?width=600",
        "coconut": _WC + quote("Cocos_nucifera_-_Köhler–s_Medizinal-Pflanzen-187.jpg") + "?width=600",
        "banana": _WC + quote("Bananavarieties.jpg") + "?width=600",
        "orange": _WC + quote("Oranges_-_whole-halved-segment.jpg") + "?width=600",
        "grapes": _WC + quote("Grapes,_Rostov-on-Don,_Russia.jpg") + "?width=600",
        "pomegranate": _WC + quote("Pomegranate_fruit.jpg") + "?width=600",
        "sugarcane": _WC + quote("Saccharum_officinarum_-_Köhler–s_Medizinal-Pflanzen-125.jpg") + "?width=600",
        "turmeric": _WC + quote("Farmers_with_freshly_harvested_turmeric_fingers_in_a_Ridhura_village_field.jpg") + "?width=600",
        "ginger": _WC + quote("Koeh-146-no_text.jpg") + "?width=600",
        "garlic": _WC + quote("Allium_sativum_(Amaryllidaceae).jpg") + "?width=600",
        "groundnut": _WC + quote("Amendoinzinho (109228473).jpeg") + "?width=600",
        "bajra": _WC + quote("Grain_millet,_early_grain_fill,_Tifton,_7-3-02.jpg") + "?width=600",
        "sesame": _WC + quote("Graines_de_sésame_blond_et_noir.jpg") + "?width=600",
        "udid": _WC + quote("Black_gram.jpg") + "?width=600",
        "mung": _WC + quote("Mung_beans_(Vigna_radiata).jpg") + "?width=600",
        "safflower": _WC + quote("Safflower.jpg") + "?width=600",
        "sunflower": _WC + quote("Sunflower_sky_backdrop.jpg") + "?width=600",
        "brinjal": _WC + quote("Solanum_melongena_24_08_2012_(1).JPG") + "?width=600",
        "papaya": _WC + quote("Carica_papaya_-_green_fruits_Wayanad_2021_(1).jpg") + "?width=600",
        "coriander": _WC + quote("Coriandrum_sativum_-_Köhler–s_Medizinal-Pflanzen-193.jpg") + "?width=600",
        "tamarind": _WC + quote("Tamarindus_indica_pods.JPG") + "?width=600",
        "linseed": _WC + quote("Linum_usitatissimum_-_Köhler–s_Medizinal-Pflanzen-088.jpg") + "?width=600",
        "mosambi": _WC + quote("Citrus_limetta.jpeg") + "?width=600",
        "custard_apple": _WC + quote("Annona_squamosa-fruits-leaves.jpg") + "?width=600",
        "strawberry": _WC + quote("Garden_strawberry_(Fragaria_×_ananassa)_single2.jpg") + "?width=600",
        "guava": _WC + quote("Guava_pink_fruit.jpg") + "?width=600",
        "sapota": _WC + quote("സപ്പോട്ട.jpg") + "?width=600",
        "lemon": _WC + quote("P1030323.JPG") + "?width=600",
        "fig": _WC + quote("Fig_fruit_ripe.jpg") + "?width=600",
        "jackfruit": _WC + quote("The_jackfruit_is_holding_on_to_the_tree.jpg") + "?width=600",
        "amla": _WC + quote("Phyllanthus_officinalis.jpg") + "?width=600",
        "ber": _WC + quote("Indian_jujube_(fruit).jpg") + "?width=600",
        "cabbage": _WC + quote("Cabbage_and_cross_section_on_white.jpg") + "?width=600",
        "cauliflower": _WC + quote("Chou-fleur_02.jpg") + "?width=600",
        "carrot": _WC + quote("Vegetable-Carrot-Bundle-wStalks.jpg") + "?width=600",
        "cucumber": _WC + quote("ARS_cucumber.jpg") + "?width=600",
        "french_beans": _WC + quote("Heaps_of_beans.jpg") + "?width=600",
        "peas": _WC + quote("Peas_in_pods_-_Studio.jpg") + "?width=600",
        "capsicum": _WC + quote("Green-Yellow-Red-Pepper-2009.jpg") + "?width=600",
        "watermelon": _WC + quote("Taiwan_2009_Tainan_City_Organic_Farm_Watermelon_FRD_7962.jpg") + "?width=600",
        "muskmelon": _WC + quote("Muskmelon.jpg") + "?width=600",
    }

    entries = []
    for (name, season, ph_min, ph_max, rain_min, rain_max, temp_min, temp_max,
         crop_type, months, yield_q, msp, cost) in crops:
        cid = CROP_ID[name]
        meta = META[name]
        price = msp if msp else MARKET_PRICES.get(name, yield_q * 200)
        yield_min = round((yield_q or 0) * 0.85, 1)
        yield_max = round((yield_q or 0) * 1.15, 1)
        rev_min = round(yield_min * price, 0)
        rev_max = round(yield_max * price, 0)
        cost_min = round((cost or yield_q * 800) * 0.85, 0)
        cost_max = round((cost or yield_q * 800) * 1.15, 0)
        sow_cost_min = round(cost_min * 0.45, 0)
        sow_cost_max = round(cost_max * 0.45, 0)
        maint_min = round(cost_min * 0.55, 0)
        maint_max = round(cost_max * 0.55, 0)
        profit_min = round(rev_min - cost_max, 0)
        profit_max = round(rev_max - cost_min, 0)

        avg_tr, avg_soil, avg_rain, avg_temp, avg_irr, avg_mkt = avg_scores.get(
            name, (None, None, None, None, None, None))
        score = round(avg_tr) if avg_tr else 75
        bkey, bcol, bbg = badge(score)
        rank = 1

        soil_s, soil_e = factor_status(avg_soil)
        rain_s, rain_e = factor_status(avg_rain)
        temp_s, temp_e = factor_status(avg_temp)
        irr_s, irr_e = factor_status(avg_irr)
        mkt_s, mkt_e = factor_status(avg_mkt, "market")

        factor_vals = {
            "soil": round(avg_soil) if avg_soil is not None else None,
            "rain": round(avg_rain) if avg_rain is not None else None,
            "temp": round(avg_temp) if avg_temp is not None else None,
            "irrigation": round(avg_irr) if avg_irr is not None else None,
            "market": round(avg_mkt) if avg_mkt is not None else None,
        }

        entry = {
            "id": cid,
            "name_mr": meta["mr"],
            "name_en": meta["en"],
            "category": meta["cat"],
            "icon": meta["icon"],
            "score": score,
            "rank": rank,
            "badgeKey": bkey,
            "badgeColor": bcol,
            "badgeBg": bbg,
            "image": images.get(cid, images["maize"]),
            "sowingPeriod_mr": meta["sow"][0],
            "sowingPeriod_en": meta["sow"][1],
            "harvestPeriod_mr": meta["har"][0],
            "harvestPeriod_en": meta["har"][1],
            "yieldPerAcreMin": yield_min,
            "yieldPerAcreMax": yield_max,
            "yieldUnit_mr": "क्विंटल / एकर",
            "yieldUnit_en": "Quintals / Acre",
            "sowingCostMin": sow_cost_min,
            "sowingCostMax": sow_cost_max,
            "maintCostMin": maint_min,
            "maintCostMax": maint_max,
            "totalCostMin": cost_min,
            "totalCostMax": cost_max,
            "revenueMin": rev_min,
            "revenueMax": rev_max,
            "profitMin": profit_min,
            "profitMax": profit_max,
            "mandiPriceAvg": round(price, 0),
            "mspPrice": msp,
            "peakArrival_mr": meta["peak"][0],
            "peakArrival_en": meta["peak"][1],
            "factors": {
                "soil": factor_vals["soil"] if factor_vals["soil"] is not None else 75,
                "rain": factor_vals["rain"] if factor_vals["rain"] is not None else 75,
                "temp": factor_vals["temp"] if factor_vals["temp"] is not None else 75,
                "irrigation": factor_vals["irrigation"] if factor_vals["irrigation"] is not None else 75,
                "market": factor_vals["market"] if factor_vals["market"] is not None else 75,
                "soilStatus_mr": soil_s, "soilStatus_en": soil_e,
                "rainStatus_mr": rain_s, "rainStatus_en": rain_e,
                "tempStatus_mr": temp_s, "tempStatus_en": temp_e,
                "irrigationStatus_mr": irr_s, "irrigationStatus_en": irr_e,
                "marketStatus_mr": mkt_s, "marketStatus_en": mkt_e,
            },
            "agronomy": {
                "soilType_mr": meta["soil"][0], "soilType_en": meta["soil"][1],
                "rainfall_mr": f"{rain_min} - {rain_max} मिमी",
                "rainfall_en": f"{rain_min} - {rain_max} mm",
                "temp_mr": f"{temp_min} - {temp_max}°C",
                "temp_en": f"{temp_min} - {temp_max}°C",
                "duration_mr": f"{months} महिने" if months else "—",
                "duration_en": f"{months} Months" if months else "—",
                "waterNeed_mr": meta["water"][0], "waterNeed_en": meta["water"][1],
                "seedRate_mr": meta["seed"][0], "seedRate_en": meta["seed"][1],
                "fertilizer_mr": meta["fert"][0], "fertilizer_en": meta["fert"][1],
                "tips_mr": meta["tips"][0], "tips_en": meta["tips"][1],
            },
            "advice_mr": meta["adv"][0],
            "advice_en": meta["adv"][1],
            "audioText_mr": meta["adv"][0],
        }
        entries.append(entry)

    # Append legacy okra (has no DB row / model score)
    kb = LEGACY["Bhendi (Okra)"]
    entries.append({
        "id": "bhendi", "name_mr": kb["mr"], "name_en": kb["en"],
        "category": kb["cat"], "icon": kb["icon"], "score": 78, "rank": 99,
        "badgeKey": "badgeConsider", "badgeColor": "#E65100", "badgeBg": "#FFF3E0",
        "image": images["bhendi"],
        "sowingPeriod_mr": kb["sow"][0], "sowingPeriod_en": kb["sow"][1],
        "harvestPeriod_mr": kb["har"][0], "harvestPeriod_en": kb["har"][1],
        "yieldPerAcreMin": 50, "yieldPerAcreMax": 65,
        "yieldUnit_mr": "क्विंटल / एकर", "yieldUnit_en": "Quintals / Acre",
        "sowingCostMin": 10000, "sowingCostMax": 14000,
        "maintCostMin": 12000, "maintCostMax": 16000,
        "totalCostMin": 22000, "totalCostMax": 30000,
        "revenueMin": 90000, "revenueMax": 117000,
        "profitMin": 60000, "profitMax": 95000,
        "mandiPriceAvg": 1800, "mspPrice": None,
        "peakArrival_mr": kb["peak"][0], "peakArrival_en": kb["peak"][1],
        "factors": {"soil": 82, "rain": 80, "temp": 84, "irrigation": 82, "market": 85,
                    "soilStatus_mr": "योग्य", "soilStatus_en": "Suitable",
                    "rainStatus_mr": "योग्य", "rainStatus_en": "Suitable",
                    "tempStatus_mr": "योग्य", "tempStatus_en": "Suitable",
                    "irrigationStatus_mr": "योग्य", "irrigationStatus_en": "Suitable",
                    "marketStatus_mr": "चांगला", "marketStatus_en": "Good Demand"},
        "agronomy": {"soilType_mr": kb["soil"][0], "soilType_en": kb["soil"][1],
                     "rainfall_mr": "500 - 800 मिमी", "rainfall_en": "500 - 800 mm",
                     "temp_mr": "22 - 35°C", "temp_en": "22 - 35°C",
                     "duration_mr": "90 - 100 दिवस", "duration_en": "90 - 100 Days",
                     "waterNeed_mr": kb["water"][0], "waterNeed_en": kb["water"][1],
                     "seedRate_mr": kb["seed"][0], "seedRate_en": kb["seed"][1],
                     "fertilizer_mr": kb["fert"][0], "fertilizer_en": kb["fert"][1],
                     "tips_mr": kb["tips"][0], "tips_en": kb["tips"][1]},
        "advice_mr": kb["adv"][0], "advice_en": kb["adv"][1],
        "audioText_mr": kb["adv"][0],
    })
    return entries


def build_regional_scores(cur, tehsil_aliases):
    """Regional suitability per (district, tehsil).

    Districts/tehsils with REAL API-fetched data (Latur, Nagpur) are scored
    from that real data for EVERY crop: the local crop_suitability_scores
    overall (soil+rain+temp fit) is used and ranks are recomputed across the
    full catalog (best score = rank 1). The imported 10-factor external model
    is kept strictly as a FALLBACK for districts/tehsils that have no fetched
    real data, and those keep their original model scores/ranks unchanged.
    """
    def _f(v):
        return round(v) if v is not None else None

    # Tehsils that genuinely have fetched local data (>=1 real soil/rain/temp
    # measure). Everywhere else falls back to the external model below.
    local_regions = {
        rid for (rid,) in cur.execute(
            "SELECT DISTINCT region_id FROM crop_suitability_scores "
            "WHERE soil_score IS NOT NULL OR rainfall_score IS NOT NULL "
            "OR temp_score IS NOT NULL"
        ).fetchall()
    }

    ext = {}
    for district, tehsil, crop_name, overall, rank, soil, rain, temp, irr, mkt, rid in cur.execute(
        "SELECT r.district, r.tehsil, s.crop_name, s.overall_score, s.rank_in_tehsil, "
        "s.soil_score, s.rainfall_score, s.temperature_score, s.irrigation_score, s.market_score, "
        "s.region_id "
        "FROM external_suitability_scores s JOIN regions r ON s.region_id = r.region_id "
        "ORDER BY r.district, r.tehsil, s.overall_score DESC"
    ).fetchall():
        if overall is None:
            continue
        ext.setdefault((district, tehsil), {})[crop_name] = {
            "score": _f(overall), "rank": _f(rank),
            "factors": {"soil": _f(soil), "rain": _f(rain), "temp": _f(temp),
                        "irrigation": _f(irr), "market": _f(mkt)},
        }

    local = {}
    for district, tehsil, crop_name, overall, soil, rain, temp, water, growing, hist, mkt, rid in cur.execute(
        "SELECT r.district, r.tehsil, c.crop_name, s.overall_score, s.soil_score, "
        "s.rainfall_score, s.temp_score, s.water_score, s.growing_score, "
        "s.history_score, s.market_factor, s.region_id "
        "FROM crop_suitability_scores s "
        "JOIN regions r ON s.region_id = r.region_id "
        "JOIN crops c ON s.crop_id = c.crop_id "
        "WHERE s.overall_score IS NOT NULL"
    ).fetchall():
        if rid not in local_regions:
            continue
        local.setdefault((district, tehsil), {})[crop_name] = {
            "score": _f(overall),
            "factors": {"soil": _f(soil), "rain": _f(rain), "temp": _f(temp),
                        "irrigation": _f(water), "market": _f(mkt),
                        "growing": _f(growing), "history": _f(hist)},
        }

    out = {}
    for (district, tehsil) in sorted(set(ext) | set(local)):
        entries = []
        if (district, tehsil) in local:
            # REAL data wins -> all 54 crops, ranked by real score.
            locals_sorted = sorted(
                local[(district, tehsil)].items(),
                key=lambda kv: ((kv[1]["score"] is not None), kv[1]["score"], kv[0]),
                reverse=True)
            for idx, (crop_name, data) in enumerate(locals_sorted, start=1):
                entries.append({
                    "cropId": CROP_ID[crop_name],
                    "cropName": META[crop_name]["en"],
                    "score": data["score"],
                    "rank": idx,
                    "factors": data["factors"],
                })
        else:
            # No fetched real data -> external model rows, model ranks intact.
            for crop_name, data in ext.get((district, tehsil), {}).items():
                entries.append({
                    "cropId": CROP_ID[crop_name],
                    "cropName": META[crop_name]["en"],
                    "score": data["score"],
                    "rank": data["rank"],
                    "factors": data["factors"],
                })
        out.setdefault(district, {})[tehsil] = entries

    # Apply alias mapping so frontend tehsil names that differ from DB names
    # (e.g. Ahmedpur -> Ahmadpur) still resolve to real scores.
    for district, alias_map in tehsil_aliases.items():
        if district not in out:
            continue
        for alias, real in alias_map.items():
            if alias not in out[district] and real in out[district]:
                out[district][alias] = out[district][real]

    return out


def _date_key(d):
    # price_data dates are stored as DD/MM/YYYY strings
    dd, mm, yyyy = d.split("/")
    return (yyyy, mm, dd)


def build_mandi_prices(cur):
    """Region-specific, recent APMC modal prices from the price_data table.

    Returns { district: { cropId: {latestDate, avgModal, minModal, maxModal,
    marketCount, markets:[{market, modal}]} } }. Only districts present in the
    table get an entry; callers fall back to MSP/estimate for the rest.
    """
    slug_by_crop_id = {
        cid: CROP_ID[name]
        for cid, name in cur.execute("SELECT crop_id, crop_name FROM crops").fetchall()
    }

    grouped = {}
    for district, cid, market, date, modal in cur.execute(
        "SELECT district, crop_id, market_name, date, modal_price "
        "FROM price_data WHERE modal_price IS NOT NULL"
    ).fetchall():
        slug = slug_by_crop_id.get(cid)
        if not slug:
            continue
        grouped.setdefault(district, {}).setdefault(slug, []).append(
            (date, market, modal))

    out = {}
    for district, by_crop in grouped.items():
        out[district] = {}
        for slug, recs in by_crop.items():
            latest = max((r[0] for r in recs), key=_date_key)
            latest_rows = [r for r in recs if r[0] == latest and r[2]]
            if not latest_rows:
                continue
            modals = [r[2] for r in latest_rows]
            best_by_market = {}
            for _, market, modal in latest_rows:
                if market not in best_by_market or modal > best_by_market[market]:
                    best_by_market[market] = modal
            market_list = [
                {"market": m, "modal": round(v)}
                for m, v in sorted(best_by_market.items(), key=lambda kv: kv[1], reverse=True)
            ]
            out[district][slug] = {
                "latestDate": latest,
                "avgModal": round(sum(modals) / len(modals)),
                "minModal": round(min(modals)),
                "maxModal": round(max(modals)),
                "marketCount": len(market_list),
                "markets": market_list[:4],
            }
    return out


def dump_js(path, var, obj):
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"export const {var} = ")
        f.write(json.dumps(obj, ensure_ascii=False, indent=None, separators=(",", ":")))
        f.write(";\n")


def main():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    crops_data = build_crops_data(cur)

    tehsil_aliases = {
        "Latur": {"Ahmedpur": "Ahmadpur"},
        "Nagpur": {"Kamthi": "Kamptee", "Nagpur City": "Nagpur (Urban)",
                   "Nagpur Rural": "Nagpur (Rural)"},
    }
    regional_scores = build_regional_scores(cur, tehsil_aliases)
    mandi_prices = build_mandi_prices(cur)

    os.makedirs(OUT_DIR, exist_ok=True)
    dump_js(os.path.join(OUT_DIR, "cropsData.js"), "CROPS_DATA", crops_data)
    dump_js(os.path.join(OUT_DIR, "regionalScores.js"), "REGIONAL_SCORES", regional_scores)
    dump_js(os.path.join(OUT_DIR, "mandiPrices.js"), "MANDI_PRICES", mandi_prices)
    conn.close()

    n_crops = len(crops_data)
    n_districts = len(regional_scores)
    n_scores = sum(len(t) for d in regional_scores.values() for t in d.values())
    n_mandi = sum(len(c) for c in mandi_prices.values())
    print(f"Wrote cropsData.js: {n_crops} crops")
    print(f"Wrote regionalScores.js: {n_districts} districts, {n_scores} district-tehsil crop lists")
    print(f"Wrote mandiPrices.js: {len(mandi_prices)} districts, {n_mandi} crop price series")


if __name__ == "__main__":
    main()