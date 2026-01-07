import React from 'react';
import { TerminalSquare, Settings, Cpu, ServerCog, Bot } from 'lucide-react';
import { WorkspaceMode } from '../types';
import { cn } from '../utils/cn';

interface SidebarProps {
  currentMode: WorkspaceMode;
  onModeChange: (mode: WorkspaceMode) => void;
  onOpenSettings: () => void;
}

export function Sidebar({ currentMode, onModeChange, onOpenSettings }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-64 h-full flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 z-50">
      
      {/* Header / Brand */}
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-sidebar-border/50">
        <div className="h-10 w-10 bg-sidebar-primary/20 rounded-lg flex items-center justify-center text-sidebar-primary shadow-inner">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="hidden lg:block ml-3">
          <h1 className="font-bold text-lg tracking-tight">Kijko</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">v2.1.0 // TRINITY</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2">
        <NavButton 
          active={currentMode === 'agents'} 
          onClick={() => onModeChange('agents')}
          icon={<Bot className="w-5 h-5" />}
          label="Agents"
          description="Let's Build an Agent"
        />

        <NavButton 
          active={currentMode === 'hyperglyph'} 
          onClick={() => onModeChange('hyperglyph')}
          icon={<TerminalSquare className="w-5 h-5" />}
          label="Hypervisa"
          description="Context & Ingestion"
        />
        
        <NavButton 
          active={currentMode === 'panopticon'} 
          onClick={() => onModeChange('panopticon')}
          icon={<ServerCog className="w-5 h-5" />}
          label="Panopticon"
          description="MCPs & Skills"
        />
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-sidebar-border/50">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center lg:justify-start p-3 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group"
        >
          <Settings className="w-5 h-5 lg:mr-3 transition-transform duration-500 group-hover:rotate-90" />
          <span className="hidden lg:inline text-sm font-medium">System Config</span>
        </button>
      </div>
    </aside>
  );
}

function NavButton({ active, onClick, icon, label, description }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center p-3 rounded-[calc(var(--radius)-4px)] transition-all duration-200 group relative overflow-hidden",
        active 
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md ring-1 ring-sidebar-border" 
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {/* Active Indicator Line */}
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary" />}
      
      <div className={cn("mr-3", active ? "text-sidebar-primary" : "group-hover:text-sidebar-primary transition-colors")}>
        {icon}
      </div>
      <div className="hidden lg:block text-left">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[10px] opacity-70 font-mono tracking-tight">{description}</div>
      </div>
    </button>
  );
}