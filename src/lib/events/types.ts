export enum EventCategory {
  COSMIC = 'COSMIC',
  GEOLOGICAL = 'GEOLOGICAL',
  BIOLOGICAL = 'BIOLOGICAL',
  POLITICAL = 'POLITICAL',
  MILITARY = 'MILITARY',
  TECHNOLOGICAL = 'TECHNOLOGICAL',
  CULTURAL = 'CULTURAL',
  ECONOMIC = 'ECONOMIC',
  DEMOGRAPHIC = 'DEMOGRAPHIC',
  ENVIRONMENTAL = 'ENVIRONMENTAL',
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  [EventCategory.COSMIC]: '#a78bfa',       // violet-400
  [EventCategory.GEOLOGICAL]: '#f97316',   // orange-500
  [EventCategory.BIOLOGICAL]: '#22c55e',   // green-500
  [EventCategory.POLITICAL]: '#3b82f6',    // blue-500
  [EventCategory.MILITARY]: '#ef4444',     // red-500
  [EventCategory.TECHNOLOGICAL]: '#06b6d4',// cyan-500
  [EventCategory.CULTURAL]: '#eab308',     // yellow-500
  [EventCategory.ECONOMIC]: '#10b981',     // emerald-500
  [EventCategory.DEMOGRAPHIC]: '#f472b6',  // pink-400
  [EventCategory.ENVIRONMENTAL]: '#84cc16',// lime-500
};

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  [EventCategory.COSMIC]: 'Cosmic',
  [EventCategory.GEOLOGICAL]: 'Geological',
  [EventCategory.BIOLOGICAL]: 'Biological',
  [EventCategory.POLITICAL]: 'Political',
  [EventCategory.MILITARY]: 'Military',
  [EventCategory.TECHNOLOGICAL]: 'Technological',
  [EventCategory.CULTURAL]: 'Cultural',
  [EventCategory.ECONOMIC]: 'Economic',
  [EventCategory.DEMOGRAPHIC]: 'Demographic',
  [EventCategory.ENVIRONMENTAL]: 'Environmental',
};

export interface SpacetimeEvent {
  id: string;
  name: string;
  description: string;
  yearYBP: number;
  yearEndYBP?: number;
  regionId: string;
  category: EventCategory;
  significance: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  isFuture: boolean;
  simulationConfidence?: number; // 0-1, only for future events
}
