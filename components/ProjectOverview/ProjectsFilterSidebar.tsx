import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import type { Project, ProjectFilter } from '../../types';
import { ProjectContextMenu } from './ProjectContextMenu';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 240;

export type QuickFilter = 'starred' | 'archived' | null;

export interface ProjectSidebarFilters {
  quickFilter: QuickFilter;
  selectedTags: string[];
}

export const DEFAULT_PROJECT_SIDEBAR_FILTERS: ProjectSidebarFilters = {
  quickFilter: null,
  selectedTags: [],
};

export interface DropTarget {
  type: 'starred' | 'archived' | 'tag';
  value?: string;
}

interface ProjectsFilterSidebarProps {
  projects: Project[];
  allTags: string[];
  filters: ProjectSidebarFilters;
  onFiltersChange: (filters: ProjectSidebarFilters) => void;
  activeFilterCount: number;
  onProjectClick?: (project: Project) => void;
  onProjectOpen?: (project: Project) => void;
  onProjectShare?: (project: Project) => void;
  onProjectToggleStarred?: (project: Project) => void;
  onProjectArchive?: (project: Project) => void;
  onProjectUnarchive?: (project: Project) => void;
  onProjectDelete?: (project: Project) => void;
  onCreateNew?: () => void;
  ownershipFilter: ProjectFilter;
  onOwnershipFilterChange: (filter: ProjectFilter) => void;
}

interface SidebarProjectItemProps {
  project: Project;
  onClick: () => void;
  onOpen: () => void;
  onShare: () => void;
  onToggleStarred: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onDelete: () => void;
}

function SidebarProjectItem({
  project,
  onClick,
  onOpen,
  onShare,
  onToggleStarred,
  onArchive,
  onUnarchive,
  onDelete,
}: SidebarProjectItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const iconBg = project.icon.backgroundColor || '#3b82f6';
  const iconContent =
    project.icon.type === 'emoji'
      ? project.icon.value
      : project.icon.value.charAt(0).toUpperCase();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({ x: rect.right, y: rect.top });
  };

  return (
    <>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
      >
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 font-medium"
          style={{ backgroundColor: iconBg, color: '#fff' }}
        >
          {iconContent}
        </span>
        <span className="truncate flex-1">{project.name}</span>
        <span
          onClick={handleMenuClick}
          className="p-0.5 text-muted-foreground hover:text-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={14} />
        </span>
      </button>

      {contextMenu && (
        <ProjectContextMenu
          project={project}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onOpen={onOpen}
          onShare={onShare}
          onToggleStarred={onToggleStarred}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

export function ProjectsFilterSidebar({
  projects,
  allTags: _allTags,
  filters: _filters,
  onFiltersChange: _onFiltersChange,
  activeFilterCount: _activeFilterCount,
  onProjectClick,
  onProjectOpen,
  onProjectShare,
  onProjectToggleStarred,
  onProjectArchive,
  onProjectUnarchive,
  onProjectDelete,
  onCreateNew,
  ownershipFilter: _ownershipFilter,
  onOwnershipFilterChange: _onOwnershipFilterChange,
}: ProjectsFilterSidebarProps) {
  // Note: filter-related props kept for API compatibility but filter UI moved to header
  void _allTags;
  void _filters;
  void _onFiltersChange;
  void _activeFilterCount;
  void _ownershipFilter;
  void _onOwnershipFilterChange;

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const delta = e.clientX - startX.current;
      const newWidth = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, startWidth.current + delta));
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
    <aside
      className="shrink-0 relative"
      style={{ width: sidebarWidth }}
    >
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

        {/* Projects List */}
        <div className="flex-1 min-h-0">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Projects ({projects.length})
          </div>
          <div className="flex flex-col gap-0.5">
            {projects.map((project) => (
              <SidebarProjectItem
                key={project.id}
                project={project}
                onClick={() => onProjectClick?.(project)}
                onOpen={() => onProjectOpen?.(project)}
                onShare={() => onProjectShare?.(project)}
                onToggleStarred={() => onProjectToggleStarred?.(project)}
                onArchive={() => onProjectArchive?.(project)}
                onUnarchive={() => onProjectUnarchive?.(project)}
                onDelete={() => onProjectDelete?.(project)}
              />
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No projects found
              </p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default ProjectsFilterSidebar;
