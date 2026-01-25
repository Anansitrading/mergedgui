/**
 * SkillForm Component
 * Reusable form for creating and editing skills
 */

import React, { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { CategorySelect } from './CategorySelect';
import { ModelSelect } from './ModelSelect';
import { PromptEditor } from './PromptEditor';
import { ParametersPanel } from './ParametersPanel';
import {
  type SkillFormValues,
  defaultSkillFormValues,
  validateSkillForm,
  fieldValidators,
} from '../../lib/skillValidation';
import type { SkillCategory, SkillOutputFormat, Skill } from '../../types/skills';

interface SkillFormProps {
  initialValues?: Partial<SkillFormValues>;
  onSubmit: (values: SkillFormValues) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isLoading?: boolean;
  existingSkill?: Skill;
}

export function SkillForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create Skill',
  isLoading = false,
  existingSkill,
}: SkillFormProps) {
  // Form state
  const [values, setValues] = useState<SkillFormValues>({
    ...defaultSkillFormValues,
    ...initialValues,
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Touched fields (for showing errors only after blur)
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update a single field
  const updateField = useCallback(<K extends keyof SkillFormValues>(
    field: K,
    value: SkillFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    // Clear error when field is updated
    const fieldStr = field as string;
    if (errors[fieldStr]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldStr];
        return next;
      });
    }
  }, [errors]);

  // Mark field as touched
  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  // Validate a single field
  const validateField = useCallback((field: keyof typeof fieldValidators, value: string | number) => {
    const validator = fieldValidators[field];
    if (validator) {
      const error = validator(value as never);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const validation = validateSkillForm(values);

    if (validation.success === false) {
      setErrors(validation.errors);
      // Mark all fields as touched
      setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      return;
    }

    try {
      await onSubmit(validation.data);
    } catch {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Basic Info
        </h3>

        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="skill-name" className="block text-sm font-medium text-foreground">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            id="skill-name"
            type="text"
            value={values.name}
            onChange={(e) => updateField('name', e.target.value)}
            onBlur={() => {
              markTouched('name');
              validateField('name', values.name);
            }}
            disabled={isLoading}
            placeholder="e.g., Code Review Assistant"
            maxLength={100}
            className={`
              w-full bg-secondary border rounded-lg px-4 py-2.5
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              ${touched.name && errors.name ? 'border-destructive' : 'border-border'}
            `}
          />
          <div className="flex items-center justify-between">
            {touched.name && errors.name ? (
              <p className="text-xs text-destructive">{errors.name}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">{values.name.length}/100</p>
          </div>
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <label htmlFor="skill-description" className="block text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="skill-description"
            value={values.description}
            onChange={(e) => updateField('description', e.target.value)}
            onBlur={() => {
              markTouched('description');
              validateField('description', values.description);
            }}
            disabled={isLoading}
            placeholder="Briefly describe what this skill does..."
            maxLength={500}
            rows={2}
            className={`
              w-full bg-secondary border rounded-lg px-4 py-2.5
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
              transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed
              ${touched.description && errors.description ? 'border-destructive' : 'border-border'}
            `}
          />
          <div className="flex items-center justify-between">
            {touched.description && errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-muted-foreground">{values.description.length}/500</p>
          </div>
        </div>

        {/* Category and Model Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CategorySelect
            value={values.category}
            onChange={(value: SkillCategory) => updateField('category', value)}
            error={touched.category ? errors.category : undefined}
            disabled={isLoading}
          />
          <ModelSelect
            value={values.model}
            onChange={(value) => updateField('model', value)}
            error={touched.model ? errors.model : undefined}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Prompt Template Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Prompt Configuration
        </h3>

        <PromptEditor
          value={values.promptTemplate}
          onChange={(value) => updateField('promptTemplate', value)}
          error={touched.promptTemplate ? errors.promptTemplate : undefined}
          disabled={isLoading}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Advanced Parameters */}
      <ParametersPanel
        temperature={values.temperature}
        maxTokens={values.maxTokens}
        outputFormat={values.outputFormat}
        onTemperatureChange={(value) => updateField('temperature', value)}
        onMaxTokensChange={(value) => updateField('maxTokens', value)}
        onOutputFormatChange={(value: SkillOutputFormat) => updateField('outputFormat', value)}
        errors={{
          temperature: touched.temperature ? errors.temperature : undefined,
          maxTokens: touched.maxTokens ? errors.maxTokens : undefined,
          outputFormat: touched.outputFormat ? errors.outputFormat : undefined,
        }}
        disabled={isLoading}
      />

      {/* Active Toggle */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <div>
          <label className="text-sm font-medium text-foreground">Active</label>
          <p className="text-xs text-muted-foreground">Enable this skill for execution</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={values.isActive}
          onClick={() => updateField('isActive', !values.isActive)}
          disabled={isLoading}
          className={`
            relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full
            transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${values.isActive ? 'bg-primary' : 'bg-muted'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-4 w-4 transform rounded-full
              bg-white shadow-lg transition-transform duration-200
              ${values.isActive ? 'translate-x-6' : 'translate-x-1'}
              mt-1
            `}
          />
        </button>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
