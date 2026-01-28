// ChatBubble Component (Floating Button)
// Task 3_3: Support Chat Widget UI

import { MessageCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatBubbleProps {
  onClick: () => void;
  unreadCount: number;
  isOpen: boolean;
}

export function ChatBubble({ onClick, unreadCount, isOpen }: ChatBubbleProps) {
  return (
    // Invisible hover area - larger zone to detect mouse proximity
    <div
      className={cn(
        'fixed bottom-0 right-0 w-24 h-24',
        'z-[9998]',
        'group',
        isOpen ? 'pointer-events-none' : ''
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          'absolute bottom-4 w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'shadow-lg hover:shadow-xl',
          'transition-all duration-300 ease-out',
          'hover:scale-105 active:scale-95',
          'glow-blue',
          // Start mostly hidden (only ~12px visible), slide in on hover
          '-right-10 group-hover:right-4',
          isOpen ? 'opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
        )}
        aria-label={unreadCount > 0 ? `Open chat (${unreadCount} unread)` : 'Open chat'}
      >
        <MessageCircle size={24} />

        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <span
            className={cn(
              'absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5',
              'bg-destructive text-destructive-foreground',
              'rounded-full text-xs font-bold',
              'flex items-center justify-center',
              'animate-scale-in'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Pulse ring animation - only show when hovering */}
        <span
          className={cn(
            'absolute inset-0 rounded-full bg-primary',
            'animate-ping opacity-0 group-hover:opacity-20',
            'transition-opacity duration-300',
            isOpen ? 'hidden' : ''
          )}
          style={{ animationDuration: '2s' }}
        />
      </button>
    </div>
  );
}
