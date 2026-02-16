'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { technologies, TECH_CATEGORY_COLORS, type Technology } from '@/data/techtree/technologies';
import { formatYBP } from '@/lib/time/format';
import { useAppStore } from '@/lib/store';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  tech: Technology;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

function getNodeRadius(tech: Technology): number {
  // More prerequisites pointing TO this node = more important
  const dependents = technologies.filter((t) => t.prerequisites.includes(tech.id)).length;
  return Math.max(6, Math.min(18, 6 + dependents * 1.5));
}

export function TechTreeView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useAppStore(s => s.theme);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);

  // Collect entire prerequisite chain recursively
  const getPrerequisiteChain = useCallback((techId: string): Set<string> => {
    const chain = new Set<string>();
    const techMap = new Map(technologies.map((t) => [t.id, t]));
    const visit = (id: string) => {
      if (chain.has(id)) return;
      chain.add(id);
      const tech = techMap.get(id);
      if (tech) {
        tech.prerequisites.forEach(visit);
      }
    };
    visit(techId);
    return chain;
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Build nodes and links
    const techMap = new Map(technologies.map((t) => [t.id, t]));

    const nodes: Node[] = technologies.map((tech) => ({
      id: tech.id,
      tech,
      radius: getNodeRadius(tech),
    }));

    const links: Link[] = [];
    for (const tech of technologies) {
      for (const prereqId of tech.prerequisites) {
        if (techMap.has(prereqId)) {
          links.push({ source: prereqId, target: tech.id });
        }
      }
    }

    // Sort technologies by yearYBP for x-positioning (most negative = oldest = left)
    const yearExtent = d3.extent(technologies, (t) => t.yearYBP) as [number, number];
    const xScale = d3.scaleLinear().domain(yearExtent).range([80, width - 80]);

    // Category y-offsets to spread nodes vertically
    const categories = ['material', 'energy', 'information', 'transport', 'biology', 'social'];
    const yBand = d3
      .scaleBand<string>()
      .domain(categories)
      .range([80, height - 80])
      .padding(0.2);

    // Initialize node positions based on year and category
    for (const node of nodes) {
      node.x = xScale(node.tech.yearYBP);
      const bandY = yBand(node.tech.category) ?? height / 2;
      const bandHeight = yBand.bandwidth();
      node.y = bandY + bandHeight / 2 + (Math.random() - 0.5) * bandHeight * 0.6;
    }

    // Zoom group
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Arrow marker
    g.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', theme === 'dark' ? '#555' : '#94a3b8');

    // Dimmed arrow for unhighlighted edges
    g.select('defs')
      .append('marker')
      .attr('id', 'arrowhead-dim')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', theme === 'dark' ? '#333' : '#64748b');

    // Highlighted arrow
    g.select('defs')
      .append('marker')
      .attr('id', 'arrowhead-hl')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 15)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#facc15');

    // Draw links
    const linkSelection = g
      .append('g')
      .selectAll<SVGLineElement, Link>('line')
      .data(links)
      .join('line')
      .attr('stroke', theme === 'dark' ? '#555' : '#94a3b8')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1)
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const nodeSelection = g
      .append('g')
      .selectAll<SVGCircleElement, Node>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => TECH_CATEGORY_COLORS[d.tech.category] ?? '#888')
      .attr('stroke', theme === 'dark' ? '#222' : '#cbd5e1')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer');

    // Labels
    const labelSelection = g
      .append('g')
      .selectAll<SVGTextElement, Node>('text')
      .data(nodes)
      .join('text')
      .text((d) => d.tech.name)
      .attr('font-size', 9)
      .attr('fill', theme === 'dark' ? '#ccc' : '#334155')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.radius + 12)
      .attr('pointer-events', 'none');

    // Tooltip
    const tooltip = d3
      .select(container)
      .append('div')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgb(31 41 55)')
      .style('border', '1px solid #555')
      .style('border-radius', '8px')
      .style('padding', '10px 14px')
      .style('font-size', '13px')
      .style('color', '#e5e7eb')
      .style('max-width', '280px')
      .style('opacity', 0)
      .style('z-index', '50')
      .style('box-shadow', '0 4px 12px rgba(0,0,0,0.5)');

    nodeSelection
      .on('mouseover', (event, d) => {
        tooltip
          .html(
            `<strong style="color:${TECH_CATEGORY_COLORS[d.tech.category]}">${d.tech.name}</strong>
            <br/><span style="color:#9ca3af">${formatYBP(d.tech.yearYBP)} &middot; ${d.tech.category}</span>
            <br/><span style="margin-top:4px;display:inline-block">${d.tech.description}</span>`
          )
          .style('opacity', 1);
      })
      .on('mousemove', (event) => {
        const rect = container.getBoundingClientRect();
        tooltip
          .style('left', event.clientX - rect.left + 14 + 'px')
          .style('top', event.clientY - rect.top - 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('opacity', 0);
      })
      .on('click', (_event, d) => {
        setSelectedTech((prev) => (prev?.id === d.tech.id ? null : d.tech));
        setHighlightedIds((prev) => {
          if (prev.has(d.tech.id) && prev.size > 0) return new Set();
          return getPrerequisiteChain(d.tech.id);
        });
      });

    // Drag behavior
    const drag = d3
      .drag<SVGCircleElement, Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeSelection.call(drag);

    // Force simulation
    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<Node, Link>(links)
          .id((d) => d.id)
          .distance(80)
          .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-120))
      .force('x', d3.forceX<Node>((d) => xScale(d.tech.yearYBP)).strength(0.4))
      .force(
        'y',
        d3
          .forceY<Node>((d) => {
            const bandY = yBand(d.tech.category) ?? height / 2;
            return bandY + yBand.bandwidth() / 2;
          })
          .strength(0.15)
      )
      .force(
        'collide',
        d3.forceCollide<Node>((d) => d.radius + 4)
      )
      .on('tick', () => {
        linkSelection
          .attr('x1', (d) => (d.source as Node).x!)
          .attr('y1', (d) => (d.source as Node).y!)
          .attr('x2', (d) => (d.target as Node).x!)
          .attr('y2', (d) => (d.target as Node).y!);

        nodeSelection.attr('cx', (d) => d.x!).attr('cy', (d) => d.y!);

        labelSelection.attr('x', (d) => d.x!).attr('y', (d) => d.y!);
      });

    simulationRef.current = simulation;

    // Initial zoom to fit
    const initialScale = 0.85;
    const tx = (width * (1 - initialScale)) / 2;
    const ty = (height * (1 - initialScale)) / 2;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialScale));

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [getPrerequisiteChain]);

  // Update visual highlighting when selection changes
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const hasHighlight = highlightedIds.size > 0;

    svg.selectAll<SVGCircleElement, Node>('circle').each(function (d) {
      const el = d3.select(this);
      if (!hasHighlight) {
        el.attr('opacity', 1).attr('stroke', theme === 'dark' ? '#222' : '#cbd5e1').attr('stroke-width', 1.5);
      } else if (highlightedIds.has(d.id)) {
        el.attr('opacity', 1).attr('stroke', '#facc15').attr('stroke-width', 2.5);
      } else {
        el.attr('opacity', 0.15).attr('stroke', theme === 'dark' ? '#222' : '#cbd5e1').attr('stroke-width', 1);
      }
    });

    svg.selectAll<SVGLineElement, Link>('line').each(function (d) {
      const el = d3.select(this);
      const srcId = typeof d.source === 'string' ? d.source : (d.source as Node).id;
      const tgtId = typeof d.target === 'string' ? d.target : (d.target as Node).id;
      if (!hasHighlight) {
        el.attr('stroke', theme === 'dark' ? '#555' : '#94a3b8')
          .attr('stroke-opacity', 0.4)
          .attr('stroke-width', 1)
          .attr('marker-end', 'url(#arrowhead)');
      } else if (highlightedIds.has(srcId) && highlightedIds.has(tgtId)) {
        el.attr('stroke', '#facc15')
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 2)
          .attr('marker-end', 'url(#arrowhead-hl)');
      } else {
        el.attr('stroke', theme === 'dark' ? '#333' : '#cbd5e1')
          .attr('stroke-opacity', 0.1)
          .attr('stroke-width', 0.5)
          .attr('marker-end', 'url(#arrowhead-dim)');
      }
    });

    svg.selectAll<SVGTextElement, Node>('text').each(function (d) {
      const el = d3.select(this);
      if (!hasHighlight) {
        el.attr('opacity', 1);
      } else if (highlightedIds.has(d.id)) {
        el.attr('opacity', 1).attr('fill', theme === 'dark' ? '#fff' : '#111');
      } else {
        el.attr('opacity', 0.1).attr('fill', theme === 'dark' ? '#ccc' : '#334155');
      }
    });
  }, [highlightedIds]);

  return (
    <div className="relative flex h-full w-full flex-col bg-background">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-800 px-4 py-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wide">
          Tech Tree
        </span>
        {Object.entries(TECH_CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs capitalize text-foreground">{cat}</span>
          </div>
        ))}
        {selectedTech && (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted">
            <span>
              Selected:{' '}
              <strong style={{ color: TECH_CATEGORY_COLORS[selectedTech.category] }}>
                {selectedTech.name}
              </strong>
            </span>
            <button
              className="rounded bg-surface-hover px-2 py-0.5 text-foreground hover:bg-border"
              onClick={() => {
                setSelectedTech(null);
                setHighlightedIds(new Set());
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* SVG container */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <svg ref={svgRef} className="h-full w-full" />
      </div>
    </div>
  );
}
