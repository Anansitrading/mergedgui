/**
 * CategorySelect Component
 * Dropdown for selecting skill category with descriptions
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { skillCategories } from '../../lib/skillValidation';
import type { SkillCategory } from '../../types/skills';

interface CategorySelectProps {
  value: SkillCategory;
  onChange: (value: SkillCategory) => void;
  error?: string;
  disabled?: boolean;
}

export function CategorySelect({ value, onChange, error, disabled }: CategorySelectProps) {
  const selectedCategory = skillCategories.find((c) => c.value === value);

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        Category <span className="text-destructive">*</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SkillCategory)}
          disabled={disabled}
          className={`
            w-full appearance-none bg-secondary border rounded-lg px-4 py-2.5 pr-10
            text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
            transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-destructive' : 'border-border'}
          `}
        >
          {skillCategories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
      </div>
      {selectedCategory && (
        <p className="text-xs text-muted-foreground">{selectedCategory.description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
