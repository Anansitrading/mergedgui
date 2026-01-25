// EmptyState Component - Shown when no skills exist or no search results
// Task 2_2: Skills Library UI

import { Sparkles, SearchX } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-skills' | 'no-results';
  searchQuery?: string;
  onCreateClick: () => void;
  onClearFilters?: () => void;
}

export function EmptyState({ type, searchQuery, onCreateClick, onClearFilters }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="p-4 bg-muted/50 rounded-xl border border-border mb-4">
          <SearchX size={40} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No skills found</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          {searchQuery
            ? `No skills match "${searchQuery}". Try a different search term or clear your filters.`
            : 'No skills match your current filters.'}
        </p>
        <div className="flex items-center gap-3">
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg-secondary hover:bg-muted text-foreground text-sm font-medium rounded-lg border border-border transition-colors"
            >
              Clear filters
            </button>
          )}
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Create new skill
          </button>
        </div>
      </div>
    );
  }

  // No skills exist yet
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4">
        <Sparkles size={40} className="text-primary" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No skills yet</h3>
      <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
        Create your first AI skill to automate tasks, generate content, or analyze data.
        Skills are reusable prompts that you can run anytime.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
      >
        <Sparkles size={18} />
        Create your first skill
      </button>
    </div>
  );
}
