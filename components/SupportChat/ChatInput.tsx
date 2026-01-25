// ChatInput Component
// Task 3_3: Support Chat Widget UI

import { Send } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-border bg-card">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm',
          'text-foreground placeholder-muted-foreground',
          'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
          'transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className={cn(
          'p-2 rounded-lg transition-all duration-150',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active-press'
        )}
        title="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
}
