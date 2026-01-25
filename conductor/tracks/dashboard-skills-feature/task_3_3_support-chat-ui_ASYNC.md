# Task 3_3: Support Chat Widget UI

**Phase:** 3
**Sequence:** 3
**Type:** ASYNC
**Duration:** 1-2 days
**Agent Assignment:** frontend-design:frontend-design
**Blocking:** No
**Parallel With:** [task_3_1, task_3_2]
**Story Points:** 5

---

## Dependencies

**Depends On:**
- None (can start independently in Sprint 3)

**Blocks:**
- [ ] task_3_4 (Support Chat AI Integration)

**Critical Path:** No

---

## Objective

Create a floating chat widget in the bottom-right corner for AI-powered support. Implement chat bubble, message list, input, and smooth animations.

---

## Implementation Steps

1. [x] Create SupportChat main component
   ```typescript
   // components/SupportChat/SupportChat.tsx
   export function SupportChat() {
     const [isOpen, setIsOpen] = useState(false);
     const [messages, setMessages] = useState<Message[]>([
       { role: 'assistant', content: 'Hi! How can I help you with Kijko today?' }
     ]);
     const [input, setInput] = useState('');
     const [isTyping, setIsTyping] = useState(false);
   }
   ```

2. [x] Create ChatBubble component (collapsed state)
   ```typescript
   // Floating button
   <button className="support-bubble">
     <MessageCircle size={24} />
     {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
   </button>
   ```

3. [x] Create ChatWindow component (expanded state)
   - Header with title and close button
   - Messages area with scroll
   - Input area with send button

4. [x] Create MessageBubble component
   ```typescript
   interface MessageBubbleProps {
     message: Message;
     isUser: boolean;
   }
   // Different styling for user vs assistant
   // Timestamp display
   // Message content with markdown support
   ```

5. [x] Create TypingIndicator component
   - Animated dots
   - Shows when AI is responding

6. [x] Implement animations
   ```css
   @keyframes slideUp {
     from { transform: translateY(20px); opacity: 0; }
     to { transform: translateY(0); opacity: 1; }
   }

   @keyframes pulse {
     0%, 100% { opacity: 0.4; }
     50% { opacity: 1; }
   }
   ```

7. [x] Create auto-scroll behavior
   - Scroll to bottom on new message
   - Smooth scroll animation
   - Don't auto-scroll if user scrolled up

8. [x] Implement responsive design
   - Desktop: 380x600px window
   - Mobile: Full-screen or bottom sheet
   - Tablet: Adjusted dimensions

9. [x] Style with existing design tokens
   - Match dark theme
   - Use existing colors
   - Consistent with app styling

---

## Verification Requirements

**Type:** PLAYWRIGHT_SCREENSHOT + PLAYWRIGHT_E2E

**Requirements:**
- [x] Chat bubble visible in bottom-right corner
- [x] Click opens chat window with smooth animation
- [x] Messages display correctly (user vs assistant)
- [x] Input field accepts text and Enter key
- [x] Send button functional
- [x] Auto-scroll to latest message
- [x] Close button collapses to bubble
- [x] Responsive on mobile

**Acceptance Criteria:**
- UI polished and matches design
- Animations smooth
- Mobile experience good
- Accessibility maintained

**Automation Script:**
```bash
npm run test:e2e -- --grep "support chat"
npm run test:screenshot -- --grep "chat widget"
```

---

## Enhancement Queries

**Query 1 (Priority: medium):**
```
React chat widget UI patterns with animations 2026
```

---

## Files Modified/Created

- [x] `components/SupportChat/SupportChat.tsx` (create)
- [x] `components/SupportChat/ChatBubble.tsx` (create)
- [x] `components/SupportChat/ChatWindow.tsx` (create)
- [x] `components/SupportChat/MessageBubble.tsx` (create)
- [x] `components/SupportChat/ChatInput.tsx` (create)
- [x] `components/SupportChat/TypingIndicator.tsx` (create)
- [x] `components/SupportChat/index.tsx` (create)
- [x] `components/SupportChat/types.ts` (create - added for type definitions)
- [x] `App.tsx` (modify - add SupportChat)
- [N/A] `styles/support-chat.css` (not needed - using Tailwind classes)

---

## Commit Message

```
feat(support): implement Support Chat widget UI

- Create floating chat bubble in bottom-right
- Add expandable chat window with animations
- Implement message list with user/assistant styling
- Add typing indicator and auto-scroll
- Make responsive for mobile/tablet
```

**Type:** feat

---

## Git Note

```
Task: task_3_3
Summary: Support Chat UI complete
Verification: Screenshot and E2E tests pass
Context: UI foundation for AI support feature
```

---

## Risk Assessment

**Risk Level:** LOW

**Potential Risks:**
- Risk 1: Z-index conflicts with modals → Mitigation: Use highest z-index or portal
- Risk 2: Mobile keyboard issues → Mitigation: Test on real devices

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~25,000 tokens
**Tool Calls:** 20-25 expected
**Agent Session:** 3-4 hours

---

## Status Tracking

**Status:** [x] Complete
**Assigned Agent:** Claude Opus 4.5
**Started:** 2026-01-25
**Completed:** 2026-01-25
**Checkpoint SHA:** pending commit
