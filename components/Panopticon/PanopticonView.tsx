import React, { useState } from 'react';
import { Server, Activity, Cpu } from 'lucide-react';
import { MarketplacePanel } from './MarketplacePanel';
import { RegistryItem } from '../../services/mcpRegistry';

export function PanopticonView() {
  const [activeItem, setActiveItem] = useState<RegistryItem | null>(null);

  const handleSelectRegistryItem = (item: RegistryItem) => {
    console.log("Selected item:", item);
    setActiveItem(item);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      
      {/* Column 1: Active Servers + Telemetry (Left/Center) */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        
        {/* Main Panel: Active Servers */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
             
             {/* Header */}
             <div className="h-14 flex items-center px-6 border-b border-border/50 justify-between shrink-0">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    <Cpu size={16} />
                    <span>Active Servers</span>
                </div>
                <div className="text-[10px] font-mono text-muted-foreground/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse"></span>
                    SYSTEM ONLINE
                </div>
             </div>
             
             {/* Empty State / Content */}
             <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <div className="border border-dashed border-border rounded-xl p-12 flex flex-col items-center text-muted-foreground/50 max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                        <Server size={32} />
                    </div>
                    <span className="text-lg font-medium text-foreground/80 mb-2">No Active MCP Servers</span>
                    <span className="text-sm">Select a tool from the marketplace on the right to begin observing agent interactions.</span>
                </div>
             </div>
        </div>

        {/* Bottom Panel: Telemetry */}
        <div className="h-[300px] border-t border-border/50 bg-card/20 backdrop-blur-md flex flex-col transition-all duration-300">
            <div className="h-10 flex items-center px-4 border-b border-border/50 bg-secondary/10 justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Activity size={14} />
                    <span>Telemetry Stream</span>
                </div>
                <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/10" />
                </div>
            </div>
            <div className="flex-1 p-4 font-mono text-xs text-muted-foreground overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                     <span className="text-6xl font-black tracking-tighter text-foreground">NO SIGNAL</span>
                </div>
                <div className="space-y-1 opacity-50">
                    <div className="flex gap-4"><span className="text-muted-foreground/50">10:42:01.002</span> <span>[SYSTEM] Telemetry subsystem initialized.</span></div>
                    <div className="flex gap-4"><span className="text-muted-foreground/50">10:42:01.050</span> <span>[SYSTEM] Waiting for MCP handshake...</span></div>
                </div>
            </div>
        </div>
      </div>

      {/* Column 2: Marketplace (Right) */}
      <MarketplacePanel onSelect={handleSelectRegistryItem} />
      
    </div>
  );
}