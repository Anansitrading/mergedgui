/**
 * DynamicInputForm Component
 * Generates form fields based on skill's input schema
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { InputSchemaField } from '../../types/skills';
import { cn } from '../../utils/cn';

interface DynamicInputFormProps {
  schema: InputSchemaField[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function DynamicInputForm({
  schema,
  values,
  onChange,
  errors = {},
  disabled = false,
}: DynamicInputFormProps) {
  const handleFieldChange = (name: string, value: unknown) => {
    onChange({
      ...values,
      [name]: value,
    });
  };

  if (!schema || schema.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">This skill has no input variables.</p>
        <p className="text-xs mt-1">Click execute to run the skill directly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {schema.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
          error={errors[field.name]}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

interface FieldRendererProps {
  field: InputSchemaField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

function FieldRenderer({ field, value, onChange, error, disabled }: FieldRendererProps) {
  const baseInputClasses = cn(
    'w-full bg-secondary border rounded-lg px-4 py-2.5',
    'text-foreground placeholder:text-muted-foreground',
    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
    'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
    error ? 'border-destructive' : 'border-border'
  );

  const renderField = () => {
    switch (field.type) {
      case 'string':
        // Use textarea for longer text inputs
        const isLongText = field.description?.toLowerCase().includes('code') ||
                          field.description?.toLowerCase().includes('content') ||
                          field.description?.toLowerCase().includes('text') ||
                          field.name.toLowerCase().includes('code') ||
                          field.name.toLowerCase().includes('content') ||
                          field.name.toLowerCase().includes('body');

        if (isLongText) {
          return (
            <textarea
              value={String(value ?? '')}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.description || `Enter ${field.name}`}
              disabled={disabled}
              rows={6}
              className={cn(baseInputClasses, 'resize-y min-h-[120px] font-mono text-sm')}
            />
          );
        }

        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value !== undefined && value !== null ? Number(value) : ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.description || `Enter ${field.name}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(value)}
              onClick={() => !disabled && onChange(!value)}
              disabled={disabled}
              className={cn(
                'relative inline-flex w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0',
                value ? 'bg-primary' : 'bg-muted',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
                  value && 'translate-x-5'
                )}
              />
            </button>
            <span className="text-sm text-muted-foreground">
              {value ? 'Yes' : 'No'}
            </span>
          </div>
        );

      case 'array':
        // Simple comma-separated input for arrays
        const arrayValue = Array.isArray(value) ? value.join(', ') : '';
        return (
          <div className="space-y-1">
            <input
              type="text"
              value={arrayValue}
              onChange={(e) => {
                const items = e.target.value
                  .split(',')
                  .map(s => s.trim())
                  .filter(s => s.length > 0);
                onChange(items);
              }}
              placeholder={field.description || `Enter ${field.name} (comma-separated)`}
              disabled={disabled}
              className={baseInputClasses}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple values with commas
            </p>
          </div>
        );

      case 'object':
        // JSON input for objects
        const objectValue = typeof value === 'object' && value !== null
          ? JSON.stringify(value, null, 2)
          : '';
        return (
          <div className="space-y-1">
            <textarea
              value={objectValue}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(parsed);
                } catch {
                  // Keep the raw value if it's not valid JSON yet
                  onChange(e.target.value);
                }
              }}
              placeholder={field.description || `Enter ${field.name} as JSON`}
              disabled={disabled}
              rows={4}
              className={cn(baseInputClasses, 'font-mono text-sm')}
            />
            <p className="text-xs text-muted-foreground">
              Enter valid JSON object
            </p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={String(value ?? '')}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.description || `Enter ${field.name}`}
            disabled={disabled}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        <span className="flex items-center gap-2">
          {formatFieldName(field.name)}
          {field.required && <span className="text-destructive">*</span>}
        </span>
      </label>

      {field.description && field.type !== 'boolean' && (
        <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
      )}

      {renderField()}

      {error && (
        <div className="flex items-center gap-1.5 text-destructive text-xs mt-1">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function formatFieldName(name: string): string {
  // Convert camelCase or snake_case to Title Case
  return name
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

export default DynamicInputForm;
