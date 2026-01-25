import { useCallback, useRef } from 'react';
import { FolderKanban, Puzzle, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { DashboardTabType } from '../../hooks/useTabNavigation';

interface DashboardTabsProps {
  activeTab: DashboardTabType;
  onTabChange: (tab: DashboardTabType) => void;
}

interface TabConfig {
  id: DashboardTabType;
  label: string;
  shortcut: number;
  icon: typeof FolderKanban;
}

const DASHBOARD_TABS: TabConfig[] = [
  { id: 'projects', label: 'Projects', shortcut: 1, icon: FolderKanban },
  { id: 'integrations', label: 'Integrations', shortcut: 2, icon: Puzzle },
  { id: 'skills', label: 'Skills', shortcut: 3, icon: Sparkles },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  const tabRefs = useRef<Map<DashboardTabType, HTMLButtonElement>>(new Map());

  const setTabRef = useCallback(
    (id: DashboardTabType) => (el: HTMLButtonElement | null) => {
      if (el) {
        tabRefs.current.set(id, el);
      } else {
        tabRefs.current.delete(id);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      let newIndex: number | null = null;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : DASHBOARD_TABS.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < DASHBOARD_TABS.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = DASHBOARD_TABS.length - 1;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          onTabChange(DASHBOARD_TABS[currentIndex].id);
          return;
      }

      if (newIndex !== null) {
        const newTab = DASHBOARD_TABS[newIndex];
        const tabElement = tabRefs.current.get(newTab.id);
        tabElement?.focus();
        onTabChange(newTab.id);
      }
    },
    [onTabChange]
  );

  return (
    <div
      role="tablist"
      aria-label="Dashboard sections"
      className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg"
    >
      {DASHBOARD_TABS.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            ref={setTabRef(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
            title={`${tab.label} (⌘${tab.shortcut})`}
          >
            <Icon size={16} className={cn(isActive ? 'text-primary' : '')} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { DASHBOARD_TABS };
