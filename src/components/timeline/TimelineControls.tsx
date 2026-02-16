'use client';

import { useAppStore } from '@/lib/store';

const ERA_BUTTONS = [
  { key: 'big-bang', label: 'Big Bang' },
  { key: 'earth', label: 'Earth' },
  { key: 'life', label: 'Life' },
  { key: 'dinosaurs', label: 'Dinosaurs' },
  { key: 'humans', label: 'Humans' },
  { key: 'civilization', label: 'Civilization' },
  { key: 'modern', label: 'Modern' },
  { key: 'future', label: 'Future' },
];

export function TimelineControls() {
  const jumpToEra = useAppStore(s => s.jumpToEra);
  const viewport = useAppStore(s => s.viewport);
  const setViewport = useAppStore(s => s.setViewport);

  const handleZoom = (factor: number) => {
    const mid = (viewport.startYBP + viewport.endYBP) / 2;
    const span = viewport.endYBP - viewport.startYBP;
    const newSpan = span * factor;
    setViewport({
      ...viewport,
      startYBP: mid - newSpan / 2,
      endYBP: mid + newSpan / 2,
    });
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-surface border-t border-border">
      <span className="text-xs text-muted mr-1">Jump to:</span>
      <div className="flex gap-1 overflow-x-auto">
        {ERA_BUTTONS.map(btn => (
          <button
            key={btn.key}
            onClick={() => jumpToEra(btn.key)}
            className="px-2.5 py-1 text-xs rounded bg-surface-hover border border-border text-muted hover:text-foreground hover:border-accent/50 transition-colors whitespace-nowrap"
          >
            {btn.label}
          </button>
        ))}
      </div>
      <div className="flex gap-1 ml-auto">
        <button
          onClick={() => handleZoom(2)}
          className="w-8 h-8 flex items-center justify-center rounded bg-surface-hover border border-border text-muted hover:text-foreground text-lg"
          title="Zoom out"
        >
          -
        </button>
        <button
          onClick={() => handleZoom(0.5)}
          className="w-8 h-8 flex items-center justify-center rounded bg-surface-hover border border-border text-muted hover:text-foreground text-lg"
          title="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
