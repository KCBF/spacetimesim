'use client';

import { useAppStore } from '@/lib/store';
import { getZoomConfig } from '@/lib/time/constants';
import { viewportSpan } from '@/lib/time/scales';
import { formatYBP } from '@/lib/time/format';
import { SearchBar } from '@/components/shared/SearchBar';

export function Header() {
  const viewport = useAppStore(s => s.viewport);
  const span = viewportSpan(viewport);
  const zoomConfig = getZoomConfig(span);
  const midYBP = (viewport.startYBP + viewport.endYBP) / 2;

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          Spacetime Simulator
        </h1>
        <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-mono">
          v0.1
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="hidden md:inline">Era: <span className="text-foreground font-medium">{zoomConfig.label}</span></span>
        <span className="hidden md:inline">Center: <span className="text-foreground font-medium">{formatYBP(midYBP)}</span></span>
        <SearchBar />
      </div>
    </header>
  );
}
