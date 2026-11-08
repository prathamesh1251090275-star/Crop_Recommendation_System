// Guards the contradiction users reported: a crop must never be presented as a
// regional specialty and as "not suitable" at the same time.
//
// The curated specialty list says a crop is famous here; the scoring engine
// says whether it actually fits this farm's soil, water and season. Those are
// different claims, and when both were shown together the screen argued with
// itself. lib/scoreCrop.js now withholds the specialty bump when a hard
// disqualifier applies, so this file asserts the invariant across real data.
//
// Run with: npm run verify:scoring
import { CROPS_DATA } from '../src/data/cropsData.js';
import { REGIONAL_SCORES } from '../src/data/regionalScores.js';
import { scoreCrop } from '../src/lib/scoreCrop.js';

let failures = 0;
const ok = (msg) => console.log(`  ok    ${msg}`);
const fail = (msg) => { failures += 1; console.error(`  FAIL  ${msg}`); };

const SOILS = ['black', 'rocky'];
const WATERS = ['rainfed', 'canal'];
const SEASONS = ['all', 'rabi'];

let combos = 0;
let applied = 0;
let cautions = 0;
const contradictions = [];

console.log('\nA crop is never both a regional specialty and unsuitable');

for (const district of Object.keys(REGIONAL_SCORES)) {
  for (const tehsil of Object.keys(REGIONAL_SCORES[district])) {
    const byId = new Map(
      REGIONAL_SCORES[district][tehsil].map((row, index) => [
        row.cropId,
        { score: row.score, rank: row.rank || index + 1, factors: row.factors || {} },
      ]),
    );

    for (const soilType of SOILS) {
      for (const waterSource of WATERS) {
        for (const season of SEASONS) {
          const ctx = {
            district,
            districtName: district,
            tehsil,
            soilType,
            waterSource,
            season,
            acres: 2,
            recommendationMode: 'standard',
            soilLabData: null,
          };

          for (const crop of CROPS_DATA) {
            const scored = scoreCrop(crop, byId.get(crop.id), ctx);
            combos += 1;
            if (scored.regionalSpecialty?.applied) applied += 1;
            if (scored.specialtyCaution) cautions += 1;

            const claimsSpecialty =
              scored.regionalSpecialty?.applied || scored.isGISpecialty;
            if (scored.notSuitable && claimsSpecialty) {
              contradictions.push(
                `${district}/${tehsil} ${crop.id} [${soilType},${waterSource},${season}] score ${scored.score}`,
              );
            }
            if (scored.notSuitable && scored.badgeKey === 'badgeGISpecialty') {
              contradictions.push(
                `${district}/${tehsil} ${crop.id} carries the GI badge while unsuitable`,
              );
            }
          }
        }
      }
    }
  }
}

if (contradictions.length === 0) {
  ok(`${combos} farm/crop combinations, none both specialty and unsuitable`);
} else {
  fail(`${contradictions.length} contradictions, e.g. ${contradictions.slice(0, 3).join(' | ')}`);
}

if (applied > 0) ok(`${applied} specialty bumps still awarded where the crop fits`);
else fail('no specialty bump was awarded anywhere - the rule is over-blocking');

if (cautions > 0) ok(`${cautions} famous-but-unsuitable crops correctly explain themselves`);
else console.warn('  warn  no famous-but-unsuitable case occurred in this sweep');

console.log(failures === 0 ? '\nSpecialty consistency checks passed' : `\n${failures} failure(s)`);
if (failures > 0) process.exit(1);
