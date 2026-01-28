import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Filter, X, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Project } from '../../types';

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
  onCreateNew?: () => void;
}

function SidebarProjectItem({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  const iconBg = project.icon.backgroundColor || '#3b82f6';
  const iconContent =
    project.icon.type === 'emoji'
      ? project.icon.value
      : project.icon.value.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
    >
      <span
        className="w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 font-medium"
        style={{ backgroundColor: iconBg, color: '#fff' }}
      >
        {iconContent}
      </span>
      <span className="truncate flex-1">{project.name}</span>
    </button>
  );
}

export function ProjectsFilterSidebar({
  projects,
  allTags,
  filters,
  onFiltersChange,
  activeFilterCount,
  onProjectClick,
  onCreateNew,
}: ProjectsFilterSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef<HTMLButtonElement>(null);
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
        {/* Create New Button + Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={onCreateNew}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            <Plus size={16} />
            <span>New</span>
          </button>

          {/* Filter Button */}
          <div className="relative">
            <button
              ref={filterButtonRef}
              onClick={() => {
                if (!isFilterDropdownOpen && filterButtonRef.current) {
                  const rect = filterButtonRef.current.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                  });
                }
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
              }}
              className={cn(
                'flex items-center justify-center p-2 border rounded-lg transition-colors',
                activeFilterCount > 0
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title="Filter projects"
            >
              <Filter size={16} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />
                <div
                  className="fixed min-w-[220px] bg-card border border-border rounded-lg shadow-xl z-50 py-3"
                  style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
                >
                  {/* Header with clear button */}
                  <div className="flex items-center justify-between px-4 pb-3 border-b border-border mb-3">
                    <span className="text-sm font-medium text-foreground">Filters</span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => onFiltersChange(DEFAULT_PROJECT_SIDEBAR_FILTERS)}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={12} />
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Status Filters */}
                  <div className="px-4 mb-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      Status
                    </span>
                    <div className="flex flex-col gap-1">
                      {(['starred', 'archived'] as const).map((status) => {
                        const isActive = filters.quickFilter === status;
                        return (
                          <button
                            key={status}
                            onClick={() =>
                              onFiltersChange({
                                ...filters,
                                quickFilter: isActive ? null : status,
                              })
                            }
                            className={cn(
                              'flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-foreground hover:bg-muted'
                            )}
                          >
                            <span
                              className={cn(
                                'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                isActive
                                  ? 'bg-primary border-primary'
                                  : 'border-muted-foreground/40'
                              )}
                            >
                              {isActive && <Check size={12} className="text-primary-foreground" />}
                            </span>
                            <span className="capitalize">{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tag Filters */}
                  {allTags.length > 0 && (
                    <div className="px-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Tags
                      </span>
                      <div className="flex flex-col gap-1">
                        {allTags.map((tag) => {
                          const isSelected = filters.selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              onClick={() =>
                                onFiltersChange({
                                  ...filters,
                                  selectedTags: isSelected
                                    ? filters.selectedTags.filter((t) => t !== tag)
                                    : [...filters.selectedTags, tag],
                                })
                              }
                              className={cn(
                                'flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                isSelected
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                  isSelected
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground/40'
                                )}
                              >
                                {isSelected && <Check size={12} className="text-primary-foreground" />}
                              </span>
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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
