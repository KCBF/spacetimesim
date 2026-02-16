'use client';

import { useAppStore } from '@/lib/store';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { TimelineView } from '@/components/timeline/TimelineView';
import { WorldMapView } from '@/components/worldmap/WorldMapView';
import { DemographicsView } from '@/components/demographics/DemographicsView';
import { TechTreeView } from '@/components/techtree/TechTreeView';
import { EconomyView } from '@/components/economy/EconomyView';
import { ChronicleView } from '@/components/chronicle/ChronicleView';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { StubPage } from '@/components/shared/StubPage';

const STUB_DESCRIPTIONS: Record<string, { title: string; description: string }> = {
  worldmap: {
    title: 'World Map',
    description: 'Interactive D3-geo projection showing era-based political boundaries, trade routes, and migration patterns across time.',
  },
  demographics: {
    title: 'Demographics',
    description: 'Population area charts per region, showing growth curves, urbanization trends, and demographic transitions.',
  },
  techtree: {
    title: 'Tech Tree',
    description: 'DAG visualization of invention prerequisites — from fire to fusion, showing how technologies depend on and enable each other.',
  },
  economy: {
    title: 'Economy',
    description: 'Economic output, trade flows, and resource distribution across civilizations and eras.',
  },
  chronicle: {
    title: 'Chronicle',
    description: 'Vertical scrolling event feed with rich detail cards, filtering, and search across all recorded events.',
  },
};

export function AppShell() {
  const activeTab = useAppStore(s => s.activeTab);

  const renderTab = () => {
    switch (activeTab) {
      case 'timeline': return <TimelineView />;
      case 'worldmap': return <WorldMapView />;
      case 'demographics': return <DemographicsView />;
      case 'techtree': return <TechTreeView />;
      case 'economy': return <EconomyView />;
      case 'chronicle': return <ChronicleView />;
      default: return <StubPage title={activeTab} description="Coming soon." />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header />
      <TabNav />
      <main className="flex-1 overflow-hidden">
        {renderTab()}
      </main>
      <ChatPanel />
    </div>
  );
}
