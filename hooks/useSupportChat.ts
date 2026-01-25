/**
 * useSupportChat Hook
 * Task 3_4: Support Chat AI Integration
 *
 * Manages support chat state, message sending, and AI responses
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { callClaudeWithRetry, streamClaude, isApiKeyConfigured, isClaudeApiError } from '../services/claudeApi';
import { getCachedUserSupportContext } from '../services/supportContext';
import { buildSupportPrompt, getDefaultSupportContext } from '../lib/supportPrompt';
import type { SupportMessage } from '../components/SupportChat/types';

// =============================================================================
// Types
// =============================================================================

export interface UseSupportChatOptions {
  enableStreaming?: boolean;
  onError?: (error: Error) => void;
}

export interface UseSupportChatReturn {
  messages: SupportMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
  retryLastMessage: () => Promise<void>;
}

// =============================================================================
// Constants
// =============================================================================

const STORAGE_KEY = 'kijko_support_chat_session';
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
const MAX_TOKENS = 1024;

const INITIAL_MESSAGE: SupportMessage = {
  id: generateId(),
  role: 'assistant',
  content: "Hi! I'm Kijko's AI assistant. How can I help you today?",
  timestamp: new Date(),
};

const ERROR_MESSAGES = {
  INVALID_API_KEY: "I'm having trouble connecting. Please check that your API key is configured correctly.",
  RATE_LIMITED: "I'm receiving too many requests right now. Please wait a moment and try again.",
  SERVICE_UNAVAILABLE: "The AI service is temporarily unavailable. Please try again in a few moments.",
  NETWORK_ERROR: "I couldn't connect to the server. Please check your internet connection.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

// =============================================================================
// Helpers
// =============================================================================

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

interface StoredSession {
  messages: SupportMessage[];
  timestamp: number;
}

function loadSession(): SupportMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [INITIAL_MESSAGE];

    const session: StoredSession = JSON.parse(stored);
    const now = Date.now();

    // Check if session is still valid
    if (now - session.timestamp > SESSION_TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return [INITIAL_MESSAGE];
    }

    // Restore dates from strings
    const messages = session.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));

    return messages.length > 0 ? messages : [INITIAL_MESSAGE];
  } catch {
    return [INITIAL_MESSAGE];
  }
}

function saveSession(messages: SupportMessage[]): void {
  try {
    const session: StoredSession = {
      messages,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save support chat session:', error);
  }
}

function getErrorMessage(error: unknown): string {
  if (isClaudeApiError(error)) {
    return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  if (error instanceof Error) {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// =============================================================================
// Hook
// =============================================================================

export function useSupportChat(options: UseSupportChatOptions = {}): UseSupportChatReturn {
  const { enableStreaming = false, onError } = options;

  const [messages, setMessages] = useState<SupportMessage[]>(() => loadSession());
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastUserMessageRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Save session when messages change
  useEffect(() => {
    saveSession(messages);
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isStreaming) return;

    const trimmedContent = content.trim();
    lastUserMessageRef.current = trimmedContent;
    setError(null);

    // Check if API key is configured
    if (!isApiKeyConfigured()) {
      setError('API key not configured. Please set VITE_ANTHROPIC_API_KEY in your environment.');
      return;
    }

    // Add user message
    const userMessage: SupportMessage = {
      id: generateId(),
      role: 'user',
      content: trimmedContent,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Fetch user context for personalized responses
      let context;
      try {
        context = await getCachedUserSupportContext();
      } catch {
        context = getDefaultSupportContext();
      }

      // Build conversation history for Claude
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || msg.id !== INITIAL_MESSAGE.id)
        .slice(-10) // Keep last 10 messages for context
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Add the new user message
      conversationHistory.push({
        role: 'user',
        content: trimmedContent,
      });

      const systemPrompt = buildSupportPrompt(context);

      if (enableStreaming) {
        // Streaming response
        setIsStreaming(true);

        const assistantMessageId = generateId();
        let streamedContent = '';

        setMessages(prev => [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
          },
        ]);

        const stream = streamClaude({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
          systemPrompt,
          parameters: { max_tokens: MAX_TOKENS, temperature: 0.7 },
        });

        for await (const event of stream) {
          if (event.type === 'text' && event.content) {
            streamedContent += event.content;
            setMessages(prev =>
              prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: streamedContent }
                  : msg
              )
            );
          }
        }

        setIsStreaming(false);
      } else {
        // Non-streaming response
        const response = await callClaudeWithRetry({
          model: DEFAULT_MODEL,
          messages: conversationHistory,
          systemPrompt,
          parameters: { max_tokens: MAX_TOKENS, temperature: 0.7 },
        });

        const assistantMessage: SupportMessage = {
          id: generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));

      // Add error message to chat
      const errorChatMessage: SupportMessage = {
        id: generateId(),
        role: 'assistant',
        content: `I apologize, but ${errorMessage.toLowerCase()}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, isLoading, isStreaming, enableStreaming, onError]);

  const clearMessages = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current) return;

    // Remove the last two messages (user message + error response)
    setMessages(prev => prev.slice(0, -2));

    // Retry sending
    await sendMessage(lastUserMessageRef.current);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    clearError,
    retryLastMessage,
  };
}
