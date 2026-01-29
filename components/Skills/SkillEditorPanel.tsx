// SkillEditorPanel Component
// Inline skill editor with 3-panel layout (Chat | YAML + Markdown)
// Used for both viewing/editing existing skills and creating new ones

import { useEffect, useCallback, useState, useMemo } from 'react';
import { Zap, Save, Loader2, Play, RotateCcw, Code, Workflow, X, FileEdit, Star, Search, ChevronLeft, LayoutGrid, List, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSkillBuilder } from '../../hooks/useSkillBuilder';
import { useSkills } from '../../hooks/useSkills';
import { SkillChat } from './ConversationalSkillBuilder/SkillChat';
import { YamlPreview } from './ConversationalSkillBuilder/YamlPreview';
import { MarkdownPreview } from './ConversationalSkillBuilder/MarkdownPreview';
import { SkillFlowDiagram } from './ConversationalSkillBuilder/SkillFlowDiagram';
import { ScopeSelectorDropdown } from './ScopeSelectorDropdown';
import { SkillsGrid } from './SkillsGrid';
import type { Skill } from '../../types/skills';
import type { SkillDraft, SkillScopeSelection } from '../../types/skillDraft';
import { defaultScopeSelection } from '../../types/skillDraft';

type PreviewTab = 'code' | 'flow';
type SkillSortBy = 'popular' | 'name' | 'recent';

// Sort options for skills browse view
const SORT_OPTIONS: { id: SkillSortBy; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'name', label: 'Name' },
  { id: 'recent', label: 'Most recent' },
];

interface SkillEditorPanelProps {
  skill: Skill | null;
  onSave?: (skill: Skill) => void;
  onRun?: (skill: Skill) => void;
  onCreated?: (skill: Skill) => void;
  onCancelCreate?: () => void;
  onCreateNew?: () => void;
  onToggleStar?: (skill: Skill, starred: boolean) => void;
  onSelectSkill?: (skill: Skill) => void;
  onClose?: () => void;
  isCreatingNew?: boolean;
  className?: string;
}

/**
 * Convert a Skill to SkillDraft format for the editor
 */
function skillToDraft(skill: Skill): Partial<SkillDraft> {
  return {
    name: skill.name,
    description: skill.description || '',
    dependencies: [],
    trigger: 'pre-tool',
    scope: 'local',
    tags: [],
    instructions: skill.promptTemplate || '',
  };
}

export function SkillEditorPanel({
  skill,
  onSave,
  onRun,
  onCreated,
  onCancelCreate,
  onCreateNew,
  onToggleStar,
  onSelectSkill,
  onClose,
  isCreatingNew = false,
  className,
}: SkillEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('code');
  const [hasStarred, setHasStarred] = useState(false);
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseViewMode, setBrowseViewMode] = useState<'grid' | 'list'>('grid');
  const [browseSortBy, setBrowseSortBy] = useState<SkillSortBy>('popular');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const { skills: allSkills, loading: skillsLoading, error: skillsError, refetch: refetchSkills } = useSkills();
  const {
    state,
    sendMessage,
    approveConfig,
    rejectConfig,
    updateDraft,
    createSkill,
    reset,
    loadSkill,
    canCreateSkill,
  } = useSkillBuilder();

  // Filter and sort skills for browse view
  const filteredBrowseSkills = useMemo(() => {
    let result = [...allSkills];

    // Filter by search
    if (browseSearch.trim()) {
      const searchLower = browseSearch.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort based on selected sort option
    switch (browseSortBy) {
      case 'popular':
        result.sort((a, b) => (b.starCount ?? 0) - (a.starCount ?? 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        result.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return result;
  }, [allSkills, browseSearch, browseSortBy]);

  // Current sort label
  const currentSortLabel = SORT_OPTIONS.find((o) => o.id === browseSortBy)?.label || 'Sort';

  // Load skill into editor when skill changes or when entering create mode
  useEffect(() => {
    if (skill) {
      loadSkill(skillToDraft(skill));
    } else if (isCreatingNew) {
      reset(); // Start fresh for new skill
    } else {
      reset();
    }
  }, [skill?.id, isCreatingNew]); // Reload when skill ID changes or create mode changes

  // Reset star state when skill changes
  useEffect(() => {
    setHasStarred(false); // TODO: Load from user's starred skills
  }, [skill?.id]);

  // Handle star toggle
  const handleToggleStar = useCallback(() => {
    if (!skill) return;
    const newStarred = !hasStarred;
    setHasStarred(newStarred);
    onToggleStar?.(skill, newStarred);
  }, [skill, hasStarred, onToggleStar]);

  // Handle save (for editing existing skill)
  const handleSave = useCallback(() => {
    if (!skill || !canCreateSkill) return;

    const skillData = createSkill();
    if (!skillData) return;

    // Create updated skill object
    const updatedSkill: Skill = {
      ...skill,
      name: skillData.name,
      description: skillData.description,
      promptTemplate: skillData.content,
      updatedAt: new Date(),
    };

    onSave?.(updatedSkill);
  }, [skill, createSkill, canCreateSkill, onSave]);

  // Handle create (for new skill)
  const handleCreate = useCallback(() => {
    if (!canCreateSkill) return;

    const skillData = createSkill();
    if (!skillData) return;

    // Create new skill object
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      userId: 'current-user',
      name: skillData.name || 'New Skill',
      description: skillData.description,
      category: 'custom',
      promptTemplate: skillData.content,
      model: 'gpt-4',
      parameters: { temperature: 0.7, max_tokens: 2048 },
      outputFormat: 'markdown',
      isActive: true,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onCreated?.(newSkill);
  }, [createSkill, canCreateSkill, onCreated]);

  // Handle run
  const handleRun = useCallback(() => {
    if (skill) {
      onRun?.(skill);
    }
  }, [skill, onRun]);

  // Handle reset
  const handleReset = useCallback(() => {
    if (skill) {
      loadSkill(skillToDraft(skill));
    }
  }, [skill, loadSkill]);

  // Handle skill selection from browse grid
  const handleBrowseSkillSelect = useCallback((skillToSelect: Skill) => {
    onSelectSkill?.(skillToSelect);
  }, [onSelectSkill]);

  // Handle delete (no-op for browse, user should select first)
  const handleBrowseDelete = useCallback(() => {
    // No-op in browse view
  }, []);

  // Show skills browser when no skill selected and not creating
  if (!skill && !isCreatingNew) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-border bg-card/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                All Skills
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredBrowseSkills.length} {filteredBrowseSkills.length === 1 ? 'skill' : 'skills'} available
                {browseSearch && ` matching "${browseSearch}"`}
              </p>
            </div>

            {/* Search and View Controls */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={browseSearch}
                  onChange={(e) => setBrowseSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="pl-9 pr-4 py-2 w-64 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1">
                <button
                  onClick={() => setBrowseViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    browseViewMode === 'grid'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setBrowseViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    browseViewMode === 'list'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title="List view"
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown
                    size={16}
                    className={cn(
                      'transition-transform',
                      isSortDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isSortDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSortDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setBrowseSortBy(option.id);
                            setIsSortDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full px-4 py-2 text-sm text-left transition-colors',
                            browseSortBy === option.id
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <SkillsGrid
            skills={filteredBrowseSkills}
            loading={skillsLoading}
            error={skillsError}
            onRetry={refetchSkills}
            onRunSkill={onRun || (() => {})}
            onEditSkill={handleBrowseSkillSelect}
            onDeleteSkill={handleBrowseDelete}
            onViewSkill={handleBrowseSkillSelect}
            viewMode={browseViewMode}
            searchQuery={browseSearch}
            onCreateNew={onCreateNew}
          />
        </div>
      </div>
    );
  }

  // Creating new skill mode
  if (isCreatingNew && !skill) {
    return (
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header for Create Mode */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileEdit size={20} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {state.draft.name || 'New Skill'}
              </h2>
              <p className="text-sm text-amber-500">
                Concept - not saved
              </p>
            </div>

            {/* Scope Selector */}
            <ScopeSelectorDropdown
              value={state.draft.scopeSelection || defaultScopeSelection}
              onChange={(selection: SkillScopeSelection) => updateDraft({ scopeSelection: selection })}
              className="ml-4"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Preview Tab Switcher */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5 mr-2">
              <button
                onClick={() => setActiveTab('code')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'code'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Code size={14} />
                Code
              </button>
              <button
                onClick={() => setActiveTab('flow')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
                  activeTab === 'flow'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Workflow size={14} />
                Flow
              </button>
            </div>

            {/* Cancel Button */}
            <button
              onClick={onCancelCreate}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Cancel"
            >
              <X size={16} />
              Cancel
            </button>

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={!canCreateSkill || state.isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                canCreateSkill && !state.isLoading
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {state.isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Create Skill
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Content - 3 Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Chat (60%) */}
          <div className="w-1/2 h-full p-4 border-r border-border">
            <SkillChat
              messages={state.messages}
              isLoading={state.isLoading}
              isStreaming={state.isStreaming}
              error={state.error}
              onSendMessage={sendMessage}
              onApproveConfig={approveConfig}
              onRejectConfig={rejectConfig}
              className="h-full"
              mode="create"
            />
          </div>

          {/* Right Panel - Previews (40%) */}
          <div className="w-1/2 h-full flex flex-col p-4 gap-4">
            {activeTab === 'code' ? (
              <>
                {/* YAML Preview (Top) */}
                <YamlPreview draft={state.draft} className="flex-1" />

                {/* Markdown Preview (Bottom) */}
                <MarkdownPreview draft={state.draft} className="flex-1" />
              </>
            ) : (
              /* Flow Diagram - Full height */
              <div className="flex-1 border border-border rounded-lg overflow-hidden">
                <SkillFlowDiagram draft={state.draft} className="h-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="shrink-0 p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Back to overview"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {skill.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {skill.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          {/* Scope Selector */}
          <ScopeSelectorDropdown
            value={state.draft.scopeSelection || defaultScopeSelection}
            onChange={(selection: SkillScopeSelection) => updateDraft({ scopeSelection: selection })}
            className="ml-4"
          />

          {/* Star Rating - Clickable */}
          <button
            onClick={handleToggleStar}
            className={cn(
              'flex items-center gap-1.5 ml-4 px-3 py-1.5 rounded-lg border transition-all',
              hasStarred
                ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                : 'bg-muted/50 border-border hover:bg-muted hover:border-yellow-500/30'
            )}
            title={hasStarred ? 'Verwijder ster' : 'Geef een ster'}
          >
            <Star
              size={16}
              className={cn(
                'transition-colors',
                hasStarred
                  ? 'text-yellow-500 fill-yellow-500'
                  : (skill.starCount ?? 0) > 0
                    ? 'text-yellow-500'
                    : 'text-muted-foreground hover:text-yellow-500'
              )}
            />
            <span className={cn(
              'text-sm font-medium tabular-nums',
              hasStarred || (skill.starCount ?? 0) > 0
                ? 'text-foreground'
                : 'text-muted-foreground'
            )}>
              {(skill.starCount ?? 0) + (hasStarred ? 1 : 0)}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Tab Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5 mr-2">
            <button
              onClick={() => setActiveTab('code')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
                activeTab === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Code size={14} />
              Code
            </button>
            <button
              onClick={() => setActiveTab('flow')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium transition-colors',
                activeTab === 'flow'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Workflow size={14} />
              Flow
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Reset changes"
          >
            <RotateCcw size={16} />
          </button>

          {/* Run Button */}
          <button
            onClick={handleRun}
            className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Play size={16} />
            Run
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!canCreateSkill || state.isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              canCreateSkill && !state.isLoading
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            )}
          >
            {state.isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat (60%) */}
        <div className="w-1/2 h-full p-4 border-r border-border">
          <SkillChat
            messages={state.messages}
            isLoading={state.isLoading}
            isStreaming={state.isStreaming}
            error={state.error}
            onSendMessage={sendMessage}
            onApproveConfig={approveConfig}
            onRejectConfig={rejectConfig}
            className="h-full"
            mode="edit"
            skillName={skill.name}
          />
        </div>

        {/* Right Panel - Previews (40%) */}
        <div className="w-1/2 h-full flex flex-col p-4 gap-4">
          {activeTab === 'code' ? (
            <>
              {/* YAML Preview (Top) */}
              <YamlPreview draft={state.draft} className="flex-1" />

              {/* Markdown Preview (Bottom) */}
              <MarkdownPreview draft={state.draft} className="flex-1" />
            </>
          ) : (
            /* Flow Diagram - Full height */
            <div className="flex-1 border border-border rounded-lg overflow-hidden">
              <SkillFlowDiagram draft={state.draft} className="h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SkillEditorPanel;
