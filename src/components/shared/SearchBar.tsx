'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { allEvents } from '@/data/events';
import { CATEGORY_COLORS } from '@/lib/events/types';
import { formatYBP } from '@/lib/time/format';
import { useAppStore } from '@/lib/store';

const fuse = new Fuse(allEvents, {
  keys: ['name', 'description', 'tags', 'regionId'],
  threshold: 0.3,
  includeScore: true,
});

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setSelectedEventId = useAppStore(s => s.setSelectedEventId);
  const jumpToEvent = useAppStore(s => s.jumpToEvent);
  const setActiveTab = useAppStore(s => s.setActiveTab);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 12);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Search events..."
        className="w-48 lg:w-64 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-accent"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 right-0 w-80 max-h-80 overflow-y-auto bg-surface border border-border rounded-lg shadow-xl z-50">
          {results.map(({ item }) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedEventId(item.id);
                jumpToEvent(item.yearYBP);
                setActiveTab('timeline');
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-hover text-sm transition-colors border-b border-border/50 last:border-0"
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate">{item.name}</div>
                <div className="text-xs text-muted">{formatYBP(item.yearYBP)}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
