export interface GDPDataPoint {
  yearYBP: number;
  region: string;
  gdp: number; // in billions of 1990 international dollars (Maddison)
}

// Historical GDP estimates based on Maddison Project data
// yearYBP = CE_year - 2026
export const gdpData: GDPDataPoint[] = [
  // 1 CE (-2025 YBP)
  { yearYBP: -2025, region: 'eurasia-west', gdp: 11 },
  { yearYBP: -2025, region: 'eurasia-east', gdp: 27 },
  { yearYBP: -2025, region: 'south-asia', gdp: 34 },
  { yearYBP: -2025, region: 'africa', gdp: 7 },
  { yearYBP: -2025, region: 'americas', gdp: 3 },

  // 1000 CE (-1026)
  { yearYBP: -1026, region: 'eurasia-west', gdp: 10 },
  { yearYBP: -1026, region: 'eurasia-east', gdp: 27 },
  { yearYBP: -1026, region: 'south-asia', gdp: 34 },
  { yearYBP: -1026, region: 'africa', gdp: 14 },
  { yearYBP: -1026, region: 'americas', gdp: 5 },

  // 1500 CE (-526)
  { yearYBP: -526, region: 'eurasia-west', gdp: 44 },
  { yearYBP: -526, region: 'eurasia-east', gdp: 62 },
  { yearYBP: -526, region: 'south-asia', gdp: 61 },
  { yearYBP: -526, region: 'africa', gdp: 19 },
  { yearYBP: -526, region: 'americas', gdp: 7 },

  // 1700 CE (-326)
  { yearYBP: -326, region: 'eurasia-west', gdp: 81 },
  { yearYBP: -326, region: 'eurasia-east', gdp: 83 },
  { yearYBP: -326, region: 'south-asia', gdp: 91 },
  { yearYBP: -326, region: 'africa', gdp: 22 },
  { yearYBP: -326, region: 'americas', gdp: 6 },

  // 1820 CE (-206)
  { yearYBP: -206, region: 'eurasia-west', gdp: 163 },
  { yearYBP: -206, region: 'eurasia-east', gdp: 235 },
  { yearYBP: -206, region: 'south-asia', gdp: 112 },
  { yearYBP: -206, region: 'africa', gdp: 31 },
  { yearYBP: -206, region: 'americas', gdp: 15 },

  // 1870 CE (-156)
  { yearYBP: -156, region: 'eurasia-west', gdp: 370 },
  { yearYBP: -156, region: 'eurasia-east', gdp: 250 },
  { yearYBP: -156, region: 'south-asia', gdp: 135 },
  { yearYBP: -156, region: 'africa', gdp: 37 },
  { yearYBP: -156, region: 'americas', gdp: 120 },

  // 1913 CE (-113)
  { yearYBP: -113, region: 'eurasia-west', gdp: 900 },
  { yearYBP: -113, region: 'eurasia-east', gdp: 310 },
  { yearYBP: -113, region: 'south-asia', gdp: 204 },
  { yearYBP: -113, region: 'africa', gdp: 53 },
  { yearYBP: -113, region: 'americas', gdp: 600 },

  // 1950 CE (-76)
  { yearYBP: -76, region: 'eurasia-west', gdp: 1400 },
  { yearYBP: -76, region: 'eurasia-east', gdp: 350 },
  { yearYBP: -76, region: 'south-asia', gdp: 222 },
  { yearYBP: -76, region: 'africa', gdp: 103 },
  { yearYBP: -76, region: 'americas', gdp: 1800 },

  // 1973 CE (-53)
  { yearYBP: -53, region: 'eurasia-west', gdp: 4100 },
  { yearYBP: -53, region: 'eurasia-east', gdp: 1200 },
  { yearYBP: -53, region: 'south-asia', gdp: 495 },
  { yearYBP: -53, region: 'africa', gdp: 260 },
  { yearYBP: -53, region: 'americas', gdp: 4200 },

  // 2000 CE (-26)
  { yearYBP: -26, region: 'eurasia-west', gdp: 7600 },
  { yearYBP: -26, region: 'eurasia-east', gdp: 6200 },
  { yearYBP: -26, region: 'south-asia', gdp: 2100 },
  { yearYBP: -26, region: 'africa', gdp: 550 },
  { yearYBP: -26, region: 'americas', gdp: 10500 },

  // 2025 CE (-1)
  { yearYBP: -1, region: 'eurasia-west', gdp: 11000 },
  { yearYBP: -1, region: 'eurasia-east', gdp: 18000 },
  { yearYBP: -1, region: 'south-asia', gdp: 5500 },
  { yearYBP: -1, region: 'africa', gdp: 1200 },
  { yearYBP: -1, region: 'americas', gdp: 14000 },
];

export const GDP_REGIONS = ['eurasia-west', 'eurasia-east', 'south-asia', 'africa', 'americas'];
