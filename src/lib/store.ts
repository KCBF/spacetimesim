import { create } from 'zustand';
import { EventCategory } from './events/types';
import type { Viewport } from './time/scales';
import { clampViewport } from './time/scales';
import {
  BIG_BANG_YBP,
  EARTH_FORMATION_YBP,
  FIRST_LIFE_YBP,
  DINOSAUR_EXTINCTION_YBP,
  FIRST_HUMANS_YBP,
  AGRICULTURE_YBP,
  MODERN_ERA_YBP,
  SIMULATION_BOUNDARY_YBP,
} from './time/constants';

export type TabId = 'timeline' | 'worldmap' | 'demographics' | 'techtree' | 'economy' | 'chronicle';

interface AppState {
  // Viewport
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;

  // Selection
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  hoveredEventId: string | null;
  setHoveredEventId: (id: string | null) => void;

  // Filters
  activeCategories: Set<EventCategory>;
  toggleCategory: (category: EventCategory) => void;
  setAllCategories: (active: boolean) => void;
  minSignificance: number;
  setMinSignificance: (min: number) => void;

  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;

  // Quick navigation
  jumpToEra: (eraKey: string) => void;
  jumpToEvent: (yearYBP: number) => void;
}

const ALL_CATEGORIES = new Set(Object.values(EventCategory));

// Start showing recent human history
const DEFAULT_VIEWPORT: Viewport = {
  startYBP: -6_000,
  endYBP: 100,
  width: 1200,
};

const ERA_JUMPS: Record<string, { startYBP: number; endYBP: number }> = {
  'big-bang': { startYBP: BIG_BANG_YBP, endYBP: -10_000_000_000 },
  'earth': { startYBP: EARTH_FORMATION_YBP - 200_000_000, endYBP: FIRST_LIFE_YBP },
  'life': { startYBP: FIRST_LIFE_YBP - 200_000_000, endYBP: -500_000_000 },
  'dinosaurs': { startYBP: -252_000_000, endYBP: DINOSAUR_EXTINCTION_YBP + 5_000_000 },
  'humans': { startYBP: FIRST_HUMANS_YBP - 50_000, endYBP: AGRICULTURE_YBP },
  'civilization': { startYBP: AGRICULTURE_YBP, endYBP: -500 },
  'modern': { startYBP: MODERN_ERA_YBP, endYBP: 10 },
  'future': { startYBP: -10, endYBP: 200 },
};

export const useAppStore = create<AppState>((set, get) => ({
  viewport: DEFAULT_VIEWPORT,
  setViewport: (viewport) => set({ viewport: clampViewport(viewport) }),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  hoveredEventId: null,
  setHoveredEventId: (id) => set({ hoveredEventId: id }),

  activeCategories: new Set(ALL_CATEGORIES),
  toggleCategory: (category) => set((state) => {
    const next = new Set(state.activeCategories);
    if (next.has(category)) next.delete(category);
    else next.add(category);
    return { activeCategories: next };
  }),
  setAllCategories: (active) => set({
    activeCategories: active ? new Set(ALL_CATEGORIES) : new Set(),
  }),
  minSignificance: 1,
  setMinSignificance: (min) => set({ minSignificance: min }),

  activeTab: 'timeline',
  setActiveTab: (tab) => set({ activeTab: tab }),

  jumpToEra: (eraKey) => {
    const jump = ERA_JUMPS[eraKey];
    if (jump) {
      set({ viewport: clampViewport({ ...get().viewport, startYBP: jump.startYBP, endYBP: jump.endYBP }) });
    }
  },
  jumpToEvent: (yearYBP) => {
    const { viewport } = get();
    const span = viewport.endYBP - viewport.startYBP;
    const halfSpan = span / 2;
    set({
      viewport: clampViewport({
        ...viewport,
        startYBP: yearYBP - halfSpan,
        endYBP: yearYBP + halfSpan,
      }),
    });
  },
}));
