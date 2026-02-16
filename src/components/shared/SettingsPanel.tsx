'use client';

import { useDisplayStore, type TimelineDisplayMode } from '@/lib/display-store';

const DISPLAY_MODES: { value: TimelineDisplayMode; label: string }[] = [
  { value: 'cards', label: 'Cards' },
  { value: 'text', label: 'Text Labels' },
  { value: 'dots', label: 'Dots Only' },
  { value: 'compact', label: 'Compact' },
];

export function SettingsPanel() {
  const { settings, updateSetting, resetSettings } = useDisplayStore();
  const setShow = useDisplayStore(s => s.setShowSettingsPanel);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={() => setShow(false)} />
      <div className="relative w-80 h-full bg-surface border-l border-border overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Display Settings</h2>
          <button onClick={() => setShow(false)} className="text-muted hover:text-foreground">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Timeline Display Mode */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Timeline Mode</label>
            <div className="grid grid-cols-2 gap-1">
              {DISPLAY_MODES.map(m => (
                <button
                  key={m.value}
                  onClick={() => updateSetting('timelineMode', m.value)}
                  className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                    settings.timelineMode === m.value
                      ? 'bg-accent text-white border-accent'
                      : 'bg-surface-hover text-muted border-border hover:text-foreground'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle switches */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Timeline Elements</label>
            <div className="space-y-2">
              {([
                ['showEventCards', 'Event Cards'],
                ['showEventText', 'Event Text'],
                ['showEraBands', 'Era Bands'],
                ['showGridLines', 'Grid Lines'],
                ['showRegionLabels', 'Region Labels'],
                ['showMinimap', 'Minimap'],
                ['showSimBoundary', 'Sim Boundary'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">{label}</span>
                  <button
                    onClick={() => updateSetting(key, !settings[key])}
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      settings[key] ? 'bg-accent' : 'bg-border'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      settings[key] ? 'translate-x-4' : 'translate-x-0.5'
                    }`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          {/* Card size */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Card Width: {settings.cardMaxWidth}px</label>
            <input
              type="range"
              min={100}
              max={300}
              value={settings.cardMaxWidth}
              onChange={e => updateSetting('cardMaxWidth', Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Font size */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Event Font: {settings.eventFontSize}px</label>
            <input
              type="range"
              min={8}
              max={16}
              value={settings.eventFontSize}
              onChange={e => updateSetting('eventFontSize', Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Data Table */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Data Table</label>
            <div className="space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Compact rows</span>
                <button
                  onClick={() => updateSetting('compactTable', !settings.compactTable)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${settings.compactTable ? 'bg-accent' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.compactTable ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Highlight on hover</span>
                <button
                  onClick={() => updateSetting('highlightRow', !settings.highlightRow)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${settings.highlightRow ? 'bg-accent' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.highlightRow ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-foreground">Animations</span>
                <button
                  onClick={() => updateSetting('animationsEnabled', !settings.animationsEnabled)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${settings.animationsEnabled ? 'bg-accent' : 'bg-border'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.animationsEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </label>
            </div>
          </div>

          {/* Rows per page */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted block mb-2">Rows per page</label>
            <select
              value={settings.rowsPerPage}
              onChange={e => updateSetting('rowsPerPage', Number(e.target.value))}
              className="w-full bg-surface border border-border rounded px-2 py-1.5 text-sm text-foreground"
            >
              {[25, 50, 100, 200].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {/* Reset */}
          <button
            onClick={resetSettings}
            className="w-full py-2 text-sm rounded border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
