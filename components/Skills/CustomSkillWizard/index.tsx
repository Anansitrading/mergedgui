import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useSkillWizard } from '../../../hooks/useSkillWizard';
import { createSkill, testSkill, isSkillsApiError } from '../../../services/skillsApi';
import { WizardStepIndicator } from './WizardStepIndicator';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PromptConfigStep } from './steps/PromptConfigStep';
import { InputFieldsStep } from './steps/InputFieldsStep';
import { ModelSettingsStep } from './steps/ModelSettingsStep';
import { TestReviewStep } from './steps/TestReviewStep';
import type { Skill, CreateSkillRequest } from '../../../types/skills';

interface CustomSkillWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (skill: Skill) => void;
}

export function CustomSkillWizard({ isOpen, onClose, onCreated }: CustomSkillWizardProps) {
  const {
    state,
    nextStep,
    prevStep,
    goToStep,
    updateField,
    updateInputSchema,
    setLoading,
    setTesting,
    setTestResult,
    validateStep,
    setErrors,
    reset,
  } = useSkillWizard();

  const { currentStep, formData, stepValidation, isLoading, isTesting, testResult, errors } = state;

  // Reset wizard state when modal opens
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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

  // Handle test execution
  const handleTest = useCallback(async (testInputs: Record<string, unknown>) => {
    setTesting(true);
    setTestResult(null);

    try {
      // Build the prompt from template
      let userPrompt = formData.userPromptTemplate;
      Object.entries(testInputs).forEach(([key, value]) => {
        userPrompt = userPrompt.replace(
          new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
          String(value)
        );
      });

      // Create a temporary skill-like object for testing
      const result = await testSkill({
        promptTemplate: userPrompt,
        systemPrompt: formData.systemPrompt,
        model: formData.model,
        parameters: {
          temperature: formData.temperature,
          max_tokens: formData.maxTokens,
        },
        input: testInputs,
      });

      setTestResult(result);
    } catch (error) {
      setTestResult({
        executionId: 'test',
        status: 'failed',
        error: isSkillsApiError(error) ? error.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  }, [formData, setTesting, setTestResult]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setErrors({});

    try {
      const request: CreateSkillRequest = {
        name: formData.name,
        description: formData.description || undefined,
        category: formData.category,
        promptTemplate: `${formData.systemPrompt}\n\n${formData.userPromptTemplate}`,
        model: formData.model,
        parameters: {
          temperature: formData.temperature,
          max_tokens: formData.maxTokens,
        },
        inputSchema: formData.inputSchema.length > 0 ? formData.inputSchema : undefined,
        outputFormat: formData.outputFormat,
        isActive: true,
      };

      const skill = await createSkill(request);
      onCreated(skill);
      onClose();
    } catch (error) {
      const message = isSkillsApiError(error)
        ? error.message
        : 'Failed to create skill. Please try again.';
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  }, [formData, setLoading, setErrors, onCreated, onClose]);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            errors={errors}
            onUpdateField={updateField}
            onValidate={(valid) => validateStep(1, valid)}
          />
        );
      case 2:
        return (
          <PromptConfigStep
            formData={formData}
            errors={errors}
            onUpdateField={updateField}
            onValidate={(valid) => validateStep(2, valid)}
          />
        );
      case 3:
        return (
          <InputFieldsStep
            formData={formData}
            errors={errors}
            onUpdateInputSchema={updateInputSchema}
            onValidate={(valid) => validateStep(3, valid)}
          />
        );
      case 4:
        return (
          <ModelSettingsStep
            formData={formData}
            errors={errors}
            onUpdateField={updateField}
            onValidate={(valid) => validateStep(4, valid)}
          />
        );
      case 5:
        return (
          <TestReviewStep
            formData={formData}
            isTesting={isTesting}
            testResult={testResult}
            onTest={handleTest}
            onValidate={(valid) => validateStep(5, valid)}
          />
        );
      default:
        return null;
    }
  };

  const canGoNext = stepValidation[currentStep];
  const isLastStep = currentStep === 5;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wizard-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-3xl mx-4 my-8 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <h2
              id="wizard-title"
              className="text-lg font-semibold text-foreground flex items-center gap-2"
            >
              <Sparkles size={20} className="text-primary" />
              Create Custom Skill
            </h2>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 pb-4">
            <WizardStepIndicator
              currentStep={currentStep}
              stepValidation={stepValidation}
              onStepClick={goToStep}
            />
          </div>
        </div>

        {/* Error Banner */}
        {errors.submit && (
          <div className="px-6 py-3 bg-destructive/10 text-destructive text-sm border-b border-destructive/20">
            {errors.submit}
          </div>
        )}

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                'text-muted-foreground hover:text-foreground hover:bg-muted',
                'disabled:opacity-50'
              )}
            >
              Cancel
            </button>

            {isLastStep ? (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext || isLoading}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'bg-primary hover:bg-primary/90 text-primary-foreground',
                  'shadow-lg shadow-primary/20 hover:shadow-primary/30',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Create Skill
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canGoNext}
                className={cn(
                  'flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-colors',
                  'bg-primary hover:bg-primary/90 text-primary-foreground',
                  'shadow-lg shadow-primary/20 hover:shadow-primary/30',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
