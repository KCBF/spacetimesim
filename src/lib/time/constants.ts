// Time stored as YBP (Years Before Present, where present = 2026)
// Negative values = years before present, so Big Bang = -13_800_000_000
// Positive values = future years after 2026

export const PRESENT_YEAR = 2026;
export const BIG_BANG_YBP = -13_800_000_000;
export const EARTH_FORMATION_YBP = -4_540_000_000;
export const FIRST_LIFE_YBP = -3_800_000_000;
export const CAMBRIAN_EXPLOSION_YBP = -538_000_000;
export const DINOSAUR_EXTINCTION_YBP = -66_000_000;
export const FIRST_HUMANS_YBP = -300_000;
export const AGRICULTURE_YBP = -12_000;
export const BRONZE_AGE_YBP = -5_300;
export const CLASSICAL_ERA_YBP = -2_500;
export const MEDIEVAL_ERA_YBP = -1_500;
export const EARLY_MODERN_YBP = -500;
export const MODERN_ERA_YBP = -226; // ~1800 CE
export const SIMULATION_BOUNDARY_YBP = 0; // 2026

export enum ZoomLevel {
  COSMIC = 0,        // Full 13.8B years
  GALACTIC = 1,      // Billions of years
  GEOLOGICAL = 2,    // Hundreds of millions
  PALEOZOIC = 3,     // Tens of millions
  CENOZOIC = 4,      // Millions of years
  PREHISTORIC = 5,   // Hundreds of thousands
  ANCIENT = 6,       // Thousands of years
  HISTORICAL = 7,    // Hundreds of years
  MODERN = 8,        // Decades
  DETAILED = 9,      // Individual years
}

export interface ZoomConfig {
  level: ZoomLevel;
  label: string;
  minSpanYears: number;
  maxSpanYears: number;
  tickInterval: number;
  minSignificance: number;
  labelFormat: 'bya' | 'mya' | 'kya' | 'bce_ce' | 'ce' | 'year';
}

export const ZOOM_CONFIGS: ZoomConfig[] = [
  { level: ZoomLevel.COSMIC, label: 'Cosmic', minSpanYears: 5_000_000_000, maxSpanYears: Infinity, tickInterval: 1_000_000_000, minSignificance: 5, labelFormat: 'bya' },
  { level: ZoomLevel.GALACTIC, label: 'Galactic', minSpanYears: 1_000_000_000, maxSpanYears: 5_000_000_000, tickInterval: 500_000_000, minSignificance: 5, labelFormat: 'bya' },
  { level: ZoomLevel.GEOLOGICAL, label: 'Geological', minSpanYears: 100_000_000, maxSpanYears: 1_000_000_000, tickInterval: 50_000_000, minSignificance: 4, labelFormat: 'mya' },
  { level: ZoomLevel.PALEOZOIC, label: 'Paleozoic', minSpanYears: 10_000_000, maxSpanYears: 100_000_000, tickInterval: 10_000_000, minSignificance: 4, labelFormat: 'mya' },
  { level: ZoomLevel.CENOZOIC, label: 'Cenozoic', minSpanYears: 1_000_000, maxSpanYears: 10_000_000, tickInterval: 1_000_000, minSignificance: 3, labelFormat: 'mya' },
  { level: ZoomLevel.PREHISTORIC, label: 'Prehistoric', minSpanYears: 50_000, maxSpanYears: 1_000_000, tickInterval: 100_000, minSignificance: 3, labelFormat: 'kya' },
  { level: ZoomLevel.ANCIENT, label: 'Ancient', minSpanYears: 2_000, maxSpanYears: 50_000, tickInterval: 1_000, minSignificance: 2, labelFormat: 'bce_ce' },
  { level: ZoomLevel.HISTORICAL, label: 'Historical', minSpanYears: 200, maxSpanYears: 2_000, tickInterval: 100, minSignificance: 2, labelFormat: 'bce_ce' },
  { level: ZoomLevel.MODERN, label: 'Modern', minSpanYears: 20, maxSpanYears: 200, tickInterval: 10, minSignificance: 1, labelFormat: 'ce' },
  { level: ZoomLevel.DETAILED, label: 'Detailed', minSpanYears: 0, maxSpanYears: 20, tickInterval: 1, minSignificance: 1, labelFormat: 'year' },
];

export function getZoomConfig(spanYears: number): ZoomConfig {
  for (const config of ZOOM_CONFIGS) {
    if (spanYears >= config.minSpanYears) return config;
  }
  return ZOOM_CONFIGS[ZOOM_CONFIGS.length - 1];
}

// Era definitions for background bands
export interface Era {
  id: string;
  name: string;
  startYBP: number;
  endYBP: number;
  color: string;
}

export const ERAS: Era[] = [
  { id: 'cosmic', name: 'Cosmic Era', startYBP: -13_800_000_000, endYBP: -4_540_000_000, color: 'rgba(88, 28, 135, 0.15)' },
  { id: 'hadean', name: 'Hadean / Archean', startYBP: -4_540_000_000, endYBP: -2_500_000_000, color: 'rgba(153, 27, 27, 0.15)' },
  { id: 'proterozoic', name: 'Proterozoic', startYBP: -2_500_000_000, endYBP: -538_000_000, color: 'rgba(120, 53, 15, 0.15)' },
  { id: 'paleozoic', name: 'Paleozoic', startYBP: -538_000_000, endYBP: -252_000_000, color: 'rgba(21, 94, 117, 0.15)' },
  { id: 'mesozoic', name: 'Mesozoic', startYBP: -252_000_000, endYBP: -66_000_000, color: 'rgba(22, 101, 52, 0.15)' },
  { id: 'cenozoic', name: 'Cenozoic', startYBP: -66_000_000, endYBP: -12_000, color: 'rgba(161, 98, 7, 0.15)' },
  { id: 'ancient', name: 'Ancient Civilizations', startYBP: -12_000, endYBP: -1_500, color: 'rgba(180, 83, 9, 0.15)' },
  { id: 'medieval', name: 'Medieval Period', startYBP: -1_500, endYBP: -500, color: 'rgba(55, 65, 81, 0.15)' },
  { id: 'earlymodern', name: 'Early Modern', startYBP: -500, endYBP: -226, color: 'rgba(30, 64, 175, 0.15)' },
  { id: 'modern', name: 'Modern Era', startYBP: -226, endYBP: 0, color: 'rgba(79, 70, 229, 0.15)' },
  { id: 'future', name: 'Cybernetics Simulation', startYBP: 0, endYBP: 1000, color: 'rgba(236, 72, 153, 0.1)' },
];
