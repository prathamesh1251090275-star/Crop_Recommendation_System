import { useState, useEffect, useMemo } from 'react';
import { FarmContext } from './useFarm';
import { translations } from '../data/translations';
import { CROPS_DATA } from '../data/cropsData';
import { DISTRICTS, TEHSILS_BY_DISTRICT } from '../data/locations';
import { REGIONAL_SCORES } from '../data/regionalScores';
import { MANDI_PRICES } from '../data/mandiPrices';
import { analyzeSoilHealthGap } from '../data/soilLabEngine';
import { getRegionalSpecialties, getRegionNote } from '../data/regionalSpecialties';
import { scoreCrop, rankCrops } from '../lib/scoreCrop';

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

  // -------------------------------------------------------------------------
  const currentDistrictObj = DISTRICTS.find(d => d.id === district) || DISTRICTS[0];
  const availableTehsils = TEHSILS_BY_DISTRICT[district] || [];
  const currentTehsilObj = availableTehsils.find(t => t.id === tehsil) || availableTehsils[0] || { id: tehsil, name_en: tehsil, name_mr: tehsil };

  const districtName = lang === 'mr' ? currentDistrictObj.name_mr : currentDistrictObj.name_en;
  const tehsilName = lang === 'mr' ? currentTehsilObj.name_mr : currentTehsilObj.name_en;

  // Single scoring pass. Every crop goes through lib/scoreCrop, so the number
  // on screen can be traced back to measured inputs. Hand-written priors
  // (soil type, regional fame, water, season, land size) are bounded nudges and
  // can no longer override the data.
  // -------------------------------------------------------------------------
  const dynamicCrops = useMemo(() => {
    const tehsilData = REGIONAL_SCORES[district]?.[tehsil] || [];
    const regionalById = new Map();
    tehsilData.forEach((item, index) => {
      regionalById.set(item.cropId, {
        score: item.score,
        rank: item.rank || index + 1,
        factors: item.factors || {},
      });
    });

    const scoringContext = {
      district,
      districtName,
      tehsil,
      soilType,
      waterSource,
      season,
      acres: normalizedAcres,
      recommendationMode,
      soilLabData,
    };

    return rankCrops(
      CROPS_DATA.map((crop) => scoreCrop(crop, regionalById.get(crop.id), scoringContext))
    );
  }, [district, districtName, tehsil, soilType, waterSource, season, normalizedAcres, recommendationMode, soilLabData]);

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

  // What this place is actually known for - curated data, not a score boost.
  const regionalSpecialties = useMemo(
    () => getRegionalSpecialties(district, tehsil)
      .map((entry) => {
        const crop = CROPS_DATA.find((c) => c.id === entry.cropId);
        return crop ? { ...entry, crop } : null;
      })
      .filter(Boolean),
    [district, tehsil]
  );
  const regionNote = useMemo(() => getRegionNote(district), [district]);

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
    regionalSpecialties,
    regionNote,
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

