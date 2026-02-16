'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';
import { populationData, STACKED_REGIONS } from '@/data/demographics/population';
import { REGIONS } from '@/data/regions';
import { formatYBP } from '@/lib/time/format';

// Display labels for region IDs
const REGION_LABELS: Record<string, string> = {
  'africa': 'Africa',
  'eurasia-west': 'Europe & West Asia',
  'eurasia-east': 'East Asia',
  'south-asia': 'South Asia',
  'americas': 'Americas',
};

// Look up region color from the REGIONS data, with fallback
function getRegionColor(regionId: string): string {
  const region = REGIONS.find(r => r.id === regionId);
  return region?.color ?? '#888888';
}

// Margins for the SVG chart
const MARGIN = { top: 24, right: 24, bottom: 48, left: 72 };

export function DemographicsView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 500 });

  // Zoom slider: 0 = full history, 1 = last 500 years only
  const [zoomLevel, setZoomLevel] = useState(0);

  // Observe container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Compute the time range from the zoom level
  const timeRange = useMemo(() => {
    // Full range of the data
    const allYears = populationData.map(d => d.yearYBP);
    const minYear = Math.min(...allYears); // most ancient (large negative)
    const maxYear = Math.max(...allYears); // closest to present

    // Zoom interpolates the start from full-history to recent-history
    // zoomLevel 0 => show everything
    // zoomLevel 1 => show only last ~250 years
    const recentStart = -250; // ~1776 CE
    const startYear = minYear + zoomLevel * (recentStart - minYear);
    return [startYear, maxYear] as [number, number];
  }, [zoomLevel]);

  // Prepare stacked data: for each unique yearYBP, gather all region populations
  const { stackedData, xScale, yScale, areaGenerator } = useMemo(() => {
    const w = dimensions.width - MARGIN.left - MARGIN.right;
    const h = dimensions.height - MARGIN.top - MARGIN.bottom;

    // Get unique sorted years that fall within the time range
    const yearsSet = new Set<number>();
    populationData.forEach(d => {
      if (d.region !== 'global' && d.yearYBP >= timeRange[0] && d.yearYBP <= timeRange[1]) {
        yearsSet.add(d.yearYBP);
      }
    });
    const years = Array.from(yearsSet).sort((a, b) => a - b);

    // Build a lookup map: region -> yearYBP -> population
    const lookup = new Map<string, Map<number, number>>();
    for (const regionId of STACKED_REGIONS) {
      const regionMap = new Map<number, number>();
      populationData
        .filter(d => d.region === regionId)
        .forEach(d => regionMap.set(d.yearYBP, d.population));
      lookup.set(regionId, regionMap);
    }

    // For each year, interpolate population for each region
    type RowData = { yearYBP: number } & Record<string, number>;
    const rows: RowData[] = years.map(year => {
      const row: RowData = { yearYBP: year };
      for (const regionId of STACKED_REGIONS) {
        const regionMap = lookup.get(regionId)!;
        // Find bounding data points for interpolation
        const regionYears = Array.from(regionMap.keys()).sort((a, b) => a - b);
        const idx = d3.bisectRight(regionYears, year);
        if (idx === 0) {
          row[regionId] = regionMap.get(regionYears[0]) ?? 0;
        } else if (idx >= regionYears.length) {
          row[regionId] = regionMap.get(regionYears[regionYears.length - 1]) ?? 0;
        } else {
          const y0 = regionYears[idx - 1];
          const y1 = regionYears[idx];
          const p0 = regionMap.get(y0) ?? 0;
          const p1 = regionMap.get(y1) ?? 0;
          const t = (year - y0) / (y1 - y0);
          row[regionId] = p0 + t * (p1 - p0);
        }
      }
      return row;
    });

    // D3 stack
    const stack = d3
      .stack<RowData>()
      .keys(STACKED_REGIONS as unknown as string[])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const stacked = stack(rows);

    // Scales
    const xScale = d3.scaleLinear().domain(timeRange).range([0, w]);

    const maxPop = d3.max(stacked, layer => d3.max(layer, d => d[1])) ?? 1000;
    const yScale = d3.scaleLinear().domain([0, maxPop * 1.05]).range([h, 0]);

    // Area generator
    const areaGen = d3
      .area<d3.SeriesPoint<RowData>>()
      .x(d => xScale(d.data.yearYBP))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    return { stackedData: stacked, xScale, yScale, areaGenerator: areaGen };
  }, [dimensions, timeRange]);

  // Generate axis ticks
  const xTicks = useMemo(() => {
    const ticks = xScale.ticks(8);
    return ticks.map(t => ({
      value: t,
      x: xScale(t),
      label: formatYBP(t, 'bce_ce'),
    }));
  }, [xScale]);

  const yTicks = useMemo(() => {
    const ticks = yScale.ticks(6);
    return ticks.map(t => ({
      value: t,
      y: yScale(t),
      label: t >= 1000 ? `${(t / 1000).toFixed(1)}B` : `${t.toFixed(0)}M`,
    }));
  }, [yScale]);

  // Tooltip state
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    yearYBP: number;
    values: { region: string; population: number }[];
  } | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const yearYBP = xScale.invert(mx);

      // For each region, interpolate population at this year
      const values: { region: string; population: number }[] = [];
      for (const regionId of STACKED_REGIONS) {
        const regionData = populationData
          .filter(d => d.region === regionId)
          .sort((a, b) => a.yearYBP - b.yearYBP);
        const idx = d3.bisectRight(
          regionData.map(d => d.yearYBP),
          yearYBP
        );
        let pop = 0;
        if (idx === 0) {
          pop = regionData[0]?.population ?? 0;
        } else if (idx >= regionData.length) {
          pop = regionData[regionData.length - 1]?.population ?? 0;
        } else {
          const d0 = regionData[idx - 1];
          const d1 = regionData[idx];
          const t = (yearYBP - d0.yearYBP) / (d1.yearYBP - d0.yearYBP);
          pop = d0.population + t * (d1.population - d0.population);
        }
        values.push({ region: regionId, population: pop });
      }

      setTooltip({
        x: mx + MARGIN.left,
        y: my + MARGIN.top,
        yearYBP,
        values,
      });
    },
    [xScale]
  );

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const innerW = dimensions.width - MARGIN.left - MARGIN.right;
  const innerH = dimensions.height - MARGIN.top - MARGIN.bottom;

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          World Population Over Time
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Full History</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={zoomLevel}
            onChange={e => setZoomLevel(parseFloat(e.target.value))}
            className="w-32 accent-indigo-500"
            title="Zoom into recent history"
          />
          <span className="text-xs text-muted">Recent</span>
        </div>
      </div>

      {/* Chart area */}
      <div ref={containerRef} className="flex-1 min-h-0 relative">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="block"
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Grid lines */}
            {yTicks.map(tick => (
              <line
                key={`grid-y-${tick.value}`}
                x1={0}
                x2={innerW}
                y1={tick.y}
                y2={tick.y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2,4"
              />
            ))}
            {xTicks.map(tick => (
              <line
                key={`grid-x-${tick.value}`}
                x1={tick.x}
                x2={tick.x}
                y1={0}
                y2={innerH}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2,4"
              />
            ))}

            {/* Stacked areas */}
            {stackedData.map(layer => {
              const regionId = layer.key;
              return (
                <path
                  key={regionId}
                  d={areaGenerator(layer) ?? ''}
                  fill={getRegionColor(regionId)}
                  fillOpacity={0.7}
                  stroke={getRegionColor(regionId)}
                  strokeWidth={0.5}
                  strokeOpacity={0.9}
                />
              );
            })}

            {/* X axis */}
            <line
              x1={0}
              x2={innerW}
              y1={innerH}
              y2={innerH}
              stroke="rgba(255,255,255,0.2)"
            />
            {xTicks.map(tick => (
              <g key={`x-${tick.value}`} transform={`translate(${tick.x},${innerH})`}>
                <line y2={6} stroke="rgba(255,255,255,0.3)" />
                <text
                  y={20}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={11}
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Y axis */}
            <line
              x1={0}
              x2={0}
              y1={0}
              y2={innerH}
              stroke="rgba(255,255,255,0.2)"
            />
            {yTicks.map(tick => (
              <g key={`y-${tick.value}`} transform={`translate(0,${tick.y})`}>
                <line x2={-6} stroke="rgba(255,255,255,0.3)" />
                <text
                  x={-10}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize={11}
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Y axis label */}
            <text
              transform={`translate(-52,${innerH / 2}) rotate(-90)`}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize={12}
            >
              Population (millions)
            </text>

            {/* Hover overlay */}
            <rect
              x={0}
              y={0}
              width={innerW}
              height={innerH}
              fill="transparent"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />

            {/* Tooltip crosshair */}
            {tooltip && (
              <line
                x1={tooltip.x - MARGIN.left}
                x2={tooltip.x - MARGIN.left}
                y1={0}
                y2={innerH}
                stroke="rgba(255,255,255,0.3)"
                strokeDasharray="4,4"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>

        {/* Tooltip popup */}
        {tooltip && (
          <div
            className="absolute pointer-events-none z-50 bg-surface/95 border border-border rounded-lg px-3 py-2 text-xs backdrop-blur-sm shadow-lg"
            style={{
              left: Math.min(tooltip.x + 16, dimensions.width - 180),
              top: Math.min(tooltip.y - 10, dimensions.height - 160),
            }}
          >
            <div className="font-semibold text-foreground mb-1">
              {formatYBP(tooltip.yearYBP, 'bce_ce')}
            </div>
            {tooltip.values.map(v => (
              <div key={v.region} className="flex items-center gap-2 py-0.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: getRegionColor(v.region) }}
                />
                <span className="text-muted">{REGION_LABELS[v.region] ?? v.region}</span>
                <span className="ml-auto text-foreground font-medium">
                  {v.population >= 1000
                    ? `${(v.population / 1000).toFixed(2)}B`
                    : `${v.population.toFixed(1)}M`}
                </span>
              </div>
            ))}
            <div className="border-t border-border mt-1 pt-1 flex justify-between">
              <span className="text-muted">Total</span>
              <span className="text-foreground font-medium">
                {(() => {
                  const total = tooltip.values.reduce((s, v) => s + v.population, 0);
                  return total >= 1000
                    ? `${(total / 1000).toFixed(2)}B`
                    : `${total.toFixed(1)}M`;
                })()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 px-4 py-2 border-t border-border">
        {STACKED_REGIONS.map(regionId => (
          <div key={regionId} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: getRegionColor(regionId) }}
            />
            <span className="text-xs text-muted">
              {REGION_LABELS[regionId] ?? regionId}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
