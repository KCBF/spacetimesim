'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3';
import { useAppStore } from '@/lib/store';
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

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 1_000_000])
      .on('zoom', (event) => {
        isZoomingRef.current = true;
        const transform = event.transform;
        const innerWidth = dimensions.width - MARGIN.left - MARGIN.right;

        // Convert D3 transform to viewport
        const fullSpan = 13_800_000_000 + 1000; // Big Bang to 1000yr future
        const newSpan = fullSpan / transform.k;
        const fullStart = -13_800_000_000;

        // Pan: transform.x maps pixel offset
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

    return () => {
      d3.select(svg).on('.zoom', null);
    };
  }, [dimensions.width]); // eslint-disable-line react-hooks/exhaustive-deps

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
          .attr('fill', 'rgba(255,255,255,0.2)')
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
        .attr('stroke', 'rgba(255,255,255,0.07)')
        .attr('stroke-width', 1);

      axisG.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.5)')
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
        .attr('stroke', 'rgba(255,255,255,0.03)')
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

    // Event nodes
    const eventG = g.append('g').attr('class', 'events');

    events.forEach(event => {
      const x = timeScale(event.yearYBP);
      const regionY = regionScale(event.regionId);
      if (x < -10 || x > innerWidth + 10 || regionY === undefined) return;

      const bandHeight = regionScale.bandwidth();
      const y = regionY + bandHeight / 2;
      const radius = 3 + event.significance * 2;
      const color = CATEGORY_COLORS[event.category];
      const isSelected = event.id === selectedEventId;
      const isFuture = event.isFuture;

      const node = eventG.append('circle')
        .attr('class', 'event-node')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', isSelected ? radius + 3 : radius)
        .attr('fill', color)
        .attr('fill-opacity', isFuture ? 0.4 : 0.8)
        .attr('stroke', isSelected ? '#fff' : isFuture ? color : 'none')
        .attr('stroke-width', isSelected ? 2 : isFuture ? 1 : 0)
        .attr('stroke-dasharray', isFuture ? '3,2' : 'none');

      node.on('click', () => {
        setSelectedEventId(event.id === selectedEventId ? null : event.id);
      });

      node.on('mouseenter', (e: MouseEvent) => {
        setHoveredEventId(event.id);
        setTooltipData({ x: e.clientX, y: e.clientY, event });
      });

      node.on('mouseleave', () => {
        setHoveredEventId(null);
        setTooltipData(null);
      });
    });

  }, [viewport, activeCategories, minSignificance, selectedEventId, dimensions]);

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
            <div className="text-gray-400 text-xs mt-1 line-clamp-2">{tooltipData.event.description}</div>
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
