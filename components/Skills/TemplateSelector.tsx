/**
 * TemplateSelector Component
 * Allows users to select a skill template or start from scratch
 * Task 3_5: Analytics & Polish
 */

import { useState, useMemo } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { TemplateCard } from './TemplateCard';
import { SKILL_TEMPLATES, searchTemplates, type SkillTemplate } from '../../lib/skillTemplates';
import { cn } from '../../utils/cn';
import type { SkillCategory } from '../../types/skills';

interface TemplateSelectorProps {
  onSelectTemplate: (template: SkillTemplate) => void;
  onStartFromScratch: () => void;
  selectedTemplateId?: string;
}

const CATEGORY_FILTERS: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'generation', label: 'Generation' },
  { value: 'transformation', label: 'Transformation' },
  { value: 'communication', label: 'Communication' },
  { value: 'automation', label: 'Automation' },
];

export function TemplateSelector({
  onSelectTemplate,
  onStartFromScratch,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | 'all'>('all');

  const filteredTemplates = useMemo(() => {
    let templates = SKILL_TEMPLATES;

    // Apply search filter
    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      templates = templates.filter((t) => t.category === categoryFilter);
    }

    return templates;
  }, [searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles size={24} />
        </div>
        <h2 className="text-xl font-semibold text-foreground">
          Choose a Template
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Start from a pre-built template or create your own skill from scratch
        </p>
      </div>

      {/* Start from scratch option */}
      <button
        onClick={onStartFromScratch}
        className={cn(
          'w-full p-4 rounded-lg border-2 border-dashed transition-all',
          'hover:border-primary hover:bg-primary/5',
          'focus:outline-none focus:ring-2 focus:ring-primary/20',
          'flex items-center justify-center gap-3'
        )}
      >
        <div className="p-2 rounded-lg bg-muted">
          <Plus size={20} className="text-muted-foreground" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Start from Scratch</p>
          <p className="text-sm text-muted-foreground">
            Create a custom skill with your own configuration
          </p>
        </div>
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or choose a template
          </span>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setCategoryFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
                categoryFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onClick={() => onSelectTemplate(template)}
              isSelected={selectedTemplateId === template.id}
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-muted-foreground">No templates found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search or{' '}
              <button
                onClick={onStartFromScratch}
                className="text-primary hover:underline"
              >
                start from scratch
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
