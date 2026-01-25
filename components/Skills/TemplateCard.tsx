/**
 * TemplateCard Component
 * Displays a skill template card for selection
 * Task 3_5: Analytics & Polish
 */

import {
  FileCode,
  Mail,
  Database,
  Megaphone,
  FileText,
  BarChart3,
  ListTodo,
  FileSearch,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SkillTemplate } from '../../lib/skillTemplates';
import type { SkillCategory } from '../../types/skills';

interface TemplateCardProps {
  template: SkillTemplate;
  onClick: () => void;
  isSelected?: boolean;
}

const CATEGORY_ICONS: Record<SkillCategory, typeof FileCode> = {
  analysis: BarChart3,
  generation: FileText,
  transformation: Database,
  communication: Mail,
  automation: ListTodo,
  custom: FileSearch,
};

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  analysis: 'bg-blue-500/10 text-blue-500',
  generation: 'bg-purple-500/10 text-purple-500',
  transformation: 'bg-orange-500/10 text-orange-500',
  communication: 'bg-green-500/10 text-green-500',
  automation: 'bg-yellow-500/10 text-yellow-500',
  custom: 'bg-gray-500/10 text-gray-500',
};

export function TemplateCard({ template, onClick, isSelected }: TemplateCardProps) {
  const Icon = CATEGORY_ICONS[template.category] || FileCode;
  const colorClass = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.custom;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg border transition-all',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20',
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg shrink-0', colorClass)}>
          <Icon size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{template.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {template.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
