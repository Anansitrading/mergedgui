// SkillsTab - Dashboard Tab Component for Skills Library
// Task 2_2: Skills Library UI
// Task 2_3: Create Skill Form
// Task 3_5: Analytics & Polish - Added onboarding

import { useState, useCallback } from 'react';
import { SkillsLibrary, CreateSkillModal, OnboardingModal, useSkillsOnboarding } from '../Skills';
import { useSkills } from '../../hooks/useSkills';
import type { Skill } from '../../types/skills';

export function SkillsTab() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { refetch } = useSkills();
  const { showOnboarding, dismissOnboarding } = useSkillsOnboarding();

  const handleCreateSkill = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleSkillCreated = useCallback((skill: Skill) => {
    console.log('Skill created:', skill);
    // Refetch skills list to include the new skill
    refetch();
  }, [refetch]);

  const handleEditSkill = useCallback((skill: Skill) => {
    // Skill editing is handled through SkillDetailModal
    console.log('Edit skill:', skill.id);
  }, []);

  const handleRunSkill = useCallback((skill: Skill) => {
    // Skill running is handled through ExecuteSkillModal
    console.log('Run skill:', skill.id);
  }, []);

  const handleOnboardingClose = useCallback(() => {
    dismissOnboarding();
  }, [dismissOnboarding]);

  const handleStartWithTemplate = useCallback(() => {
    dismissOnboarding();
    setIsCreateModalOpen(true);
  }, [dismissOnboarding]);

  const handleStartFromScratch = useCallback(() => {
    dismissOnboarding();
    setIsCreateModalOpen(true);
  }, [dismissOnboarding]);

  return (
    <div
      role="tabpanel"
      id="tabpanel-skills"
      aria-labelledby="tab-skills"
      className="h-full overflow-y-auto p-6"
    >
      <div className="max-w-6xl mx-auto">
        <SkillsLibrary
          onCreateSkill={handleCreateSkill}
          onEditSkill={handleEditSkill}
          onRunSkill={handleRunSkill}
        />
      </div>

      <CreateSkillModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleSkillCreated}
      />

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
