'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { gdpData, GDP_REGIONS } from '@/data/economy/gdp';
import { REGIONS } from '@/data/regions';
import { formatYBP } from '@/lib/time/format';

export function EconomyView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 900, height: 500 });

  const regionColors = Object.fromEntries(REGIONS.map(r => [r.id, r.color]));

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    if (!svgRef.current) return;

    const margin = { top: 40, right: 160, bottom: 50, left: 80 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Get unique years, sorted
    const years = [...new Set(gdpData.map(d => d.yearYBP))].sort((a, b) => a - b);

    // Build stacked data
    const stackData = years.map(year => {
      const row: Record<string, number> = { yearYBP: year };
      GDP_REGIONS.forEach(r => {
        const point = gdpData.find(d => d.yearYBP === year && d.region === r);
        row[r] = point?.gdp ?? 0;
      });
      return row;
    });

    const stack = d3.stack<Record<string, number>>()
      .keys(GDP_REGIONS)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(stackData);

    const xScale = d3.scaleLinear()
      .domain(d3.extent(years) as [number, number])
      .range([0, w]);

    const yMax = d3.max(series, s => d3.max(s, d => d[1])) ?? 1;
    const yScale = d3.scaleLinear().domain([0, yMax * 1.1]).range([h, 0]);

    // Area generator
    const area = d3.area<d3.SeriesPoint<Record<string, number>>>()
      .x(d => xScale(d.data.yearYBP))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw areas
    series.forEach(s => {
      g.append('path')
        .datum(s)
        .attr('d', area)
        .attr('fill', regionColors[s.key] ?? '#666')
        .attr('fill-opacity', 0.7)
        .attr('stroke', regionColors[s.key] ?? '#666')
        .attr('stroke-width', 1);
    });

    // X axis
    const xAxis = d3.axisBottom(xScale)
      .ticks(8)
      .tickFormat(d => formatYBP(d as number, 'bce_ce'));
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(xAxis)
      .selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px');
    g.selectAll('.domain, .tick line').attr('stroke', '#374151');

    // Y axis
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => `$${d}B`);
    g.append('g')
      .call(yAxis)
      .selectAll('text').attr('fill', '#9ca3af').attr('font-size', '10px');

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(yScale.ticks(6))
      .join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', 'rgba(255,255,255,0.05)');

    // Title
    svg.append('text')
      .attr('x', dims.width / 2)
      .attr('y', 24)
      .attr('text-anchor', 'middle')
      .attr('fill', '#e5e7eb')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Regional GDP Over Time (Billions, 1990 Int\'l $)');

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${dims.width - margin.right + 20}, ${margin.top})`);

    GDP_REGIONS.forEach((r, i) => {
      const regionData = REGIONS.find(reg => reg.id === r);
      const name = regionData?.names[regionData.names.length - 1]?.name ?? r;

      legend.append('rect')
        .attr('x', 0).attr('y', i * 22)
        .attr('width', 12).attr('height', 12)
        .attr('rx', 2)
        .attr('fill', regionColors[r] ?? '#666');

      legend.append('text')
        .attr('x', 18).attr('y', i * 22 + 10)
        .attr('fill', '#9ca3af')
        .attr('font-size', '11px')
        .text(name);
    });
  }, [dims]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-background p-4">
      <svg ref={svgRef} width={dims.width} height={dims.height} />
    </div>
  );
}
