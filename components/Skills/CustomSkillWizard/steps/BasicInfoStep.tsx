import { useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { skillCategories } from '../../../../lib/skillValidation';
import type { WizardFormData } from '../../../../hooks/useSkillWizard';
import type { SkillCategory } from '../../../../types/skills';

interface BasicInfoStepProps {
  formData: WizardFormData;
  errors: Record<string, string>;
  onUpdateField: <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => void;
  onValidate: (valid: boolean) => void;
}

const EMOJI_OPTIONS = ['⚡', '🎯', '📝', '🔍', '💡', '🚀', '🎨', '📊', '🔧', '💬', '📧', '🤖'];

export function BasicInfoStep({
  formData,
  errors,
  onUpdateField,
  onValidate,
}: BasicInfoStepProps) {
  // Validate step
  const validateStep = useCallback(() => {
    const isValid =
      formData.name.trim().length >= 1 &&
      formData.name.trim().length <= 100 &&
      formData.description.trim().length <= 500;
    onValidate(isValid);
  }, [formData.name, formData.description, onValidate]);

  useEffect(() => {
    validateStep();
  }, [validateStep]);

  return (
    <div className="space-y-6">
      {/* Step Description */}
      <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Info size={20} className="text-primary mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground mb-1">Basic Information</h3>
          <p className="text-sm text-muted-foreground">
            Give your skill a name and description. Choose a category and icon to help organize it.
          </p>
        </div>
      </div>

      {/* Name Field */}
      <div>
        <label htmlFor="skill-name" className="block text-sm font-medium text-foreground mb-2">
          Skill Name <span className="text-destructive">*</span>
        </label>
        <input
          id="skill-name"
          type="text"
          value={formData.name}
          onChange={(e) => onUpdateField('name', e.target.value)}
          placeholder="e.g., Email Summarizer"
          maxLength={100}
          className={cn(
            'w-full px-4 py-2.5 bg-muted/50 border rounded-lg text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
            'transition-colors',
            errors.name ? 'border-destructive' : 'border-border'
          )}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.name ? (
            <span className="text-xs text-destructive">{errors.name}</span>
          ) : (
            <span className="text-xs text-muted-foreground">A short, descriptive name</span>
          )}
          <span className="text-xs text-muted-foreground">{formData.name.length}/100</span>
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label htmlFor="skill-description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          id="skill-description"
          value={formData.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="Describe what this skill does..."
          rows={3}
          maxLength={500}
          className={cn(
            'w-full px-4 py-2.5 bg-muted/50 border rounded-lg text-foreground resize-none',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
            'transition-colors',
            errors.description ? 'border-destructive' : 'border-border'
          )}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.description ? (
            <span className="text-xs text-destructive">{errors.description}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Optional but recommended</span>
          )}
          <span className="text-xs text-muted-foreground">{formData.description.length}/500</span>
        </div>
      </div>

      {/* Category and Icon Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Category Field */}
        <div>
          <label htmlFor="skill-category" className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <select
            id="skill-category"
            value={formData.category}
            onChange={(e) => onUpdateField('category', e.target.value as SkillCategory)}
            className={cn(
              'w-full px-4 py-2.5 bg-muted/50 border border-border rounded-lg text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50',
              'transition-colors cursor-pointer'
            )}
          >
            {skillCategories.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-card text-foreground">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Icon
          </label>
          <div className="flex items-center gap-2 flex-wrap p-3 bg-muted/50 border border-border rounded-lg">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => onUpdateField('icon', emoji)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center text-lg rounded-md transition-colors',
                  formData.icon === emoji
                    ? 'bg-primary/20 ring-2 ring-primary'
                    : 'hover:bg-muted'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
