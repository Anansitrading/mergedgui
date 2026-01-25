// DeleteSkillDialog Component - Confirmation dialog for skill deletion
// Task 2_4: Skill Detail & Edit

import { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Skill } from '../../types/skills';

interface DeleteSkillDialogProps {
  skill: Skill;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteSkillDialog({
  skill,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteSkillDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative z-10 w-full max-w-md',
          'bg-card border border-border rounded-xl shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <h2
              id="delete-dialog-title"
              className="text-lg font-semibold text-foreground"
            >
              Delete Skill
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p id="delete-dialog-description" className="text-foreground mb-4">
            Are you sure you want to delete{' '}
            <span className="font-semibold">"{skill.name}"</span>?
          </p>
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">
              This action cannot be undone. This will permanently delete the skill
              and all associated:
            </p>
            <ul className="mt-2 text-sm text-destructive list-disc list-inside space-y-1">
              <li>Scheduled habits</li>
              <li>Event triggers (reflexes)</li>
              <li>Execution history ({skill.executionCount} executions)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'bg-destructive hover:bg-destructive/90 text-destructive-foreground',
              'text-sm font-medium rounded-lg transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isDeleting && <Loader2 size={16} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Skill'}
          </button>
        </div>
      </div>
    </div>
  );
}
