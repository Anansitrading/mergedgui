import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { PanopticonView } from './components/Panopticon/PanopticonView';
import { AgentsView } from './components/Agents/AgentsView';
import { ContextStore } from './components/ContextStore';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceMode } from './types';

function App() {
  const [mode, setMode] = useState<WorkspaceMode>('agents');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* 
        Layout Strategy: 
        Sidebar is fixed width, Main Content takes remaining space.
        Border styling uses the new oklch variables for subtle separation.
      */}
      <Sidebar 
        currentMode={mode} 
        onModeChange={setMode} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
      />

      <main className="flex-1 relative flex flex-col h-full overflow-hidden transition-all duration-500 ease-out">
        {/* Ambient background glow for depth */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          <div className="h-full w-full rounded-[var(--radius)] border border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl overflow-hidden relative">
            {mode === 'agents' && <AgentsView />}
            
            {mode === 'hyperglyph' && (
               <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] h-full transition-all duration-300">
                <ChatInterface />
                <div className="hidden lg:block border-l border-border/50 bg-secondary/10 relative overflow-hidden">
                  <ContextStore />
                </div>
              </div>
            )}
            
            {mode === 'panopticon' && <PanopticonView />}
          </div>
        </div>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}

export default App;