'use client';

import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { allEvents } from '@/data/events';
import { CATEGORY_COLORS, CATEGORY_LABELS, EventCategory, type SpacetimeEvent } from '@/lib/events/types';
import { formatYBP } from '@/lib/time/format';
import { getRegionDisplayName } from '@/lib/regions/regions';
import { useAppStore } from '@/lib/store';

const fuse = new Fuse(allEvents, {
  keys: ['name', 'description', 'tags', 'regionId'],
  threshold: 0.3,
});

const sortedEvents = [...allEvents].sort((a, b) => a.yearYBP - b.yearYBP);

export function ChronicleView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [selectedEvent, setSelectedEvent] = useState<SpacetimeEvent | null>(null);
  const setSelectedEventId = useAppStore(s => s.setSelectedEventId);
  const jumpToEvent = useAppStore(s => s.jumpToEvent);
  const setActiveTab = useAppStore(s => s.setActiveTab);

  const filteredEvents = useMemo(() => {
    let events = searchQuery.trim()
      ? fuse.search(searchQuery).map(r => r.item)
      : sortedEvents;

    if (categoryFilter !== 'all') {
      events = events.filter(e => e.category === categoryFilter);
    }
    return events;
  }, [searchQuery, categoryFilter]);

  const handleViewOnTimeline = (event: SpacetimeEvent) => {
    setSelectedEventId(event.id);
    jumpToEvent(event.yearYBP);
    setActiveTab('timeline');
  };

  return (
    <div className="h-full flex bg-background">
      {/* Event list */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search and filters */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search all events..."
              className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent"
            />
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as EventCategory | 'all')}
              className="bg-gray-800 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All Categories</option>
              {Object.values(EventCategory).map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-muted">{filteredEvents.length} events</div>
        </div>

        {/* Event list */}
        <div className="flex-1 overflow-y-auto">
          {filteredEvents.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-surface-hover transition-colors ${
                selectedEvent?.id === event.id ? 'bg-surface-hover' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: CATEGORY_COLORS[event.category] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{event.name}</span>
                    {event.isFuture && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400 flex-shrink-0">SIM</span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {formatYBP(event.yearYBP)} &middot; {getRegionDisplayName(event.regionId, event.yearYBP)}
                  </div>
                </div>
                <div className="flex gap-0.5 flex-shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i < event.significance ? 'bg-accent' : 'bg-border'}`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedEvent && (
        <div className="w-96 border-l border-border bg-surface overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[selectedEvent.category] }}
              />
              <span className="text-xs font-medium" style={{ color: CATEGORY_COLORS[selectedEvent.category] }}>
                {CATEGORY_LABELS[selectedEvent.category]}
              </span>
              {selectedEvent.isFuture && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">Simulated</span>
              )}
            </div>

            <h2 className="text-xl font-bold text-foreground mb-1">{selectedEvent.name}</h2>
            <p className="text-sm text-muted mb-4">{formatYBP(selectedEvent.yearYBP)}</p>
            <p className="text-sm text-muted leading-relaxed mb-4">{selectedEvent.description}</p>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-muted">Region:</span>
              <span className="text-xs text-foreground">{getRegionDisplayName(selectedEvent.regionId, selectedEvent.yearYBP)}</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-muted">Significance:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`w-2 h-2 rounded-full ${i < selectedEvent.significance ? 'bg-accent' : 'bg-border'}`} />
                ))}
              </div>
            </div>

            {selectedEvent.isFuture && selectedEvent.simulationConfidence !== undefined && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted">Confidence:</span>
                <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full" style={{ width: `${selectedEvent.simulationConfidence * 100}%` }} />
                </div>
                <span className="text-xs text-muted">{Math.round(selectedEvent.simulationConfidence * 100)}%</span>
              </div>
            )}

            {selectedEvent.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedEvent.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 text-xs rounded bg-surface-hover text-muted border border-border">{tag}</span>
                ))}
              </div>
            )}

            <button
              onClick={() => handleViewOnTimeline(selectedEvent)}
              className="w-full mt-2 px-4 py-2 text-sm rounded-lg bg-accent text-white hover:bg-accent-dim transition-colors"
            >
              View on Timeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
