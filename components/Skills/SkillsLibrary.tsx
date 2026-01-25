// SkillsLibrary Component - Main Skills Library UI
// Task 2_2: Skills Library UI
// Task 2_4: Skill Detail & Edit Integration
// Task 2_5: Skill Execution Integration

import { useState, useCallback } from 'react';
import { useSkills } from '../../hooks/useSkills';
import { SkillsHeader } from './SkillsHeader';
import { SkillsGrid } from './SkillsGrid';
import { EmptyState } from './EmptyState';
import { ExecuteSkillModal } from './ExecuteSkillModal';
import { SkillDetailModal } from './SkillDetailModal';
import type { Skill } from '../../types/skills';

interface SkillsLibraryProps {
  onCreateSkill?: () => void;
  onEditSkill?: (skill: Skill) => void;
  onRunSkill?: (skill: Skill) => void;
}

export function SkillsLibrary({
  onCreateSkill,
  onEditSkill,
  onRunSkill,
}: SkillsLibraryProps) {
  const {
    skills,
    filteredSkills,
    loading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    refetch,
    deleteSkill,
  } = useSkills();

  const [isDeleting, setIsDeleting] = useState(false);
  const [executeModalSkill, setExecuteModalSkill] = useState<Skill | null>(null);
  const [detailModalSkill, setDetailModalSkill] = useState<Skill | null>(null);

  const handleCreateClick = useCallback(() => {
    if (onCreateSkill) {
      onCreateSkill();
    } else {
      // TODO: Open create skill modal
      console.log('Create skill clicked');
    }
  }, [onCreateSkill]);

  const handleViewSkill = useCallback((skill: Skill) => {
    setDetailModalSkill(skill);
  }, []);

  const handleEditSkill = useCallback((skill: Skill) => {
    if (onEditSkill) {
      onEditSkill(skill);
    } else {
      // Open detail modal for editing
      setDetailModalSkill(skill);
    }
  }, [onEditSkill]);

  const handleRunSkill = useCallback((skill: Skill) => {
    if (onRunSkill) {
      onRunSkill(skill);
    } else {
      // Open the execute skill modal
      setExecuteModalSkill(skill);
    }
  }, [onRunSkill]);

  const handleCloseExecuteModal = useCallback(() => {
    setExecuteModalSkill(null);
  }, []);

  const handleExecutionComplete = useCallback(() => {
    // Refetch skills to update execution counts
    refetch();
  }, [refetch]);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalSkill(null);
  }, []);

  const handleSkillUpdated = useCallback((updatedSkill: Skill) => {
    // Update the local skill in the detail modal
    setDetailModalSkill(updatedSkill);
    // Refetch to update the grid
    refetch();
  }, [refetch]);

  const handleSkillDeleted = useCallback(() => {
    setDetailModalSkill(null);
    refetch();
  }, [refetch]);

  const handleDeleteSkill = useCallback(async (skill: Skill) => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        await deleteSkill(skill.id);
      } catch (err) {
        console.error('Failed to delete skill:', err);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [deleteSkill, isDeleting]);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setCategory('all');
  }, [setSearch, setCategory]);

  // Determine which empty state to show
  const hasNoSkills = !loading && !error && skills.length === 0;
  const hasNoResults = !loading && !error && skills.length > 0 && filteredSkills.length === 0;

  return (
    <>
      <div className="space-y-6">
        {/* Header with search and filters */}
        <SkillsHeader
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          onCreateClick={handleCreateClick}
          skillCount={filteredSkills.length}
        />

        {/* Content */}
        {hasNoSkills ? (
          <EmptyState type="no-skills" onCreateClick={handleCreateClick} />
        ) : hasNoResults ? (
          <EmptyState
            type="no-results"
            searchQuery={search}
            onCreateClick={handleCreateClick}
            onClearFilters={handleClearFilters}
          />
        ) : (
          <SkillsGrid
            skills={filteredSkills}
            loading={loading}
            error={error}
            onRetry={refetch}
            onRunSkill={handleRunSkill}
            onEditSkill={handleEditSkill}
            onDeleteSkill={handleDeleteSkill}
            onViewSkill={handleViewSkill}
          />
        )}
      </div>

      {/* Execute Skill Modal */}
      {executeModalSkill && (
        <ExecuteSkillModal
          skill={executeModalSkill}
          isOpen={true}
          onClose={handleCloseExecuteModal}
          onExecutionComplete={handleExecutionComplete}
        />
      )}

      {/* Skill Detail Modal */}
      {detailModalSkill && (
        <SkillDetailModal
          skill={detailModalSkill}
          isOpen={true}
          onClose={handleCloseDetailModal}
          onUpdated={handleSkillUpdated}
          onDeleted={handleSkillDeleted}
          onRun={handleRunSkill}
        />
      )}
    </>
  );
}
