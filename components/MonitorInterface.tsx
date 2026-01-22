import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { LogEntry, AgentStatus } from '../types';
import { cn } from '../utils/cn';

// Mock data to demonstrate the aesthetic - replace with WebSocket data
const MOCK_LOGS: LogEntry[] = [
  { ts: '10:42:01', level: 'INFO', agent: 'Orchestrator', msg: 'Initializing collaborative mesh...' },
  { ts: '10:42:05', level: 'DEBUG', agent: 'Gemini-3', msg: 'Context window utilization: 42%' },
  { ts: '10:42:08', level: 'WARN', agent: 'FileSystem', msg: 'Write permission check passed with latency warning' },
  { ts: '10:42:12', level: 'INFO', agent: 'Orchestrator', msg: 'Agent swarm synchronized.' },
  { ts: '10:42:15', level: 'INFO', agent: 'Coder', msg: 'Refactoring utility module...' },
];

const AGENTS: AgentStatus[] = [
    { name: 'Orchestrator', state: 'Working', load: 45 },
    { name: 'Coder', state: 'Working', load: 78 },
    { name: 'Reviewer', state: 'Idle', load: 12 },
    { name: 'Architect', state: 'Thinking', load: 92 },
];

const CHART_DATA = [
    {v: 10}, {v: 15}, {v: 12}, {v: 35}, {v: 45}, {v: 30}, {v: 60}, {v: 55}, {v: 70}, {v: 65}, {v: 80}
];

export function MonitorInterface() {
  return (
    <div className="h-full flex flex-col bg-card/50">
      {/* Status Header */}
      <div className="h-20 border-b border-border flex items-center px-6 justify-between shrink-0 bg-background/50 backdrop-blur-md z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_10px_var(--primary)]"></span>
            </span>
            <div className="flex flex-col">
                <span className="font-mono text-sm font-bold text-foreground tracking-tight leading-none">SYSTEM ONLINE</span>
                <span className="text-[10px] text-muted-foreground font-mono">Uptime: 42h 12m</span>
            </div>
          </div>
          <div className="h-8 w-px bg-border/50" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">WebSocket</span>
            <span className="text-sm font-medium text-primary">Connected</span>
          </div>
        </div>
        
        {/* Tiny Sparkline using chart vars */}
        <div className="w-48 h-12">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={CHART_DATA}>
               <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={true} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30 overflow-hidden">
        {/* Left Panel: Live Logs */}
        <div className="bg-card flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-3 border-b border-border/50 bg-secondary/30 text-xs font-mono uppercase tracking-wider text-muted-foreground flex justify-between items-center">
            <span>System Events</span>
            <span className="text-[10px] bg-background/50 px-2 py-0.5 rounded border border-border/50">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
            {MOCK_LOGS.map((log, i) => (
              <div key={i} className="flex space-x-3 hover:bg-muted/50 p-1.5 rounded-md cursor-default transition-all duration-200 border border-transparent hover:border-border/50">
                <span className="text-muted-foreground/50 opacity-70 w-16 shrink-0">{log.ts}</span>
                <span className={cn(
                    "w-12 shrink-0 font-bold",
                    log.level === 'INFO' ? 'text-primary' : 
                    log.level === 'WARN' ? 'text-chart-4' : 
                    log.level === 'DEBUG' ? 'text-chart-2' : 'text-muted-foreground'
                )}>
                  {log.level}
                </span>
                <span className="text-accent-foreground font-semibold w-24 shrink-0">{log.agent}:</span>
                <span className="text-foreground/90 break-words">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Agent Grid */}
        <div className="bg-card p-6 overflow-y-auto relative">
           <div className="absolute top-0 right-0 p-4">
             <div className="h-32 w-32 rounded-full border-4 border-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-primary">84%</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Mesh Load</div>
                </div>
             </div>
           </div>
           
           <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">Active Agents</h3>
           
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {AGENTS.map((agent) => (
              <div key={agent.name} className="group relative overflow-hidden rounded-xl border border-border bg-background/50 p-5 hover:border-primary/50 transition-all duration-500 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border",
                      agent.state === 'Working' ? "bg-primary/10 text-primary border-primary/20" :
                      agent.state === 'Thinking' ? "bg-chart-2/10 text-chart-2 border-chart-2/20" :
                      "bg-muted text-muted-foreground border-transparent"
                  )}>
                    {agent.state}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Processing Load</span>
                    <span>{agent.load}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                        className={cn(
                            "h-full transition-all duration-1000 ease-out rounded-full",
                            agent.load > 80 ? "bg-chart-4" : "bg-primary"
                        )} 
                        style={{ width: `${agent.load}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}