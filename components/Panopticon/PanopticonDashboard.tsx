import React from 'react';
import { Bot, Server, Zap, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function PanopticonDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full p-4 overflow-hidden">
      
      {/* Column 1: AGENTS */}
      <div className="flex flex-col min-h-0">
        <Header icon={<Bot size={14} />} title="AGENTS" />
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <AgentCard name="Orchestrator" status="working" task="Coordinating workflow" />
            <AgentCard name="Coder-Alpha" status="idle" task="Waiting for context" />
            <AgentCard name="Reviewer-01" status="paused" task="Manual approval required" />
            <AgentCard name="Researcher-X" status="working" task="Fetching registry data" />
        </div>
      </div>

      {/* Column 2: SERVERS */}
      <div className="flex flex-col min-h-0 border-l border-border/30 pl-4">
        <Header icon={<Server size={14} />} title="ACTIVE SERVERS" />
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <ServerCard name="filesystem" status="connected" version="v1.0.4" />
            <ServerCard name="brave-search" status="connected" version="v0.9.1" />
            <ServerCard name="memory-service" status="connecting" version="v2.0.0" />
            <ServerCard name="github-integration" status="error" version="v1.2.0" />
        </div>
      </div>

      {/* Column 3: SKILLS */}
      <div className="flex flex-col min-h-0 border-l border-border/30 pl-4">
        <Header icon={<Zap size={14} />} title="DISCOVERED SKILLS" />
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <SkillPill tool="filesystem.read_file" server="filesystem" />
            <SkillPill tool="filesystem.write_file" server="filesystem" />
            <SkillPill tool="filesystem.list_dir" server="filesystem" />
            <SkillPill tool="brave.web_search" server="brave-search" />
            <SkillPill tool="brave.local_search" server="brave-search" />
            <SkillPill tool="memory.store_vector" server="memory-service" />
            <SkillPill tool="memory.retrieve" server="memory-service" />
        </div>
      </div>
    </div>
  );
}

function Header({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 shrink-0 text-muted-foreground/80">
      {icon}
      <span className="text-xs font-mono font-bold uppercase tracking-wider">{title}</span>
    </div>
  );
}

function AgentCard({ name, status, task }: { name: string, status: 'working' | 'idle' | 'paused', task: string }) {
  return (
    <div className="bg-card/40 border border-border/50 rounded-lg p-3 hover:bg-card/60 transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-sm text-foreground">{name}</span>
        <div className="flex items-center gap-1.5">
            <div className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse", 
                status === 'working' ? "bg-emerald-500" : 
                status === 'idle' ? "bg-amber-500" : "bg-red-500"
            )} />
            <span className="text-[10px] font-mono uppercase text-muted-foreground">{status}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground/70 truncate font-mono group-hover:text-muted-foreground transition-colors">
        {task}
      </p>
    </div>
  );
}

function ServerCard({ name, status, version }: { name: string, status: 'connected' | 'connecting' | 'error', version: string }) {
    return (
      <div className="bg-card/20 border border-border/30 rounded-lg p-3 flex items-center justify-between hover:border-primary/20 transition-all">
          <div className="flex flex-col">
              <span className="font-medium text-sm text-foreground/90">{name}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{version}</span>
          </div>
          <div className={cn(
              "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
              status === 'connected' ? "bg-emerald-500/10 text-emerald-500" :
              status === 'connecting' ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
          )}>
              {status}
          </div>
      </div>
    );
}

function SkillPill({ tool, server }: { tool: string, server: string }) {
    return (
        <div className="flex items-center justify-between bg-secondary/30 hover:bg-secondary/50 border border-border/30 rounded px-3 py-2 transition-colors cursor-default">
            <span className="text-xs font-mono text-foreground/80">{tool}</span>
            <span className="text-[10px] text-muted-foreground/50">{server}</span>
        </div>
    )
}