// Markdown Instructions Preview Component
// Shows live markdown preview of the skill instructions

import { cn } from '../../../utils/cn';
import { MarkdownRenderer } from '../MarkdownRenderer';
import type { SkillDraft } from '../../../types/skillDraft';

interface MarkdownPreviewProps {
  draft: SkillDraft;
  className?: string;
}

export function MarkdownPreview({ draft, className }: MarkdownPreviewProps) {
  const markdownContent = generateMarkdownContent(draft);

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-card border border-green-500/30 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50">
        <h3 className="text-sm font-medium text-foreground">
          Markdown Instructions Preview
        </h3>
      </div>

      {/* Markdown Content */}
      <div className="flex-1 overflow-auto p-4">
        {markdownContent ? (
          <MarkdownRenderer content={markdownContent} />
        ) : (
          <div className="text-muted-foreground text-sm italic">
            Start a conversation to build your skill...
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Generate markdown content from draft
 */
function generateMarkdownContent(draft: SkillDraft): string {
  const lines: string[] = [];

  // Title
  if (draft.name) {
    lines.push(`# ${draft.name}`);
    lines.push('');
  }

  // Description
  if (draft.description) {
    lines.push(draft.description);
    lines.push('');
  }

  // Dependencies section
  if (draft.dependencies.length > 0) {
    lines.push('## Dependencies');
    lines.push('');
    draft.dependencies.forEach((dep) => {
      lines.push(`- ${dep}`);
    });
    lines.push('');
  }

  // Metadata badges
  if (draft.trigger || draft.scope || draft.tags.length > 0) {
    const badges: string[] = [];

    if (draft.trigger) {
      badges.push(`**Trigger:** ${draft.trigger}`);
    }
    if (draft.scope) {
      badges.push(`**Scope:** ${draft.scope}`);
    }

    if (badges.length > 0) {
      lines.push(badges.join(' | '));
      lines.push('');
    }

    if (draft.tags.length > 0) {
      lines.push(`**Tags:** ${draft.tags.map((t) => `\`${t}\``).join(' ')}`);
      lines.push('');
    }
  }

  // Instructions
  if (draft.instructions) {
    lines.push('## Instructions');
    lines.push('');
    lines.push(draft.instructions);
  }

  return lines.join('\n');
}
