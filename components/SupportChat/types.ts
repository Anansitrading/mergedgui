// Support Chat Types
// Task 3_3: Support Chat Widget UI

export interface SupportMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SupportChatState {
  isOpen: boolean;
  messages: SupportMessage[];
  input: string;
  isTyping: boolean;
  unreadCount: number;
}
