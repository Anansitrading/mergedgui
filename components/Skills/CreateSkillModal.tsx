/**
 * CreateSkillModal Component
 * Modal wrapper for creating new skills with optional template selection
 * Task 3_5: Analytics & Polish - Added template selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';
import { SkillForm } from './SkillForm';
import { TemplateSelector } from './TemplateSelector';
import { createSkill, isSkillsApiError } from '../../services/skillsApi';
import type { SkillFormValues } from '../../lib/skillValidation';
import type { Skill, CreateSkillRequest } from '../../types/skills';
import type { SkillTemplate } from '../../lib/skillTemplates';

interface CreateSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (skill: Skill) => void;
  initialTemplate?: SkillTemplate;
  skipTemplateSelection?: boolean;
}

type FeedbackState = {
  type: 'success' | 'error';
  message: string;
} | null;

type Step = 'template' | 'form';

export function CreateSkillModal({
  isOpen,
  onClose,
  onCreated,
  initialTemplate,
  skipTemplateSelection = false,
}: CreateSkillModalProps) {
  const [step, setStep] = useState<Step>(skipTemplateSelection ? 'form' : 'template');
  const [selectedTemplate, setSelectedTemplate] = useState<SkillTemplate | null>(
    initialTemplate || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setIsLoading(false);
      setStep(skipTemplateSelection ? 'form' : 'template');
      setSelectedTemplate(initialTemplate || null);
    }
  }, [isOpen, skipTemplateSelection, initialTemplate]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Prevent body scroll when modal is open
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

  // Convert form values to API request
  const formValuesToRequest = useCallback((values: SkillFormValues): CreateSkillRequest => {
    return {
      name: values.name,
      description: values.description || undefined,
      category: values.category,
      promptTemplate: values.promptTemplate,
      model: values.model,
      parameters: {
        temperature: values.temperature,
        max_tokens: values.maxTokens,
      },
      outputFormat: values.outputFormat,
      isActive: values.isActive,
    };
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback((template: SkillTemplate) => {
    setSelectedTemplate(template);
    setStep('form');
  }, []);

  // Handle start from scratch
  const handleStartFromScratch = useCallback(() => {
    setSelectedTemplate(null);
    setStep('form');
  }, []);

  // Handle back to template selection
  const handleBackToTemplates = useCallback(() => {
    setStep('template');
  }, []);

  // Handle form submission
  const handleSubmit = async (values: SkillFormValues) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const request = formValuesToRequest(values);
      const skill = await createSkill(request);

      setFeedback({
        type: 'success',
        message: `Skill "${skill.name}" created successfully!`,
      });

      // Brief delay to show success message before closing
      setTimeout(() => {
        onCreated(skill);
        onClose();
      }, 800);
    } catch (error) {
      const message = isSkillsApiError(error)
        ? error.message
        : 'An unexpected error occurred. Please try again.';

      setFeedback({
        type: 'error',
        message,
      });
      setIsLoading(false);
    }
  };

  // Convert template to initial form values
  const getInitialFormValues = (): Partial<SkillFormValues> | undefined => {
    if (!selectedTemplate) return undefined;

    return {
      name: selectedTemplate.name,
      description: selectedTemplate.description,
      category: selectedTemplate.category,
      promptTemplate: selectedTemplate.promptTemplate,
      model: selectedTemplate.suggestedModel,
      temperature: selectedTemplate.suggestedTemperature,
      maxTokens: selectedTemplate.suggestedMaxTokens,
      outputFormat: selectedTemplate.outputFormat,
      isActive: true,
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-skill-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-8 overflow-hidden">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            {step === 'form' && !skipTemplateSelection && (
              <button
                onClick={handleBackToTemplates}
                disabled={isLoading}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 mr-2"
                aria-label="Back to templates"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h2
              id="create-skill-title"
              className="text-lg font-semibold text-foreground flex items-center gap-2"
            >
              <Sparkles size={20} className="text-primary" />
              {step === 'template' ? 'Create New Skill' : selectedTemplate ? `New: ${selectedTemplate.name}` : 'Create Custom Skill'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`
              flex items-center gap-2 px-4 py-3 text-sm
              ${
                feedback.type === 'success'
                  ? 'bg-green-500/10 text-green-500 border-b border-green-500/20'
                  : 'bg-destructive/10 text-destructive border-b border-destructive/20'
              }
            `}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <AlertCircle size={16} />
            )}
            {feedback.message}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {step === 'template' ? (
            <TemplateSelector
              onSelectTemplate={handleSelectTemplate}
              onStartFromScratch={handleStartFromScratch}
              selectedTemplateId={selectedTemplate?.id}
            />
          ) : (
            <SkillForm
              initialValues={getInitialFormValues()}
              onSubmit={handleSubmit}
              onCancel={onClose}
              submitLabel="Create Skill"
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
