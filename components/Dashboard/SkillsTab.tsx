// SkillsTab - Dashboard Tab Component for Skills Library
// Task 2_2: Skills Library UI
// Task 2_3: Create Skill Form
// Task 3_5: Analytics & Polish - Added onboarding
// Layout Redesign: Skills shown in sidebar grouped by category

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { SkillsCategorySidebar } from '../Skills/SkillsCategorySidebar';
import { SkillOverviewTab } from '../Skills/SkillOverviewTab';
import { CommunitySkillsView } from '../Skills/CommunitySkillsView';
import { ExecuteSkillModal } from '../Skills/ExecuteSkillModal';
import { SkillDetailModal } from '../Skills/SkillDetailModal';
import { ConversationalSkillBuilder, OnboardingModal, useSkillsOnboarding } from '../Skills';
import { useSkills } from '../../hooks/useSkills';
import { useSkillsSubNavigation, type SkillsSubTabType } from '../../hooks/useSkillsSubNavigation';
import type { Skill } from '../../types/skills';

// Sub-tab configuration
const SUB_TABS: { id: SkillsSubTabType; label: string }[] = [
  { id: 'all-skills', label: 'All' },
  { id: 'my-skills', label: 'My Skills' },
  { id: 'community-skills', label: 'Community' },
];

export function SkillsTab() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { skills, loading, deleteSkill, refetch } = useSkills();
  const { activeSubTab, setActiveSubTab } = useSkillsSubNavigation();
  const { showOnboarding, dismissOnboarding } = useSkillsOnboarding();

  // Selected skill and modal states
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [executeModalSkill, setExecuteModalSkill] = useState<Skill | null>(null);
  const [editModalSkill, setEditModalSkill] = useState<Skill | null>(null);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter skills based on search and active tab
  const filteredSkills = useMemo(() => {
    let result = [...skills];

    // For now, all tabs show all user skills (Community is a placeholder)
    // In the future, 'all-skills' might include marketplace skills

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchLower) ||
          skill.description?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [skills, search]);

  // Clear selection when switching tabs
  useEffect(() => {
    setSelectedSkill(null);
  }, [activeSubTab]);

  // Update selected skill when skills list changes (e.g., after edit)
  useEffect(() => {
    if (selectedSkill) {
      const updated = skills.find((s) => s.id === selectedSkill.id);
      if (updated) {
        setSelectedSkill(updated);
      } else {
        setSelectedSkill(null);
      }
    }
  }, [skills, selectedSkill?.id]);

  const handleCreateSkill = useCallback(() => {
    setIsWizardOpen(true);
  }, []);

  const handleSkillCreated = useCallback((skill: Skill) => {
    console.log('Skill created:', skill);
    refetch();
    setSelectedSkill(skill);
  }, [refetch]);

  const handleSelectSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
  }, []);

  const handleRunSkill = useCallback((skill: Skill) => {
    setExecuteModalSkill(skill);
  }, []);

  const handleEditSkill = useCallback((skill: Skill) => {
    setEditModalSkill(skill);
  }, []);

  const handleDeleteSkill = useCallback(async (skill: Skill) => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteSkill(skill.id);
        if (selectedSkill?.id === skill.id) {
          setSelectedSkill(null);
        }
      } catch (err) {
        console.error('Failed to delete skill:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [deleteSkill, isDeleting, selectedSkill?.id]);

  const handleCloseExecuteModal = useCallback(() => {
    setExecuteModalSkill(null);
  }, []);

  const handleExecutionComplete = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCloseEditModal = useCallback(() => {
    setEditModalSkill(null);
  }, []);

  const handleSkillUpdated = useCallback((updatedSkill: Skill) => {
    setEditModalSkill(updatedSkill);
    refetch();
  }, [refetch]);

  const handleSkillDeleted = useCallback(() => {
    setEditModalSkill(null);
    if (selectedSkill?.id === editModalSkill?.id) {
      setSelectedSkill(null);
    }
    refetch();
  }, [refetch, selectedSkill?.id, editModalSkill?.id]);

  const handleOnboardingClose = useCallback(() => {
    dismissOnboarding();
  }, [dismissOnboarding]);

  const handleStartWithTemplate = useCallback(() => {
    dismissOnboarding();
    setIsWizardOpen(true);
  }, [dismissOnboarding]);

  const handleStartFromScratch = useCallback(() => {
    dismissOnboarding();
    setIsWizardOpen(true);
  }, [dismissOnboarding]);

  // Render community tab content
  if (activeSubTab === 'community-skills') {
    return (
      <div
        role="tabpanel"
        id="tabpanel-skills"
        aria-labelledby="tab-skills"
        className="flex flex-col h-full"
      >
        {/* Controls Bar */}
        <div className="shrink-0 border-b border-border bg-card/30 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Sub-Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              {SUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={cn(
                    'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                    activeSubTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={handleCreateSkill}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Plus size={18} />
              <span>Create new skill</span>
            </button>
          </div>
        </div>

        {/* Community Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <CommunitySkillsView onCreateSkill={handleCreateSkill} />
        </main>

        {/* Conversational Skill Builder */}
        <ConversationalSkillBuilder
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onCreated={handleSkillCreated}
        />
      </div>
    );
  }

  // Render main skills view (All / My Skills)
  return (
    <div
      role="tabpanel"
      id="tabpanel-skills"
      aria-labelledby="tab-skills"
      className="flex flex-col h-full"
    >
      {/* Controls Bar */}
      <div className="shrink-0 border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Sub-Tab Navigation */}
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
            {SUB_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={cn(
                  'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                  activeSubTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64 hidden md:block">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search size={16} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleCreateSkill}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <Plus size={18} />
              <span>Create new skill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar with skills grouped by category */}
          <div className="shrink-0 p-4 overflow-y-auto border-r border-border">
            <SkillsCategorySidebar
              skills={filteredSkills}
              selectedSkillId={selectedSkill?.id ?? null}
              onSelectSkill={handleSelectSkill}
              onRunSkill={handleRunSkill}
              loading={loading}
            />
          </div>

          {/* Main content - Skill details or empty state */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedSkill ? (
              <div className="max-w-4xl">
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                      <Zap size={24} className="text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">
                        {selectedSkill.name}
                      </h1>
                      {!selectedSkill.isActive && (
                        <span className="text-sm text-muted-foreground">(Inactive)</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditSkill(selectedSkill)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(selectedSkill)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Skill Overview */}
                <SkillOverviewTab
                  skill={selectedSkill}
                  onRun={() => handleRunSkill(selectedSkill)}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="p-4 bg-muted/50 rounded-2xl mb-4">
                  <Zap size={48} className="text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Select a skill
                </h2>
                <p className="text-muted-foreground max-w-md">
                  Choose a skill from the sidebar to view its details, run it, or make changes.
                </p>
                {filteredSkills.length === 0 && !loading && (
                  <button
                    onClick={handleCreateSkill}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                  >
                    <Plus size={18} />
                    Create your first skill
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Conversational Skill Builder */}
      <ConversationalSkillBuilder
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreated={handleSkillCreated}
      />

      {/* Execute Skill Modal */}
      {executeModalSkill && (
        <ExecuteSkillModal
          skill={executeModalSkill}
          isOpen={true}
          onClose={handleCloseExecuteModal}
          onExecutionComplete={handleExecutionComplete}
        />
      )}

      {/* Skill Detail/Edit Modal */}
      {editModalSkill && (
        <SkillDetailModal
          skill={editModalSkill}
          isOpen={true}
          onClose={handleCloseEditModal}
          onUpdated={handleSkillUpdated}
          onDeleted={handleSkillDeleted}
          onRun={handleRunSkill}
        />
      )}

      {/* Onboarding Modal for first-time users */}
      {showOnboarding && (
        <OnboardingModal
          onClose={handleOnboardingClose}
          onStartWithTemplate={handleStartWithTemplate}
          onStartFromScratch={handleStartFromScratch}
        />
      )}
    </div>
  );
}
