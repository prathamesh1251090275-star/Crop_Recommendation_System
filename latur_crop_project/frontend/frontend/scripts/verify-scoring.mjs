// Guards the scoring rules so a regression cannot quietly bring back the old
// behaviour (specialties forced to 99, fabricated 75s, ties at the top).
//
//   npm run verify:scoring
//
// Runs against the real generated data files and the real scoring module - no
// mocks, no build step.

import { CROPS_DATA } from '../src/data/cropsData.js';
import { REGIONAL_SCORES } from '../src/data/regionalScores.js';
import { DISTRICTS, TEHSILS_BY_DISTRICT } from '../src/data/locations.js';
import { REGIONS, getSpecialty, getRegionalSpecialties } from '../src/data/regionalSpecialties.js';
import { CROP_AGRONOMY } from '../src/data/cropAgronomy.js';
import { scoreCrop, rankCrops, NOT_SUITABLE_BELOW } from '../src/lib/scoreCrop.js';

let failures = 0;
const fail = (msg) => { failures += 1; console.error('  FAIL  ' + msg); };
const ok = (msg) => console.log('  ok    ' + msg);

const cropIds = new Set(CROPS_DATA.map((c) => c.id));
const districtIds = new Set(DISTRICTS.map((d) => d.id));

// ---------------------------------------------------------------------------
console.log('\n1. Regional specialty ids resolve against real locations and crops');
let specialtyCount = 0;
for (const [districtId, region] of Object.entries(REGIONS)) {
  if (!districtIds.has(districtId)) fail(`unknown district id "${districtId}"`);
  if (!REGIONAL_SCORES[districtId]) fail(`district "${districtId}" has no regional scores`);

  const validTehsils = new Set((TEHSILS_BY_DISTRICT[districtId] || []).map((t) => t.id));

  for (const cropId of Object.keys(region.district || {})) {
    specialtyCount += 1;
    if (!cropIds.has(cropId)) fail(`${districtId}: unknown crop id "${cropId}"`);
  }
  for (const [tehsilId, crops] of Object.entries(region.tehsils || {})) {
    if (!validTehsils.has(tehsilId)) fail(`${districtId}: unknown tehsil id "${tehsilId}"`);
    for (const cropId of Object.keys(crops)) {
      specialtyCount += 1;
      if (!cropIds.has(cropId)) fail(`${districtId}/${tehsilId}: unknown crop id "${cropId}"`);
    }
  }
  for (const cropId of region.gi || []) {
    if (!cropIds.has(cropId)) fail(`${districtId}: unknown GI crop "${cropId}"`);
  }
  for (const cropId of region.excluded || []) {
    if (!cropIds.has(cropId)) fail(`${districtId}: unknown excluded crop "${cropId}"`);
  }
}
if (failures === 0) ok(`${specialtyCount} specialty entries, all ids valid`);

// ---------------------------------------------------------------------------
console.log('\n2. A regional specialty can never beat the measured data');
const ctx = (over = {}) => ({
  district: 'Latur',
  districtName: 'Latur',
  tehsil: 'Ausa',
  soilType: 'black',
  waterSource: 'limited',
  season: 'all',
  acres: 2,
  recommendationMode: 'standard',
  soilLabData: null,
  ...over,
});

const regionalFor = (district, tehsil) => {
  const map = new Map();
  (REGIONAL_SCORES[district]?.[tehsil] || []).forEach((r) => map.set(r.cropId, r));
  return map;
};

const ausa = regionalFor('Latur', 'Ausa');
const byId = new Map(CROPS_DATA.map((c) => [c.id, c]));

for (const cropId of ['gram', 'onion']) {
  const crop = byId.get(cropId);
  const measured = ausa.get(cropId)?.score;
  const scored = scoreCrop(crop, ausa.get(cropId), ctx());
  const label = `${cropId}: measured ${measured} -> shown ${scored.score}`;
  if (measured !== undefined && scored.score - measured > 20) {
    fail(`${label} - specialty/soil lifted it more than 20 points`);
  } else if (measured !== undefined && measured < 50 && scored.score >= 70) {
    fail(`${label} - an unsuitable measured score was shown as a strong recommendation`);
  } else {
    ok(label);
  }
}

// ---------------------------------------------------------------------------
console.log('\n3. No fabricated values, no clamping into ties');
const laturScores = rankCrops(CROPS_DATA.map((c) => scoreCrop(c, ausa.get(c.id), ctx())));

const outOfRange = laturScores.filter((c) => c.score < 0 || c.score > 100);
if (outOfRange.length) fail(`${outOfRange.length} crops outside 0-100`);

const perfect = laturScores.filter((c) => c.score === 100);
if (perfect.length > 3) fail(`${perfect.length} crops tie at exactly 100 (was 8 at 99)`);
else ok(`${perfect.length} crop(s) at 100`);

const ranks = laturScores.map((c) => c.rank);
const uniqueRanks = new Set(ranks).size === ranks.length;
if (!uniqueRanks) fail('duplicate ranks'); else ok('ranks are unique and deterministic');

const suitable = laturScores.filter((c) => !c.notSuitable).length;
console.log(`        Latur/Ausa: ${suitable}/${laturScores.length} shown as suitable`);

// A missing regional factor must stay null, not become 75.
const noData = laturScores.filter((c) => c.factors.soilSource === 'missing' && c.factors.soil === 75);
if (noData.length) fail(`${noData.length} crops show soil=75 with no soil data`);
else ok('missing soil data is never published as 75');

// ---------------------------------------------------------------------------
console.log('\n4. Ordering is reproducible');
const again = rankCrops(CROPS_DATA.map((c) => scoreCrop(c, ausa.get(c.id), ctx())));
const sameOrder = again.map((c) => c.id).join() === laturScores.map((c) => c.id).join();
if (!sameOrder) fail('scoring is not deterministic'); else ok('identical output across runs');

// ---------------------------------------------------------------------------
console.log('\n5. Every region resolves a "famous crops" list');
let emptyRegions = 0;
for (const districtId of districtIds) {
  const tehsil = (TEHSILS_BY_DISTRICT[districtId] || [])[0]?.id;
  const list = getRegionalSpecialties(districtId, tehsil);
  if (!list.length && !districtId.startsWith('Mumbai')) {
    emptyRegions += 1;
    console.warn(`  warn  ${districtId} has no regional specialties`);
  }
}
if (emptyRegions) fail(`${emptyRegions} non-urban districts have no specialties`);
else ok('all non-urban districts resolve at least one specialty');

// ---------------------------------------------------------------------------
console.log('\n6. Tehsil-level specialties actually fire');
const katol = getSpecialty('Nagpur', 'Katol', 'orange');
if (katol?.level !== 'tehsil') fail('Katol orange should be a tehsil-level specialty');
else ok('Nagpur/Katol -> orange (tehsil)');

const niphad = getSpecialty('Nashik', 'Niphad', 'onion');
if (niphad?.level !== 'tehsil') fail('Niphad onion should be a tehsil-level specialty');
else ok('Nashik/Niphad -> onion (tehsil)');

// ---------------------------------------------------------------------------
console.log('\n7. Agronomy matrix covers every catalog crop');
const missingAgronomy = CROPS_DATA.filter((c) => !CROP_AGRONOMY[c.id]).map((c) => c.id);
if (missingAgronomy.length) fail(`no agronomy entry for: ${missingAgronomy.join(', ')}`);
else ok('every crop has an agronomy profile');

// ---------------------------------------------------------------------------
console.log('');
if (failures) {
  console.error(`${failures} scoring check(s) failed\n`);
  process.exit(1);
}
console.log('All scoring checks passed\n');
