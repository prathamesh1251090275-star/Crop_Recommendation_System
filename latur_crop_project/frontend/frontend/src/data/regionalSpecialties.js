// Regional crop strengths for Maharashtra: what each district - and, where it
// really matters, each tehsil - is actually known for.
//
// WHY THIS FILE EXISTS
// The app used to force a specialty crop to a fixed 92-99 score with
// Math.max(), which let a hand-written prior beat measured soil/weather data
// (gram measured 48 in Ausa displayed as 99). Here a region only contributes a
// *bounded* nudge of 2-6 points, applied by lib/scoreCrop.js and never able to
// rescue a crop the data says is unsuitable.
//
// DATA RULES
//  - `gi`         crops with a documented Geographical Indication / signature
//                 status for that district.
//  - `district`   strength 1 (notable) .. 3 (district-wide signature crop).
//  - `tehsils`    overrides/additions for the tehsils where the crop is
//                 genuinely concentrated (Niphad onions, Katol oranges, ...).
//  - `excluded`   crops that do not belong in the region at all; their score is
//                 capped so they can never read as a recommendation.
//
// Every district/tehsil/crop id is validated against locations.js and
// cropsData.js by `npm run verify:scoring`, so a typo like the old
// `Ahmednagar` / `Saoner` keys fails the build instead of silently doing
// nothing.

export const SPECIALTY_POINTS = { 1: 2, 2: 4, 3: 6 };

// A specialty may only nudge a crop that the data already considers plausible.
// Below this base score the crop stays "not suitable" and the UI shows the
// caution note instead of a boost.
export const SPECIALTY_MIN_BASE = 55;

const CONKAN_EXCLUDED = ['cotton', 'wheat', 'sugarcane', 'jowar', 'soybean', 'gram', 'safflower'];

export const REGIONS = {
  Latur: {
    gi: ['tur', 'mosambi'],
    note_en: 'Latur is the state’s tur (pigeonpea) and sweet-lime belt, with soybean and gram as its main rotation crops.',
    note_mr: 'लातूर हा राज्यातील तूर व मोसंबीचा प्रमुख पट्टा आहे; सोयाबीन व हरभरा ही मुख्य फेरपालटी पिके आहेत.',
    district: { tur: 3, mosambi: 3, soybean: 3, gram: 2 },
    tehsils: {
      Ahmadpur: { mosambi: 3 },
      Ahmedpur: { mosambi: 3 },
      Ausa: { soybean: 3, gram: 2 },
      Udgir: { tur: 3 },
      Nilanga: { tur: 2, soybean: 2 },
      Chakur: { gram: 2 },
      Renapur: { soybean: 2 },
      Deoni: { tur: 2 },
      Jalkot: { soybean: 2 },
      Latur: { mosambi: 2, tur: 2 },
      'Shirur Anantpal': { soybean: 2 },
    },
  },

  Nagpur: {
    gi: ['orange'],
    note_en: 'Nagpur is India’s orange city; cotton, soybean and tur dominate the rest of the district.',
    note_mr: 'नागपूर हे भारताचे संत्रा नगर आहे; उर्वरित जिल्ह्यात कापूस, सोयाबीन व तूर प्रमुख आहेत.',
    district: { orange: 3, cotton: 3, soybean: 3, tur: 2 },
    tehsils: {
      Katol: { orange: 3 },
      Savner: { orange: 2, cotton: 3 },
      Kamptee: { orange: 2 },
      Kamthi: { orange: 2 },
      Hingna: { orange: 2 },
      Ramtek: { rice: 2 },
      Narkhed: { orange: 2, cotton: 2 },
      Umred: { rice: 2 },
    },
  },

  Amravati: {
    gi: ['orange'],
    note_en: 'Amravati grows the Vidarbha orange belt around Morshi and Warud, plus heavy cotton and soybean.',
    note_mr: 'अमरावती जिल्ह्यात मोर्शी व वरुड परिसरात संत्रा पट्टा, तसेच मोठ्या प्रमाणात कापूस व सोयाबीन घेतले जाते.',
    district: { orange: 2, cotton: 3, soybean: 3, tur: 2 },
    tehsils: {
      Morshi: { orange: 3 },
      Warud: { orange: 3 },
      Achalpur: { cotton: 3 },
      Daryapur: { banana: 3 },
      'Chandur Bazar': { cotton: 2, soybean: 2 },
      Bhatkuli: { banana: 2 },
    },
  },

  Akola: {
    note_en: 'Akola is a cotton and soybean district with a growing tur area.',
    note_mr: 'अकोला जिल्हा कापूस व सोयाबीनसाठी प्रसिद्ध असून तुरीचे क्षेत्र वाढत आहे.',
    district: { cotton: 3, soybean: 3, tur: 2 },
    tehsils: { Akot: { cotton: 3 }, Telhara: { cotton: 2, soybean: 2 } },
  },

  Buldhana: {
    note_en: 'Buldhana is a rainfed cotton and soybean district, with gram on the black-soil plains.',
    note_mr: 'बुलढाणा हा कोरडवाहू कापूस व सोयाबीनचा जिल्हा आहे; काळ्या जमिनीत हरभरा घेतला जातो.',
    district: { cotton: 3, soybean: 3, gram: 2 },
    tehsils: { Khamgaon: { cotton: 3 }, Shegaon: { cotton: 2 }, Malkapur: { cotton: 2, gram: 2 } },
  },

  Washim: {
    note_en: 'Washim is a soybean and tur district on the Vidarbha black-soil belt.',
    note_mr: 'वाशिम हा विदर्भातील काळ्या जमिनीचा सोयाबीन व तूर जिल्हा आहे.',
    district: { soybean: 3, tur: 2, cotton: 2 },
    tehsils: { Mangrulpir: { soybean: 3 }, Risod: { soybean: 2, tur: 2 } },
  },

  Yavatmal: {
    note_en: 'Yavatmal is one of India’s largest cotton districts, with soybean and tur alongside.',
    note_mr: 'यवतमाळ हा देशातील सर्वात मोठ्या कापूस उत्पादक जिल्ह्यांपैकी एक आहे; सोबत सोयाबीन व तूर.',
    district: { cotton: 3, soybean: 3, tur: 3 },
    tehsils: { Wani: { tur: 3 }, Pusad: { cotton: 2, tur: 2 }, Umarkhed: { cotton: 3 } },
  },

  Wardha: {
    note_en: 'Wardha grows cotton and soybean, with orange and tur in its south.',
    note_mr: 'वर्धा जिल्ह्यात कापूस व सोयाबीन, तसेच दक्षिण भागात संत्रा व तूर घेतली जाते.',
    district: { cotton: 3, soybean: 2, tur: 2, orange: 2 },
    tehsils: { Hinganghat: { cotton: 3 }, Arvi: { tur: 2, orange: 2 } },
  },

  Nashik: {
    gi: ['grapes', 'onion'],
    note_en: 'Nashik is India’s grape and wine capital; Niphad is the country’s largest onion mandi.',
    note_mr: 'नाशिक हे भारताचे द्राक्ष व वाइन राजधानी आहे; निफाड ही देशातील सर्वात मोठी कांदा बाजारपेठ आहे.',
    district: { grapes: 3, onion: 3, tomato: 2 },
    tehsils: {
      Niphad: { grapes: 3, onion: 3 },
      Dindori: { grapes: 3, tomato: 2 },
      Yeola: { onion: 3 },
      Malegaon: { onion: 2 },
      Sinnar: { tomato: 2, grapes: 2 },
      Igatpuri: { rice: 2 },
      Kalwan: { rice: 2 },
    },
  },

  Jalgaon: {
    gi: ['banana'],
    note_en: 'Jalgaon is India’s banana city, with cotton and onion as its other main crops.',
    note_mr: 'जळगाव हे भारताचे केळी नगर आहे; कापूस व कांदा ही इतर प्रमुख पिके.',
    district: { banana: 3, cotton: 3, onion: 2 },
    tehsils: {
      Raver: { banana: 3 },
      Chopda: { banana: 3 },
      Bhusawal: { banana: 2 },
      Jamner: { cotton: 2, banana: 2 },
      Amalner: { cotton: 2 },
    },
  },

  Dhule: {
    note_en: 'Dhule is a cotton, jowar and onion district on the Tapi plain.',
    note_mr: 'धुळे जिल्हा तापी खोऱ्यातील कापूस, ज्वारी व कांद्याचा जिल्हा आहे.',
    district: { cotton: 3, jowar: 2, onion: 2 },
    tehsils: { Shirpur: { cotton: 3, banana: 2 }, Sakri: { jowar: 2 } },
  },

  Nandurbar: {
    note_en: 'Nandurbar grows cotton and jowar, with rice in its wetter western tehsils.',
    note_mr: 'नंदुरबार जिल्ह्यात कापूस व ज्वारी; पश्चिम भागात भात.',
    district: { cotton: 3, jowar: 2, rice: 2 },
    tehsils: { Shahada: { cotton: 2, banana: 2 }, Akkalkuwa: { rice: 2 } },
  },

  Palghar: {
    gi: ['sapota'],
    note_en: 'Dahanu and Palghar are the state’s chikoo (sapota) belt, with rice and cashew.',
    note_mr: 'डहाणू व पालघर हा राज्यातील चिकू (सपोटा) पट्टा आहे; सोबत भात व काजू.',
    district: { sapota: 3, rice: 3, cashew: 2 },
    excluded: CONKAN_EXCLUDED,
    tehsils: { Dahanu: { sapota: 3, cashew: 2 }, Palghar: { sapota: 2 }, Wada: { rice: 2, sapota: 2 }, Vasai: { rice: 2 } },
  },

  Thane: {
    note_en: 'Thane is a rice and chikoo district, urbanising fast around the lake belt.',
    note_mr: 'ठाणे जिल्हा भात व चिकूसाठी ओळखला जातो; शहरीकरण झपाट्याने वाढत आहे.',
    district: { rice: 3, sapota: 2 },
    excluded: CONKAN_EXCLUDED,
    tehsils: { Shahapur: { rice: 3 }, Murbad: { rice: 3 } },
  },

  Raigad: {
    gi: ['mango'],
    note_en: 'Raigad grows Alphonso mango, coconut and rice along the Konkan coast.',
    note_mr: 'रायगड जिल्ह्यात कोकण किनाऱ्यावर अल्फोन्सो आंबा, नारळ व भात घेतला जातो.',
    district: { mango: 3, coconut: 3, rice: 3, cashew: 2 },
    excluded: ['cotton', 'wheat'],
    tehsils: { Alibag: { mango: 3, coconut: 2 }, Pen: { rice: 3 }, Panvel: { rice: 2, mango: 2 } },
  },

  Ratnagiri: {
    gi: ['mango', 'cashew'],
    note_en: 'Ratnagiri is the home of the Alphonso mango, with cashew and coconut.',
    note_mr: 'रत्नागिरी हे अल्फोन्सो आंब्याचे माहेरघर आहे; सोबत काजू व नारळ.',
    district: { mango: 3, cashew: 3, coconut: 3, rice: 2 },
    excluded: CONKAN_EXCLUDED,
    tehsils: { Dapoli: { cashew: 3 }, Ratnagiri: { mango: 3 }, Sangameshwar: { coconut: 2 }, Guhagar: { coconut: 3 } },
  },

  Sindhudurg: {
    gi: ['mango', 'cashew'],
    note_en: 'Sindhudurg grows Alphonso mango, cashew and coconut; Vengurla is its cashew hub.',
    note_mr: 'सिंधुदुर्ग जिल्ह्यात अल्फोन्सो आंबा, काजू व नारळ; वेंगुर्ला हे काजूचे केंद्र.',
    district: { mango: 3, cashew: 3, coconut: 3, rice: 2 },
    excluded: CONKAN_EXCLUDED,
    tehsils: { Vengurla: { cashew: 3, mango: 3 }, Malvan: { coconut: 3 }, Sawantwadi: { cashew: 2 } },
  },

  Satara: {
    gi: ['strawberry'],
    note_en: 'Mahabaleshwar and Wai grow the state’s strawberries; turmeric and sugarcane follow in the east.',
    note_mr: 'महाबळेश्वर व वाई परिसरात स्ट्रॉबेरी; पूर्व भागात हळद व ऊस.',
    district: { strawberry: 3, potato: 2, turmeric: 2 },
    excluded: [],
    tehsils: {
      Mahabaleshwar: { strawberry: 3 },
      Wai: { strawberry: 2, turmeric: 2 },
      Karad: { turmeric: 3, sugarcane: 2 },
      Koregaon: { sugarcane: 3 },
      Patan: { sugarcane: 2, turmeric: 2 },
    },
    tehsilExcluded: { Mahabaleshwar: ['cotton', 'rice', 'bajra', 'jowar'] },
  },

  Sangli: {
    gi: ['turmeric', 'grapes'],
    note_en: 'Sangli is the turmeric capital of India, with table grapes around Tasgaon and heavy sugarcane.',
    note_mr: 'सांगली ही भारताची हळद राजधानी आहे; तासगाव परिसरात द्राक्ष व मोठ्या प्रमाणात ऊस.',
    district: { turmeric: 3, grapes: 3, sugarcane: 3 },
    tehsils: { Tasgaon: { grapes: 3 }, Miraj: { turmeric: 3 }, Walwa: { sugarcane: 3 }, Palus: { sugarcane: 2 } },
  },

  Kolhapur: {
    gi: ['sugarcane'],
    note_en: 'Kolhapur is the jaggery (gul) capital; sugarcane dominates with rice in the ghats.',
    note_mr: 'कोल्हापूर हे गूळ उत्पादनाचे केंद्र आहे; ऊस प्रमुख, डोंगराळ भागात भात.',
    district: { sugarcane: 3, rice: 2 },
    tehsils: { Hatkanangale: { sugarcane: 3 }, Shirol: { sugarcane: 3 }, Karvir: { sugarcane: 2 }, Radhanagari: { rice: 3 } },
    tehsilExcluded: { _all: ['cotton', 'safflower'] },
  },

  Solapur: {
    gi: ['pomegranate'],
    note_en: 'Solapur is India’s pomegranate capital around Sangola and Malshiras, with jowar and sugarcane.',
    note_mr: 'सोलापूर जिल्ह्यात सांगोला व माळशिरस परिसरात डाळिंब; सोबत ज्वारी व ऊस.',
    district: { pomegranate: 3, jowar: 3, sugarcane: 2, gram: 2 },
    tehsils: {
      Sangola: { pomegranate: 3, jowar: 2 },
      Malshiras: { pomegranate: 3, sugarcane: 2 },
      Pandharpur: { pomegranate: 2, jowar: 2 },
      Barshi: { jowar: 3 },
      Mohol: { gram: 2, sugarcane: 2 },
    },
  },

  Pune: {
    gi: ['fig'],
    note_en: 'Purandar is India’s fig (anjeer) hub; onion, tomato and sugarcane fill the rest of the district.',
    note_mr: 'पुरंदर हे भारतातील अंजीर केंद्र आहे; उर्वरित जिल्ह्यात कांदा, टोमॅटो व ऊस.',
    district: { fig: 3, onion: 3, tomato: 2, grapes: 2 },
    tehsils: {
      Purandar: { fig: 3, custard_apple: 2 },
      Baramati: { sugarcane: 3, grapes: 2, onion: 2 },
      Haveli: { onion: 2, tomato: 2 },
      Indapur: { pomegranate: 2, sugarcane: 2 },
      Junnar: { onion: 3 },
      Shirur: { onion: 2, tomato: 2 },
    },
  },

  Ahilyanagar: {
    gi: ['pomegranate'],
    note_en: 'Ahilyanagar leads in onion, sugarcane, grapes and pomegranate; Rahata is a guava hub.',
    note_mr: 'अहिल्यानगर जिल्हा कांदा, ऊस, द्राक्ष व डाळिंबात आघाडीवर आहे; राहाता हे पेरूचे केंद्र.',
    district: { onion: 3, pomegranate: 3, sugarcane: 2, grapes: 2, guava: 2 },
    tehsils: {
      Rahata: { guava: 3 },
      Sangamner: { pomegranate: 3, onion: 2 },
      Shrirampur: { onion: 3, sugarcane: 2 },
      Kopargaon: { grapes: 2, sugarcane: 2 },
      Newasa: { sugarcane: 3 },
      Shrigonda: { pomegranate: 2, onion: 2 },
    },
  },

  Beed: {
    gi: ['custard_apple'],
    note_en: 'Beed is known for custard apple (sitaphal), cotton, soybean and tur.',
    note_mr: 'बीड जिल्हा सीताफळ, कापूस, सोयाबीन व तुरीसाठी ओळखला जातो.',
    district: { custard_apple: 3, cotton: 2, soybean: 2, tur: 2 },
    tehsils: { Dharur: { custard_apple: 3 }, Ambajogai: { custard_apple: 2, tur: 2 }, Kaij: { tur: 2 } },
  },

  Dharashiv: {
    note_en: 'Dharashiv grows custard apple, soybean, tur and gram on the Marathwada plateau.',
    note_mr: 'धाराशिव जिल्ह्यात मराठवाडा पठारावर सीताफळ, सोयाबीन, तूर व हरभरा घेतला जातो.',
    district: { custard_apple: 3, soybean: 2, tur: 2, gram: 2 },
    tehsils: { Tuljapur: { custard_apple: 3 }, Umarga: { tur: 2 }, Kalamb: { soybean: 2 } },
  },

  Jalna: {
    gi: ['mosambi'],
    note_en: 'Jalna is the sweet-lime (mosambi) district, with cotton and soybean.',
    note_mr: 'जालना हा मोसंबीचा जिल्हा आहे; सोबत कापूस व सोयाबीन.',
    district: { mosambi: 3, cotton: 3, soybean: 2 },
    tehsils: { Ambad: { mosambi: 3 }, Bhokardan: { mosambi: 2, cotton: 2 }, Jafrabad: { cotton: 2, mosambi: 2 } },
  },

  Parbhani: {
    note_en: 'Parbhani is a tur and soybean district; Gangakhed is a major tur mandi.',
    note_mr: 'परभणी हा तूर व सोयाबीनचा जिल्हा आहे; गंगाखेड ही मोठी तूर बाजारपेठ.',
    district: { tur: 3, soybean: 2, cotton: 2, jowar: 2 },
    tehsils: { Gangakhed: { tur: 3 }, Purna: { tur: 2, soybean: 2 }, Sailu: { cotton: 2 } },
  },

  Hingoli: {
    note_en: 'Hingoli is a soybean and tur district on the Marathwada black-soil belt.',
    note_mr: 'हिंगोली हा मराठवाड्यातील काळ्या जमिनीचा सोयाबीन व तूर जिल्हा आहे.',
    district: { soybean: 3, tur: 2, cotton: 2, jowar: 2 },
    tehsils: { Basmath: { soybean: 2, tur: 2 }, Kalamnuri: { soybean: 2 } },
  },

  Nanded: {
    note_en: 'Nanded is a tur, soybean and cotton district, with banana along the Godavari.',
    note_mr: 'नांदेड जिल्ह्यात तूर, सोयाबीन व कापूस; गोदावरी काठावर केळी.',
    district: { tur: 3, soybean: 3, cotton: 2, banana: 2 },
    tehsils: { Kinwat: { tur: 3, soybean: 2 }, Deglur: { tur: 2 }, Nanded: { banana: 2, tur: 2 }, Bhokar: { soybean: 2 } },
  },

  'Chhatrapati Sambhajinagar': {
    note_en: 'Sambhajinagar leads in cotton and maize; Paithan is known for grapes and bananas.',
    note_mr: 'संभाजीनगर जिल्हा कापूस व मका; पैठण परिसर द्राक्ष व केळीसाठी ओळखला जातो.',
    district: { cotton: 3, maize: 2, grapes: 2, onion: 2 },
    tehsils: { Kannad: { cotton: 3 }, Paithan: { grapes: 2, maize: 2, banana: 2 }, Sillod: { cotton: 2, maize: 2 } },
  },

  Bhandara: {
    note_en: 'Bhandara is a rice district with sugarcane and tur.',
    note_mr: 'भंडारा हा भाताचा जिल्हा आहे; सोबत ऊस व तूर.',
    district: { rice: 3, sugarcane: 2 },
    tehsils: { Tumsar: { rice: 3 }, Sakoli: { rice: 2 } },
  },

  Gondia: {
    note_en: 'Gondia is a rice district on the Wainganga plain.',
    note_mr: 'गोंदिया हा वैनगंगा खोऱ्यातील भाताचा जिल्हा आहे.',
    district: { rice: 3 },
    tehsils: { Tirora: { rice: 2 }, Goregaon: { rice: 2 } },
  },

  Chandrapur: {
    note_en: 'Chandrapur grows rice, cotton and tur on its mixed red and black soils.',
    note_mr: 'चंद्रपूर जिल्ह्यात लाल व काळ्या मिश्र जमिनीत भात, कापूस व तूर.',
    district: { rice: 3, cotton: 2, tur: 2 },
    tehsils: { Bramhapuri: { rice: 3 }, Warora: { cotton: 2 }, Chimur: { rice: 2 } },
  },

  Gadchiroli: {
    note_en: 'Gadchiroli is a rice district with tur and other pulses.',
    note_mr: 'गडचिरोली हा भाताचा जिल्हा आहे; सोबत तूर व इतर कडधान्ये.',
    district: { rice: 3, tur: 2 },
    tehsils: { Chamorshi: { rice: 3 }, Aheri: { rice: 2 } },
  },

  'Mumbai City': {
    note_en: 'Fully urban district - no meaningful farmland for crop recommendations.',
    note_mr: 'पूर्णपणे शहरी जिल्हा - पीक शिफारसीसाठी लागवडीची जमीन नाही.',
    district: {},
  },

  'Mumbai Suburban': {
    note_en: 'Fully urban district - no meaningful farmland for crop recommendations.',
    note_mr: 'पूर्णपणे शहरी जिल्हा - पीक शिफारसीसाठी लागवडीची जमीन नाही.',
    district: {},
  },
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** Strength (1-3) of a crop in this region, or null when it carries no specialty. */
export function getSpecialty(districtId, tehsilId, cropId) {
  const region = REGIONS[districtId];
  if (!region) return null;

  const gi = (region.gi || []).includes(cropId);
  const tehsilCrops = region.tehsils?.[tehsilId];

  if (tehsilCrops && tehsilCrops[cropId]) {
    return { strength: tehsilCrops[cropId], level: 'tehsil', gi };
  }
  if (region.district?.[cropId]) {
    return { strength: region.district[cropId], level: 'district', gi };
  }
  return null;
}

/** True when the crop genuinely does not belong in this region. */
export function isExcludedCrop(districtId, tehsilId, cropId) {
  const region = REGIONS[districtId];
  if (!region) return false;
  if ((region.excluded || []).includes(cropId)) return true;
  const perTehsil = region.tehsilExcluded?.[tehsilId] || region.tehsilExcluded?._all || [];
  return perTehsil.includes(cropId);
}

/**
 * Ordered list of what this place is known for - tehsil-level first, then
 * district-wide, without duplicates. Used by the "famous crops" section.
 */
export function getRegionalSpecialties(districtId, tehsilId) {
  const region = REGIONS[districtId];
  if (!region) return [];

  const seen = new Set();
  const out = [];

  const tehsilCrops = region.tehsils?.[tehsilId] || {};
  Object.entries(tehsilCrops)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cropId, strength]) => {
      seen.add(cropId);
      out.push({ cropId, strength, level: 'tehsil', gi: (region.gi || []).includes(cropId) });
    });

  Object.entries(region.district || {})
    .sort((a, b) => b[1] - a[1])
    .forEach(([cropId, strength]) => {
      if (seen.has(cropId)) return;
      seen.add(cropId);
      out.push({ cropId, strength, level: 'district', gi: (region.gi || []).includes(cropId) });
    });

  return out;
}

/** Bilingual description of the region, for the UI. */
export function getRegionNote(districtId) {
  const region = REGIONS[districtId];
  if (!region || !region.note_en) return null;
  return { note_en: region.note_en, note_mr: region.note_mr };
}
