'use client';

import { useState, useMemo } from 'react';
import { useDisplayStore } from '@/lib/display-store';
import { countries as countriesImport } from '@/data/countries/stub';
import { DATA_CATEGORIES } from '@/data/countries/categories';

const countriesData = countriesImport || [];
const categoriesData = DATA_CATEGORIES || [];

function formatValue(value: any, format: string, prefix?: string, suffix?: string, decimals?: number): string {
  if (value === null || value === undefined) return '-';
  const dec = decimals ?? (format === 'decimal' ? 1 : 0);
  let str = '';
  switch (format) {
    case 'currency':
      str = (prefix || '$') + Number(value).toLocaleString(undefined, { maximumFractionDigits: dec });
      break;
    case 'percent':
      str = Number(value).toFixed(dec) + '%';
      break;
    case 'decimal':
      str = Number(value).toFixed(dec);
      break;
    case 'number':
      str = Number(value).toLocaleString();
      break;
    default:
      str = String(value);
  }
  if (suffix) str += suffix;
  return str;
}

export function DataHubView() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const { settings } = useDisplayStore();

  const categories = categoriesData;
  const currentCat = categories[activeCategory] || { columns: [], label: 'Overview', id: 'overview' };

  const regions = useMemo(() => {
    const r = new Set(countriesData.map((c: any) => c.region));
    return ['all', ...Array.from(r).sort()];
  }, []);

  const filteredData = useMemo(() => {
    let data = [...countriesData];
    if (regionFilter !== 'all') {
      data = data.filter((c: any) => c.region === regionFilter);
    }
    if (filterText) {
      const q = filterText.toLowerCase();
      data = data.filter((c: any) =>
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q) ||
        c.capital?.toLowerCase().includes(q) ||
        c.region?.toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      data.sort((a: any, b: any) => {
        const av = a[sortKey] ?? 0;
        const bv = b[sortKey] ?? 0;
        if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        return sortDir === 'asc' ? av - bv : bv - av;
      });
    }
    return data;
  }, [regionFilter, filterText, sortKey, sortDir]);

  const totalPages = Math.ceil(filteredData.length / settings.rowsPerPage);
  const pageData = filteredData.slice(page * settings.rowsPerPage, (page + 1) * settings.rowsPerPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (countriesData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Global Data Hub</div>
          <div>Loading country data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Title bar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Global Data Hub 2025</h2>
            <p className="text-xs text-muted">Business intelligence for 195 countries - Compare, filter, and analyze</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={regionFilter}
              onChange={e => { setRegionFilter(e.target.value); setPage(0); }}
              className="bg-surface border border-border rounded px-2 py-1 text-xs text-foreground"
            >
              {regions.map(r => (
                <option key={r} value={r}>{r === 'all' ? 'All Regions' : r}</option>
              ))}
            </select>
            <input
              type="text"
              value={filterText}
              onChange={e => { setFilterText(e.target.value); setPage(0); }}
              placeholder="Search country..."
              className="bg-surface border border-border rounded px-2 py-1 text-xs text-foreground placeholder-muted w-40"
            />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 px-4 py-1.5 border-b border-border overflow-x-auto bg-surface">
        {categories.map((cat: any, i: number) => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(i); setPage(0); }}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded whitespace-nowrap transition-colors ${
              activeCategory === i
                ? 'bg-accent text-white font-medium'
                : 'text-muted hover:text-foreground hover:bg-surface-hover'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left text-muted font-semibold w-8">#</th>
              {currentCat.columns?.map((col: any) => (
                <th
                  key={col.key}
                  className="px-2 py-2 text-left text-muted font-semibold cursor-pointer hover:text-foreground select-none"
                  style={{ minWidth: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.shortLabel || col.label}</span>
                    {sortKey === col.key && (
                      <span className="text-accent">{sortDir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((row: any, i: number) => (
              <tr
                key={row.code || i}
                className={`border-b border-border/50 ${settings.highlightRow ? 'hover:bg-surface-hover' : ''} ${
                  settings.compactTable ? '' : ''
                }`}
              >
                <td className="px-2 py-1.5 text-muted">{page * settings.rowsPerPage + i + 1}</td>
                {currentCat.columns?.map((col: any) => (
                  <td key={col.key} className="px-2 py-1.5 text-foreground">
                    {col.key === 'name' ? (
                      <span className="font-medium">{row[col.key]}</span>
                    ) : (
                      formatValue(row[col.key], col.format, col.prefix, col.suffix, col.decimals)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface text-xs text-muted">
        <span>Showing {filteredData.length} of {countriesData.length} countries</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-2 py-1 rounded border border-border disabled:opacity-30 hover:bg-surface-hover"
          >
            Prev
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-2 py-1 rounded border border-border disabled:opacity-30 hover:bg-surface-hover"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
