// ---------------------------------------------------------------------------
// Country data category tabs & column definitions
// Matches the tabbed layout style of world.effoma.com
// ---------------------------------------------------------------------------

export interface ColumnDef {
  key: string; // matches CountryData field name
  label: string;
  shortLabel?: string;
  format: 'number' | 'currency' | 'percent' | 'decimal' | 'text';
  suffix?: string;
  prefix?: string;
  decimals?: number;
  sortable: boolean;
  filterable: boolean;
  width: number; // px
}

export interface CategoryTab {
  id: string;
  label: string;
  icon: string; // emoji
  columns: ColumnDef[];
}

// ---- Reusable column factories ----

const col = {
  country: (): ColumnDef => ({
    key: 'country',
    label: 'Country',
    format: 'text',
    sortable: true,
    filterable: true,
    width: 150,
  }),
  population: (): ColumnDef => ({
    key: 'population',
    label: 'Population',
    format: 'number',
    sortable: true,
    filterable: true,
    width: 130,
  }),
  gdp: (): ColumnDef => ({
    key: 'gdp',
    label: 'GDP',
    shortLabel: 'GDP',
    format: 'currency',
    prefix: '$',
    sortable: true,
    filterable: true,
    width: 140,
  }),
  gdpPerCapita: (): ColumnDef => ({
    key: 'gdpPerCapita',
    label: 'GDP Per Capita',
    shortLabel: 'GDP/Cap',
    format: 'currency',
    prefix: '$',
    decimals: 0,
    sortable: true,
    filterable: true,
    width: 130,
  }),
  area: (): ColumnDef => ({
    key: 'area',
    label: 'Area',
    format: 'number',
    suffix: ' km\u00B2',
    sortable: true,
    filterable: true,
    width: 120,
  }),
  density: (): ColumnDef => ({
    key: 'density',
    label: 'Density',
    shortLabel: 'Pop/km\u00B2',
    format: 'decimal',
    suffix: ' /km\u00B2',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 110,
  }),
  growthRate: (): ColumnDef => ({
    key: 'growthRate',
    label: 'Growth Rate',
    shortLabel: 'Growth',
    format: 'percent',
    suffix: '%',
    decimals: 2,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  lifeExpectancy: (): ColumnDef => ({
    key: 'lifeExpectancy',
    label: 'Life Expectancy',
    shortLabel: 'Life Exp.',
    format: 'decimal',
    suffix: ' yrs',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  urbanization: (): ColumnDef => ({
    key: 'urbanization',
    label: 'Urbanization',
    shortLabel: 'Urban',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 110,
  }),
  medianAge: (): ColumnDef => ({
    key: 'medianAge',
    label: 'Median Age',
    shortLabel: 'Med. Age',
    format: 'decimal',
    suffix: ' yrs',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  literacy: (): ColumnDef => ({
    key: 'literacy',
    label: 'Literacy',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  internet: (): ColumnDef => ({
    key: 'internet',
    label: 'Internet',
    shortLabel: 'Internet %',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  unemployment: (): ColumnDef => ({
    key: 'unemployment',
    label: 'Unemployment',
    shortLabel: 'Unemp.',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 110,
  }),
  avgSalary: (): ColumnDef => ({
    key: 'avgSalary',
    label: 'Avg Salary',
    shortLabel: 'Avg Sal.',
    format: 'currency',
    prefix: '$',
    decimals: 0,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  minWage: (): ColumnDef => ({
    key: 'minWage',
    label: 'Min Wage',
    format: 'currency',
    prefix: '$',
    decimals: 0,
    sortable: true,
    filterable: true,
    width: 110,
  }),
  maxIncomeTax: (): ColumnDef => ({
    key: 'maxIncomeTax',
    label: 'Max Income Tax',
    shortLabel: 'Inc. Tax',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  corporateTax: (): ColumnDef => ({
    key: 'corporateTax',
    label: 'Corporate Tax',
    shortLabel: 'Corp. Tax',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  inflation: (): ColumnDef => ({
    key: 'inflation',
    label: 'Inflation',
    format: 'percent',
    suffix: '%',
    decimals: 2,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  debtToGdp: (): ColumnDef => ({
    key: 'debtToGdp',
    label: 'Debt/GDP',
    format: 'percent',
    suffix: '%',
    decimals: 1,
    sortable: true,
    filterable: true,
    width: 100,
  }),
  militarySpending: (): ColumnDef => ({
    key: 'militarySpending',
    label: 'Military %GDP',
    shortLabel: 'Mil. %GDP',
    format: 'percent',
    suffix: '%',
    decimals: 2,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  healthSpending: (): ColumnDef => ({
    key: 'healthSpending',
    label: 'Health %GDP',
    shortLabel: 'Health %GDP',
    format: 'percent',
    suffix: '%',
    decimals: 2,
    sortable: true,
    filterable: true,
    width: 120,
  }),
  currency: (): ColumnDef => ({
    key: 'currency',
    label: 'Currency',
    format: 'text',
    sortable: true,
    filterable: true,
    width: 110,
  }),
  region: (): ColumnDef => ({
    key: 'region',
    label: 'Region',
    format: 'text',
    sortable: true,
    filterable: true,
    width: 130,
  }),
  subregion: (): ColumnDef => ({
    key: 'subregion',
    label: 'Subregion',
    format: 'text',
    sortable: true,
    filterable: true,
    width: 150,
  }),
};

// ---- Category tabs ----

export const DATA_CATEGORIES: CategoryTab[] = [
  // 1. Overview
  {
    id: 'overview',
    label: 'Overview',
    icon: '\uD83C\uDF0D',
    columns: [
      col.country(),
      col.population(),
      col.gdp(),
      col.gdpPerCapita(),
      col.area(),
      col.density(),
      col.growthRate(),
      col.lifeExpectancy(),
      col.urbanization(),
      col.medianAge(),
      col.literacy(),
      col.internet(),
      col.unemployment(),
      col.avgSalary(),
      col.minWage(),
      col.maxIncomeTax(),
      col.corporateTax(),
      col.inflation(),
      col.debtToGdp(),
      col.militarySpending(),
      col.healthSpending(),
    ],
  },

  // 2. Finance & Tax
  {
    id: 'finance-tax',
    label: 'Finance & Tax',
    icon: '\uD83D\uDCB0',
    columns: [
      col.country(),
      col.gdp(),
      col.gdpPerCapita(),
      col.avgSalary(),
      col.minWage(),
      col.maxIncomeTax(),
      col.corporateTax(),
      col.inflation(),
      col.debtToGdp(),
      col.currency(),
    ],
  },

  // 3. Demographics
  {
    id: 'demographics',
    label: 'Demographics',
    icon: '\uD83D\uDC65',
    columns: [
      col.country(),
      col.population(),
      col.density(),
      col.growthRate(),
      col.medianAge(),
      col.lifeExpectancy(),
      col.urbanization(),
      col.literacy(),
      col.internet(),
      col.unemployment(),
    ],
  },

  // 4. Trade & Industry
  {
    id: 'trade-industry',
    label: 'Trade & Industry',
    icon: '\uD83C\uDFED',
    columns: [
      col.country(),
      col.gdp(),
      col.gdpPerCapita(),
      col.inflation(),
      col.corporateTax(),
      col.unemployment(),
      col.growthRate(),
    ],
  },

  // 5. Military & Defense
  {
    id: 'military-defense',
    label: 'Military & Defense',
    icon: '\uD83D\uDEE1\uFE0F',
    columns: [
      col.country(),
      col.population(),
      col.gdp(),
      col.militarySpending(),
      col.area(),
    ],
  },

  // 6. Health & Medicine
  {
    id: 'health-medicine',
    label: 'Health & Medicine',
    icon: '\uD83C\uDFE5',
    columns: [
      col.country(),
      col.population(),
      col.lifeExpectancy(),
      col.healthSpending(),
      col.medianAge(),
      col.urbanization(),
    ],
  },

  // 7. Climate & Weather (placeholder data)
  {
    id: 'climate-weather',
    label: 'Climate & Weather',
    icon: '\uD83C\uDF24\uFE0F',
    columns: [
      col.country(),
      col.area(),
      col.region(),
      col.subregion(),
    ],
  },

  // 8. Technology
  {
    id: 'technology',
    label: 'Technology',
    icon: '\uD83D\uDCBB',
    columns: [
      col.country(),
      col.internet(),
      col.gdpPerCapita(),
      col.population(),
      col.literacy(),
    ],
  },

  // 9. Education & Research
  {
    id: 'education-research',
    label: 'Education & Research',
    icon: '\uD83C\uDF93',
    columns: [
      col.country(),
      col.literacy(),
      col.gdpPerCapita(),
      col.population(),
      col.internet(),
    ],
  },
];

// ---- Helpers ----

/** Look up a category by its id */
export function getCategoryById(id: string): CategoryTab | undefined {
  return DATA_CATEGORIES.find((cat) => cat.id === id);
}

/** Get all unique column keys referenced across every category */
export function getAllColumnKeys(): string[] {
  const keys = new Set<string>();
  for (const cat of DATA_CATEGORIES) {
    for (const c of cat.columns) {
      keys.add(c.key);
    }
  }
  return Array.from(keys);
}
