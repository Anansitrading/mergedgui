import React, { useState } from 'react';
import { Terminal, ChevronUp, ChevronDown, Activity, Clock, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';

const MOCK_TELEMETRY = [
    { ts: '10:45:01.002', source: 'SYSTEM', msg: 'Dashboard initialized successfully.' },
    { ts: '10:45:01.250', source: 'MCP', msg: 'Connected to local filesystem server.' },
    { ts: '10:45:02.105', source: 'AGENT', msg: 'Orchestrator requesting context refresh.' },
    { ts: '10:45:03.440', source: 'NETWORK', msg: 'WebSocket latency: 12ms' },
    { ts: '10:45:05.112', source: 'MCP', msg: 'Tool call executed: filesystem.list_dir' },
];

export function TelemetryBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
        className={cn(
            "border-t border-border/50 bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out flex flex-col z-20",
            isExpanded ? "h-[300px]" : "h-9"
        )}
    >
      {/* Toggle Bar */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-9 shrink-0 flex items-center justify-between px-4 cursor-pointer hover:bg-secondary/30 transition-colors group select-none"
      >
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/80 group-hover:text-primary">
                <Zap size={12} />
                <span>Agentic Stream</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 LIVE
            </div>
            <div className="hidden md:flex items-center gap-1 text-[10px] font-mono text-muted-foreground/60 border-l border-border/50 pl-4">
                 <Clock size={10} />
                 Last Event: tool_call.success (20ms)
            </div>
        </div>

        <div className="text-muted-foreground group-hover:text-foreground transition-transform duration-300">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Expanded Content */}
      <div className="flex-1 overflow-hidden relative bg-black/20">
        <div className="absolute inset-0 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
            {MOCK_TELEMETRY.map((log, i) => (
                <div key={i} className="flex gap-4 py-0.5 hover:bg-white/5 px-2 -mx-2 rounded">
                    <span className="text-muted-foreground/50 w-24 shrink-0">{log.ts}</span>
                    <span className="text-primary/70 font-bold w-16 shrink-0 text-right mr-2">{log.source}</span>
                    <span className="text-foreground/80">{log.msg}</span>
                </div>
            ))}
            <div className="flex gap-4 py-0.5 px-2 -mx-2 animate-pulse opacity-50">
                 <span className="text-muted-foreground/50 w-24 shrink-0">...</span>
            </div>
        </div>
      </div>
    </div>
  );
}