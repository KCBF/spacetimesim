'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { useAppStore } from '@/lib/store';
import { allEvents } from '@/data/events';
import { REGIONS } from '@/data/regions';
import { CATEGORY_COLORS } from '@/lib/events/types';
import { formatYBP } from '@/lib/time/format';
import { getRegionDisplayName } from '@/lib/regions/regions';
import { SIMULATION_BOUNDARY_YBP } from '@/lib/time/constants';

const REGION_CENTERS: Record<string, [number, number]> = {
  'global': [0, 20],
  'africa': [20, 5],
  'eurasia-west': [15, 48],
  'eurasia-east': [105, 35],
  'south-asia': [78, 22],
  'eurasia-central': [65, 45],
  'americas': [-80, 15],
  'oceania': [140, -25],
  'universe': [0, 0],
  'solar-system': [0, 0],
};

const REGION_COLORS: Record<string, string> = {};
for (const region of REGIONS) {
  REGION_COLORS[region.id] = region.color;
}

const MIN_YBP = -13_800_000_000;
const MAX_YBP = 100;

// Use a logarithmic-like mapping for the slider so that recent history
// gets more resolution than deep cosmic time.
function sliderToYBP(value: number): number {
  // value is 0..1000
  const t = value / 1000;
  if (t <= 0) return MIN_YBP;
  if (t >= 1) return MAX_YBP;

  // Use a power curve: more resolution at the right (recent) end
  const power = 4;
  const mapped = Math.pow(t, power);
  return MIN_YBP + (MAX_YBP - MIN_YBP) * mapped;
}

function ybpToSlider(ybp: number): number {
  const t = (ybp - MIN_YBP) / (MAX_YBP - MIN_YBP);
  const clamped = Math.max(0, Math.min(1, t));
  const power = 4;
  return Math.pow(clamped, 1 / power) * 1000;
}

// Compute the time window around a given YBP for filtering events
function getTimeWindow(ybp: number): [number, number] {
  const absYbp = Math.abs(ybp);
  let halfWindow: number;
  if (absYbp >= 1_000_000_000) halfWindow = 500_000_000;
  else if (absYbp >= 100_000_000) halfWindow = 50_000_000;
  else if (absYbp >= 1_000_000) halfWindow = 500_000;
  else if (absYbp >= 100_000) halfWindow = 50_000;
  else if (absYbp >= 10_000) halfWindow = 2_000;
  else if (absYbp >= 1_000) halfWindow = 200;
  else if (absYbp >= 100) halfWindow = 50;
  else halfWindow = 20;
  return [ybp - halfWindow, ybp + halfWindow];
}

interface GeoFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSON.Feature<GeoJSON.Geometry>[];
}

export function WorldMapView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [worldData, setWorldData] = useState<GeoFeatureCollection | null>(null);
  const [currentYBP, setCurrentYBP] = useState(-2_000);
  const [dimensions, setDimensions] = useState({ width: 960, height: 500 });
  const { selectedEventId, setSelectedEventId, activeCategories, minSignificance, theme } = useAppStore();

  // Load world atlas data
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((res) => res.json())
      .then((topology: Topology) => {
        const countries = feature(
          topology as any,
          (topology as any).objects.countries
        ) as unknown as GeoFeatureCollection;
        setWorldData(countries);
      })
      .catch((err) => console.error('Failed to load world atlas:', err));
  }, []);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height: height - 80 }); // reserve space for slider
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Filter events visible at the current time
  const visibleEvents = useMemo(() => {
    const [windowStart, windowEnd] = getTimeWindow(currentYBP);
    return allEvents.filter((event) => {
      if (!activeCategories.has(event.category)) return false;
      if (event.significance < minSignificance) return false;
      const eventEnd = event.yearEndYBP ?? event.yearYBP;
      // Event overlaps with the time window
      return event.yearYBP <= windowEnd && eventEnd >= windowStart;
    });
  }, [currentYBP, activeCategories, minSignificance]);

  // Regions that are active at this time
  const activeRegions = useMemo(() => {
    return REGIONS.filter((region) => {
      return region.names.some(
        (era) => currentYBP >= era.startYBP && currentYBP < era.endYBP
      );
    }).filter((r) => REGION_CENTERS[r.id]);
  }, [currentYBP]);

  // Is this in the simulation (future) zone?
  const isSimulated = currentYBP > SIMULATION_BOUNDARY_YBP;

  // Projection
  const projection = useMemo(() => {
    return d3
      .geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], {
        type: 'Sphere',
      } as any)
      .translate([dimensions.width / 2, dimensions.height / 2]);
  }, [dimensions]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  // Draw the map
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svgRef.current || !worldData) return;

    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Background
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', theme === 'dark' ? '#0a0a0f' : '#f8fafc');

    // Graticule
    const graticule = d3.geoGraticule();
    svg
      .append('path')
      .datum(graticule())
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', theme === 'dark' ? '#1a1a2e' : '#cbd5e1')
      .attr('stroke-width', 0.5);

    // Sphere outline
    svg
      .append('path')
      .datum({ type: 'Sphere' } as any)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', theme === 'dark' ? '#2a2a3e' : '#94a3b8')
      .attr('stroke-width', 1);

    // Countries
    const countriesGroup = svg.append('g').attr('class', 'countries');
    countriesGroup
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', pathGenerator as any)
      .attr('fill', theme === 'dark' ? '#1a1a2e' : '#e2e8f0')
      .attr('stroke', theme === 'dark' ? '#2a2a3e' : '#94a3b8')
      .attr('stroke-width', 0.5);

    // Region highlight overlays
    const regionGroup = svg.append('g').attr('class', 'regions');
    for (const region of activeRegions) {
      const center = REGION_CENTERS[region.id];
      if (!center || region.id === 'universe' || region.id === 'solar-system') continue;

      const projected = projection(center);
      if (!projected) continue;

      const displayName = getRegionDisplayName(region.id, currentYBP);

      // Region glow circle
      regionGroup
        .append('circle')
        .attr('cx', projected[0])
        .attr('cy', projected[1])
        .attr('r', 40)
        .attr('fill', region.color)
        .attr('opacity', 0.12)
        .attr('filter', 'url(#glow)');

      // Region label
      regionGroup
        .append('text')
        .attr('x', projected[0])
        .attr('y', projected[1] - 48)
        .attr('text-anchor', 'middle')
        .attr('fill', region.color)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .attr('opacity', 0.85)
        .text(displayName);
    }

    // Event dots
    const eventsGroup = svg.append('g').attr('class', 'events');
    for (const event of visibleEvents) {
      const center = REGION_CENTERS[event.regionId];
      if (!center) continue;

      const projected = projection(center);
      if (!projected) continue;

      // Add jitter so overlapping events spread out
      const jitterAngle = hashString(event.id) * Math.PI * 2;
      const jitterRadius = (hashString(event.id + 'r') % 30) + 5;
      const x = projected[0] + Math.cos(jitterAngle) * jitterRadius;
      const y = projected[1] + Math.sin(jitterAngle) * jitterRadius;

      const color = CATEGORY_COLORS[event.category];
      const radius = 2 + event.significance * 1.2;
      const isSelected = event.id === selectedEventId;

      const dot = eventsGroup
        .append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', isSelected ? radius + 3 : radius)
        .attr('fill', color)
        .attr('opacity', event.isFuture ? 0.5 : 0.8)
        .attr('stroke', isSelected ? (theme === 'dark' ? '#ffffff' : '#000000') : 'none')
        .attr('stroke-width', isSelected ? 2 : 0)
        .attr('cursor', 'pointer')
        .attr('class', 'event-dot');

      // Tooltip on hover
      dot
        .append('title')
        .text(`${event.name}\n${formatYBP(event.yearYBP)}\n${getRegionDisplayName(event.regionId, event.yearYBP)}`);

      dot.on('click', () => {
        setSelectedEventId(event.id);
      });
    }

    // Simulation boundary visual
    if (isSimulated) {
      svg
        .append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '8,4')
        .attr('opacity', 0.6);

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 28)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ec4899')
        .attr('font-size', '13px')
        .attr('font-weight', '700')
        .attr('letter-spacing', '2px')
        .text('SIMULATION ZONE — SPECULATIVE DATA');
    }

    // SVG filter for glow effect
    const defs = svg.append('defs');
    const filter = defs
      .append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter
      .append('feGaussianBlur')
      .attr('stdDeviation', '8')
      .attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }, [
    worldData,
    dimensions,
    projection,
    pathGenerator,
    visibleEvents,
    activeRegions,
    currentYBP,
    selectedEventId,
    setSelectedEventId,
    isSimulated,
  ]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sliderVal = parseFloat(e.target.value);
      setCurrentYBP(sliderToYBP(sliderVal));
    },
    []
  );

  const sliderValue = ybpToSlider(currentYBP);

  // Determine the visual era label
  const eraLabel = useMemo(() => {
    const abs = Math.abs(currentYBP);
    if (abs >= 4_540_000_000) return 'Cosmic Era';
    if (abs >= 538_000_000) return 'Geological Era';
    if (abs >= 66_000_000) return 'Mesozoic / Cenozoic';
    if (abs >= 12_000) return 'Prehistoric';
    if (abs >= 1_500) return 'Ancient Civilizations';
    if (abs >= 500) return 'Medieval Period';
    if (abs >= 226) return 'Early Modern';
    if (currentYBP <= 0) return 'Modern Era';
    return 'Simulated Future';
  }, [currentYBP]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col w-full h-full bg-background overflow-hidden"
    >
      {/* Map SVG */}
      <div className="flex-1 relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        />

        {/* Loading state */}
        {!worldData && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-muted text-sm">Loading world map...</div>
          </div>
        )}

        {/* Event count badge */}
        <div className="absolute top-3 left-3 px-3 py-1.5 rounded bg-surface/80 backdrop-blur-sm border border-border text-xs text-foreground">
          {visibleEvents.length} event{visibleEvents.length !== 1 ? 's' : ''} visible
        </div>

        {/* Era label */}
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded bg-surface/80 backdrop-blur-sm border border-border text-xs text-muted">
          {eraLabel}
        </div>
      </div>

      {/* Time slider panel */}
      <div className="flex-shrink-0 px-4 py-3 bg-surface/80 border-t border-border">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted font-mono">13.8 Bya</span>
          <span
            className={`text-sm font-semibold font-mono ${
              isSimulated ? 'text-pink-400' : 'text-foreground'
            }`}
          >
            {formatYBP(currentYBP)}
            {isSimulated && (
              <span className="ml-2 text-xs text-pink-500 font-normal">
                [SIMULATED]
              </span>
            )}
          </span>
          <span className="text-xs text-muted font-mono">Future</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={0}
            max={1000}
            step={1}
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right,
                #581c87 0%,
                #9f1239 20%,
                #065f46 40%,
                #1e3a5f 60%,
                #4338ca 80%,
                ${currentYBP > SIMULATION_BOUNDARY_YBP ? '#ec4899' : '#6366f1'} 100%
              )`,
            }}
          />
          {/* Simulation boundary marker */}
          <div
            className="absolute top-0 h-2 w-0.5 bg-pink-500 pointer-events-none"
            style={{
              left: `${(ybpToSlider(SIMULATION_BOUNDARY_YBP) / 1000) * 100}%`,
            }}
          />
        </div>

        {/* Region legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
          {activeRegions
            .filter(
              (r) => r.id !== 'universe' && r.id !== 'solar-system'
            )
            .map((region) => (
              <div key={region.id} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: region.color }}
                />
                <span className="text-xs text-muted">
                  {getRegionDisplayName(region.id, currentYBP)}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// Simple deterministic hash to get a stable number from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0..1
}
