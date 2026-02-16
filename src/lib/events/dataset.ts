import { allEvents } from '@/data/events';
import type { SpacetimeEvent } from './types';
import { EventCategory } from './types';
import type { Viewport } from '@/lib/time/scales';
import { viewportSpan } from '@/lib/time/scales';
import { getZoomConfig, type ZoomConfig } from '@/lib/time/constants';

export function getVisibleEvents(
  viewport: Viewport,
  activeCategories: Set<EventCategory>,
  minSignificanceOverride?: number,
): SpacetimeEvent[] {
  const span = viewportSpan(viewport);
  const zoomConfig = getZoomConfig(span);
  const minSig = minSignificanceOverride ?? zoomConfig.minSignificance;

  return allEvents.filter(event => {
    // Filter by viewport range
    if (event.yearYBP < viewport.startYBP || event.yearYBP > viewport.endYBP) {
      return false;
    }
    // Filter by category
    if (!activeCategories.has(event.category)) {
      return false;
    }
    // Filter by significance at current zoom level
    if (event.significance < minSig) {
      return false;
    }
    return true;
  });
}

export function getEventById(id: string): SpacetimeEvent | undefined {
  return allEvents.find(e => e.id === id);
}

export function getRelatedEvents(event: SpacetimeEvent, maxCount = 5): SpacetimeEvent[] {
  return allEvents
    .filter(e => e.id !== event.id)
    .map(e => ({
      event: e,
      score: computeRelatedness(event, e),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxCount)
    .map(x => x.event);
}

function computeRelatedness(a: SpacetimeEvent, b: SpacetimeEvent): number {
  let score = 0;
  // Same category
  if (a.category === b.category) score += 3;
  // Same region
  if (a.regionId === b.regionId) score += 2;
  // Temporal proximity (closer = higher score)
  const timeDist = Math.abs(a.yearYBP - b.yearYBP);
  if (timeDist < 100) score += 3;
  else if (timeDist < 1000) score += 2;
  else if (timeDist < 10000) score += 1;
  // Shared tags
  const sharedTags = a.tags.filter(t => b.tags.includes(t)).length;
  score += sharedTags * 2;
  return score;
}
