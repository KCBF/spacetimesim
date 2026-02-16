'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { useAppStore } from '@/lib/store';
import { useDisplayStore } from '@/lib/display-store';
import { createTimeScale, viewportSpan } from '@/lib/time/scales';
import { getZoomConfig, ERAS, SIMULATION_BOUNDARY_YBP } from '@/lib/time/constants';
import { formatYBP } from '@/lib/time/format';
import { getVisibleEvents } from '@/lib/events/dataset';
import { CATEGORY_COLORS } from '@/lib/events/types';
import { getRegionsForViewport, getRegionDisplayName } from '@/lib/regions/regions';
import { Tooltip } from '@/components/shared/Tooltip';
import type { SpacetimeEvent } from '@/lib/events/types';

const MARGIN = { top: 40, right: 30, bottom: 20, left: 140 };

export function TimelineCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const isZoomingRef = useRef(false);

  const viewport = useAppStore(s => s.viewport);
  const setViewport = useAppStore(s => s.setViewport);
  const activeCategories = useAppStore(s => s.activeCategories);
  const minSignificance = useAppStore(s => s.minSignificance);
  const selectedEventId = useAppStore(s => s.selectedEventId);
  const setSelectedEventId = useAppStore(s => s.setSelectedEventId);
  const setHoveredEventId = useAppStore(s => s.setHoveredEventId);

  const theme = useAppStore(s => s.theme);
  const displaySettings = useDisplayStore(s => s.settings);

  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; event: SpacetimeEvent } | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
        setViewport({ ...viewport, width: width - MARGIN.left - MARGIN.right });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Setup D3 zoom
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const innerWidth = dimensions.width - MARGIN.left - MARGIN.right;
    const fullSpan = 13_800_000_000 + 1000;
    const fullStart = -13_800_000_000;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1_000_000])
      .on('zoom', (event) => {
        if (!event.sourceEvent) return; // Skip programmatic transforms
        isZoomingRef.current = true;
        const transform = event.transform;

        const newSpan = fullSpan / transform.k;
        const panOffset = -transform.x / (innerWidth * transform.k) * fullSpan;
        const newStart = fullStart + panOffset;

        setViewport({
          startYBP: newStart,
          endYBP: newStart + newSpan,
          width: innerWidth,
        });

        requestAnimationFrame(() => {
          isZoomingRef.current = false;
        });
      });

    zoomRef.current = zoom;
    d3.select(svg).call(zoom);

    // Sync D3 transform to current viewport immediately
    const vp = useAppStore.getState().viewport;
    const k = fullSpan / (vp.endYBP - vp.startYBP);
    const tx = -(vp.startYBP - fullStart) / fullSpan * innerWidth * k;
    d3.select(svg).call(zoom.transform, d3.zoomIdentity.translate(tx, 0).scale(k));

    return () => {
      d3.select(svg).on('.zoom', null);
    };
  }, [dimensions.width]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync D3 zoom transform when viewport changes externally (era jumps, minimap clicks)
  useEffect(() => {
    const svg = svgRef.current;
    const zoom = zoomRef.current;
    if (!svg || !zoom || isZoomingRef.current) return;

    const innerWidth = dimensions.width - MARGIN.left - MARGIN.right;
    const fullSpan = 13_800_000_000 + 1000;
    const fullStart = -13_800_000_000;

    const k = fullSpan / (viewport.endYBP - viewport.startYBP);
    const tx = -(viewport.startYBP - fullStart) / fullSpan * innerWidth * k;

    d3.select(svg).call(zoom.transform, d3.zoomIdentity.translate(tx, 0).scale(k));
  }, [viewport.startYBP, viewport.endYBP, dimensions.width]);

  // Render timeline
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = dimensions.width;
    const height = dimensions.height;
    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const span = viewportSpan(viewport);
    const zoomConfig = getZoomConfig(span);
    const timeScale = createTimeScale({ ...viewport, width: innerWidth });

    // Get visible data
    const events = getVisibleEvents(viewport, activeCategories, minSignificance > zoomConfig.minSignificance ? minSignificance : undefined);
    const regions = getRegionsForViewport(viewport);

    // Region Y scale
    const regionScale = d3.scaleBand()
      .domain(regions.map(r => r.id))
      .range([0, innerHeight])
      .padding(0.1);

    const root = d3.select(svg);

    // Read CSS custom properties for theme-aware rendering
    const styles = getComputedStyle(document.documentElement);
    const gridColor = styles.getPropertyValue('--svg-grid').trim() || 'rgba(0,0,0,0.06)';
    const textColor = styles.getPropertyValue('--svg-text').trim() || 'rgba(0,0,0,0.55)';
    const eraTextColor = styles.getPropertyValue('--svg-era-text').trim() || 'rgba(0,0,0,0.15)';
    const rowStroke = theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';

    // Clear and setup
    root.selectAll('g.main').remove();
    const g = root.append('g')
      .attr('class', 'main')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Era background bands
    const eraG = g.append('g').attr('class', 'eras');
    ERAS.forEach(era => {
      if (era.endYBP < viewport.startYBP || era.startYBP > viewport.endYBP) return;
      const x1 = Math.max(0, timeScale(era.startYBP));
      const x2 = Math.min(innerWidth, timeScale(era.endYBP));
      if (x2 - x1 < 1) return;

      eraG.append('rect')
        .attr('x', x1)
        .attr('y', 0)
        .attr('width', x2 - x1)
        .attr('height', innerHeight)
        .attr('fill', era.color);

      // Era label if wide enough
      if (x2 - x1 > 80) {
        eraG.append('text')
          .attr('x', (x1 + x2) / 2)
          .attr('y', 12)
          .attr('text-anchor', 'middle')
          .attr('fill', eraTextColor)
          .attr('font-size', '10px')
          .text(era.name);
      }
    });

    // Simulation boundary at 2026
    const simX = timeScale(SIMULATION_BOUNDARY_YBP);
    if (simX >= 0 && simX <= innerWidth) {
      g.append('line')
        .attr('x1', simX).attr('y1', 0)
        .attr('x2', simX).attr('y2', innerHeight)
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '6,4')
        .attr('opacity', 0.7);

      g.append('text')
        .attr('x', simX + 6)
        .attr('y', innerHeight - 8)
        .attr('fill', '#ec4899')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('CYBERNETICS SIMULATION BOUNDARY');
    }

    // Time axis
    const axisG = g.append('g').attr('class', 'time-axis');
    const tickCount = Math.max(4, Math.floor(innerWidth / 120));
    const ticks = timeScale.ticks(tickCount);

    ticks.forEach(tick => {
      const x = timeScale(tick);
      if (x < 0 || x > innerWidth) return;

      axisG.append('line')
        .attr('x1', x).attr('y1', -5)
        .attr('x2', x).attr('y2', innerHeight)
        .attr('stroke', gridColor)
        .attr('stroke-width', 1);

      axisG.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', textColor)
        .attr('font-size', '10px')
        .attr('font-family', 'var(--font-mono), monospace')
        .text(formatYBP(tick, zoomConfig.labelFormat));
    });

    // Region rows
    const regionG = g.append('g').attr('class', 'regions');
    const midYBP = (viewport.startYBP + viewport.endYBP) / 2;

    regions.forEach(region => {
      const y = regionScale(region.id);
      if (y === undefined) return;
      const bandHeight = regionScale.bandwidth();

      // Row background
      regionG.append('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', innerWidth)
        .attr('height', bandHeight)
        .attr('fill', 'transparent')
        .attr('stroke', rowStroke)
        .attr('stroke-width', 1);

      // Region label (in margin)
      const displayName = getRegionDisplayName(region.id, midYBP);
      root.append('text')
        .attr('class', 'main')
        .attr('x', MARGIN.left - 8)
        .attr('y', MARGIN.top + y + bandHeight / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', region.color)
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text(displayName);
    });

    // Event rendering - mode-aware with overlap prevention
    const eventG = g.append('g').attr('class', 'events');
    const mode = displaySettings.timelineMode;
    const cardW = displaySettings.cardMaxWidth;
    const fontSize = displaySettings.eventFontSize;

    // Sort events by x position for overlap prevention
    const positionedEvents = events
      .map(event => {
        const ex = timeScale(event.yearYBP);
        const regionY = regionScale(event.regionId);
        return { event, x: ex, regionY };
      })
      .filter(e => e.x >= -20 && e.x <= innerWidth + 20 && e.regionY !== undefined)
      .sort((a, b) => a.x - b.x);

    // Overlap prevention: track occupied x-ranges per region
    const occupiedByRegion: Record<string, number[]> = {};

    positionedEvents.forEach(({ event, x: ex, regionY }) => {
      const bandHeight = regionScale.bandwidth();
      const baseY = regionY! + 4;
      const color = CATEGORY_COLORS[event.category];
      const isSelected = event.id === selectedEventId;
      const isFuture = event.isFuture;

      // Find y offset to avoid overlap within the band
      const regionKey = event.regionId;
      if (!occupiedByRegion[regionKey]) occupiedByRegion[regionKey] = [];
      const occupied = occupiedByRegion[regionKey];

      let itemWidth = mode === 'dots' ? 16 : (mode === 'compact' ? 60 : cardW);
      let yOffset = 0;

      // Stack items that would overlap
      for (const ox of occupied) {
        if (Math.abs(ex - ox) < itemWidth * 0.6) {
          yOffset += mode === 'dots' ? 14 : (mode === 'compact' ? 14 : 22);
        }
      }
      occupied.push(ex);

      const y = baseY + yOffset;
      if (y > regionY! + bandHeight - 4) return; // skip if overflows band

      if (mode === 'dots') {
        // Simple dots
        const radius = 3 + event.significance * 1.5;
        const node = eventG.append('circle')
          .attr('class', 'event-node')
          .attr('cx', ex).attr('cy', y + 6)
          .attr('r', isSelected ? radius + 2 : radius)
          .attr('fill', color)
          .attr('fill-opacity', isFuture ? 0.4 : 0.85)
          .attr('stroke', isSelected ? (theme === 'dark' ? '#fff' : '#000') : 'none')
          .attr('stroke-width', isSelected ? 2 : 0);
        node.on('click', () => setSelectedEventId(event.id === selectedEventId ? null : event.id));
        node.on('mouseenter', (e: MouseEvent) => { setHoveredEventId(event.id); setTooltipData({ x: e.clientX, y: e.clientY, event }); });
        node.on('mouseleave', () => { setHoveredEventId(null); setTooltipData(null); });

      } else if (mode === 'text' || mode === 'compact') {
        // Text labels
        const label = eventG.append('g')
          .attr('class', 'event-node')
          .attr('transform', `translate(${ex}, ${y})`);

        label.append('circle').attr('cx', 0).attr('cy', 5).attr('r', 3)
          .attr('fill', color).attr('fill-opacity', isFuture ? 0.4 : 0.85);

        if (displaySettings.showEventText) {
          label.append('text')
            .attr('x', 6).attr('y', 8)
            .attr('fill', textColor)
            .attr('font-size', `${fontSize}px`)
            .text(event.name.length > 25 ? event.name.slice(0, 23) + '..' : event.name);
        }

        if (isSelected) {
          label.append('rect').attr('x', -2).attr('y', -1).attr('width', cardW).attr('height', 14)
            .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('rx', 2);
        }

        label.on('click', () => setSelectedEventId(event.id === selectedEventId ? null : event.id));
        label.on('mouseenter', (e: MouseEvent) => { setHoveredEventId(event.id); setTooltipData({ x: e.clientX, y: e.clientY, event }); });
        label.on('mouseleave', () => { setHoveredEventId(null); setTooltipData(null); });

      } else {
        // Cards mode (default)
        const card = eventG.append('g')
          .attr('class', 'event-node')
          .attr('transform', `translate(${ex}, ${y})`);

        const cw = Math.min(cardW, 180);
        const ch = 20;

        // Card background
        card.append('rect')
          .attr('x', -2).attr('y', -2)
          .attr('width', cw).attr('height', ch)
          .attr('rx', 3)
          .attr('fill', theme === 'dark' ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)')
          .attr('stroke', isSelected ? color : (theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'))
          .attr('stroke-width', isSelected ? 1.5 : 0.5);

        if (isFuture) {
          card.select('rect').attr('stroke-dasharray', '3,2');
        }

        // Color indicator
        card.append('rect')
          .attr('x', -2).attr('y', -2).attr('width', 3).attr('height', ch).attr('rx', 1)
          .attr('fill', color);

        // Event name
        if (displaySettings.showEventText) {
          card.append('text')
            .attr('x', 6).attr('y', 10)
            .attr('fill', theme === 'dark' ? '#e5e7eb' : '#111')
            .attr('font-size', `${Math.min(fontSize, 10)}px`)
            .attr('font-weight', '500')
            .text(event.name.length > 22 ? event.name.slice(0, 20) + '..' : event.name);
        }

        card.on('click', () => setSelectedEventId(event.id === selectedEventId ? null : event.id));
        card.on('mouseenter', (e: MouseEvent) => { setHoveredEventId(event.id); setTooltipData({ x: e.clientX, y: e.clientY, event }); });
        card.on('mouseleave', () => { setHoveredEventId(null); setTooltipData(null); });
      }
    });

  }, [viewport, activeCategories, minSignificance, selectedEventId, dimensions, theme, displaySettings]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        className="timeline-svg w-full h-full"
        width={dimensions.width}
        height={dimensions.height}
      />
      <Tooltip
        x={tooltipData?.x ?? 0}
        y={tooltipData?.y ?? 0}
        visible={!!tooltipData}
      >
        {tooltipData && (
          <div>
            <div className="font-semibold text-white">{tooltipData.event.name}</div>
            <div className="text-muted text-xs mt-0.5">{formatYBP(tooltipData.event.yearYBP)}</div>
            <div className="text-muted text-xs mt-1 line-clamp-2">{tooltipData.event.description}</div>
            {tooltipData.event.isFuture && (
              <div className="text-pink-400 text-xs mt-1">
                Simulation ({Math.round((tooltipData.event.simulationConfidence ?? 0) * 100)}% confidence)
              </div>
            )}
          </div>
        )}
      </Tooltip>
    </div>
  );
}
