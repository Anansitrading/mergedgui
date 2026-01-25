/**
 * ModelSelect Component
 * Dropdown for selecting AI model with descriptions
 */

import React from 'react';
import { ChevronDown, Cpu } from 'lucide-react';
import { availableModels } from '../../lib/skillValidation';

interface ModelSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function ModelSelect({ value, onChange, error, disabled }: ModelSelectProps) {
  const selectedModel = availableModels.find((m) => m.value === value);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        <span className="flex items-center gap-2">
          <Cpu size={14} className="text-muted-foreground" />
          AI Model <span className="text-destructive">*</span>
        </span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`
            w-full appearance-none bg-secondary border rounded-lg px-4 py-2.5 pr-10
            text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-destructive' : 'border-border'}
          `}
        >
          {availableModels.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      {selectedModel && (
        <p className="text-xs text-muted-foreground">{selectedModel.description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
