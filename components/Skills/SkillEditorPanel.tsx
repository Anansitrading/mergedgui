// SkillEditorPanel Component
// Inline skill editor with 3-panel layout (Chat | YAML + Markdown)
// Used for both viewing/editing existing skills and creating new ones

import { useEffect, useCallback, useState } from 'react';
import { Zap, Save, Loader2, Play, RotateCcw, Code, Workflow, X, FileEdit, Users, Sparkles, Star, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSkillBuilder } from '../../hooks/useSkillBuilder';
import { SkillChat } from './ConversationalSkillBuilder/SkillChat';
import { YamlPreview } from './ConversationalSkillBuilder/YamlPreview';
import { MarkdownPreview } from './ConversationalSkillBuilder/MarkdownPreview';
import { SkillFlowDiagram } from './ConversationalSkillBuilder/SkillFlowDiagram';
import { ScopeSelectorDropdown } from './ScopeSelectorDropdown';
import type { Skill } from '../../types/skills';
import type { SkillDraft, SkillScopeSelection } from '../../types/skillDraft';
import { defaultScopeSelection } from '../../types/skillDraft';

type PreviewTab = 'code' | 'flow';

interface SkillEditorPanelProps {
  skill: Skill | null;
  onSave?: (skill: Skill) => void;
  onRun?: (skill: Skill) => void;
  onCreated?: (skill: Skill) => void;
  onCancelCreate?: () => void;
  onCreateNew?: () => void;
  onToggleStar?: (skill: Skill, starred: boolean) => void;
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
  isCreatingNew = false,
  className,
}: SkillEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>('code');
  const [hasStarred, setHasStarred] = useState(false);
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

  // Show empty state when no skill selected and not creating
  if (!skill && !isCreatingNew) {
    return (
      <div className={cn('flex items-center justify-center h-full', className)}>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          {/* Icon */}
          <div className="relative mb-6">
            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
              <Users size={48} className="text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 p-2 bg-card border border-border rounded-full shadow-lg">
              <Sparkles size={16} className="text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Community Skills
          </h2>

          {/* Description */}
          <p className="text-center text-muted-foreground max-w-md mb-8">
            Discover and share skills created by the Kijko community.
            Rate, review, and use skills built by other users.
          </p>

          {/* Coming Soon Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-8">
            <Sparkles size={16} />
            Coming Soon
          </div>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="p-2 bg-yellow-500/10 rounded-lg w-fit mx-auto mb-3">
                <Star size={20} className="text-yellow-500" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Rate & Review</h3>
              <p className="text-xs text-muted-foreground">
                Share your experience with skills from the community
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="p-2 bg-green-500/10 rounded-lg w-fit mx-auto mb-3">
                <Download size={20} className="text-green-500" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Easy Import</h3>
              <p className="text-xs text-muted-foreground">
                Add community skills to your library with one click
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="p-2 bg-blue-500/10 rounded-lg w-fit mx-auto mb-3">
                <Users size={20} className="text-blue-500" />
              </div>
              <h3 className="font-medium text-foreground mb-1">Share Your Skills</h3>
              <p className="text-xs text-muted-foreground">
                Publish your custom skills for others to use
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              In the meantime, create your own custom skills:
            </p>
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Sparkles size={18} />
              Create Custom Skill
            </button>
          </div>
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
          <div className="w-[60%] h-full p-4 border-r border-border">
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
          <div className="w-[40%] h-full flex flex-col p-4 gap-4">
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
        <div className="w-[60%] h-full p-4 border-r border-border">
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
        <div className="w-[40%] h-full flex flex-col p-4 gap-4">
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
