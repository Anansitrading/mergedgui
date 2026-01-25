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

1. [ ] Create SupportChat main component
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

2. [ ] Create ChatBubble component (collapsed state)
   ```typescript
   // Floating button
   <button className="support-bubble">
     <MessageCircle size={24} />
     {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
   </button>
   ```

3. [ ] Create ChatWindow component (expanded state)
   - Header with title and close button
   - Messages area with scroll
   - Input area with send button

4. [ ] Create MessageBubble component
   ```typescript
   interface MessageBubbleProps {
     message: Message;
     isUser: boolean;
   }
   // Different styling for user vs assistant
   // Timestamp display
   // Message content with markdown support
   ```

5. [ ] Create TypingIndicator component
   - Animated dots
   - Shows when AI is responding

6. [ ] Implement animations
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

7. [ ] Create auto-scroll behavior
   - Scroll to bottom on new message
   - Smooth scroll animation
   - Don't auto-scroll if user scrolled up

8. [ ] Implement responsive design
   - Desktop: 380x600px window
   - Mobile: Full-screen or bottom sheet
   - Tablet: Adjusted dimensions

9. [ ] Style with existing design tokens
   - Match dark theme
   - Use existing colors
   - Consistent with app styling

---

## Verification Requirements

**Type:** PLAYWRIGHT_SCREENSHOT + PLAYWRIGHT_E2E

**Requirements:**
- [ ] Chat bubble visible in bottom-right corner
- [ ] Click opens chat window with smooth animation
- [ ] Messages display correctly (user vs assistant)
- [ ] Input field accepts text and Enter key
- [ ] Send button functional
- [ ] Auto-scroll to latest message
- [ ] Close button collapses to bubble
- [ ] Responsive on mobile

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

- [ ] `components/SupportChat/SupportChat.tsx` (create)
- [ ] `components/SupportChat/ChatBubble.tsx` (create)
- [ ] `components/SupportChat/ChatWindow.tsx` (create)
- [ ] `components/SupportChat/MessageBubble.tsx` (create)
- [ ] `components/SupportChat/ChatInput.tsx` (create)
- [ ] `components/SupportChat/TypingIndicator.tsx` (create)
- [ ] `components/SupportChat/index.tsx` (create)
- [ ] `App.tsx` (modify - add SupportChat)
- [ ] `styles/support-chat.css` (create if needed)

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

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
