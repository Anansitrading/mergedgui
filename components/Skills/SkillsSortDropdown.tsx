import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export type SkillsSortOption = 'most-used' | 'recent' | 'alphabetical';

interface SkillsSortDropdownProps {
  value: SkillsSortOption;
  onChange: (value: SkillsSortOption) => void;
}

const SORT_OPTIONS: { value: SkillsSortOption; label: string }[] = [
  { value: 'most-used', label: 'Most Used' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'alphabetical', label: 'A-Z' },
];

export function SkillsSortDropdown({ value, onChange }: SkillsSortDropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SkillsSortOption)}
        className={cn(
          'appearance-none px-3 py-1.5 pr-8 bg-muted/50 border border-border rounded-lg',
          'text-sm text-foreground cursor-pointer',
          'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20',
          'transition-all'
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-card text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>
  );
}
