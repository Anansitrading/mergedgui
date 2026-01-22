import React, { useState } from 'react';
import { MarketplacePanel } from './MarketplacePanel';
import { PanopticonDashboard } from './PanopticonDashboard';
import { TelemetryBar } from './TelemetryBar';
import { ChatInterface } from '../ChatInterface';
import { RegistryItem } from '../../services/mcpRegistry';

export function PanopticonView() {
  const [activeItem, setActiveItem] = useState<RegistryItem | null>(null);

  const handleSelectRegistryItem = (item: RegistryItem) => {
    console.log("Selected item:", item);
    setActiveItem(item);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      
      {/* Main Area: Dashboard + Chat + Telemetry */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        
        {/* Top: Engine Room Dashboard */}
        <div className="flex-1 overflow-hidden relative">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
             <PanopticonDashboard />
        </div>

        {/* Middle: Chat Overlay (Compact) */}
        <div className="shrink-0 border-t border-border/50 bg-background/40 backdrop-blur-md">
            <ChatInterface mode="minimal" className="p-4" />
        </div>

        {/* Bottom: Telemetry */}
        <TelemetryBar />
      </div>

      {/* Right Column: Marketplace */}
      <MarketplacePanel onSelect={handleSelectRegistryItem} />
      
    </div>
  );
}