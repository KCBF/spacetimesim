'use client';

import { useAppStore } from '@/lib/store';
import { getZoomConfig } from '@/lib/time/constants';
import { viewportSpan } from '@/lib/time/scales';
import { formatYBP } from '@/lib/time/format';
import { SearchBar } from '@/components/shared/SearchBar';

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

export function Header() {
  const viewport = useAppStore(s => s.viewport);
  const theme = useAppStore(s => s.theme);
  const toggleTheme = useAppStore(s => s.toggleTheme);
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
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="hidden md:inline">Era: <span className="text-foreground font-medium">{zoomConfig.label}</span></span>
        <span className="hidden md:inline">Center: <span className="text-foreground font-medium">{formatYBP(midYBP)}</span></span>
        <SearchBar />
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
