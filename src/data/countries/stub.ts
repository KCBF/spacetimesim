// Stub - will be replaced by full data
export interface CountryData {
  rank: number;
  code: string;
  name: string;
  region: string;
  subregion: string;
  population: number;
  gdpMillions: number;
  gdpPerCapita: number;
  areaSqKm: number;
  density: number;
  growthRate: number;
  lifeExpectancy: number;
  urbanization: number;
  medianAge: number;
  literacy: number;
  internet: number;
  unemployment: number;
  avgSalary: number;
  minWage: number;
  maxIncomeTax: number;
  corporateTax: number;
  inflation: number;
  debtToGdp: number;
  militaryGdp: number;
  healthGdp: number;
  currency: string;
  capital: string;
}
export const REGIONS = ['Africa', 'Americas', 'Asia', 'Europe', 'Middle East', 'Oceania'] as const;
export const countries: CountryData[] = [];
