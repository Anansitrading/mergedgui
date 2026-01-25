// SkillsHeader Component - Header with search, filter, and create button
// Task 2_2: Skills Library UI

import { Search, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { skillCategories } from '../../lib/skillValidation';
import type { SkillCategory } from '../../types/skills';

interface SkillsHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: SkillCategory | 'all';
  onCategoryChange: (value: SkillCategory | 'all') => void;
  onCreateClick: () => void;
  skillCount: number;
}

export function SkillsHeader({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onCreateClick,
  skillCount,
}: SkillsHeaderProps) {
  const categoryOptions: { value: SkillCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Categories' },
    ...skillCategories.map(c => ({ value: c.value, label: c.label })),
  ];

  return (
    <div className="space-y-4">
      {/* Title Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skills Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {skillCount} {skillCount === 1 ? 'skill' : 'skills'} available
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          <Plus size={18} />
          <span>Create new skill</span>
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as SkillCategory | 'all')}
            className={cn(
              'appearance-none px-4 py-2 pr-10 bg-muted/50 border border-border rounded-lg',
              'text-sm text-foreground cursor-pointer',
              'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20',
              'transition-all'
            )}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-card text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}
