// Skill Chat Input Component
// Text input for the skill builder chat

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface SkillChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function SkillChatInput({
  onSend,
  disabled = false,
  placeholder = 'Describe what you want the skill to do...',
  className,
}: SkillChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    if (!value.trim() || disabled) return;

    onSend(value.trim());
    setValue('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setValue(e.target.value);

      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    },
    []
  );

  return (
    <div
      className={cn(
        'flex items-end gap-2 p-3 border-t border-border bg-secondary/50',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        className={cn(
          'flex-1 resize-none bg-muted/50 border border-border rounded-lg',
          'px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'min-h-[40px] max-h-[120px]'
        )}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className={cn(
          'p-2.5 rounded-lg transition-colors',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary'
        )}
        title="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
