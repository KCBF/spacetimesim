import { PRESENT_YEAR, type ZoomConfig } from './constants';

export function ybpToCE(ybp: number): number {
  return PRESENT_YEAR + ybp;
}

export function ceToYBP(ce: number): number {
  return ce - PRESENT_YEAR;
}

export function formatYBP(ybp: number, format?: ZoomConfig['labelFormat']): string {
  const absYbp = Math.abs(ybp);

  if (!format) {
    // Auto-detect format
    if (absYbp >= 1_000_000_000) format = 'bya';
    else if (absYbp >= 1_000_000) format = 'mya';
    else if (absYbp >= 50_000) format = 'kya';
    else format = 'bce_ce';
  }

  if (format === 'bya') {
    const val = absYbp / 1_000_000_000;
    return `${val.toFixed(val >= 10 ? 0 : 1)} Bya`;
  }

  if (format === 'mya') {
    const val = absYbp / 1_000_000;
    return `${val >= 100 ? val.toFixed(0) : val.toFixed(val >= 10 ? 0 : 1)} Mya`;
  }

  if (format === 'kya') {
    const val = absYbp / 1_000;
    return `${val.toFixed(0)} kya`;
  }

  // BCE/CE
  const ce = ybpToCE(ybp);
  if (format === 'ce' || format === 'year') {
    return `${Math.abs(Math.round(ce))} ${ce < 0 ? 'BCE' : 'CE'}`;
  }

  // bce_ce
  if (ce < 0) {
    return `${Math.abs(Math.round(ce))} BCE`;
  }
  return `${Math.round(ce)} CE`;
}

export function formatYBPShort(ybp: number): string {
  const absYbp = Math.abs(ybp);
  if (absYbp >= 1_000_000_000) return `${(absYbp / 1_000_000_000).toFixed(1)}B`;
  if (absYbp >= 1_000_000) return `${(absYbp / 1_000_000).toFixed(0)}M`;
  if (absYbp >= 1_000) return `${(absYbp / 1_000).toFixed(0)}k`;
  const ce = ybpToCE(ybp);
  return `${Math.abs(Math.round(ce))}${ce < 0 ? 'BC' : ''}`;
}
