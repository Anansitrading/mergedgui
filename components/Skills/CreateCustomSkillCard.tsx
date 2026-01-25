import { Plus, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CreateCustomSkillCardProps {
  onClick: () => void;
}

export function CreateCustomSkillCard({ onClick }: CreateCustomSkillCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 rounded-xl p-6',
        'hover:border-primary/50 hover:from-primary/15 hover:to-primary/10',
        'transition-all duration-200 text-left w-full',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
      )}
    >
      {/* Icon */}
      <div className="flex items-center justify-center w-12 h-12 bg-primary/20 rounded-xl mb-4 group-hover:bg-primary/30 transition-colors">
        <Plus size={24} className="text-primary" />
      </div>

      {/* Content */}
      <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
        Create Custom Skill
        <Sparkles size={16} className="text-primary" />
      </h3>
      <p className="text-sm text-muted-foreground">
        Build your own AI-powered skill with custom prompts, inputs, and configurations.
      </p>

      {/* Hover effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity',
          'bg-gradient-to-r from-primary/5 to-transparent pointer-events-none'
        )}
      />
    </button>
  );
}
