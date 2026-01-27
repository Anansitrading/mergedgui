import { useState, useRef, useEffect } from 'react';
import {
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  PanelBottomClose,
  PanelBottomOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { useLayout } from '../../contexts/LayoutContext';
import { LayoutCustomizePopover } from './LayoutCustomizePopover';
import { cn } from '../../utils/cn';

const btnBase =
  'p-1.5 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50';

export function HeaderLayoutControls() {
  const { state, toggleLeftSidebar, toggleChatInput, toggleRightSidebar } = useLayout();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const customizeRef = useRef<HTMLDivElement>(null);

  // Close popover on Escape
  useEffect(() => {
    if (!isCustomizeOpen) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCustomizeOpen(false);
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isCustomizeOpen]);

  return (
    <div className="flex items-center gap-0.5">
      {/* 1. Customize Layout */}
      <div ref={customizeRef} className="relative">
        <button
          onClick={() => setIsCustomizeOpen((v) => !v)}
          className={cn(btnBase, isCustomizeOpen ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10')}
          title="Customize layout"
          aria-label="Customize layout"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        {isCustomizeOpen && (
          <LayoutCustomizePopover onClose={() => setIsCustomizeOpen(false)} />
        )}
      </div>

      {/* 2. Toggle Left Sidebar */}
      <button
        onClick={toggleLeftSidebar}
        className={cn(btnBase, state.leftSidebarCollapsed ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-white hover:bg-white/10')}
        title={state.leftSidebarCollapsed ? 'Show left panel' : 'Hide left panel'}
        aria-label={state.leftSidebarCollapsed ? 'Show left panel' : 'Hide left panel'}
      >
        {state.leftSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
      </button>

      {/* 3. Toggle Chat Input */}
      <button
        onClick={toggleChatInput}
        className={cn(btnBase, state.chatInputCollapsed ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-white hover:bg-white/10')}
        title={state.chatInputCollapsed ? 'Show chat input' : 'Hide chat input'}
        aria-label={state.chatInputCollapsed ? 'Show chat input' : 'Hide chat input'}
      >
        {state.chatInputCollapsed ? <PanelBottomOpen className="w-4 h-4" /> : <PanelBottomClose className="w-4 h-4" />}
      </button>

      {/* 4. Toggle Right Panel */}
      <button
        onClick={toggleRightSidebar}
        className={cn(btnBase, state.rightSidebarCollapsed ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-white hover:bg-white/10')}
        title={state.rightSidebarCollapsed ? 'Show right panel' : 'Hide right panel'}
        aria-label={state.rightSidebarCollapsed ? 'Show right panel' : 'Hide right panel'}
      >
        {state.rightSidebarCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
      </button>
    </div>
  );
}
