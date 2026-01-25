// SkillReflexesTab Component - Manage reflexes for a skill
// Task 3_2: Reflexes Implementation

import { useState, useCallback } from 'react';
import { Zap, Plus, Loader2, AlertCircle, Play, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { ReflexCard } from './ReflexCard';
import { ReflexConfigModal } from './ReflexConfigModal';
import { useReflexes } from '../../hooks/useReflexes';
import type { Reflex, CreateReflexRequest, UpdateReflexRequest } from '../../types/skills';

interface SkillReflexesTabProps {
  skillId: string;
}

interface DeleteConfirmState {
  isOpen: boolean;
  reflex: Reflex | null;
  isDeleting: boolean;
}

interface TestResultState {
  isOpen: boolean;
  reflex: Reflex | null;
  isRunning: boolean;
  result: {
    success: boolean;
    conditionsMatch: boolean;
    executionResult?: {
      output: string;
      tokensUsed: number;
      durationMs: number;
    };
    error?: string;
  } | null;
}

export function SkillReflexesTab({ skillId }: SkillReflexesTabProps) {
  const {
    reflexes,
    loading,
    error,
    create,
    update,
    remove,
    toggle,
    test,
    resetErrors,
    regenerateSecret,
    refetch,
    clearError,
  } = useReflexes({ skillId });

  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    reflex: Reflex | null;
  }>({ isOpen: false, reflex: null });

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    isOpen: false,
    reflex: null,
    isDeleting: false,
  });

  const [testResult, setTestResult] = useState<TestResultState>({
    isOpen: false,
    reflex: null,
    isRunning: false,
    result: null,
  });

  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Handle create/edit modal
  const handleOpenCreate = () => {
    setConfigModal({ isOpen: true, reflex: null });
  };

  const handleOpenEdit = (reflex: Reflex) => {
    setConfigModal({ isOpen: true, reflex });
  };

  const handleCloseModal = () => {
    setConfigModal({ isOpen: false, reflex: null });
  };

  // Handle save (create or update)
  const handleSave = useCallback(
    async (request: CreateReflexRequest | UpdateReflexRequest) => {
      if (configModal.reflex) {
        // Update existing
        await update(configModal.reflex.id, request as UpdateReflexRequest);
      } else {
        // Create new
        await create(request as CreateReflexRequest);
      }
    },
    [configModal.reflex, create, update]
  );

  // Handle regenerate secret
  const handleRegenerateSecret = useCallback(
    async (reflexId: string) => {
      await regenerateSecret(reflexId);
      await refetch();
    },
    [regenerateSecret, refetch]
  );

  // Handle delete
  const handleOpenDelete = (reflex: Reflex) => {
    setDeleteConfirm({ isOpen: true, reflex, isDeleting: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.reflex) return;

    setDeleteConfirm((prev) => ({ ...prev, isDeleting: true }));

    try {
      await remove(deleteConfirm.reflex.id);
      setDeleteConfirm({ isOpen: false, reflex: null, isDeleting: false });
    } catch {
      setDeleteConfirm((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ isOpen: false, reflex: null, isDeleting: false });
  };

  // Handle toggle
  const handleToggle = async (reflex: Reflex, isActive: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(reflex.id));
    try {
      await toggle(reflex.id, isActive);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(reflex.id);
        return next;
      });
    }
  };

  // Handle test
  const handleTest = async (reflex: Reflex) => {
    setTestResult({
      isOpen: true,
      reflex,
      isRunning: true,
      result: null,
    });

    try {
      const result = await test(reflex.id, {
        test: true,
        timestamp: new Date().toISOString(),
        data: { sample: 'payload' },
      });
      setTestResult((prev) => ({
        ...prev,
        isRunning: false,
        result,
      }));
    } catch (err) {
      setTestResult((prev) => ({
        ...prev,
        isRunning: false,
        result: {
          success: false,
          conditionsMatch: false,
          error: err instanceof Error ? err.message : 'Test failed',
        },
      }));
    }
  };

  const handleCloseTestResult = () => {
    setTestResult({
      isOpen: false,
      reflex: null,
      isRunning: false,
      result: null,
    });
  };

  // Handle reset errors
  const handleResetErrors = async (reflex: Reflex) => {
    await resetErrors(reflex.id);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 size={32} className="text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading reflexes...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20 mb-4">
          <AlertCircle size={32} className="text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Failed to load reflexes
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{error}</p>
        <button
          onClick={() => {
            clearError();
            refetch();
          }}
          className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (reflexes.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-muted/50 rounded-xl border border-border mb-4">
            <Zap size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Event Triggers
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Set up reflexes to trigger this skill automatically when specific
            events occur, like webhooks, emails, or file changes.
          </p>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Create Reflex
          </button>
        </div>

        <ReflexConfigModal
          skillId={skillId}
          isOpen={configModal.isOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </>
    );
  }

  // List of reflexes
  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Event Triggers ({reflexes.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Automatic skill execution based on events
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Reflex
          </button>
        </div>

        {/* Reflex Cards */}
        <div className="grid gap-3">
          {reflexes.map((reflex) => (
            <ReflexCard
              key={reflex.id}
              reflex={reflex}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onTest={handleTest}
              onToggle={handleToggle}
              onResetErrors={handleResetErrors}
              isToggling={togglingIds.has(reflex.id)}
            />
          ))}
        </div>
      </div>

      {/* Config Modal */}
      <ReflexConfigModal
        skillId={skillId}
        reflex={configModal.reflex || undefined}
        isOpen={configModal.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        onRegenerateSecret={handleRegenerateSecret}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && deleteConfirm.reflex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={deleteConfirm.isDeleting ? undefined : handleCancelDelete}
          />
          <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Delete Reflex
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this reflex? This action cannot be
              undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={deleteConfirm.isDeleting}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteConfirm.isDeleting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteConfirm.isDeleting && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Result Dialog */}
      {testResult.isOpen && testResult.reflex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={testResult.isRunning ? undefined : handleCloseTestResult}
          />
          <div className="relative z-10 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Play size={20} className="text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Test Reflex
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {testResult.isRunning ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 size={32} className="text-primary animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Running test execution...
                  </p>
                </div>
              ) : testResult.result ? (
                <div className="space-y-4">
                  {/* Status */}
                  <div
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg',
                      testResult.result.success
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-destructive/10 border border-destructive/20'
                    )}
                  >
                    {testResult.result.success ? (
                      <CheckCircle2 size={24} className="text-green-400" />
                    ) : (
                      <XCircle size={24} className="text-destructive" />
                    )}
                    <div>
                      <h4
                        className={cn(
                          'font-medium',
                          testResult.result.success
                            ? 'text-green-400'
                            : 'text-destructive'
                        )}
                      >
                        {testResult.result.success
                          ? 'Test Successful'
                          : 'Test Failed'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testResult.result.conditionsMatch
                          ? 'Conditions matched - skill would execute'
                          : 'Conditions did not match'}
                      </p>
                    </div>
                  </div>

                  {/* Execution Result */}
                  {testResult.result.executionResult && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">
                        Execution Result
                      </h4>
                      <pre className="p-3 bg-muted rounded-lg text-xs text-foreground overflow-x-auto max-h-48 overflow-y-auto">
                        {testResult.result.executionResult.output}
                      </pre>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          Tokens: {testResult.result.executionResult.tokensUsed}
                        </span>
                        <span>
                          Duration: {testResult.result.executionResult.durationMs}ms
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error */}
                  {testResult.result.error && (
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-sm text-destructive">
                        {testResult.result.error}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {!testResult.isRunning && (
              <div className="flex items-center justify-end px-6 py-4 border-t border-border">
                <button
                  onClick={handleCloseTestResult}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
