// ChatWindow Component
// Task 3_3: Support Chat Widget UI
// Task 3_4: Support Chat AI Integration

import { useRef, useEffect, useState } from 'react';
import { X, Minus, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import type { SupportMessage } from './types';

interface ChatWindowProps {
  messages: SupportMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  isTyping: boolean;
  isVisible: boolean;
  error?: string | null;
}

export function ChatWindow({
  messages,
  input,
  onInputChange,
  onSend,
  onClose,
  isTyping,
  isVisible,
  error,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!userScrolledUp) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, userScrolledUp]);

  // Detect if user has scrolled up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 50;
      setUserScrolledUp(!isAtBottom);
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 w-[380px] h-[500px] max-h-[70vh]',
        'bg-card border border-border rounded-2xl shadow-2xl',
        'flex flex-col overflow-hidden',
        'transition-all duration-300 ease-out origin-bottom-right',
        'z-[9999]',
        // Mobile responsive
        'max-sm:fixed max-sm:inset-0 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:rounded-none max-sm:bottom-0 max-sm:right-0',
        isVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">K</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Kijko Support</h3>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden max-sm:flex"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20 flex items-center gap-2">
          <AlertCircle size={14} className="text-destructive shrink-0" />
          <span className="text-xs text-destructive">{error}</span>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={isTyping}
        placeholder="Ask Kijko anything..."
      />
    </div>
  );
}
