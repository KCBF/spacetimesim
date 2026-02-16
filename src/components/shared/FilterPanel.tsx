'use client';

import { useAppStore } from '@/lib/store';
import { EventCategory, CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/events/types';

export function FilterPanel() {
  const activeCategories = useAppStore(s => s.activeCategories);
  const toggleCategory = useAppStore(s => s.toggleCategory);
  const setAllCategories = useAppStore(s => s.setAllCategories);
  const minSignificance = useAppStore(s => s.minSignificance);
  const setMinSignificance = useAppStore(s => s.setMinSignificance);

  const allActive = activeCategories.size === Object.values(EventCategory).length;

  return (
    <div className="flex flex-col gap-3 p-3 bg-surface border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Categories</span>
        <button
          onClick={() => setAllCategories(!allActive)}
          className="text-xs text-accent hover:text-accent-dim"
        >
          {allActive ? 'None' : 'All'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.values(EventCategory).map(cat => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-colors ${
              activeCategories.has(cat)
                ? 'border-transparent text-white'
                : 'border-border text-muted opacity-50'
            }`}
            style={{
              backgroundColor: activeCategories.has(cat) ? CATEGORY_COLORS[cat] + '33' : undefined,
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[cat] }}
            />
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <span className="text-xs text-muted whitespace-nowrap">Min significance:</span>
        <input
          type="range"
          min={1}
          max={5}
          value={minSignificance}
          onChange={(e) => setMinSignificance(Number(e.target.value))}
          className="flex-1 h-1 accent-accent"
        />
        <span className="text-xs font-mono text-foreground w-4 text-center">{minSignificance}</span>
      </div>
    </div>
  );
}
