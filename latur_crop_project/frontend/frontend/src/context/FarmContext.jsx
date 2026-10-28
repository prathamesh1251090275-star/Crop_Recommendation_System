import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations } from '../data/translations';
import { CROPS_DATA } from '../data/cropsData';
import { DISTRICTS, TEHSILS_BY_DISTRICT } from '../data/locations';
import { REGIONAL_SCORES } from '../data/regionalScores';
import { MANDI_PRICES } from '../data/mandiPrices';
import { computeCropSoilLabScore, analyzeSoilHealthGap, validateSoilLabInputs } from '../data/soilLabEngine';

const FarmContext = createContext();

// ---------------------------------------------------------------------------
// Maharashtra Geographical Indication (GI) & Specialty Agro-Fruit Belts
// ---------------------------------------------------------------------------
const REGIONAL_SPECIALTY_CROPS = {
  Solapur: {
    specialties: ['pomegranate', 'jowar'],
    tehsilBoosts: {
      Sangola: { pomegranate: 98, jowar: 95 },
      Malshiras: { pomegranate: 97, sugarcane: 94 },
      Pandharpur: { pomegranate: 97, jowar: 95 },
      _all: { pomegranate: 97, jowar: 95 }
    }
  },
  Jalgaon: {
    specialties: ['banana', 'cotton'],
    tehsilBoosts: {
      _all: { banana: 98, cotton: 95, maize: 92 }
    }
  },
  Nashik: {
    specialties: ['grapes', 'onion', 'tomato'],
    tehsilBoosts: {
      Niphad: { grapes: 98, onion: 97 },
      Dindori: { grapes: 98, tomato: 95 },
      _all: { grapes: 97, onion: 96, tomato: 94 }
    }
  },
  Satara: {
    specialties: ['strawberry', 'potato'],
    tehsilBoosts: {
      Mahabaleshwar: { strawberry: 99, potato: 95 },
      Wai: { strawberry: 97, turmeric: 95 },
      _all: { strawberry: 96, turmeric: 94, sugarcane: 92 }
    },
    penalties: {
      Mahabaleshwar: ['cotton', 'rice', 'bajra', 'jowar']
    }
  },
  Palghar: {
    specialties: ['sapota', 'cashew', 'coconut', 'rice'],
    tehsilBoosts: {
      Dahanu: { sapota: 98, cashew: 96, coconut: 95 },
      Palghar: { sapota: 97, cashew: 95, coconut: 95, rice: 94 },
      _all: { sapota: 97, cashew: 95, coconut: 95, rice: 94 }
    },
    penalties: {
      _all: ['cotton', 'wheat', 'jowar']
    }
  },
  Nagpur: {
    specialties: ['orange', 'cotton', 'soybean'],
    tehsilBoosts: {
      Katol: { orange: 98, cotton: 95 },
      Saoner: { orange: 98, cotton: 95 },
      _all: { orange: 98, cotton: 95, soybean: 95 }
    }
  },
  Amravati: {
    specialties: ['orange', 'cotton', 'soybean'],
    tehsilBoosts: {
      Morshi: { orange: 98, cotton: 95 },
      Warud: { orange: 98, cotton: 95 },
      _all: { orange: 97, cotton: 95, soybean: 95 }
    }
  },
  Ratnagiri: {
    specialties: ['mango', 'cashew', 'coconut'],
    tehsilBoosts: {
      _all: { mango: 99, cashew: 98, coconut: 96, rice: 94 }
    },
    penalties: {
      _all: ['cotton', 'wheat', 'sugarcane', 'jowar', 'soybean']
    }
  },
  Sindhudurg: {
    specialties: ['mango', 'cashew', 'coconut'],
    tehsilBoosts: {
      Vengurla: { cashew: 99, mango: 99, coconut: 96 },
      _all: { mango: 99, cashew: 98, coconut: 96, rice: 94 }
    },
    penalties: {
      _all: ['cotton', 'wheat', 'sugarcane', 'jowar', 'soybean']
    }
  },
  Raigad: {
    specialties: ['mango', 'cashew', 'coconut', 'rice', 'onion'],
    tehsilBoosts: {
      Alibag: { onion: 98, coconut: 96, rice: 96, mango: 96 },
      _all: { mango: 97, cashew: 96, coconut: 96, rice: 95 }
    },
    penalties: {
      _all: ['cotton', 'wheat']
    }
  },
  Pune: {
    specialties: ['fig', 'custard_apple', 'guava', 'onion'],
    tehsilBoosts: {
      Purandar: { fig: 99, custard_apple: 97, guava: 96, onion: 94 },
      Haveli: { onion: 96, tomato: 95, vegetables: 94 },
      _all: { fig: 96, custard_apple: 95, onion: 95, guava: 94, sugarcane: 94 }
    }
  },
  Ahmednagar: {
    specialties: ['guava', 'pomegranate', 'onion'],
    tehsilBoosts: {
      Rahata: { guava: 98, pomegranate: 97, onion: 95 },
      Sangamner: { pomegranate: 98, tomato: 95, onion: 95 },
      _all: { onion: 96, pomegranate: 96, guava: 96, soybean: 94 }
    }
  },
  Sangli: {
    specialties: ['turmeric', 'grapes', 'sugarcane'],
    tehsilBoosts: {
      Tasgaon: { grapes: 99, turmeric: 97 },
      Miraj: { turmeric: 98, grapes: 97, sugarcane: 95 },
      Walwa: { sugarcane: 98, turmeric: 97 },
      _all: { turmeric: 98, grapes: 97, sugarcane: 95 }
    }
  },
  Kolhapur: {
    specialties: ['sugarcane', 'rice'],
    tehsilBoosts: {
      _all: { sugarcane: 99, rice: 95, jowar: 90 }
    },
    penalties: {
      _all: ['cotton', 'safflower']
    }
  },
  Latur: {
    specialties: ['soybean', 'tur', 'mosambi', 'gram'],
    tehsilBoosts: {
      Ahmadpur: { mosambi: 98, soybean: 96, tur: 96 },
      Ahmedpur: { mosambi: 98, soybean: 96, tur: 96 },
      Ausa: { soybean: 96, tur: 96, gram: 94, onion: 92 },
      _all: { soybean: 96, tur: 96, gram: 94, mosambi: 95 }
    }
  },
  Jalna: {
    specialties: ['mosambi', 'cotton', 'soybean'],
    tehsilBoosts: {
      Ambad: { mosambi: 99, cotton: 95 },
      _all: { mosambi: 98, cotton: 95, soybean: 95 }
    }
  },
  Beed: {
    specialties: ['custard_apple', 'cotton', 'soybean'],
    tehsilBoosts: {
      Dharur: { custard_apple: 99, cotton: 95 },
      _all: { custard_apple: 97, cotton: 95, soybean: 95, tur: 94 }
    }
  },
  Dharashiv: {
    specialties: ['custard_apple', 'soybean', 'tur'],
    tehsilBoosts: {
      _all: { custard_apple: 97, soybean: 96, tur: 95, gram: 94 }
    }
  },
  Bhandara: {
    specialties: ['rice'],
    tehsilBoosts: {
      _all: { rice: 98, sugarcane: 92 }
    }
  },
  Gondia: {
    specialties: ['rice'],
    tehsilBoosts: {
      _all: { rice: 98 }
    }
  },
  Thane: {
    specialties: ['sapota', 'rice', 'vegetables'],
    tehsilBoosts: {
      _all: { sapota: 97, rice: 95, vegetables: 94 }
    }
  }
};

// ---------------------------------------------------------------------------
// Agronomic Properties Matrix (Soil affinity, Water requirement, Season)
// ---------------------------------------------------------------------------
const CROP_AGRONOMY_MATRIX = {
  // Cereals & Pulses & Oilseeds
  soybean: { category: 'oilseeds', season: 'kharif', waterNeed: 'moderate', soil: { black: 15, red: 5, rocky: -40, mixed: 8 } },
  cotton: { category: 'cashcrops', season: 'kharif', waterNeed: 'moderate', soil: { black: 15, red: -10, rocky: -45, mixed: 5 } },
  tur: { category: 'pulses', season: 'kharif', waterNeed: 'moderate', soil: { black: 15, red: 5, rocky: -30, mixed: 10 } },
  udid: { category: 'pulses', season: 'kharif', waterNeed: 'low', soil: { black: 12, red: 10, rocky: -15, mixed: 12 } },
  mung: { category: 'pulses', season: 'kharif', waterNeed: 'low', soil: { black: 10, red: 12, rocky: -15, mixed: 12 } },
  jowar: { category: 'cereals', season: 'rabi', waterNeed: 'low', soil: { black: 14, red: 5, rocky: 10, mixed: 10 } },
  wheat: { category: 'cereals', season: 'rabi', waterNeed: 'moderate', soil: { black: 15, red: -12, rocky: -45, mixed: 8 } },
  gram: { category: 'pulses', season: 'rabi', waterNeed: 'low', soil: { black: 15, red: 0, rocky: -25, mixed: 10 } },
  maize: { category: 'cereals', season: 'kharif', waterNeed: 'moderate', soil: { black: 12, red: 5, rocky: -35, mixed: 14 } },
  bajra: { category: 'cereals', season: 'kharif', waterNeed: 'low', soil: { black: 8, red: 12, rocky: 16, mixed: 10 } },
  rice: { category: 'cereals', season: 'kharif', waterNeed: 'high', soil: { black: 5, red: 12, rocky: -50, mixed: 10 } },
  safflower: { category: 'oilseeds', season: 'rabi', waterNeed: 'low', soil: { black: 12, red: 8, rocky: 16, mixed: 10 } },
  sunflower: { category: 'oilseeds', season: 'rabi', waterNeed: 'moderate', soil: { black: 14, red: 5, rocky: -20, mixed: 10 } },
  groundnut: { category: 'oilseeds', season: 'kharif', waterNeed: 'moderate', soil: { black: -5, red: 18, rocky: -15, mixed: 12 } },
  linseed: { category: 'oilseeds', season: 'rabi', waterNeed: 'low', soil: { black: 10, red: 8, rocky: 5, mixed: 10 } },
  sesame: { category: 'oilseeds', season: 'kharif', waterNeed: 'low', soil: { black: 8, red: 12, rocky: 10, mixed: 10 } },

  // Fruits / Horticulture
  pomegranate: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 8, red: 12, rocky: 15, mixed: 14 } },
  banana: { category: 'fruits', season: 'annual', waterNeed: 'high', soil: { black: 12, red: 5, rocky: -50, mixed: 14 } },
  grapes: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 10, red: 10, rocky: -10, mixed: 15 } },
  mango: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 5, red: 16, rocky: 5, mixed: 12 } },
  cashew: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: -15, red: 18, rocky: 10, mixed: 10 } },
  coconut: { category: 'fruits', season: 'annual', waterNeed: 'high', soil: { black: -15, red: 15, rocky: -20, mixed: 10 } },
  orange: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 14, red: 8, rocky: -15, mixed: 12 } },
  mosambi: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 14, red: 8, rocky: -15, mixed: 14 } },
  custard_apple: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 8, red: 12, rocky: 20, mixed: 12 } },
  strawberry: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: -15, red: 16, rocky: -10, mixed: 14 } },
  guava: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 10, red: 10, rocky: 5, mixed: 15 } },
  sapota: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 10, red: 15, rocky: 0, mixed: 14 } },
  fig: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 8, red: 12, rocky: 18, mixed: 14 } },
  papaya: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 8, red: 10, rocky: -30, mixed: 16 } },
  tamarind: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 8, red: 10, rocky: 20, mixed: 10 } },
  amla: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 8, red: 12, rocky: 18, mixed: 12 } },
  ber: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 8, red: 10, rocky: 20, mixed: 10 } },
  lemon: { category: 'fruits', season: 'annual', waterNeed: 'moderate', soil: { black: 10, red: 10, rocky: 5, mixed: 14 } },
  jackfruit: { category: 'fruits', season: 'annual', waterNeed: 'low', soil: { black: 5, red: 14, rocky: 5, mixed: 10 } },

  // Commercial / Cash
  sugarcane: { category: 'cashcrops', season: 'annual', waterNeed: 'high', soil: { black: 15, red: -10, rocky: -50, mixed: 10 } },
  turmeric: { category: 'cashcrops', season: 'annual', waterNeed: 'moderate', soil: { black: 12, red: 8, rocky: -30, mixed: 15 } },
  ginger: { category: 'cashcrops', season: 'annual', waterNeed: 'moderate', soil: { black: 8, red: 12, rocky: -30, mixed: 15 } },

  // Vegetables
  onion: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 12, red: 8, rocky: -30, mixed: 16 } },
  tomato: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 10, red: 8, rocky: -35, mixed: 16 } },
  chilli: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 10, red: 10, rocky: -25, mixed: 16 } },
  potato: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 5, red: 12, rocky: -35, mixed: 15 } },
  garlic: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 12, red: 8, rocky: -25, mixed: 15 } },
  brinjal: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 10, red: 8, rocky: -30, mixed: 16 } },
  bhendi: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 10, red: 8, rocky: -25, mixed: 16 } },
  cabbage: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 10, red: 5, rocky: -40, mixed: 15 } },
  cauliflower: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 10, red: 5, rocky: -40, mixed: 15 } },
  carrot: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 5, red: 12, rocky: -35, mixed: 16 } },
  cucumber: { category: 'vegetables', season: 'summer', waterNeed: 'moderate', soil: { black: 8, red: 8, rocky: -30, mixed: 16 } },
  watermelon: { category: 'fruits', season: 'summer', waterNeed: 'moderate', soil: { black: -5, red: 16, rocky: -20, mixed: 15 } },
  muskmelon: { category: 'fruits', season: 'summer', waterNeed: 'moderate', soil: { black: -5, red: 15, rocky: -20, mixed: 15 } },
  coriander: { category: 'vegetables', season: 'rabi', waterNeed: 'low', soil: { black: 10, red: 10, rocky: -10, mixed: 15 } },
  capsicum: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 8, red: 8, rocky: -30, mixed: 16 } },
  peas: { category: 'vegetables', season: 'rabi', waterNeed: 'moderate', soil: { black: 10, red: 8, rocky: -25, mixed: 15 } },
  french_beans: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 8, red: 8, rocky: -25, mixed: 15 } }
};

export function FarmProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('pm_lang') || 'mr');
  const [district, setDistrictState] = useState(() => localStorage.getItem('pm_district') || 'Latur');
  const [tehsil, setTehsil] = useState(() => localStorage.getItem('pm_tehsil') || 'Ausa');
  const [landArea, setLandArea] = useState(() => Number(localStorage.getItem('pm_landArea')) || 2);
  const [landUnit, setLandUnit] = useState(() => localStorage.getItem('pm_landUnit') || 'acre');
  const [soilType, setSoilType] = useState(() => localStorage.getItem('pm_soilType') || 'black');
  const [waterSource, setWaterSource] = useState(() => localStorage.getItem('pm_waterSource') || 'limited');
  const [season, setSeason] = useState(() => localStorage.getItem('pm_season') || 'all');
  // Smart Soil Lab States (Default: Standard mode)
  const [recommendationMode, setRecommendationMode] = useState(() => localStorage.getItem('pm_rec_mode') || 'standard');
  const [soilLabData, setSoilLabData] = useState(() => {
    try {
      const saved = localStorage.getItem('pm_soil_lab_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [savedSoilProfiles, setSavedSoilProfiles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pm_saved_soil_profiles')) || [];
    } catch {
      return [];
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pm_bookmarks')) || ['soybean'];
    } catch {
      return ['soybean'];
    }
  });

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pm_history')) || [
        { cropId: 'soybean', date: 'आज', area: 2, tehsil: 'Ausa' },
        { cropId: 'cotton', date: 'काल', area: 2, tehsil: 'Ausa' }
      ];
    } catch {
      return [];
    }
  });

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);

  // Sync state with localStorage
  useEffect(() => { localStorage.setItem('pm_lang', lang); }, [lang]);
  useEffect(() => {
    localStorage.setItem('pm_district', district);
    localStorage.setItem('pm_tehsil', tehsil);
  }, [district, tehsil]);
  useEffect(() => { localStorage.setItem('pm_landArea', landArea); }, [landArea]);
  useEffect(() => { localStorage.setItem('pm_landUnit', landUnit); }, [landUnit]);
  useEffect(() => { localStorage.setItem('pm_soilType', soilType); }, [soilType]);
  useEffect(() => { localStorage.setItem('pm_waterSource', waterSource); }, [waterSource]);
  useEffect(() => { localStorage.setItem('pm_season', season); }, [season]);
  useEffect(() => { localStorage.setItem('pm_rec_mode', recommendationMode); }, [recommendationMode]);
  useEffect(() => {
    if (soilLabData) localStorage.setItem('pm_soil_lab_profile', JSON.stringify(soilLabData));
    else localStorage.removeItem('pm_soil_lab_profile');
  }, [soilLabData]);
  useEffect(() => {
    localStorage.setItem('pm_saved_soil_profiles', JSON.stringify(savedSoilProfiles));
  }, [savedSoilProfiles]);
  useEffect(() => { localStorage.setItem('pm_bookmarks', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('pm_history', JSON.stringify(history)); }, [history]);

  // Handle district change with auto-selection of valid tehsil
  const setDistrict = (newDistrict) => {
    setDistrictState(newDistrict);
    const availableTehsils = TEHSILS_BY_DISTRICT[newDistrict] || [];
    const isTehsilValid = availableTehsils.some(t => t.id === tehsil);
    if (!isTehsilValid && availableTehsils.length > 0) {
      setTehsil(availableTehsils[0].id);
    }
  };

  // Convert landArea and landUnit into standard normalized acres
  const normalizedAcres = useMemo(() => {
    const val = Number(landArea) || 1;
    if (landUnit === 'guntha') return val / 40;
    if (landUnit === 'hectare') return val * 2.471;
    return val;
  }, [landArea, landUnit]);

  // Soil Health Gap Analysis memo
  const soilHealthGap = useMemo(() => {
    if (recommendationMode === 'soil_lab' && soilLabData) {
      return analyzeSoilHealthGap(soilLabData);
    }
    return null;
  }, [recommendationMode, soilLabData]);

  const saveSoilLabProfile = (profile) => {
    if (!profile) return;
    const newEntry = {
      ...profile,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    setSavedSoilProfiles(prev => [newEntry, ...prev.filter(p => p.id !== newEntry.id)].slice(0, 10));
    setSoilLabData(profile);
  };

  const clearSoilLabData = () => {
    setSoilLabData(null);
    setRecommendationMode('standard');
    localStorage.removeItem('pm_soil_lab_profile');
  };

  // Helper to determine factor statuses dynamically
  const getStatusText = (val, type = 'general') => {
    if (val === null || val === undefined) return { mr: 'तपासणी सुरू', en: 'Checking' };
    if (type === 'market') {
      if (val >= 85) return { mr: 'चांगला बाजार', en: 'Good Market' };
      if (val >= 70) return { mr: 'मध्यम बाजार', en: 'Moderate Market' };
      return { mr: 'कमी मागणी', en: 'Low Demand' };
    }
    if (val >= 80) return { mr: 'योग्य', en: 'Suitable' };
    if (val >= 65) return { mr: 'मध्यम', en: 'Moderate' };
    return { mr: 'लक्ष द्या', en: 'Pay Attention' };
  };

  // -------------------------------------------------------------------------
  // Dynamically compute crops for the active district, tehsil, soil & water
  // -------------------------------------------------------------------------
  const dynamicCrops = useMemo(() => {
    const tehsilData = REGIONAL_SCORES[district]?.[tehsil] || [];
    const scoreMap = new Map();
    tehsilData.forEach((item, index) => {
      scoreMap.set(item.cropId, {
        score: item.score,
        rank: item.rank || index + 1,
        factors: item.factors || {}
      });
    });

    const distSpecialty = REGIONAL_SPECIALTY_CROPS[district];
    const tehsilBoosts = distSpecialty?.tehsilBoosts?.[tehsil] || distSpecialty?.tehsilBoosts?.['_all'] || {};
    const districtPenalties = distSpecialty?.penalties?.[tehsil] || distSpecialty?.penalties?.['_all'] || [];

    const computed = CROPS_DATA.map((crop) => {
      const reg = scoreMap.get(crop.id);
      // Optional Smart Soil Lab Evaluation
      const isLabMode = recommendationMode === 'soil_lab' && !!soilLabData;
      const cropSoilLab = isLabMode ? computeCropSoilLabScore(crop.id, soilLabData) : null;
      const agronomy = CROP_AGRONOMY_MATRIX[crop.id] || {
        category: crop.category || 'cashcrops',
        season: 'kharif',
        waterNeed: 'moderate',
        soil: { black: 10, red: 8, rocky: -20, mixed: 12 }
      };

      // 1. Base Score calculation
      let baseScore = reg?.score;
      if (baseScore === undefined || baseScore === null) {
        baseScore = crop.score || 75;
      }

      // Check GI specialty boost for this region
      let isGISpecialty = false;
      if (tehsilBoosts[crop.id]) {
        baseScore = Math.max(baseScore, tehsilBoosts[crop.id]);
        isGISpecialty = true;
      } else if (distSpecialty?.specialties?.includes(crop.id)) {
        baseScore = Math.max(baseScore, 95);
        isGISpecialty = true;
      }

      // Check geographical disqualification (e.g. cotton in Mahabaleshwar or Konkan)
      if (districtPenalties.includes(crop.id)) {
        baseScore = Math.min(baseScore, 45);
      }

      // 2. Soil Type Suitability Adjustment (or Soil Lab Precision Adjustment)
      const soilAdj = agronomy.soil?.[soilType] !== undefined ? agronomy.soil[soilType] : 0;
      let finalScore = baseScore + soilAdj;

      if (isLabMode && cropSoilLab) {
        // Refine score based on actual laboratory test
        const labDelta = Math.round((cropSoilLab.soilLabScore - 75) * 0.35);
        finalScore += labDelta;
        if (cropSoilLab.severeConflict) {
          finalScore = Math.min(finalScore, 45);
        }
      }

      // 3. Water Availability Adjustment
      let waterConflict = false;
      if (waterSource === 'rainfed') {
        if (agronomy.waterNeed === 'high') {
          finalScore -= 45;
          waterConflict = true;
        } else if (agronomy.waterNeed === 'low') {
          finalScore += 6;
        }
      } else if (waterSource === 'limited') {
        if (agronomy.waterNeed === 'high') {
          finalScore -= 20;
        } else if (agronomy.season === 'rabi') {
          finalScore += 4;
        }
      } else if (waterSource === 'canal' || waterSource === 'drip') {
        if (agronomy.waterNeed === 'high' || agronomy.category === 'fruits' || agronomy.category === 'vegetables') {
          finalScore += 6;
        }
      }

      // 4. Season Match Adjustment
      let seasonConflict = false;
      if (season !== 'all') {
        if (season === agronomy.season || agronomy.season === 'annual') {
          finalScore += 5;
        } else {
          finalScore -= 25;
          seasonConflict = true;
        }
      }

      // 5. Land Area Scale Fit (Intensive vs Broadacre)
      if (normalizedAcres <= 0.5) {
        if (agronomy.category === 'vegetables' || crop.id === 'coriander' || crop.id === 'strawberry') {
          finalScore += 5;
        } else if (crop.id === 'soybean' || crop.id === 'cotton' || crop.id === 'jowar') {
          finalScore -= 5;
        }
      }

      // Clamp score between 25 and 99
      finalScore = Math.min(99, Math.max(25, Math.round(finalScore)));

      // 6. Badges & Suitable Gate
      let badgeKey = 'badgeLimited';
      let badgeColor = '#F57F17';
      let badgeBg = '#FFFDE7';

      if (isGISpecialty) {
        badgeKey = 'badgeGISpecialty';
        badgeColor = '#00695C';
        badgeBg = '#E0F2F1';
      } else if (finalScore >= 90) {
        badgeKey = 'badgeBest';
        badgeColor = '#1B5E20';
        badgeBg = '#E8F5E9';
      } else if (finalScore >= 80) {
        badgeKey = 'badgeGood';
        badgeColor = '#2E7D32';
        badgeBg = '#E8F5E9';
      } else if (finalScore >= 70) {
        badgeKey = 'badgeConsider';
        badgeColor = '#E65100';
        badgeBg = '#FFF3E0';
      }

      // Only flag notSuitable if score is genuinely low, severe water/soil conflict, or lab conflict
      const notSuitable = finalScore < 60 || 
        (waterConflict && agronomy.waterNeed === 'high') || 
        (soilType === 'rocky' && soilAdj <= -40) ||
        (isLabMode && cropSoilLab?.severeConflict);

      // 7. Area-scaled Economics
      const areaProfitMin = Math.round(crop.profitMin * normalizedAcres);
      const areaProfitMax = Math.round(crop.profitMax * normalizedAcres);
      const areaCostMin = Math.round(crop.totalCostMin * normalizedAcres);
      const areaCostMax = Math.round(crop.totalCostMax * normalizedAcres);
      const areaRevenueMin = Math.round(crop.revenueMin * normalizedAcres);
      const areaRevenueMax = Math.round(crop.revenueMax * normalizedAcres);
      const areaYieldMin = (crop.yieldPerAcreMin * normalizedAcres).toFixed(1);
      const areaYieldMax = (crop.yieldPerAcreMax * normalizedAcres).toFixed(1);

      // 8. Custom Recommendation Reasons
      let matchReason_mr = '';
      let matchReason_en = '';
      if (isGISpecialty) {
        matchReason_mr = `${district} परिसरातील प्रसिद्ध व उच्च प्रतीचे पीक`;
        matchReason_en = `Renowned regional specialty of ${district}`;
      } else if (soilType === 'rocky' && soilAdj > 0) {
        matchReason_mr = 'खडकाळ / मुरमाड जमिनीसाठी अत्यंत योग्य व दुष्काळसहनशील';
        matchReason_en = 'Highly suited for rocky/shallow soil & drought hardy';
      } else if (soilType === 'black' && soilAdj > 10) {
        matchReason_mr = 'काळी कसदार माती व स्थानिक हवामानाशी सर्वोत्तम जुळणारे';
        matchReason_en = 'Best match for fertile black soil & local climate';
      } else if (soilType === 'red' && soilAdj > 10) {
        matchReason_mr = 'लाल व मुरमाड जमिनीसाठी उत्तम उत्पादनक्षम पर्याय';
        matchReason_en = 'High-yielding match for red & laterite soils';
      } else if (waterSource === 'rainfed' && agronomy.waterNeed === 'low') {
        matchReason_mr = 'कमी पाण्यावर / कोरडवाहू शेतीत खात्रीशीर उत्पादन';
        matchReason_en = 'Reliable returns under rainfed / low-water conditions';
      } else if (agronomy.category === 'vegetables' && normalizedAcres <= 1) {
        matchReason_mr = 'कमी क्षेत्रात वेगाने भरघोस रोख उत्पन्न देणारे पीक';
        matchReason_en = 'Quick, high cash flow for small farm holdings';
      } else {
        matchReason_mr = 'स्थानिक जमीन, पाऊस व तापमानासाठी अनुकूल';
        matchReason_en = 'Favorable for local soil, rainfall & temperature';
      }

      // Dynamic factor values & statuses
      const regFactors = reg?.factors || {};
      const soilScore = isLabMode && cropSoilLab 
        ? cropSoilLab.soilLabScore 
        : Math.min(100, Math.max(30, (regFactors.soil || crop.factors.soil || 80) + Math.round(soilAdj * 0.5)));
      const rainScore = Math.min(100, Math.max(30, (regFactors.rain || crop.factors.rain || 80)));
      const tempScore = Math.min(100, Math.max(30, (regFactors.temp || crop.factors.temp || 85)));
      const irrScore = waterSource === 'rainfed' && agronomy.waterNeed === 'high' ? 35 : Math.min(100, Math.max(30, (regFactors.irrigation || crop.factors.irrigation || 80)));
      const mktScore = isGISpecialty ? 98 : Math.min(100, Math.max(40, (regFactors.market || crop.factors.market || 80)));

      const soilSt = getStatusText(soilScore);
      const rainSt = getStatusText(rainScore);
      const tempSt = getStatusText(tempScore);
      const irrSt = getStatusText(irrScore);
      const mktSt = getStatusText(mktScore, 'market');

      return {
        ...crop,
        score: finalScore,
        category: agronomy.category,
        seasonType: agronomy.season,
        waterNeed: agronomy.waterNeed,
        isGISpecialty,
        matchReason_mr,
        matchReason_en,
        regionalAnalysis: true,
        soilLabMatch: cropSoilLab,
        recommendationMode,
        notSuitable,
        seasonConflict,
        waterConflict,
        badgeKey,
        badgeColor,
        badgeBg,
        areaProfitMin,
        areaProfitMax,
        areaCostMin,
        areaCostMax,
        areaRevenueMin,
        areaRevenueMax,
        areaYieldMin,
        areaYieldMax,
        factors: {
          soil: soilScore,
          rain: rainScore,
          temp: tempScore,
          irrigation: irrScore,
          market: mktScore,
          soilStatus_mr: soilSt.mr,
          soilStatus_en: soilSt.en,
          rainStatus_mr: rainSt.mr,
          rainStatus_en: rainSt.en,
          tempStatus_mr: tempSt.mr,
          tempStatus_en: tempSt.en,
          irrigationStatus_mr: irrSt.mr,
          irrigationStatus_en: irrSt.en,
          marketStatus_mr: mktSt.mr,
          marketStatus_en: mktSt.en
        }
      };
    });

    // Rank & sort: Valid, high-scoring crops first.
    return computed.sort((a, b) => {
      if (a.notSuitable !== b.notSuitable) return a.notSuitable ? 1 : -1;
      return b.score - a.score;
    }).map((c, idx) => ({ ...c, rank: idx + 1 }));
  }, [district, tehsil, soilType, waterSource, season, normalizedAcres, recommendationMode, soilLabData]);

  // Audio Text-to-Speech
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'mr' ? 'आपल्या ब्राउझरमध्ये ऑडिओ सपोर्ट उपलब्ध नाही.' : 'Audio speech not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const toggleBookmark = (cropId) => {
    setBookmarks(prev =>
      prev.includes(cropId) ? prev.filter(id => id !== cropId) : [...prev, cropId]
    );
  };

  const addToHistory = (cropId) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.cropId !== cropId);
      const newEntry = {
        cropId,
        date: lang === 'mr' ? 'आज' : 'Today',
        area: landArea,
        tehsil,
        mode: recommendationMode,
        soilLabSummary: recommendationMode === 'soil_lab' && soilLabData ? {
          ph: soilLabData.ph,
          ec: soilLabData.ec,
          oc: soilLabData.organicCarbon,
          n: soilLabData.nitrogen,
          p: soilLabData.phosphorus,
          k: soilLabData.potassium
        } : null
      };
      return [newEntry, ...filtered].slice(0, 10);
    });
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['mr']?.[key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  // Helper names
  const currentDistrictObj = DISTRICTS.find(d => d.id === district) || DISTRICTS[0];
  const availableTehsils = TEHSILS_BY_DISTRICT[district] || [];
  const currentTehsilObj = availableTehsils.find(t => t.id === tehsil) || availableTehsils[0] || { id: tehsil, name_en: tehsil, name_mr: tehsil };

  const districtName = lang === 'mr' ? currentDistrictObj.name_mr : currentDistrictObj.name_en;
  const tehsilName = lang === 'mr' ? currentTehsilObj.name_mr : currentTehsilObj.name_en;

  const value = {
    lang,
    setLang,
    t,
    district,
    setDistrict,
    tehsil,
    setTehsil,
    districtName,
    tehsilName,
    availableTehsils,
    landArea,
    setLandArea,
    landUnit,
    setLandUnit,
    normalizedAcres,
    soilType,
    setSoilType,
    waterSource,
    setWaterSource,
    season,
    setSeason,
    crops: dynamicCrops,
    districtMandi: MANDI_PRICES[district] || {},
    bookmarks,
    toggleBookmark,
    history,
    addToHistory,
    speakText,
    stopAudio,
    isPlayingAudio,
    isLocationModalOpen,
    setLocationModalOpen,
    recommendationMode,
    setRecommendationMode,
    soilLabData,
    setSoilLabData,
    savedSoilProfiles,
    saveSoilLabProfile,
    clearSoilLabData,
    soilHealthGap
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error('useFarm must be used within FarmProvider');
  return context;
}
