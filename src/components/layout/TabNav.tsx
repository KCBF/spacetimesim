'use client';

import { useAppStore, type TabId } from '@/lib/store';

const TABS: { id: TabId; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'worldmap', label: 'World Map' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'techtree', label: 'Tech Tree' },
  { id: 'economy', label: 'Economy' },
  { id: 'chronicle', label: 'Chronicle' },
];

export function TabNav() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);

  return (
    <nav className="flex gap-1 px-4 py-1 bg-surface border-b border-border overflow-x-auto">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-accent text-white font-medium'
              : 'text-muted hover:text-foreground hover:bg-surface-hover'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
