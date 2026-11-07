// Agronomic properties matrix: soil affinity, water need, season.
//
// Data only - no scoring logic lives here. Every number is a *nudge* applied on
// top of the region's measured suitability score, and lib/scoreCrop.js bounds
// the total so these priors can never override real soil/weather data.
//
// `soil` deltas are points added for the farmer's chosen soil type.

export const DEFAULT_AGRONOMY = {
  category: 'cashcrops',
  season: 'kharif',
  waterNeed: 'moderate',
  soil: { black: 8, red: 8, rocky: -20, mixed: 10 },
};

export const CROP_AGRONOMY = {
  // Cereals, pulses, oilseeds
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

  // Fruits / horticulture
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

  // Commercial / cash crops
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
  french_beans: { category: 'vegetables', season: 'kharif', waterNeed: 'moderate', soil: { black: 8, red: 8, rocky: -25, mixed: 15 } },
};
