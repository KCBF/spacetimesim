'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as d3 from 'd3';

import { commodities as commoditiesImport, historicIncidents as incidentsImport } from '@/data/markets';
const commoditiesData = commoditiesImport || [];
const incidentsData = incidentsImport || [];

const CATEGORY_COLORS: Record<string, string> = {
  'precious-metal': '#eab308',
  energy: '#f97316',
  agriculture: '#22c55e',
  industrial: '#6366f1',
  crypto: '#8b5cf6',
  index: '#3b82f6',
};

const INCIDENT_COLORS: Record<string, string> = {
  financial: '#ef4444',
  geopolitical: '#f97316',
  natural: '#22c55e',
  technological: '#3b82f6',
  pandemic: '#8b5cf6',
  social: '#ec4899',
};

export function MarketsView() {
  const [selected, setSelected] = useState<string>(commoditiesData[0]?.id || '');
  const [showIncidents, setShowIncidents] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 800, height: 400 });

  const commodity = commoditiesData.find((c: any) => c.id === selected);

  const drawChart = useCallback(() => {
    if (!svgRef.current || !commodity) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 30, bottom: 40, left: 70 };
    const w = dims.width - margin.left - margin.right;
    const h = dims.height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const history = commodity.history || [];
    const xExtent = d3.extent(history, (d: any) => d.year) as [number, number];
    const yExtent = d3.extent(history, (d: any) => d.price) as [number, number];

    const x = d3.scaleLinear().domain(xExtent).range([0, w]);
    const y = d3.scaleLinear().domain([0, yExtent[1] * 1.15]).range([h, 0]);

    // Grid
    const styles = getComputedStyle(document.documentElement);
    const gridColor = styles.getPropertyValue('--svg-grid').trim() || 'rgba(0,0,0,0.06)';
    const textColor = styles.getPropertyValue('--svg-text').trim() || 'rgba(0,0,0,0.55)';

    g.append('g').selectAll('line').data(y.ticks(5)).join('line')
      .attr('x1', 0).attr('x2', w).attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', gridColor);

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`).call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', textColor);
    g.append('g').call(d3.axisLeft(y).ticks(6).tickFormat(d => `${commodity.unit === 'USD' ? '$' : ''}${d3.format(',.0f')(d as number)}`))
      .selectAll('text').attr('fill', textColor);
    g.selectAll('.domain, .tick line').attr('stroke', gridColor);

    // Area
    const color = CATEGORY_COLORS[commodity.category] || '#6366f1';
    const area = d3.area<any>().x(d => x(d.year)).y0(h).y1(d => y(d.price)).curve(d3.curveMonotoneX);
    g.append('path').datum(history).attr('d', area).attr('fill', color).attr('fill-opacity', 0.1);

    // Line
    const line = d3.line<any>().x(d => x(d.year)).y(d => y(d.price)).curve(d3.curveMonotoneX);
    g.append('path').datum(history).attr('d', line).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2);

    // Incident markers
    if (showIncidents) {
      const relevant = incidentsData.filter((inc: any) =>
        inc.year >= xExtent[0] && inc.year <= xExtent[1]
      );
      relevant.forEach((inc: any) => {
        const ix = x(inc.year);
        g.append('line').attr('x1', ix).attr('x2', ix).attr('y1', 0).attr('y2', h)
          .attr('stroke', INCIDENT_COLORS[inc.category] || '#888').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.5);
        g.append('text').attr('x', ix + 3).attr('y', 12).attr('fill', INCIDENT_COLORS[inc.category] || '#888')
          .attr('font-size', '8px').attr('transform', `rotate(-45, ${ix + 3}, 12)`).text(inc.name);
      });
    }

    // Title
    svg.append('text').attr('x', dims.width / 2).attr('y', 18).attr('text-anchor', 'middle')
      .attr('fill', textColor).attr('font-size', '14px').attr('font-weight', 'bold')
      .text(`${commodity.name} Price History (${commodity.unit})`);
  }, [commodity, dims, showIncidents]);

  useEffect(() => { drawChart(); }, [drawChart]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ width, height: Math.max(300, height - 220) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  if (commoditiesData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted">Loading market data...</div>;
  }

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-background">
      {/* Commodity selector */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto">
        {commoditiesData.map((c: any) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              selected === c.id ? 'bg-accent text-white' : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] }} />
            {c.name}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-muted whitespace-nowrap">
          <input type="checkbox" checked={showIncidents} onChange={e => setShowIncidents(e.target.checked)} className="accent-accent" />
          Show incidents
        </label>
      </div>

      {/* Current price */}
      {commodity && (
        <div className="px-4 py-2 flex items-center gap-6 border-b border-border">
          <div>
            <span className="text-2xl font-bold text-foreground">${commodity.currentPrice.toLocaleString()}</span>
            <span className="text-xs text-muted ml-2">/{commodity.unit}</span>
          </div>
          <p className="text-xs text-muted flex-1">{commodity.description}</p>
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 p-2">
        <svg ref={svgRef} width={dims.width} height={dims.height} />
      </div>

      {/* Incidents table */}
      <div className="h-48 overflow-y-auto border-t border-border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface">
            <tr className="border-b border-border">
              <th className="px-3 py-1.5 text-left text-muted">Year</th>
              <th className="px-3 py-1.5 text-left text-muted">Event</th>
              <th className="px-3 py-1.5 text-left text-muted">Category</th>
              <th className="px-3 py-1.5 text-left text-muted">Impact</th>
              <th className="px-3 py-1.5 text-left text-muted">Price Effect</th>
            </tr>
          </thead>
          <tbody>
            {incidentsData.map((inc: any) => (
              <tr key={inc.id} className="border-b border-border/50 hover:bg-surface-hover">
                <td className="px-3 py-1.5 text-foreground font-mono">{inc.year}</td>
                <td className="px-3 py-1.5 text-foreground font-medium">{inc.name}</td>
                <td className="px-3 py-1.5">
                  <span className="px-1.5 py-0.5 rounded text-white text-[10px]" style={{ backgroundColor: INCIDENT_COLORS[inc.category] }}>
                    {inc.category}
                  </span>
                </td>
                <td className="px-3 py-1.5 text-muted">{inc.impact}</td>
                <td className="px-3 py-1.5 text-muted">{inc.priceImpact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
