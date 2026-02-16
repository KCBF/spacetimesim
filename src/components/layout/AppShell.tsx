'use client';

import { useAppStore } from '@/lib/store';
import { useDisplayStore } from '@/lib/display-store';
import { Header } from './Header';
import { TabNav } from './TabNav';
import { TimelineView } from '@/components/timeline/TimelineView';
import { WorldMapView } from '@/components/worldmap/WorldMapView';
import { DemographicsView } from '@/components/demographics/DemographicsView';
import { TechTreeView } from '@/components/techtree/TechTreeView';
import { EconomyView } from '@/components/economy/EconomyView';
import { ChronicleView } from '@/components/chronicle/ChronicleView';
import { DataHubView } from '@/components/datahub/DataHubView';
import { MarketsView } from '@/components/markets/MarketsView';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { SettingsPanel } from '@/components/shared/SettingsPanel';
import { ThemeInit } from './ThemeInit';

export function AppShell() {
  const activeTab = useAppStore(s => s.activeTab);
  const showSettings = useDisplayStore(s => s.showSettingsPanel);

  const renderTab = () => {
    switch (activeTab) {
      case 'timeline': return <TimelineView />;
      case 'datahub': return <DataHubView />;
      case 'markets': return <MarketsView />;
      case 'worldmap': return <WorldMapView />;
      case 'demographics': return <DemographicsView />;
      case 'techtree': return <TechTreeView />;
      case 'economy': return <EconomyView />;
      case 'chronicle': return <ChronicleView />;
      default: return <DataHubView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <ThemeInit />
      <Header />
      <TabNav />
      <main className="flex-1 overflow-hidden">
        {renderTab()}
      </main>
      <ChatPanel />
      {showSettings && <SettingsPanel />}
    </div>
  );
}
