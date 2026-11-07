// Single scoring engine for the app.
//
// Every number the farmer sees is produced here, from:
//   1. the region's measured suitability score (pipeline output), or
//   2. the crop's state-average score when the tehsil has no row, or
//   3. an explicit "assumed" 75 - recorded as such, never disguised as data.
//
// Hand-written priors (soil type, regional fame, water access, season, land
// size) are BOUNDED nudges on top of that base. This module exists because the
// old inline version used Math.max(score, 96) for regional specialties and
// clamped everything to 25-99, so gram (measured 48) displayed as 99 and every
// good crop collapsed into an eight-way tie at the top.
//
// Pure functions only - no React, no localStorage - so `npm run verify:scoring`
// can test the real scoring rules.

import { CROP_AGRONOMY, DEFAULT_AGRONOMY } from '../data/cropAgronomy.js';
import {
  getSpecialty,
  isExcludedCrop,
  SPECIALTY_POINTS,
  SPECIALTY_MIN_BASE,
} from '../data/regionalSpecialties.js';
import { computeCropSoilLabScore } from '../data/soilLabEngine.js';

// Hard bounds on every adjustment. A prior may refine the measured score; it
// may never reverse it.
const SOIL_MIN = -20;
const SOIL_MAX = 10;
const WATER_RAINFED_HIGH = -35;
const WATER_LIMITED_HIGH = -15;
const WATER_GOOD = 5;
const SEASON_MATCH = 4;
const SEASON_MISMATCH = -20;
const LAND_SMALL_GAIN = 4;
const LAND_SMALL_LOSS = -4;
const EXCLUDED_CAP = 45;
const LAB_CONFLICT_CAP = 45;

export const NOT_SUITABLE_BELOW = 60;

const BADGE = {
  gi: { key: 'badgeGISpecialty', color: '#00695C', bg: '#E0F2F1' },
  best: { key: 'badgeBest', color: '#1B5E20', bg: '#E8F5E9' },
  good: { key: 'badgeGood', color: '#2E7D32', bg: '#E8F5E9' },
  consider: { key: 'badgeConsider', color: '#E65100', bg: '#FFF3E0' },
  limited: { key: 'badgeLimited', color: '#F57F17', bg: '#FFFDE7' },
};

const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));

function statusText(value, kind = 'general') {
  // Never invent a value: a missing factor is shown as missing.
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { mr: 'माहिती नाही', en: 'No data' };
  }
  if (kind === 'market') {
    if (value >= 85) return { mr: 'चांगला बाजार', en: 'Good Market' };
    if (value >= 70) return { mr: 'मध्यम बाजार', en: 'Moderate Market' };
    return { mr: 'कमी मागणी', en: 'Low Demand' };
  }
  if (value >= 80) return { mr: 'योग्य', en: 'Suitable' };
  if (value >= 65) return { mr: 'मध्यम', en: 'Moderate' };
  return { mr: 'लक्ष द्या', en: 'Pay Attention' };
}

function reasonFor({ isSpecialty, specialty, soilType, soilDeltaRaw, waterSource, agronomy, acres, districtName }) {
  if (isSpecialty && specialty) {
    const where = specialty.level === 'tehsil' ? 'this tehsil' : `${districtName}`;
    return {
      mr: `${districtName} परिसरातील प्रसिद्ध पीक (${where === 'this tehsil' ? 'या तालुक्यात प्रमुख' : 'जिल्ह्यात प्रमुख'}).`,
      en: `A recognised regional specialty of ${where}.`,
    };
  }
  if (soilType === 'rocky' && soilDeltaRaw > 0) {
    return {
      mr: 'खडकाळ / मुरमाड जमिनीसाठी योग्य व दुष्काळसहनशील',
      en: 'Suited to rocky/shallow soil and drought hardy',
    };
  }
  if (soilType === 'black' && soilDeltaRaw > 10) {
    return { mr: 'काळ्या कसदार मातीसाठी उत्तम', en: 'Best match for fertile black soil' };
  }
  if (soilType === 'red' && soilDeltaRaw > 10) {
    return { mr: 'लाल व मुरमाड जमिनीसाठी उत्तम', en: 'Good match for red and laterite soil' };
  }
  if (waterSource === 'rainfed' && agronomy.waterNeed === 'low') {
    return { mr: 'कमी पाण्यावर / कोरडवाहू शेतीत खात्रीशीर', en: 'Reliable under rainfed, low-water conditions' };
  }
  if (agronomy.category === 'vegetables' && acres <= 1) {
    return { mr: 'कमी क्षेत्रात भरघोस रोख उत्पन्न', en: 'Quick cash flow for small holdings' };
  }
  return { mr: 'स्थानिक जमीन, पाऊस व तापमानास अनुकूल', en: 'Favourable for local soil, rainfall and temperature' };
}

/**
 * Score one crop for one place.
 *
 * @param {object} crop        entry from cropsData.js
 * @param {object|undefined} regional  {score, rank, factors} for this tehsil
 * @param {object} ctx         {district, districtName, tehsil, soilType,
 *                              waterSource, season, acres, recommendationMode,
 *                              soilLabData}
 */
export function scoreCrop(crop, regional, ctx) {
  const {
    district, districtName, tehsil, soilType, waterSource, season,
    acres, recommendationMode, soilLabData,
  } = ctx;

  const agronomy = CROP_AGRONOMY[crop.id] || DEFAULT_AGRONOMY;

  // ---- 1. Base score, labelled with where it came from --------------------
  const measured = Number.isFinite(regional?.score) ? regional.score : null;
  const catalogScore = Number.isFinite(crop.score) ? crop.score : null;
  const base = measured !== null ? measured : (catalogScore !== null ? catalogScore : 75);
  const scoreSource = measured !== null ? 'measured' : (catalogScore !== null ? 'state' : 'assumed');

  const regFactors = regional?.factors || {};

  // ---- 2. Regional specialty: bounded, and never a rescue -----------------
  const specialty = getSpecialty(district, tehsil, crop.id);
  const excluded = isExcludedCrop(district, tehsil, crop.id);
  const specialtyEligible = Boolean(specialty) && !excluded && base >= SPECIALTY_MIN_BASE;
  const specialtyPoints = specialtyEligible ? (SPECIALTY_POINTS[specialty.strength] || 0) : 0;
  const isSpecialty = specialtyPoints > 0;
  // Famous here, but the data disagrees - the UI shows this instead of a boost.
  const specialtyCaution = Boolean(specialty) && !isSpecialty && !excluded;

  // ---- 3. Soil type -------------------------------------------------------
  const soilDeltaRaw = agronomy.soil?.[soilType] ?? 0;
  const soilDelta = clamp(soilDeltaRaw, SOIL_MIN, SOIL_MAX);

  // ---- 4. Water access ----------------------------------------------------
  let waterDelta = 0;
  let waterConflict = false;
  if (waterSource === 'rainfed') {
    if (agronomy.waterNeed === 'high') {
      waterDelta = WATER_RAINFED_HIGH;
      waterConflict = true;
    } else if (agronomy.waterNeed === 'low') {
      waterDelta = WATER_GOOD;
    }
  } else if (waterSource === 'limited') {
    if (agronomy.waterNeed === 'high') waterDelta = WATER_LIMITED_HIGH;
    else if (agronomy.season === 'rabi') waterDelta = 3;
  } else if (waterSource === 'canal' || waterSource === 'drip') {
    if (agronomy.waterNeed === 'high' || agronomy.category === 'fruits' || agronomy.category === 'vegetables') {
      waterDelta = WATER_GOOD;
    }
  }

  // ---- 5. Season ----------------------------------------------------------
  let seasonDelta = 0;
  let seasonConflict = false;
  if (season !== 'all') {
    if (season === agronomy.season || agronomy.season === 'annual') {
      seasonDelta = SEASON_MATCH;
    } else {
      seasonDelta = SEASON_MISMATCH;
      seasonConflict = true;
    }
  }

  // ---- 6. Land size -------------------------------------------------------
  let landDelta = 0;
  if (acres <= 0.5) {
    if (agronomy.category === 'vegetables' || crop.id === 'coriander' || crop.id === 'strawberry') {
      landDelta = LAND_SMALL_GAIN;
    } else if (crop.id === 'soybean' || crop.id === 'cotton' || crop.id === 'jowar') {
      landDelta = LAND_SMALL_LOSS;
    }
  }

  // ---- 7. Smart Soil Lab --------------------------------------------------
  const isLabMode = recommendationMode === 'soil_lab' && !!soilLabData;
  const soilLabMatch = isLabMode ? computeCropSoilLabScore(crop.id, soilLabData) : null;
  let labDelta = 0;
  if (soilLabMatch && Number.isFinite(soilLabMatch.soilLabScore)) {
    labDelta = Math.round((soilLabMatch.soilLabScore - 75) * 0.35);
  }

  // ---- 8. Combine, then clamp to a real 0-100 scale -----------------------
  let raw = base + soilDelta + specialtyPoints + waterDelta + seasonDelta + landDelta + labDelta;

  if (excluded) raw = Math.min(raw, EXCLUDED_CAP);
  if (soilLabMatch?.severeConflict) raw = Math.min(raw, LAB_CONFLICT_CAP);

  const score = Math.round(clamp(raw, 0, 100));

  const notSuitable =
    score < NOT_SUITABLE_BELOW ||
    waterConflict ||
    (soilType === 'rocky' && soilDeltaRaw <= -40) ||
    Boolean(soilLabMatch?.severeConflict);

  // ---- 9. Badge -----------------------------------------------------------
  let badge = BADGE.limited;
  if (isSpecialty && score >= NOT_SUITABLE_BELOW) badge = BADGE.gi;
  else if (score >= 90) badge = BADGE.best;
  else if (score >= 80) badge = BADGE.good;
  else if (score >= 70) badge = BADGE.consider;

  // ---- 10. Factor bars ----------------------------------------------------
  // Regional values win; the crop's state-average factor is used only when the
  // tehsil has no regional row, and is flagged as an estimate.
  const factor = (key) => {
    if (Number.isFinite(regFactors[key])) return { value: regFactors[key], source: 'measured' };
    if (scoreSource !== 'measured' && Number.isFinite(crop.factors?.[key])) {
      return { value: crop.factors[key], source: 'state' };
    }
    return { value: null, source: 'missing' };
  };

  const soilF = factor('soil');
  const rainF = factor('rain');
  const tempF = factor('temp');
  const irrF = factor('irrigation');
  const mktF = factor('market');

  // Soil Lab replaces the soil factor with the real lab value.
  const soilValue = isLabMode && soilLabMatch
    ? soilLabMatch.soilLabScore
    : (soilF.value === null ? null : clamp(soilF.value + Math.round(soilDelta * 0.5), 0, 100));

  const irrigationValue = waterSource === 'rainfed' && agronomy.waterNeed === 'high'
    ? 35
    : (irrF.value === null ? null : irrF.value);

  // A regional specialty may lift the market read, but only slightly and only
  // when we actually have a market number.
  const marketValue = (mktF.value === null)
    ? null
    : (isSpecialty ? clamp(mktF.value + 3, 0, 100) : mktF.value);

  const soilSt = statusText(soilValue);
  const rainSt = statusText(rainF.value);
  const tempSt = statusText(tempF.value);
  const irrSt = statusText(irrigationValue);
  const mktSt = statusText(marketValue, 'market');

  // ---- 11. Area-scaled economics (null-safe, never invented) --------------
  const acresSafe = Number(acres) > 0 ? Number(acres) : 1;
  const money = (v) => (Number.isFinite(v) ? Math.round(v * acresSafe) : null);
  const qty = (v) => (Number.isFinite(v) ? (v * acresSafe).toFixed(1) : null);

  // ---- 12. Data gaps, surfaced so the UI can be honest -------------------
  const dataGaps = [];
  if (scoreSource !== 'measured') dataGaps.push('regionalScore');
  ['soil', 'rain', 'temp', 'irrigation', 'market', 'history'].forEach((key) => {
    if (!Number.isFinite(regFactors[key])) dataGaps.push(key);
  });

  const reason = reasonFor({
    isSpecialty, specialty, soilType, soilDeltaRaw, waterSource,
    agronomy, acres, districtName,
  });

  return {
    ...crop,
    score,
    scoreSource,
    baseScore: base,
    specialtyPoints: specialtyPoints,
    regionalSpecialty: specialty
      ? {
        level: specialty.level,
        gi: specialty.gi,
        strength: specialty.strength,
        applied: isSpecialty,
        caution: specialtyCaution,
      }
      : null,
    isGISpecialty: isSpecialty && (specialty?.gi ?? false),
    specialtyCaution,
    excludedHere: excluded,
    dataGaps,
    notSuitable,
    seasonConflict,
    waterConflict,
    category: agronomy.category,
    seasonType: agronomy.season,
    waterNeed: agronomy.waterNeed,
    recommendationMode,
    soilLabMatch,
    matchReason_mr: reason.mr,
    matchReason_en: reason.en,
    regionalAnalysis: scoreSource !== 'assumed',
    badgeKey: badge.key,
    badgeColor: badge.color,
    badgeBg: badge.bg,
    areaProfitMin: money(crop.profitMin),
    areaProfitMax: money(crop.profitMax),
    areaCostMin: money(crop.totalCostMin),
    areaCostMax: money(crop.totalCostMax),
    areaRevenueMin: money(crop.revenueMin),
    areaRevenueMax: money(crop.revenueMax),
    areaYieldMin: qty(crop.yieldPerAcreMin),
    areaYieldMax: qty(crop.yieldPerAcreMax),
    factors: {
      soil: soilValue,
      rain: rainF.value,
      temp: tempF.value,
      irrigation: irrigationValue,
      market: marketValue,
      soilSource: isLabMode ? 'lab' : soilF.source,
      rainSource: rainF.source,
      tempSource: tempF.source,
      irrigationSource: irrF.source,
      marketSource: mktF.source,
      soilStatus_mr: soilSt.mr,
      soilStatus_en: soilSt.en,
      rainStatus_mr: rainSt.mr,
      rainStatus_en: rainSt.en,
      tempStatus_mr: tempSt.mr,
      tempStatus_en: tempSt.en,
      irrigationStatus_mr: irrSt.mr,
      irrigationStatus_en: irrSt.en,
      marketStatus_mr: mktSt.mr,
      marketStatus_en: mktSt.en,
    },
  };
}

/**
 * Deterministic ordering: unsuitable crops last, then by suitability, then by
 * expected profit (a real tiebreak instead of array position), then by id.
 */
export function rankCrops(scored) {
  return scored
    .slice()
    .sort((a, b) => {
      if (a.notSuitable !== b.notSuitable) return a.notSuitable ? 1 : -1;
      if (b.score !== a.score) return b.score - a.score;
      const pa = Number.isFinite(a.areaProfitMax) ? a.areaProfitMax : -1;
      const pb = Number.isFinite(b.areaProfitMax) ? b.areaProfitMax : -1;
      if (pb !== pa) return pb - pa;
      return String(a.id).localeCompare(String(b.id));
    })
    .map((c, index) => ({ ...c, rank: index + 1 }));
}
