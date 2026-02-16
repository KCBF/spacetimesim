import * as d3 from 'd3';
import { BIG_BANG_YBP } from './constants';

export interface Viewport {
  startYBP: number;
  endYBP: number;
  width: number;
}

export function createTimeScale(viewport: Viewport): d3.ScaleLinear<number, number> {
  return d3.scaleLinear()
    .domain([viewport.startYBP, viewport.endYBP])
    .range([0, viewport.width]);
}

export function createOverviewScale(width: number): d3.ScalePower<number, number> {
  // Power scale with low exponent compresses deep time while expanding recent history
  // We shift domain to positive numbers since pow scale needs it
  const offset = -BIG_BANG_YBP;
  return d3.scalePow()
    .exponent(0.15)
    .domain([0, offset + 1000]) // Big Bang to 1000 years future
    .range([0, width]);
}

export function overviewToYBP(px: number, width: number): number {
  const scale = createOverviewScale(width);
  const offset = -BIG_BANG_YBP;
  return scale.invert(px) - offset;
}

export function ybpToOverview(ybp: number, width: number): number {
  const scale = createOverviewScale(width);
  const offset = -BIG_BANG_YBP;
  return scale(ybp + offset);
}

export function clampViewport(viewport: Viewport): Viewport {
  const span = viewport.endYBP - viewport.startYBP;
  let start = viewport.startYBP;
  let end = viewport.endYBP;

  // Don't go before Big Bang
  if (start < BIG_BANG_YBP) {
    start = BIG_BANG_YBP;
    end = start + span;
  }
  // Don't go too far into future
  if (end > 1000) {
    end = 1000;
    start = end - span;
    if (start < BIG_BANG_YBP) start = BIG_BANG_YBP;
  }

  return { ...viewport, startYBP: start, endYBP: end };
}

export function viewportSpan(viewport: Viewport): number {
  return viewport.endYBP - viewport.startYBP;
}
