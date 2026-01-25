// SupportChat Main Component
// Task 3_3: Support Chat Widget UI
// Task 3_4: Support Chat AI Integration

import { useState, useCallback } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';
import { useSupportChat } from '../../hooks/useSupportChat';

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearError,
  } = useSupportChat({
    enableStreaming: false, // Can be enabled for streaming responses
    onError: (err) => {
      console.error('Support chat error:', err);
    },
  });

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) {
        // Opening chat - clear unread count and any errors
        setUnreadCount(0);
        clearError();
      }
      return !prev;
    });
  }, [clearError]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || isStreaming) return;

    const messageContent = input.trim();
    setInput('');

    await sendMessage(messageContent);

    // Increment unread if chat is closed (for responses that arrive while closed)
    if (!isOpen) {
      setUnreadCount((prev) => prev + 1);
    }
  }, [input, isLoading, isStreaming, isOpen, sendMessage]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
  }, []);

  // Show typing indicator when loading or streaming
  const isTyping = isLoading || isStreaming;

  return (
    <>
      <ChatBubble
        onClick={handleToggle}
        unreadCount={unreadCount}
        isOpen={isOpen}
      />
      <ChatWindow
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSend={handleSend}
        onClose={handleToggle}
        isTyping={isTyping}
        isVisible={isOpen}
        error={error}
      />
    </>
  );
}
