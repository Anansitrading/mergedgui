// ScopeSelectorDropdown Component
// Dropdown menu for selecting skill scope (projects, worktrees, branches)
// Supports multiple selections

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  Globe,
  FolderOpen,
  GitBranch,
  GitFork,
  Check,
  X,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProjects } from '../../contexts/ProjectsContext';
import { getWorktreesForProject } from '../ProjectOverview/repoMindmapData';
import type { SkillScopeSelection } from '../../types/skillDraft';

interface ScopeSelectorDropdownProps {
  value: SkillScopeSelection;
  onChange: (selection: SkillScopeSelection) => void;
  className?: string;
}

type ScopeType = SkillScopeSelection['type'];

export function ScopeSelectorDropdown({
  value,
  onChange,
  className,
}: ScopeSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ScopeType>(value.type);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { projects } = useProjects();

  // Compute all worktrees across all projects
  const allWorktrees = useMemo(() => {
    return projects.flatMap(project => {
      const worktrees = getWorktreesForProject(project.id);
      return worktrees.map(wt => ({
        ...wt,
        projectId: project.id,
        projectName: project.name,
      }));
    });
  }, [projects]);

  // Compute all branches across all projects (with worktree context)
  const allBranches = useMemo(() => {
    const branchMap = new Map<string, { name: string; projectId: string; projectName: string; worktreeName: string }>();

    projects.forEach(project => {
      const worktrees = getWorktreesForProject(project.id);
      worktrees.forEach(wt => {
        wt.branches.forEach(branch => {
          // Use a composite key to handle same branch name in different projects
          const key = `${project.id}:${branch.name}`;
          if (!branchMap.has(key)) {
            branchMap.set(key, {
              name: branch.name,
              projectId: project.id,
              projectName: project.name,
              worktreeName: wt.name,
            });
          }
        });
      });
    });

    return Array.from(branchMap.values());
  }, [projects]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display label based on current selection
  const displayLabel = useMemo(() => {
    switch (value.type) {
      case 'all':
        return 'All Projects';
      case 'projects':
        if (value.projectIds?.length === 1) {
          const project = projects.find(p => p.id === value.projectIds![0]);
          return project?.name || '1 Project';
        }
        return `${value.projectIds?.length || 0} Projects`;
      case 'worktrees':
        if (value.worktreeIds?.length === 1) {
          const worktree = allWorktrees.find(w => w.id === value.worktreeIds![0]);
          return worktree?.name || '1 Worktree';
        }
        return `${value.worktreeIds?.length || 0} Worktrees`;
      case 'branches':
        if (value.branchNames?.length === 1) {
          return value.branchNames[0];
        }
        return `${value.branchNames?.length || 0} Branches`;
      default:
        return 'Select Scope';
    }
  }, [value, projects]);

  // Get icon based on current selection
  const DisplayIcon = useMemo(() => {
    switch (value.type) {
      case 'all':
        return Globe;
      case 'projects':
        return FolderOpen;
      case 'worktrees':
        return GitFork;
      case 'branches':
        return GitBranch;
      default:
        return Globe;
    }
  }, [value.type]);

  // Handle selecting "All Projects"
  const handleSelectAll = () => {
    onChange({ type: 'all' });
    setIsOpen(false);
  };

  // Handle project selection toggle
  const handleProjectToggle = (projectId: string) => {
    const currentIds = value.projectIds || [];
    const newIds = currentIds.includes(projectId)
      ? currentIds.filter(id => id !== projectId)
      : [...currentIds, projectId];

    if (newIds.length === 0) {
      onChange({ type: 'all' });
    } else {
      onChange({ type: 'projects', projectIds: newIds });
    }
  };

  // Handle worktree selection toggle
  const handleWorktreeToggle = (worktreeId: string) => {
    const currentIds = value.worktreeIds || [];
    const newIds = currentIds.includes(worktreeId)
      ? currentIds.filter(id => id !== worktreeId)
      : [...currentIds, worktreeId];

    if (newIds.length === 0) {
      onChange({ type: 'all' });
    } else {
      onChange({ type: 'worktrees', worktreeIds: newIds });
    }
  };

  // Handle branch selection toggle
  const handleBranchToggle = (branchName: string) => {
    const currentNames = value.branchNames || [];
    const newNames = currentNames.includes(branchName)
      ? currentNames.filter(name => name !== branchName)
      : [...currentNames, branchName];

    if (newNames.length === 0) {
      onChange({ type: 'all' });
    } else {
      onChange({ type: 'branches', branchNames: newNames });
    }
  };

  // Check if an item is selected
  const isProjectSelected = (projectId: string) =>
    value.type === 'projects' && value.projectIds?.includes(projectId);
  const isWorktreeSelected = (worktreeId: string) =>
    value.type === 'worktrees' && value.worktreeIds?.includes(worktreeId);
  const isBranchSelected = (branchName: string) =>
    value.type === 'branches' && value.branchNames?.includes(branchName);

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm font-medium',
          isOpen
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-secondary/50 border-border text-foreground hover:border-primary/30'
        )}
      >
        <DisplayIcon size={14} />
        <span className="max-w-[120px] truncate">{displayLabel}</span>
        <ChevronDown
          size={14}
          className={cn('transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">Skill Scope</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select where this skill is available
            </p>
          </div>

          {/* All Projects Option */}
          <div className="p-2 border-b border-border">
            <button
              onClick={handleSelectAll}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                value.type === 'all'
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <Globe size={16} />
              <span className="flex-1 text-left text-sm">All Projects</span>
              {value.type === 'all' && <Check size={16} className="text-primary" />}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border">
            {(['projects', 'worktrees', 'branches'] as ScopeType[]).map((tab) => {
              const TabIcon = tab === 'projects' ? FolderOpen : tab === 'worktrees' ? GitFork : GitBranch;
              const label = tab === 'projects' ? 'Projects' : tab === 'worktrees' ? 'Worktrees' : 'Branches';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-colors',
                    activeTab === tab
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <TabIcon size={12} />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Selection List */}
          <div className="max-h-48 overflow-y-auto p-2">
            {activeTab === 'projects' && (
              <div className="space-y-1">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No projects available
                  </p>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectToggle(project.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isProjectSelected(project.id)
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
                        style={{ backgroundColor: project.icon?.backgroundColor || '#3b82f6' }}
                      >
                        {project.icon?.value || project.name.charAt(0)}
                      </div>
                      <span className="flex-1 text-left text-sm truncate">
                        {project.name}
                      </span>
                      {isProjectSelected(project.id) && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === 'worktrees' && (
              <div className="space-y-1">
                {allWorktrees.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No worktrees available
                  </p>
                ) : (
                  allWorktrees.map((worktree) => (
                    <button
                      key={worktree.id}
                      onClick={() => handleWorktreeToggle(worktree.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isWorktreeSelected(worktree.id)
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <GitFork size={14} className="shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <span className="block text-sm truncate">
                          {worktree.name}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {worktree.projectName}
                        </span>
                      </div>
                      {isWorktreeSelected(worktree.id) && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {activeTab === 'branches' && (
              <div className="space-y-1">
                {allBranches.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No branches available
                  </p>
                ) : (
                  allBranches.map((branch) => (
                    <button
                      key={`${branch.projectId}:${branch.name}`}
                      onClick={() => handleBranchToggle(branch.name)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isBranchSelected(branch.name)
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted text-foreground'
                      )}
                    >
                      <GitBranch size={14} className="shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <span className="block text-sm truncate">
                          {branch.name}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {branch.projectName}
                        </span>
                      </div>
                      {isBranchSelected(branch.name) && (
                        <Check size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer with selection summary */}
          {value.type !== 'all' && (
            <div className="px-4 py-2.5 border-t border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {value.type === 'projects' && `${value.projectIds?.length || 0} selected`}
                {value.type === 'worktrees' && `${value.worktreeIds?.length || 0} selected`}
                {value.type === 'branches' && `${value.branchNames?.length || 0} selected`}
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ScopeSelectorDropdown;
