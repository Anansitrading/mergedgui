// Filter Sidebar for Integrations Tab
// Shows + New button and My Integrations list

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Github, Slack, Cloud, Zap, HardDrive, Network } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { IntegrationCategory, IntegrationCardData } from '../../../types/settings';

// Icon mapping for integrations (smaller version for sidebar)
const getIntegrationIcon = (iconName: string): React.ReactNode => {
  const iconClass = 'w-5 h-5';

  switch (iconName) {
    case 'kijko-file-storage':
      return <HardDrive className={iconClass} />;
    case 'kijko-knowledge-graph':
      return <Network className={iconClass} />;
    case 'github':
      return <Github className={iconClass} />;
    case 'slack':
      return <Slack className={iconClass} />;
    case 'zap':
    case 'custom':
      return <Zap className={iconClass} />;
    default:
      return <Cloud className={iconClass} />;
  }
};

// Sidebar integration item
function SidebarIntegrationItem({
  integration,
  onClick,
  isSelected,
}: {
  integration: IntegrationCardData;
  onClick: () => void;
  isSelected?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors group',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      <span className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 bg-muted/50 text-muted-foreground group-hover:text-foreground">
        {integration.iconUrl ? (
          <img
            src={integration.iconUrl}
            alt={integration.name}
            className="w-4 h-4 object-contain"
          />
        ) : (
          getIntegrationIcon(integration.icon)
        )}
      </span>
      <span className="truncate flex-1">{integration.name}</span>
      {integration.isConnected && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            integration.connectionStatus === 'warning' || integration.connectionStatus === 'disconnected'
              ? 'bg-orange-500'
              : 'bg-green-500'
          )}
        />
      )}
    </button>
  );
}

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 240;

export interface SidebarFilters {
  selectedCategories: IntegrationCategory[];
  selectedStatuses: ('connected' | 'warning' | 'disconnected' | 'default')[];
  selectedTypes: ('pre-built' | 'custom')[];
}

export const DEFAULT_SIDEBAR_FILTERS: SidebarFilters = {
  selectedCategories: [],
  selectedStatuses: [],
  selectedTypes: [],
};

interface FilterSidebarProps {
  filters: SidebarFilters;
  onFiltersChange: (filters: SidebarFilters) => void;
  onCreateNew?: () => void;
  integrations: IntegrationCardData[];
  onIntegrationClick?: (id: string) => void;
  selectedIntegrationId?: string | null;
}

export function FilterSidebar({
  filters,
  onFiltersChange: _onFiltersChange,
  onCreateNew,
  integrations,
  onIntegrationClick,
  selectedIntegrationId,
}: FilterSidebarProps) {
  // Note: filters and onFiltersChange kept for API compatibility but filter UI moved to header
  void _onFiltersChange;
  void filters;

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isResizing.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [sidebarWidth]
  );

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(
        SIDEBAR_MAX_WIDTH,
        Math.max(SIDEBAR_MIN_WIDTH, startWidth.current + delta)
      );
      setSidebarWidth(newWidth);
    };

    const handleResizeEnd = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <aside className="shrink-0 relative" style={{ width: sidebarWidth }}>
      {/* Resize handle */}
      <div
        onMouseDown={handleResizeStart}
        className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 transition-colors z-10"
      />
      <div className="pr-4 border-r border-border h-full overflow-y-auto flex flex-col">
        {/* Create New Button */}
        <div className="mb-4">
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Plus size={16} />
            <span>New</span>
          </button>
        </div>

        {/* My Integrations List - Only show connected integrations */}
        <div className="flex-1 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            My Integrations ({integrations.filter((i) => i.isConnected).length})
          </div>
          <div className="flex flex-col gap-0.5">
            {integrations
              .filter((integration) => integration.isConnected)
              .map((integration) => (
                <SidebarIntegrationItem
                  key={integration.id}
                  integration={integration}
                  onClick={() => onIntegrationClick?.(integration.id)}
                  isSelected={selectedIntegrationId === integration.id}
                />
              ))}
            {integrations.filter((i) => i.isConnected).length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No connected integrations
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
