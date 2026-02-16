import { REGIONS } from '@/data/regions';
import type { Region, RegionEraName } from './types';
import type { Viewport } from '@/lib/time/scales';

export function getRegionDisplayName(regionId: string, yearYBP: number): string {
  const region = REGIONS.find(r => r.id === regionId);
  if (!region) return regionId;

  // Find the era name that covers this year
  for (const eraName of region.names) {
    if (yearYBP >= eraName.startYBP && yearYBP < eraName.endYBP) {
      return eraName.name;
    }
  }

  // Fallback: return the last era name or region id
  return region.names[region.names.length - 1]?.name ?? regionId;
}

export function getRegionEraName(region: Region, yearYBP: number): RegionEraName | undefined {
  return region.names.find(n => yearYBP >= n.startYBP && yearYBP < n.endYBP);
}

export function getRegionsForViewport(viewport: Viewport): Region[] {
  const midYBP = (viewport.startYBP + viewport.endYBP) / 2;

  return REGIONS.filter(region => {
    // Region is visible if any of its era names overlap with the viewport
    return region.names.some(eraName =>
      eraName.endYBP > viewport.startYBP && eraName.startYBP < viewport.endYBP
    );
  }).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getRegionById(regionId: string): Region | undefined {
  return REGIONS.find(r => r.id === regionId);
}
