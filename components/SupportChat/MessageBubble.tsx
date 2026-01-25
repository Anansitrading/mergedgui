// MessageBubble Component
// Task 3_3: Support Chat Widget UI

import { Bot, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SupportMessage } from './types';

interface MessageBubbleProps {
  message: SupportMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        'flex gap-2 animate-fade-in-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-muted-foreground border border-border'
        )}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[80%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-secondary text-foreground rounded-bl-md border border-border'
          )}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-muted-foreground mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
