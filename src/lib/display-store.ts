import { create } from 'zustand';

export type TimelineDisplayMode = 'dots' | 'cards' | 'text' | 'compact';

export interface DisplaySettings {
  // Timeline display
  timelineMode: TimelineDisplayMode;
  showEventCards: boolean;
  showEventText: boolean;
  showEraBands: boolean;
  showGridLines: boolean;
  showRegionLabels: boolean;
  showMinimap: boolean;
  showSimBoundary: boolean;
  cardMaxWidth: number;
  eventFontSize: number;

  // Data table
  rowsPerPage: number;
  compactTable: boolean;
  showFlags: boolean;
  highlightRow: boolean;

  // General
  animationsEnabled: boolean;
}

const DEFAULTS: DisplaySettings = {
  timelineMode: 'cards',
  showEventCards: true,
  showEventText: true,
  showEraBands: true,
  showGridLines: true,
  showRegionLabels: true,
  showMinimap: true,
  showSimBoundary: true,
  cardMaxWidth: 180,
  eventFontSize: 11,
  rowsPerPage: 50,
  compactTable: false,
  showFlags: true,
  highlightRow: true,
  animationsEnabled: true,
};

interface DisplayState {
  settings: DisplaySettings;
  showSettingsPanel: boolean;
  setShowSettingsPanel: (show: boolean) => void;
  updateSetting: <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => void;
  resetSettings: () => void;
}

function loadSettings(): DisplaySettings {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem('spacetime-display');
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch { return DEFAULTS; }
}

function saveSettings(settings: DisplaySettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('spacetime-display', JSON.stringify(settings));
}

export const useDisplayStore = create<DisplayState>((set, get) => ({
  settings: typeof window !== 'undefined' ? loadSettings() : DEFAULTS,
  showSettingsPanel: false,
  setShowSettingsPanel: (show) => set({ showSettingsPanel: show }),
  updateSetting: (key, value) => {
    const settings = { ...get().settings, [key]: value };
    saveSettings(settings);
    set({ settings });
  },
  resetSettings: () => {
    saveSettings(DEFAULTS);
    set({ settings: DEFAULTS });
  },
}));
