'use client';

import { useState } from 'react';
import { TimelineCanvas } from './TimelineCanvas';
import { TimelineControls } from './TimelineControls';
import { Minimap } from './Minimap';
import { EventDetail } from './EventDetail';
import { FilterPanel } from '@/components/shared/FilterPanel';
import { useAppStore } from '@/lib/store';

export function TimelineView() {
  const selectedEventId = useAppStore(s => s.selectedEventId);
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="h-full flex flex-col relative">
      {/* Main timeline area */}
      <div className="flex-1 relative overflow-hidden">
        <TimelineCanvas />

        {/* Controls overlay - top right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 text-xs rounded-md bg-surface/90 border border-border text-muted hover:text-foreground backdrop-blur-sm"
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
          {showFilters && <FilterPanel />}
        </div>

        {/* Event detail panel */}
        {selectedEventId && (
          <div className="absolute top-0 right-0 h-full w-80 z-20">
            <EventDetail />
          </div>
        )}
      </div>

      {/* Controls bar */}
      <TimelineControls />

      {/* Minimap */}
      <Minimap />
    </div>
  );
}
