'use client';

import { useAppStore } from '@/lib/store';
import { getEventById, getRelatedEvents } from '@/lib/events/dataset';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/events/types';
import { formatYBP, ybpToCE } from '@/lib/time/format';

export function EventDetail() {
  const selectedEventId = useAppStore(s => s.selectedEventId);
  const setSelectedEventId = useAppStore(s => s.setSelectedEventId);
  const jumpToEvent = useAppStore(s => s.jumpToEvent);

  if (!selectedEventId) return null;

  const event = getEventById(selectedEventId);
  if (!event) return null;

  const related = getRelatedEvents(event, 5);
  const color = CATEGORY_COLORS[event.category];

  return (
    <div className="h-full bg-surface/95 backdrop-blur-sm border-l border-border overflow-y-auto">
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={() => setSelectedEventId(null)}
          className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded text-muted hover:text-foreground hover:bg-surface-hover"
        >
          x
        </button>

        {/* Category badge */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium" style={{ color }}>
            {CATEGORY_LABELS[event.category]}
          </span>
          {event.isFuture && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">
              Simulated
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-1">{event.name}</h3>

        {/* Date */}
        <p className="text-sm text-muted mb-3">
          {formatYBP(event.yearYBP)}
          {event.yearEndYBP !== undefined && ` — ${formatYBP(event.yearEndYBP)}`}
        </p>

        {/* Description */}
        <p className="text-sm text-muted mb-4 leading-relaxed">{event.description}</p>

        {/* Significance */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-muted">Significance:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < event.significance ? 'bg-accent' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Simulation confidence for future events */}
        {event.isFuture && event.simulationConfidence !== undefined && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-muted">Confidence:</span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full"
                style={{ width: `${event.simulationConfidence * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted">{Math.round(event.simulationConfidence * 100)}%</span>
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 text-xs rounded bg-surface-hover text-muted border border-border">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Related events */}
        {related.length > 0 && (
          <div className="border-t border-border pt-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Related Events</h4>
            <div className="flex flex-col gap-1">
              {related.map(rel => (
                <button
                  key={rel.id}
                  onClick={() => {
                    setSelectedEventId(rel.id);
                    jumpToEvent(rel.yearYBP);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-surface-hover text-sm transition-colors"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[rel.category] }}
                  />
                  <span className="text-foreground truncate">{rel.name}</span>
                  <span className="text-muted text-xs ml-auto whitespace-nowrap">{formatYBP(rel.yearYBP)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
