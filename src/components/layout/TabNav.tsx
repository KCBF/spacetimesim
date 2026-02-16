'use client';

import { useAppStore, type TabId } from '@/lib/store';
import { useDisplayStore } from '@/lib/display-store';

const TABS: { id: TabId; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'datahub', label: 'Global Data' },
  { id: 'markets', label: 'Markets' },
  { id: 'worldmap', label: 'World Map' },
  { id: 'demographics', label: 'Demographics' },
  { id: 'techtree', label: 'Tech Tree' },
  { id: 'economy', label: 'Economy' },
  { id: 'chronicle', label: 'Chronicle' },
];

export function TabNav() {
  const activeTab = useAppStore(s => s.activeTab);
  const setActiveTab = useAppStore(s => s.setActiveTab);
  const showSettings = useDisplayStore(s => s.showSettingsPanel);
  const setShowSettings = useDisplayStore(s => s.setShowSettingsPanel);

  return (
    <nav className="flex items-center gap-1 px-4 py-1 bg-surface border-b border-border overflow-x-auto">
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
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="ml-auto px-2.5 py-1.5 text-xs rounded-md border border-border text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
      >
        Settings
      </button>
    </nav>
  );
}
