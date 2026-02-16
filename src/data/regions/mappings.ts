import type { Region } from '@/lib/regions/types';

export const REGIONS: Region[] = [
  {
    id: 'universe',
    displayOrder: 0,
    names: [
      { name: 'Universe', startYBP: -13_800_000_000, endYBP: -4_540_000_000 },
    ],
    color: '#7c3aed', // violet-600
  },
  {
    id: 'solar-system',
    displayOrder: 1,
    names: [
      { name: 'Solar System', startYBP: -4_600_000_000, endYBP: -538_000_000 },
    ],
    color: '#f59e0b', // amber-500
  },
  {
    id: 'global',
    displayOrder: 2,
    names: [
      { name: 'Global', startYBP: -13_800_000_000, endYBP: 1000 },
    ],
    color: '#6366f1', // indigo-500
  },
  {
    id: 'africa',
    displayOrder: 3,
    names: [
      { name: 'Gondwana (East)', startYBP: -538_000_000, endYBP: -66_000_000 },
      { name: 'Cradle of Humanity', startYBP: -66_000_000, endYBP: -5_000 },
      { name: 'Egypt / Kush', startYBP: -5_000, endYBP: -1_550 },
      { name: 'Africa', startYBP: -1_550, endYBP: 1000 },
    ],
    color: '#f97316', // orange-500
  },
  {
    id: 'eurasia-west',
    displayOrder: 4,
    names: [
      { name: 'Laurasia (West)', startYBP: -538_000_000, endYBP: -66_000_000 },
      { name: 'Fertile Crescent', startYBP: -12_000, endYBP: -3_500 },
      { name: 'Rome / Greece', startYBP: -3_500, endYBP: -1_550 },
      { name: 'Christendom', startYBP: -1_550, endYBP: -526 },
      { name: 'Europe', startYBP: -526, endYBP: 1000 },
    ],
    color: '#3b82f6', // blue-500
  },
  {
    id: 'eurasia-east',
    displayOrder: 5,
    names: [
      { name: 'Laurasia (East)', startYBP: -538_000_000, endYBP: -66_000_000 },
      { name: 'Yellow River', startYBP: -10_000, endYBP: -4_200 },
      { name: 'Han Dynasty Era', startYBP: -4_200, endYBP: -1_550 },
      { name: 'East Asia', startYBP: -1_550, endYBP: 1000 },
    ],
    color: '#ef4444', // red-500
  },
  {
    id: 'south-asia',
    displayOrder: 6,
    names: [
      { name: 'Indian Subcontinent', startYBP: -66_000_000, endYBP: -4_600 },
      { name: 'Indus Valley', startYBP: -4_600, endYBP: -3_500 },
      { name: 'South Asia', startYBP: -3_500, endYBP: 1000 },
    ],
    color: '#10b981', // emerald-500
  },
  {
    id: 'eurasia-central',
    displayOrder: 7,
    names: [
      { name: 'Central Steppe', startYBP: -66_000_000, endYBP: -3_000 },
      { name: 'Persia / Steppe', startYBP: -3_000, endYBP: -826 },
      { name: 'Central Asia', startYBP: -826, endYBP: 1000 },
    ],
    color: '#8b5cf6', // violet-500
  },
  {
    id: 'americas',
    displayOrder: 8,
    names: [
      { name: 'Gondwana (West)', startYBP: -538_000_000, endYBP: -66_000_000 },
      { name: 'The Americas', startYBP: -20_000, endYBP: -3_500 },
      { name: 'Mesoamerica / Andes', startYBP: -3_500, endYBP: -534 },
      { name: 'Americas', startYBP: -534, endYBP: 1000 },
    ],
    color: '#06b6d4', // cyan-500
  },
  {
    id: 'oceania',
    displayOrder: 9,
    names: [
      { name: 'Sahul', startYBP: -65_000, endYBP: -256 },
      { name: 'Oceania', startYBP: -256, endYBP: 1000 },
    ],
    color: '#14b8a6', // teal-500
  },
];
