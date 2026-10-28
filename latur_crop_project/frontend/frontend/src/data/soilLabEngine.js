/**
 * Smart Soil Lab - Scientific Soil Evaluation Engine
 * Based on Indian Council of Agricultural Research (ICAR),
 * National Bureau of Soil Survey & Land Use Planning (NBSS&LUP),
 * VNMKV Parbhani, MPKV Rahuri, and Indian Soil Health Card (SHC) benchmarks.
 */

// ---------------------------------------------------------------------------
// 1. Standard Indian Soil Health Card (SHC) Reference Ranges
// ---------------------------------------------------------------------------
export const SOIL_LAB_BENCHMARKS = {
  // Soil Reaction (pH) - 1:2.5 soil-water suspension
  ph: {
    stronglyAcidic: { max: 5.5, label_mr: 'अति आम्लधर्मी (Strongly Acidic)', label_en: 'Strongly Acidic (< 5.5)', status: 'danger' },
    moderatelyAcidic: { min: 5.5, max: 6.5, label_mr: 'मध्यम आम्लधर्मी (Acidic)', label_en: 'Moderately Acidic (5.5 - 6.5)', status: 'warning' },
    optimal: { min: 6.5, max: 7.5, label_mr: 'योग्य / उदासीन (Neutral / Optimal)', label_en: 'Optimal / Neutral (6.5 - 7.5)', status: 'good' },
    moderatelyAlkaline: { min: 7.5, max: 8.5, label_mr: 'मध्यम विम्लधर्मी (Alkaline)', label_en: 'Moderately Alkaline (7.5 - 8.5)', status: 'warning' },
    stronglyAlkaline: { min: 8.5, label_mr: 'अति विम्लधर्मी / क्षारयुक्त (Strongly Alkaline/Sodic)', label_en: 'Strongly Alkaline (> 8.5)', status: 'danger' },
    unit: 'pH'
  },

  // Electrical Conductivity (EC) in dS/m at 25°C
  ec: {
    normal: { max: 1.0, label_mr: 'उत्तम / क्षारविरहित (Normal)', label_en: 'Normal / Non-saline (< 1.0 dS/m)', status: 'good' },
    critical: { min: 1.0, max: 2.0, label_mr: 'मध्यम क्षारता (Critical / Slight)', label_en: 'Critical / Slight Salinity (1.0 - 2.0 dS/m)', status: 'warning' },
    saline: { min: 2.0, max: 4.0, label_mr: 'हानिकारक क्षारता (Saline)', label_en: 'Harmful Salinity (2.0 - 4.0 dS/m)', status: 'danger' },
    stronglySaline: { min: 4.0, label_mr: 'अति हानिकारक क्षारता (Highly Saline)', label_en: 'Highly Saline (> 4.0 dS/m)', status: 'danger' },
    unit: 'dS/m'
  },

  // Organic Carbon (OC) % (Walkley-Black chromic acid wet oxidation)
  organicCarbon: {
    low: { max: 0.50, label_mr: 'कमी सेंद्रिय कर्ब (Low)', label_en: 'Low (< 0.50%)', status: 'danger' },
    medium: { min: 0.50, max: 0.75, label_mr: 'मध्यम सेंद्रिय कर्ब (Medium)', label_en: 'Medium (0.50 - 0.75%)', status: 'warning' },
    high: { min: 0.75, label_mr: 'उत्तम सेंद्रिय कर्ब (High / Rich)', label_en: 'High / Optimal (> 0.75%)', status: 'good' },
    unit: '%'
  },

  // Available Nitrogen (N) kg/ha (Alkaline Permanganate method)
  nitrogen: {
    low: { max: 280, label_mr: 'कमी नत्र (Low)', label_en: 'Low (< 280 kg/ha)', status: 'danger' },
    medium: { min: 280, max: 560, label_mr: 'मध्यम नत्र (Medium)', label_en: 'Medium (280 - 560 kg/ha)', status: 'good' },
    high: { min: 560, label_mr: 'भरपूर नत्र (High)', label_en: 'High (> 560 kg/ha)', status: 'good' },
    unit: 'kg/ha'
  },

  // Available Phosphorus (P / P2O5) kg/ha (Olsen's method)
  phosphorus: {
    low: { max: 23, label_mr: 'कमी स्फुरद (Low)', label_en: 'Low (< 23 kg/ha)', status: 'danger' },
    medium: { min: 23, max: 56, label_mr: 'मध्यम स्फुरद (Medium)', label_en: 'Medium (23 - 56 kg/ha)', status: 'good' },
    high: { min: 56, label_mr: 'भरपूर स्फुरद (High)', label_en: 'High (> 56 kg/ha)', status: 'good' },
    unit: 'kg/ha'
  },

  // Available Potassium (K / K2O) kg/ha (Neutral Ammonium Acetate method)
  potassium: {
    low: { max: 140, label_mr: 'कमी पालाश (Low)', label_en: 'Low (< 140 kg/ha)', status: 'danger' },
    medium: { min: 140, max: 280, label_mr: 'मध्यम पालाश (Medium)', label_en: 'Medium (140 - 280 kg/ha)', status: 'good' },
    high: { min: 280, label_mr: 'भरपूर पालाश (High)', label_en: 'High (> 280 kg/ha)', status: 'good' },
    unit: 'kg/ha'
  }
};

// ---------------------------------------------------------------------------
// 2. Crop-Specific Agronomic Soil Tolerance & Nutrient Affinity Profiles
// ---------------------------------------------------------------------------
export const CROP_SOIL_SCIENCE_PROFILES = {
  // Cereals, Pulses & Oilseeds
  soybean: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.2], ecMax: 1.8,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.45,
    note_mr: 'सोयाबीन मुळांवर गाठींद्वारे हवेतील नत्र शोषून घेते; स्फुरद उपलब्ध असल्यास उत्तम वाढ होते. pH 8.3 च्या वर रायझोबियम जीवाणू मंदावतात.',
    note_en: 'Fixes atmospheric nitrogen via root nodules; responsive to available phosphorus. Rhizobium efficiency drops above pH 8.3.'
  },
  cotton: {
    phOpt: [6.2, 8.2], phAbs: [6.0, 8.6], ecMax: 4.5,
    isNFixer: false, nDemand: 'high', pDemand: 'med', kDemand: 'high', minOC: 0.45,
    note_mr: 'कापूस मध्यम क्षारता व विम्ल जमीन सहन करतो; बोंडांच्या वाढीसाठी पालाश (K) व नत्र (N) ची मोठी गरज असते.',
    note_en: 'Moderately tolerant of salinity and alkaline soils; heavy feeder of nitrogen and potassium for boll development.'
  },
  tur: {
    phOpt: [6.0, 7.8], phAbs: [5.5, 8.4], ecMax: 2.0,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.40,
    note_mr: 'तूर खोल मुळांचे पीक असून नत्र स्थिर करते. जमिनीचा पाण्याचा निचरा चांगला व स्फुरद मुबलक असल्यास भरघोस शेंगा लागतात.',
    note_en: 'Deep-rooted legume with strong N-fixation; demands well-drained soil and adequate phosphorus for pod setting.'
  },
  jowar: {
    phOpt: [6.0, 8.2], phAbs: [5.5, 8.8], ecMax: 3.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.35,
    note_mr: 'ज्वारी विविध प्रकारच्या जमिनीत आणि मध्यम क्षारतेतही तग धरते; दुष्काळसहनशील.',
    note_en: 'Hardy cereal tolerant to wide pH range and moderate salinity; drought resilient.'
  },
  wheat: {
    phOpt: [6.2, 7.8], phAbs: [5.8, 8.5], ecMax: 3.0,
    isNFixer: false, nDemand: 'high', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'गहू उदासीन ते किंचित विम्ल जमिनीत उत्तम येतो. फुलोरा व दाणे भरताना नत्र व पालाशची आवश्यकता असते.',
    note_en: 'Performs best in neutral to slightly alkaline loams; requires balanced N and K at tillering and grain filling.'
  },
  gram: {
    phOpt: [6.0, 7.8], phAbs: [5.8, 8.4], ecMax: 1.6,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.40,
    note_mr: 'हरभरा जास्त क्षारतेस संवेदनशील आहे (EC > 1.6 असल्यास घाटी गळ होते). स्फुरद (P) मुळे मुळांची वाढ वेगाने होते.',
    note_en: 'Sensitive to soil salinity during flowering; requires adequate phosphorus for early root and nodule development.'
  },
  udid: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 1.6,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.40,
    note_mr: 'कमी कालावधीचे कडधान्य, नत्र फिक्सेशन करते. आम्लधर्मी जमिनीपेक्षा उदासीन जमीन फायदेशीर.',
    note_en: 'Short-duration legume that enriches soil nitrogen; performs best around neutral pH.'
  },
  mung: {
    phOpt: [6.2, 7.5], phAbs: [5.5, 8.0], ecMax: 1.5,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.40,
    note_mr: 'मुगासाठी भुसभुशीत जमीन व योग्य स्फुरद प्रमाण आवश्यक. जास्त क्षारतेत रोपे पिवळी पडतात.',
    note_en: 'Prefers friable loam with good phosphorus; sensitive to salinity and waterlogging.'
  },
  safflower: {
    phOpt: [6.2, 8.2], phAbs: [5.5, 8.8], ecMax: 4.0,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.35,
    note_mr: 'करडई क्षारीय व चुनखडीयुक्त जमिनीतही उत्तम तग धरते; मुळे खोलवर जाऊन अन्नद्रव्ये शोषतात.',
    note_en: 'Highly tolerant to calcareous and saline soils; taproot accesses deep nutrients.'
  },
  sunflower: {
    phOpt: [6.2, 7.8], phAbs: [5.8, 8.2], ecMax: 2.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.45,
    note_mr: 'सूर्यफुलाच्या दाण्यांमध्ये तेल निर्मितीसाठी पालाश (K) व बोरॉन अत्यंत आवश्यक ठरते.',
    note_en: 'High potassium requirement for seed filling and oil synthesis.'
  },
  groundnut: {
    phOpt: [5.8, 7.2], phAbs: [5.3, 7.8], ecMax: 1.6,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.45,
    note_mr: 'भुईमुगाला भुसभुशीत जमीन व कॅल्शियम/जिप्सम लागते. अति काळी चोपण जमीन आऱ्या जाण्यास अडथळा ठरते.',
    note_en: 'Requires loose, friable soil and available calcium for pegging; heavy sodic clay impedes pod entry.'
  },
  bajra: {
    phOpt: [6.2, 8.5], phAbs: [5.5, 9.0], ecMax: 4.0,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'low', minOC: 0.30,
    note_mr: 'कमी सेंद्रिय कर्ब व मुरमाड जमिनीतही बाजरी खात्रीशीर उत्पादन देते.',
    note_en: 'Highly resilient in low organic carbon, shallow, or calcareous soils.'
  },
  maize: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.2], ecMax: 2.0,
    isNFixer: false, nDemand: 'high', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'मका हे अन्नद्रव्यांची मोठी भूक असणारे पीक आहे; नत्र व जस्त (Zn) ची उपलब्धता महत्त्वाची.',
    note_en: 'Heavy nutrient feeder; demands available nitrogen and zinc for cob weight.'
  },
  rice: {
    phOpt: [5.2, 7.2], phAbs: [4.8, 8.0], ecMax: 2.5,
    isNFixer: false, nDemand: 'high', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'भात किंचित आम्लधर्मी ते उदासीन जमिनीत उत्तम येतो; पाणी साचू शकणारी जमीन अनुकूल.',
    note_en: 'Thrives in slightly acidic to neutral soils with good clay content for water retention.'
  },
  linseed: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.2], ecMax: 2.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.40,
    note_mr: 'जवस मध्यम सुपीक जमिनीत कमी खर्चात येते.',
    note_en: 'Moderate nutrient demand; performs well on residual moisture.'
  },
  sesame: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 2.0,
    isNFixer: false, nDemand: 'low', pDemand: 'med', kDemand: 'med', minOC: 0.35,
    note_mr: 'तीळ हलक्या ते मध्यम जमिनीत उत्तम निचरा असल्यास चांगले येते.',
    note_en: 'Light to medium well-drained soil with modest fertility requirement.'
  },

  // Fruit Orchards
  pomegranate: {
    phOpt: [6.5, 7.8], phAbs: [6.0, 8.4], ecMax: 2.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.50,
    note_mr: 'डाळिंबासाठी पाण्याचा चांगला निचरा व भरपूर पालाश (K) आवश्यक. पालाशमुळे फळांना चकाकी व गोडवा येतो.',
    note_en: 'Demands deep drainage and high potassium for aril color, sugar content, and skin luster.'
  },
  grapes: {
    phOpt: [6.5, 7.8], phAbs: [6.0, 8.2], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'very_high', minOC: 0.60,
    note_mr: 'द्राक्ष बागेसाठी पालाश (K) अत्यंत महत्त्वाचा घटक आहे; क्षारतेस (EC > 1.8) द्राक्ष अत्यंत संवेदनशील असतात.',
    note_en: 'Enormous potassium requirement for berry elongation and brix; sensitive to soil salinity and chlorides.'
  },
  banana: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 1.5,
    isNFixer: false, nDemand: 'very_high', pDemand: 'high', kDemand: 'very_high', minOC: 0.70,
    note_mr: 'केळीला भरपूर सेंद्रिय कर्ब, नत्र व पालाश लागते. किंचितही क्षारता असल्यास पानांच्या कडा करपतात.',
    note_en: 'Huge feeder of N and K with high organic carbon need; salinity causes leaf margin scorching.'
  },
  mango: {
    phOpt: [5.5, 7.5], phAbs: [5.0, 8.0], ecMax: 2.0,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'हापूस आंबा कोकणातील किंचित आम्लधर्मी लाल मातीत सर्वोत्तम चव व सुगंध देतो.',
    note_en: 'Excels in slightly acidic, well-drained laterite soils; tolerates wide moisture variations.'
  },
  orange: {
    phOpt: [6.2, 7.8], phAbs: [5.8, 8.2], ecMax: 1.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.55,
    note_mr: 'संत्रा झाडांना चुनखडी व क्षारता हानिकारक ठरते; जस्त, लोह व पालाशची नियमित गरज असते.',
    note_en: 'Susceptible to lime-induced iron chlorosis above pH 8.2 and salinity above 1.5 dS/m.'
  },
  mosambi: {
    phOpt: [6.2, 7.8], phAbs: [5.8, 8.2], ecMax: 1.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.55,
    note_mr: 'मोसंबीला उत्तम निचऱ्याची गाळमिश्रित काळी जमीन व पुरेसे सूक्ष्म अन्नद्रव्ये लागतात.',
    note_en: 'Thrives in well-drained medium black loams; sensitive to high salts and root asphyxiation.'
  },
  custard_apple: {
    phOpt: [6.2, 8.2], phAbs: [5.5, 8.8], ecMax: 3.0,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'med', minOC: 0.35,
    note_mr: 'सीताफळ हलक्या, खडकाळ व चुनखडीयुक्त जमिनीतही उत्तम उत्पादन देते; अत्यंत काटक फळझाड.',
    note_en: 'Exceptionally hardy in shallow, stony, or calcareous soils with low nutrient requirements.'
  },
  strawberry: {
    phOpt: [5.5, 6.8], phAbs: [5.0, 7.4], ecMax: 1.0,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'high', minOC: 0.80,
    note_mr: 'स्ट्रॉबेरी केवळ किंचित आम्लधर्मी व भरपूर सेंद्रिय कर्ब असलेल्या जमिनीतच यशस्वी होते. विम्ल जमिनीत (pH > 7.5) लोह कमतरतेने झाडे पिवळी पडतात.',
    note_en: 'Acid-loving crop requiring high organic matter; severe chlorosis and failure in alkaline/saline soils.'
  },
  guava: {
    phOpt: [5.5, 7.8], phAbs: [5.0, 8.5], ecMax: 2.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.45,
    note_mr: 'पेरू विविध प्रकारच्या जमिनीशी जुळवून घेतो; मध्यम क्षारताही सहन करू शकतो.',
    note_en: 'Adaptable to wide pH and moderate salinity; tolerant to diverse soil textures.'
  },
  sapota: {
    phOpt: [6.0, 8.0], phAbs: [5.5, 8.5], ecMax: 2.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.45,
    note_mr: 'चिकू खोल काळी तसेच किनारपट्टीच्या वालुकामय जमिनीतही उत्तम वाढतो.',
    note_en: 'Hardy perennial suited to deep alluvial loams and coastal soils.'
  },
  cashew: {
    phOpt: [5.0, 6.5], phAbs: [4.5, 7.5], ecMax: 1.8,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'med', minOC: 0.40,
    note_mr: 'काजू लाल जांभा (जांभा दगड) व हलक्या उताराच्या आम्लधर्मी जमिनीत बहरतो; चुनखडीयुक्त काळ्या जमिनीत कुचका ठरतो.',
    note_en: 'Thrives in acidic red laterite slopes; stunted in heavy calcareous black clay.'
  },
  coconut: {
    phOpt: [5.5, 7.8], phAbs: [5.0, 8.2], ecMax: 3.0,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.45,
    note_mr: 'नारळाला भरपूर पालाश (K) व ओलावा लागतो; मध्यम क्षारता सहज सहन करतो.',
    note_en: 'Heavy potassium consumer; tolerates coastal salinity and brackish conditions.'
  },
  fig: {
    phOpt: [6.5, 8.0], phAbs: [6.0, 8.5], ecMax: 2.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.45,
    note_mr: 'अंजीर चुनखडीयुक्त व मध्यम हलक्या जमिनीत गोड व दर्जेदार फळे देते.',
    note_en: 'Flourishes in well-drained calcareous loams with good potassium for fruit brix.'
  },
  papaya: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.4,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'high', minOC: 0.60,
    note_mr: 'पपईला उत्तम निचरा व भरपूर सेंद्रिय खत लागते; मुळांजवळ पाणी साचल्यास किंवा क्षारतेमुळे मुळकुज होते.',
    note_en: 'Requires rich organic matter and rapid drainage; extremely prone to root rot in poorly drained or saline soils.'
  },
  tamarind: {
    phOpt: [6.2, 8.5], phAbs: [5.5, 9.0], ecMax: 4.0,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'low', minOC: 0.30,
    note_mr: 'चिंच निकृष्ट, क्षारयुक्त व खडकाळ जमिनीतही शतकानुशतके फळे देते.',
    note_en: 'Highly resilient in marginal, sodic, and rocky soils.'
  },
  amla: {
    phOpt: [6.2, 8.5], phAbs: [5.5, 9.0], ecMax: 4.0,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'low', minOC: 0.30,
    note_mr: 'आवळा क्षारीय व खडकाळ जमिनीतही चांगला वाढतो.',
    note_en: 'Tolerant to alkali and sodic soil conditions up to pH 8.8.'
  },
  ber: {
    phOpt: [6.2, 8.5], phAbs: [5.5, 9.0], ecMax: 4.0,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'low', minOC: 0.30,
    note_mr: 'बोर अत्यंत काटक पीक असून निकृष्ट जमिनीतही उत्तम उत्पादन देते.',
    note_en: 'Extremely hardy in dry, saline, or sodic soils.'
  },
  lemon: {
    phOpt: [6.0, 7.8], phAbs: [5.5, 8.2], ecMax: 1.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.50,
    note_mr: 'लिंबाला हलकी ते मध्यम निचरा होणारी जमीन व पालाश पोषक ठरते.',
    note_en: 'Needs well-drained loams; sensitive to excess salts.'
  },
  jackfruit: {
    phOpt: [5.5, 7.2], phAbs: [5.0, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'low', pDemand: 'low', kDemand: 'med', minOC: 0.40,
    note_mr: 'फणस लाल जांभा व खोल गाळाच्या जमिनीत उत्तम वाढतो.',
    note_en: 'Deep rooted, prefers moist well-drained laterite soils.'
  },

  // Commercial / Cash Crops
  sugarcane: {
    phOpt: [6.5, 7.8], phAbs: [5.8, 8.4], ecMax: 2.2,
    isNFixer: false, nDemand: 'very_high', pDemand: 'high', kDemand: 'very_high', minOC: 0.60,
    note_mr: 'ऊस हे जमिनीतून प्रचंड प्रमाणात नत्र व पालाश शोषून घेणारे पीक आहे; सेंद्रिय कर्ब उत्तम असावा लागतो.',
    note_en: 'Heavy consumer of nitrogen and potassium; needs rich organic matter and deep water holding capacity.'
  },
  turmeric: {
    phOpt: [5.8, 7.2], phAbs: [5.3, 7.8], ecMax: 1.5,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'high', minOC: 0.70,
    note_mr: 'हळदीसाठी भुसभुशीत, सेंद्रिय कर्बयुक्त जमीन व पालाश अत्यंत आवश्यक. चोपण जमिनीत गड्डे सडतात.',
    note_en: 'Requires friable, high-organic soil with high potassium for rhizome development.'
  },
  ginger: {
    phOpt: [5.8, 7.0], phAbs: [5.3, 7.6], ecMax: 1.4,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'high', minOC: 0.75,
    note_mr: 'आले पिकास उत्कृष्ट निचरा व भरपूर शेणखत/सेंद्रिय कर्ब लागतो; किंचितही पाणी साचल्यास कंदकुज होते.',
    note_en: 'Demands rich organic loam and perfect drainage; highly susceptible to rhizome rot in compact soils.'
  },

  // Vegetables
  onion: {
    phOpt: [6.2, 7.5], phAbs: [5.8, 8.0], ecMax: 1.4,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'high', minOC: 0.55,
    note_mr: 'कांद्याला पालाश व गंधक (Sulfur) मुळे तिखटपणा व टिकाऊपणा येतो; क्षारतेस कांदा संवेदनशील असतो.',
    note_en: 'Requires potassium and sulfur for bulb pungency and storage quality; sensitive to salinity.'
  },
  garlic: {
    phOpt: [6.2, 7.5], phAbs: [5.8, 8.0], ecMax: 1.4,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'high', minOC: 0.55,
    note_mr: 'लसणाला भुसभुशीत जमीन व गंधक-पालाशची गरज असते.',
    note_en: 'Needs fertile, friable soil with adequate sulfur and potassium.'
  },
  tomato: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'high', minOC: 0.55,
    note_mr: 'टोमॅटो फळांच्या मजबुती व रंगासाठी कॅल्शियम व पालाश महत्त्वाचे असतात.',
    note_en: 'Demands balanced potassium and calcium to prevent blossom end rot.'
  },
  chilli: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 1.6,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'high', minOC: 0.50,
    note_mr: 'मिरचीसाठी चांगला निचरा व स्फुरद-पालाश आवश्यक; चोपण जमिनीत चुरडा-मुरडा व मर वाढते.',
    note_en: 'Requires good aeration and balanced NPK; compact saline soil worsens wilt and dieback.'
  },
  potato: {
    phOpt: [5.2, 6.5], phAbs: [4.8, 7.5], ecMax: 1.5,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'very_high', minOC: 0.60,
    note_mr: 'बटाटा किंचित आम्लधर्मी जमिनीत (pH 5.5-6.5) उत्कृष्ट येतो. विम्ल जमिनीत (pH > 6.8) खवड्या (Scab) रोगाचा प्रादुर्भाव वाढतो.',
    note_en: 'Prefers slightly acidic soil (pH 5.2 - 6.5). Higher pH drastically promotes common potato scab.'
  },
  brinjal: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'वांग्यासाठी मध्यम सुपीक गाळमिश्रित जमीन अनुकूल.',
    note_en: 'Grows well in fertile, well-drained loams.'
  },
  bhendi: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.50,
    note_mr: 'भेंडीसाठी मध्यम काळी व सुपीक जमीन उत्तम.',
    note_en: 'Adaptable vegetable needing moderate fertility.'
  },
  cabbage: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'high', pDemand: 'med', kDemand: 'med', minOC: 0.55,
    note_mr: 'कोबीला भरपूर नत्र व ओलावा लागतो.',
    note_en: 'High nitrogen demand for vegetative head formation.'
  },
  cauliflower: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'med', minOC: 0.55,
    note_mr: 'फ्लॉवरसाठी मॉलिब्डेनम व बोरॉनसह संतुलित नत्र-स्फुरद आवश्यक.',
    note_en: 'Requires balanced NPK plus micronutrients (boron/molybdenum) for white curd.'
  },
  carrot: {
    phOpt: [5.8, 7.0], phAbs: [5.5, 7.5], ecMax: 1.2,
    isNFixer: false, nDemand: 'med', pDemand: 'high', kDemand: 'high', minOC: 0.55,
    note_mr: 'गाजरासाठी वाळूमिश्रित मऊ जमीन आवश्यक; क्षारतेमुळे गाजरे वाकडी होतात.',
    note_en: 'Needs deep, loose sandy loam; salinity causes root splitting and forking.'
  },
  cucumber: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.55,
    note_mr: 'काकडीला पालाश व नियमित ओलावा आवश्यक.',
    note_en: 'High moisture and potassium requirement for straight fruits.'
  },
  watermelon: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.50,
    note_mr: 'कलिंगडाला वालुकामय जमीन व गोडव्यासाठी पालाश पोषक ठरते.',
    note_en: 'Best in sandy loam riverbeds; potassium enhances fruit sugar brix.'
  },
  muskmelon: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.8,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'high', minOC: 0.50,
    note_mr: 'खरबुजासाठी चांगला निचरा व सूर्यप्रकाश अनुकूल.',
    note_en: 'Needs sunny, well-drained loams with adequate potassium.'
  },
  coriander: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 8.0], ecMax: 1.5,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'low', minOC: 0.45,
    note_mr: 'कोथिंबीर कमी कालावधीत भुसभुशीत जमिनीत वेगाने वाढते.',
    note_en: 'Quick growing herb thriving in fertile, friable soils.'
  },
  capsicum: {
    phOpt: [6.0, 7.2], phAbs: [5.5, 7.8], ecMax: 1.6,
    isNFixer: false, nDemand: 'high', pDemand: 'high', kDemand: 'high', minOC: 0.60,
    note_mr: 'ढोबळी मिरचीला उत्तम सेंद्रिय कर्ब व पालाशची गरज असते.',
    note_en: 'Demands rich organic matter and steady potassium supply.'
  },
  peas: {
    phOpt: [6.0, 7.5], phAbs: [5.5, 7.8], ecMax: 1.5,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.45,
    note_mr: 'मटार नत्र फिक्स करतो; स्फुरद उपलब्ध असल्यास शेंगांचा दर्जा सुधारतो.',
    note_en: 'Nitrogen-fixing legume requiring phosphorus for root nodulation.'
  },
  french_beans: {
    phOpt: [5.8, 6.8], phAbs: [5.3, 7.5], ecMax: 1.2,
    isNFixer: true, nDemand: 'low', pDemand: 'high', kDemand: 'med', minOC: 0.50,
    note_mr: 'फरसबी जास्त क्षारतेस अत्यंत संवेदनशील असते.',
    note_en: 'Extremely sensitive to soil salinity and excess lime.'
  }
};

// ---------------------------------------------------------------------------
// 3. Input Validation
// ---------------------------------------------------------------------------
export function validateSoilLabInputs(data) {
  const errors = {};
  const warnings = {};

  if (!data) return { isValid: false, errors: { general: 'No data provided' }, warnings };

  // pH validation (physically possible 3.0 to 11.0; standard agri soils 4.5 to 9.5)
  if (data.ph !== undefined && data.ph !== null && data.ph !== '') {
    const phVal = Number(data.ph);
    if (isNaN(phVal) || phVal < 3.0 || phVal > 11.0) {
      errors.ph = 'pH must be between 3.0 and 11.0 (जमिनीचा सामू ३.० ते ११.० दरम्यान असावा)';
    } else if (phVal < 5.0 || phVal > 9.0) {
      warnings.ph = 'Extreme soil pH detected. Special amendment required (अति आम्ल/विम्ल जमीन)';
    }
  }

  // Electrical Conductivity (EC) (0.0 to 25.0 dS/m)
  if (data.ec !== undefined && data.ec !== null && data.ec !== '') {
    const ecVal = Number(data.ec);
    if (isNaN(ecVal) || ecVal < 0 || ecVal > 25.0) {
      errors.ec = 'EC must be between 0.0 and 25.0 dS/m (क्षारता ० ते २५ dS/m असावी)';
    } else if (ecVal > 3.0) {
      warnings.ec = 'High salinity detected (> 3.0 dS/m). Salt-tolerant crops advised.';
    }
  }

  // Organic Carbon (OC) (0.01% to 6.0%)
  if (data.organicCarbon !== undefined && data.organicCarbon !== null && data.organicCarbon !== '') {
    const ocVal = Number(data.organicCarbon);
    if (isNaN(ocVal) || ocVal < 0 || ocVal > 6.0) {
      errors.organicCarbon = 'Organic Carbon must be between 0.01% and 6.0% (सेंद्रिय कर्ब ० ते ६% दरम्यान)';
    } else if (ocVal < 0.35) {
      warnings.organicCarbon = 'Very low organic carbon. High FYM/vermicompost application required.';
    }
  }

  // Nitrogen (N) (10 to 1200 kg/ha)
  if (data.nitrogen !== undefined && data.nitrogen !== null && data.nitrogen !== '') {
    const nVal = Number(data.nitrogen);
    if (isNaN(nVal) || nVal < 0 || nVal > 1500) {
      errors.nitrogen = 'Nitrogen must be between 0 and 1500 kg/ha';
    }
  }

  // Phosphorus (P) (0 to 300 kg/ha)
  if (data.phosphorus !== undefined && data.phosphorus !== null && data.phosphorus !== '') {
    const pVal = Number(data.phosphorus);
    if (isNaN(pVal) || pVal < 0 || pVal > 400) {
      errors.phosphorus = 'Phosphorus must be between 0 and 400 kg/ha';
    }
  }

  // Potassium (K) (0 to 1500 kg/ha)
  if (data.potassium !== undefined && data.potassium !== null && data.potassium !== '') {
    const kVal = Number(data.potassium);
    if (isNaN(kVal) || kVal < 0 || kVal > 1500) {
      errors.potassium = 'Potassium must be between 0 and 1500 kg/ha';
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors, warnings };
}

// ---------------------------------------------------------------------------
// 4. Soil Health Gap Analysis (Diagnostic & Amelioration Advisory)
// ---------------------------------------------------------------------------
export function analyzeSoilHealthGap(labData) {
  if (!labData) return null;

  const ph = Number(labData.ph) || 7.2;
  const ec = Number(labData.ec) || 0.4;
  const oc = Number(labData.organicCarbon) || 0.55;
  const n = Number(labData.nitrogen) || 240;
  const p = Number(labData.phosphorus) || 18;
  const k = Number(labData.potassium) || 310;

  // 1. Parameter Evaluations
  const params = {};

  // pH
  if (ph < 5.5) {
    params.ph = {
      value: ph, status: 'danger', category: 'stronglyAcidic',
      label_mr: 'अति आम्लधर्मी (pH < 5.5)', label_en: 'Strongly Acidic',
      gap_mr: 'कॅल्शियम व मॅग्नेशियमची तीव्र कमतरता, सूक्ष्मजीव कार्य मंदावते',
      gap_en: 'Severe Ca/Mg deficiency, aluminum toxicity risk',
      advisory_mr: 'शेतात हेक्टरी २ ते ३ टन कृषी चुना (Agricultural Lime) किंवा डोलोमाईट मिसळा.',
      advisory_en: 'Apply agricultural lime (CaCO3) or dolomite @ 2-3 tons/ha before monsoon.'
    };
  } else if (ph < 6.5) {
    params.ph = {
      value: ph, status: 'warning', category: 'moderatelyAcidic',
      label_mr: 'मध्यम आम्लधर्मी (pH 5.5 - 6.5)', label_en: 'Moderately Acidic',
      gap_mr: 'किंचित आम्लता, बहुतांश पिकांना योग्य पण कापूस व गव्हासाठी मर्यादा',
      gap_en: 'Mild acidity, suitable for fruits and rice, marginal for cotton',
      advisory_mr: 'सेंद्रिय शेणखत व लाकडी राख वापरा.',
      advisory_en: 'Incorporate well-decomposed FYM and wood ash.'
    };
  } else if (ph <= 7.5) {
    params.ph = {
      value: ph, status: 'good', category: 'optimal',
      label_mr: 'उत्तम उदासीन (pH 6.5 - 7.5)', label_en: 'Optimal / Neutral',
      gap_mr: 'सर्व मुख्य व सूक्ष्म अन्नद्रव्ये पिकांना सहज उपलब्ध होतात',
      gap_en: 'Ideal balanced nutrient availability for all crops',
      advisory_mr: 'सध्याची सुपीकता टिकवण्यासाठी नियमित सेंद्रिय खतांचा वापर सुरू ठेवा.',
      advisory_en: 'Maintain balanced organic matter and crop rotation.'
    };
  } else if (ph <= 8.5) {
    params.ph = {
      value: ph, status: 'warning', category: 'moderatelyAlkaline',
      label_mr: 'मध्यम विम्लधर्मी / चुनखडीयुक्त (pH 7.5 - 8.5)', label_en: 'Moderately Alkaline',
      gap_mr: 'स्फुरद, लोह (Fe) व जस्त (Zn) मातीत अडकून पिकास कमी मिळतात',
      gap_en: 'Phosphorus fixation and iron/zinc micro-deficiencies common',
      advisory_mr: 'शेणखतात मिसळून सिंगल सुपर फॉस्फेट (SSP) व फेरस/झिंक सल्फेट चिलेटेड स्वरूपात द्या.',
      advisory_en: 'Use Single Super Phosphate (SSP) with FYM; spray chelated Fe and Zn.'
    };
  } else {
    params.ph = {
      value: ph, status: 'danger', category: 'stronglyAlkaline',
      label_mr: 'अति विम्लधर्मी / चोपण (pH > 8.5)', label_en: 'Strongly Sodic / Alkali',
      gap_mr: 'सोडियमचे प्रमाण वाढल्याने जमीन घट्ट होते व पाण्याचा निचरा थांबतो',
      gap_en: 'High exchangeable sodium degrades soil structure and permeability',
      advisory_mr: 'माती परीक्षणानुसार हेक्टरी २.५ ते ४ टन जिप्सम (Gypsum) टाका व धैंचा/ताग गाडून हिरवळीचे खत करा.',
      advisory_en: 'Apply gypsum @ 2.5-4 t/ha followed by leaching; green manure with Dhaincha.'
    };
  }

  // EC (Salinity)
  if (ec <= 1.0) {
    params.ec = {
      value: ec, status: 'good', category: 'normal',
      label_mr: 'उत्तम / क्षारमुक्त (< 1.0 dS/m)', label_en: 'Normal / Safe',
      gap_mr: 'क्षारतेचा कोणताही ताण नाही, सर्व संवेदनशील पिकांसाठी सुरक्षित',
      gap_en: 'No salinity stress; completely safe for all sensitive crops',
      advisory_mr: 'पाण्याचा योग्य निचरा कायम ठेवा.',
      advisory_en: 'Maintain good sub-surface drainage.'
    };
  } else if (ec <= 2.0) {
    params.ec = {
      value: ec, status: 'warning', category: 'critical',
      label_mr: 'मध्यम क्षारता (1.0 - 2.0 dS/m)', label_en: 'Critical / Slight Salinity',
      gap_mr: 'स्ट्रॉबेरी, कांदा, कडधान्ये या पिकांच्या उगवण व उत्पादनावर परिणाम संभवतो',
      gap_en: 'Yield reduction possible in salt-sensitive vegetables and fruits',
      advisory_mr: 'ठिबक सिंचनाने पाणी द्या, शेतात पाणी साचू देऊ नका, सेंद्रिय आच्छादन (Mulching) करा.',
      advisory_en: 'Use drip irrigation, avoid dry spells, apply organic mulch to suppress salt buildup.'
    };
  } else {
    params.ec = {
      value: ec, status: 'danger', category: 'saline',
      label_mr: 'हानिकारक क्षारता (> 2.0 dS/m)', label_en: 'Harmful Saline Soil',
      gap_mr: 'जमीन खारवट असल्याने झाडांना मुळांद्वारे पाणी शोषण्यास अडथळा होतो',
      gap_en: 'High osmotic potential restricts crop water uptake',
      advisory_mr: 'क्षार सहन करणारी पिके (कापूस, ज्वारी, करडई) निवडा; शेतातून चर खोदून क्षार वाहून काढा.',
      advisory_en: 'Grow salt-tolerant crops (cotton, sorghum, safflower); install field drains to leach salts.'
    };
  }

  // Organic Carbon (OC)
  if (oc < 0.50) {
    params.organicCarbon = {
      value: oc, status: 'danger', category: 'low',
      label_mr: 'कमी सेंद्रिय कर्ब (< 0.50%)', label_en: 'Low (< 0.50%)',
      gap_mr: 'मातीची पाणी धरून ठेवण्याची क्षमता व उपयुक्त जिवाणूंची संख्या कमी',
      gap_en: 'Low moisture holding capacity and poor microbial activity',
      advisory_mr: 'हेक्टरी ५ ते ८ टन चांगले कुजलेले शेणखत किंवा गांडूळ खत (Vermicompost) अवश्य वापरा.',
      advisory_en: 'Incorporate 5-8 tons/ha FYM or vermicompost; avoid burning crop residues.'
    };
  } else if (oc <= 0.75) {
    params.organicCarbon = {
      value: oc, status: 'warning', category: 'medium',
      label_mr: 'मध्यम सेंद्रिय कर्ब (0.50 - 0.75%)', label_en: 'Moderate (0.50 - 0.75%)',
      gap_mr: 'मातीची रचना सर्वसाधारण पिकांसाठी समाधानकारक',
      gap_en: 'Moderate soil structure and water retention',
      advisory_mr: 'पिकांचे अवशेष जमिनीत गाडा व आंतरपीक पद्धत अवलंबा.',
      advisory_en: 'Practice crop residue mulching and intercropping with legumes.'
    };
  } else {
    params.organicCarbon = {
      value: oc, status: 'good', category: 'high',
      label_mr: 'उत्तम सेंद्रिय कर्ब (> 0.75%)', label_en: 'High / Optimal (> 0.75%)',
      gap_mr: 'जमीन कसदार असून गांडूळ व जिवाणूंची क्रियाशीलता उत्कृष्ट',
      gap_en: 'Rich organic matter, fertile and highly resilient soil',
      advisory_mr: 'सेंद्रिय पद्धतीचे व्यवस्थापन पुढे चालू ठेवा.',
      advisory_en: 'Excellent condition; maintain current biological practices.'
    };
  }

  // Nitrogen (N)
  if (n < 280) {
    params.nitrogen = {
      value: n, status: 'danger', category: 'low',
      label_mr: 'कमी नत्र (< 280 kg/ha)', label_en: 'Low (< 280 kg/ha)',
      gap_mr: 'झाडांची शाकीय वाढ खुंटू शकते, पाने पिवळी पडू शकतात',
      gap_en: 'Stunted vegetative growth and chlorosis in heavy feeders',
      advisory_mr: 'कडधान्य पिकांना प्राधान्य द्या (नत्र फिक्स करतात); इतर पिकांना युरिया/डीएपी शिफारशीनुसार हप्त्याने द्या.',
      advisory_en: 'Legumes recommended; apply split doses of neem-coated urea or compost.'
    };
  } else if (n <= 560) {
    params.nitrogen = {
      value: n, status: 'good', category: 'medium',
      label_mr: 'मध्यम नत्र (280 - 560 kg/ha)', label_en: 'Medium (280 - 560 kg/ha)',
      gap_mr: 'बहुतेक पिकांच्या वाढीसाठी संतुलित नत्र उपलब्ध',
      gap_en: 'Adequate baseline nitrogen for normal crop growth',
      advisory_mr: 'पिकांच्या गरजेनुसार सामान्य खतमात्रा द्या.',
      advisory_en: 'Follow standard recommended fertilizer doses (RDF).'
    };
  } else {
    params.nitrogen = {
      value: n, status: 'good', category: 'high',
      label_mr: 'भरपूर नत्र (> 560 kg/ha)', label_en: 'High (> 560 kg/ha)',
      gap_mr: 'नत्राचे प्रमाण उत्तम; अतिरिक्त रासायनिक खत देणे टाळावे',
      gap_en: 'High nitrogen reserve; reduce basal chemical N to prevent lodging',
      advisory_mr: 'जादा युरिया टाळा जेणेकरून कीड-रोगांचा प्रादुर्भाव वाढणार नाही.',
      advisory_en: 'Avoid excess urea application to reduce pest infestation and succulent growth.'
    };
  }

  // Phosphorus (P)
  if (p < 23) {
    params.phosphorus = {
      value: p, status: 'danger', category: 'low',
      label_mr: 'कमी स्फुरद (< 23 kg/ha)', label_en: 'Low (< 23 kg/ha)',
      gap_mr: 'मुळांचा विकास मंदावतो, फुलोरा व फळधारणेवर थेट विपरीत परिणाम',
      gap_en: 'Poor root branching and delayed flowering/pod set',
      advisory_mr: 'पेरणीवेळी बियाण्याखाली सिंगल सुपर फॉस्फेट (SSP) द्या व पीएसबी (PSB) जिवाणू संवर्धक वापरा.',
      advisory_en: 'Place Single Super Phosphate (SSP) at root zone; treat seeds with PSB biofertilizer.'
    };
  } else if (p <= 56) {
    params.phosphorus = {
      value: p, status: 'good', category: 'medium',
      label_mr: 'मध्यम स्फुरद (23 - 56 kg/ha)', label_en: 'Medium (23 - 56 kg/ha)',
      gap_mr: 'मुळांच्या वाढीसाठी समाधानकारक स्फुरद',
      gap_en: 'Adequate phosphorus for root network and seed formation',
      advisory_mr: 'शिफारशीत स्फुरदयुक्त खतमात्रा द्या.',
      advisory_en: 'Apply standard balanced fertilizer doses.'
    };
  } else {
    params.phosphorus = {
      value: p, status: 'good', category: 'high',
      label_mr: 'भरपूर स्फुरद (> 56 kg/ha)', label_en: 'High (> 56 kg/ha)',
      gap_mr: 'स्फुरदाचे प्रमाण भरपूर आहे',
      gap_en: 'High phosphorus availability in soil reserve',
      advisory_mr: 'रासायनिक स्फुरद खतांचा खर्च कमी करता येईल.',
      advisory_en: 'Can economize on external chemical phosphorus fertilizers.'
    };
  }

  // Potassium (K)
  if (k < 140) {
    params.potassium = {
      value: k, status: 'danger', category: 'low',
      label_mr: 'कमी पालाश (< 140 kg/ha)', label_en: 'Low (< 140 kg/ha)',
      gap_mr: 'फळे व दाण्यांची चकाकी, गोडवा व रोगप्रतिकारक शक्ती कमी होते',
      gap_en: 'Decreased pest resistance, poor grain filling, low fruit brix',
      advisory_mr: 'म्युरेट ऑफ पोटॅश (MOP 0:0:60) किंवा सल्फेट ऑफ पोटॅश (SOP) चा वापर करा.',
      advisory_en: 'Apply Muriate of Potash (MOP) or SOP, especially for fruits, sugarcane, and vegetables.'
    };
  } else if (k <= 280) {
    params.potassium = {
      value: k, status: 'good', category: 'medium',
      label_mr: 'मध्यम पालाश (140 - 280 kg/ha)', label_en: 'Medium (140 - 280 kg/ha)',
      gap_mr: 'सर्वसाधारण पिकांसाठी पुरेसे पालाश',
      gap_en: 'Satisfactory potassium reserve for field crops',
      advisory_mr: 'फळबाग व नगदी पिकांना शिफारशीनुसार अतिरिक्त पालाश द्या.',
      advisory_en: 'Maintain maintenance dose for heavy feeders like banana and grapes.'
    };
  } else {
    params.potassium = {
      value: k, status: 'good', category: 'high',
      label_mr: 'भरपूर पालाश (> 280 kg/ha)', label_en: 'High (> 280 kg/ha)',
      gap_mr: 'महाराष्ट्राच्या काळ्या मातीतील नैसर्गिक भरपूर पालाश; फळांच्या दर्जेदार गुणवत्तेसाठी अत्यंत फायदेशीर',
      gap_en: 'Rich natural potassium reserve typical of Maharashtra Vertisols; excellent for fruits and cane',
      advisory_mr: 'पालाश खतांवर होणारा रासायनिक खर्च कमी करता येईल.',
      advisory_en: 'Minimal external potash required, saving input costs.'
    };
  }

  // Calculate Overall Soil Health Score (0 - 100)
  let healthScore = 100;
  if (params.ph.status === 'danger') healthScore -= 25;
  else if (params.ph.status === 'warning') healthScore -= 10;

  if (params.ec.status === 'danger') healthScore -= 25;
  else if (params.ec.status === 'warning') healthScore -= 12;

  if (params.organicCarbon.status === 'danger') healthScore -= 20;
  else if (params.organicCarbon.status === 'warning') healthScore -= 8;

  if (params.phosphorus.status === 'danger') healthScore -= 15;
  if (params.nitrogen.status === 'danger') healthScore -= 10;
  if (params.potassium.status === 'danger') healthScore -= 10;

  healthScore = Math.max(30, Math.min(98, healthScore));

  let healthStatus_mr = 'उत्तम जमीन आरोग्य';
  let healthStatus_en = 'Good Soil Health';
  let badgeColor = '#1B5E20';
  let badgeBg = '#E8F5E9';

  if (healthScore < 60) {
    healthStatus_mr = 'माती सुधारणेची तातडीची गरज';
    healthStatus_en = 'Urgent Soil Amelioration Needed';
    badgeColor = '#C62828';
    badgeBg = '#FFEBEE';
  } else if (healthScore < 80) {
    healthStatus_mr = 'मध्यम सुपीकता - काही त्रुटी';
    healthStatus_en = 'Moderate Fertility - Minor Deficiencies';
    badgeColor = '#E65100';
    badgeBg = '#FFF3E0';
  }

  return {
    params,
    healthScore,
    healthStatus_mr,
    healthStatus_en,
    badgeColor,
    badgeBg,
    summaryValues: { ph, ec, oc, n, p, k }
  };
}

// ---------------------------------------------------------------------------
// 5. Scientific Crop Soil Lab Match Evaluator
// ---------------------------------------------------------------------------
export function computeCropSoilLabScore(cropId, labData) {
  if (!labData) return null;

  const profile = CROP_SOIL_SCIENCE_PROFILES[cropId] || {
    phOpt: [6.0, 7.8], phAbs: [5.5, 8.4], ecMax: 2.0,
    isNFixer: false, nDemand: 'med', pDemand: 'med', kDemand: 'med', minOC: 0.45,
    note_mr: 'सर्वसाधारण कसदार जमिनीत योग्य वाढ होते.',
    note_en: 'Performs well in balanced fertile soil.'
  };

  const ph = Number(labData.ph) || 7.2;
  const ec = Number(labData.ec) || 0.4;
  const oc = Number(labData.organicCarbon) || 0.55;
  const n = Number(labData.nitrogen) || 240;
  const p = Number(labData.phosphorus) || 18;
  const k = Number(labData.potassium) || 310;

  const limitations_mr = [];
  const limitations_en = [];
  let severeConflict = false;

  // 1. pH Score (0 - 100)
  let phScore = 100;
  const [phOptMin, phOptMax] = profile.phOpt;
  const [phAbsMin, phAbsMax] = profile.phAbs;

  if (ph >= phOptMin && ph <= phOptMax) {
    phScore = 100;
  } else if (ph >= phAbsMin && ph <= phAbsMax) {
    if (ph < phOptMin) {
      const dist = phOptMin - ph;
      const span = phOptMin - phAbsMin || 0.5;
      phScore = Math.max(65, Math.round(100 - (dist / span) * 35));
      limitations_mr.push(`किंचित आम्लधर्मी जमीन (pH ${ph}) - या पिकासाठी आदर्श सामू ${phOptMin}-${phOptMax} आहे`);
      limitations_en.push(`Slightly acidic for this crop (pH ${ph}, ideal is ${phOptMin}-${phOptMax})`);
    } else {
      const dist = ph - phOptMax;
      const span = phAbsMax - phOptMax || 0.5;
      phScore = Math.max(65, Math.round(100 - (dist / span) * 35));
      limitations_mr.push(`किंचित चुनखडीयुक्त / विम्ल जमीन (pH ${ph}) - सूक्ष्म अन्नद्रव्यांची कमतरता संभवते`);
      limitations_en.push(`Moderately alkaline (pH ${ph}) - potential micronutrient lockup`);
    }
  } else {
    // Severe out of range
    if (ph < phAbsMin) {
      phScore = Math.max(20, Math.round(50 - (phAbsMin - ph) * 30));
      limitations_mr.push(`अति आम्लधर्मी जमीन (pH ${ph}) या पिकासाठी अत्यंत प्रतिकूल`);
      limitations_en.push(`Strongly acidic soil (pH ${ph}) is detrimental for this crop`);
      severeConflict = true;
    } else {
      phScore = Math.max(20, Math.round(50 - (ph - phAbsMax) * 30));
      limitations_mr.push(`अति विम्ल / चोपण जमीन (pH ${ph}) या पिकासाठी अयोग्य`);
      limitations_en.push(`Excessive soil alkalinity (pH ${ph}) severely restricts this crop`);
      if (cropId === 'strawberry' || cropId === 'potato' || cropId === 'french_beans') {
        severeConflict = true;
      }
    }
  }

  // 2. EC (Salinity) Score (0 - 100)
  let ecScore = 100;
  if (ec <= 1.0) {
    ecScore = 100;
  } else if (ec <= profile.ecMax) {
    const ratio = (ec - 1.0) / (profile.ecMax - 1.0 || 0.5);
    ecScore = Math.max(68, Math.round(100 - ratio * 30));
    limitations_mr.push(`मध्यम क्षारता (EC ${ec} dS/m) मुळे उत्पादनात ५-१०% घट शक्य`);
    limitations_en.push(`Moderate salinity (EC ${ec} dS/m) may slightly suppress yield`);
  } else {
    // Exceeds crop tolerance threshold
    const excess = ec - profile.ecMax;
    ecScore = Math.max(15, Math.round(60 - excess * 25));
    limitations_mr.push(`जमिनीची क्षारता (${ec} dS/m) या पिकाच्या सहनशीलतेपेक्षा (${profile.ecMax} dS/m) जास्त`);
    limitations_en.push(`Soil salinity (${ec} dS/m) exceeds crop tolerance limit (${profile.ecMax} dS/m)`);
    if (excess > 1.0) {
      severeConflict = true;
    }
  }

  // 3. NPK Compatibility Score (0 - 100)
  let npkScore = 85;

  // Nitrogen
  if (profile.isNFixer) {
    // Pulses/Legumes fix own N!
    if (n < 280) {
      npkScore += 5; // Advantage: performs well even when soil N is low
    }
  } else if (profile.nDemand === 'very_high' || profile.nDemand === 'high') {
    if (n < 280) {
      npkScore -= 15;
      limitations_mr.push('जमिनीत नत्र (N) कमी असल्याने जादा रासायनिक खतांचा खर्च येईल');
      limitations_en.push('Low soil nitrogen requires supplemental top dressing');
    } else if (n > 560) {
      npkScore += 5;
    }
  }

  // Phosphorus
  if (profile.pDemand === 'high' || profile.isNFixer) {
    if (p < 23) {
      npkScore -= 12;
      limitations_mr.push('स्फुरद (P) ची कमतरता - मुळांच्या वाढीसाठी एसएसपी खत आवश्यक');
      limitations_en.push('Low soil phosphorus may restrict root development');
    } else if (p > 56) {
      npkScore += 5;
    }
  }

  // Potassium
  if (profile.kDemand === 'very_high') {
    if (k < 140) {
      npkScore -= 20;
      limitations_mr.push('पालाश (K) तीव्र कमी - फळांचा आकार व दर्जा घटू शकतो');
      limitations_en.push('Deficient potassium severely limits fruit size, brix, and cane yield');
    } else if (k > 280) {
      npkScore += 10;
    }
  } else if (profile.kDemand === 'high') {
    if (k < 140) {
      npkScore -= 10;
      limitations_mr.push('पालाश कमी असल्याने पोटॅश खत देणे गरजेचे');
      limitations_en.push('Low potassium requires external potash management');
    } else if (k > 280) {
      npkScore += 5;
    }
  }
  npkScore = Math.max(30, Math.min(100, npkScore));

  // 4. Organic Carbon Fit (0 - 100)
  let ocScore = 90;
  if (oc < profile.minOC) {
    const gap = profile.minOC - oc;
    ocScore = Math.max(40, Math.round(90 - (gap / profile.minOC) * 45));
    if (profile.minOC >= 0.65) {
      limitations_mr.push('या पिकासाठी सेंद्रिय कर्ब (OC) जास्त आवश्यक; भरपूर शेणखत द्यावे लागेल');
      limitations_en.push('Demands higher soil organic matter than currently measured');
    }
  } else if (oc >= 0.75) {
    ocScore = 100;
  }

  // Composite Weighted Soil Lab Score (0 - 100)
  // Weights: pH 35%, Salinity (EC) 25%, NPK match 25%, Organic Carbon 15%
  let finalLabScore = Math.round(
    phScore * 0.35 +
    ecScore * 0.25 +
    npkScore * 0.25 +
    ocScore * 0.15
  );

  if (severeConflict) {
    finalLabScore = Math.min(finalLabScore, 48);
  }

  finalLabScore = Math.max(20, Math.min(99, finalLabScore));

  // Determine Match Degree & Explanations
  let matchDegree_mr = 'उत्तम माती अनुकूलता';
  let matchDegree_en = 'Optimal Soil Match';
  let matchColor = '#1B5E20';
  let matchBg = '#E8F5E9';

  if (finalLabScore < 55 || severeConflict) {
    matchDegree_mr = 'माती मर्यादा / अयोग्य';
    matchDegree_en = 'Severe Soil Limitations';
    matchColor = '#C62828';
    matchBg = '#FFEBEE';
  } else if (finalLabScore < 72) {
    matchDegree_mr = 'मध्यम अनुकूल - खत व्यवस्थापन आवश्यक';
    matchDegree_en = 'Moderate - Needs Amendments';
    matchColor = '#E65100';
    matchBg = '#FFF3E0';
  } else if (finalLabScore < 85) {
    matchDegree_mr = 'चांगली माती अनुकूलता';
    matchDegree_en = 'Good Soil Match';
    matchColor = '#2E7D32';
    matchBg = '#E8F5E9';
  }

  let explanation_mr = profile.note_mr;
  let explanation_en = profile.note_en;

  if (limitations_mr.length > 0) {
    explanation_mr += ` (लक्षात घ्या: ${limitations_mr.slice(0, 2).join('; ')})`;
    explanation_en += ` (Note: ${limitations_en.slice(0, 2).join('; ')})`;
  }

  return {
    cropId,
    soilLabScore: finalLabScore,
    phScore,
    ecScore,
    npkScore,
    ocScore,
    matchDegree_mr,
    matchDegree_en,
    matchColor,
    matchBg,
    limitations_mr,
    limitations_en,
    explanation_mr,
    explanation_en,
    severeConflict,
    cropProfile: profile
  };
}
