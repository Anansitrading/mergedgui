# Task 3_4: Support Chat AI Integration

**Phase:** 3
**Sequence:** 4
**Type:** SEQUENTIAL
**Duration:** 1-2 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** No
**Parallel With:** []
**Story Points:** 5

---

## Dependencies

**Depends On:**
- [x] task_3_3 (Support Chat Widget UI)

**Blocks:**
- [ ] task_3_5 (Analytics & Polish)

**Critical Path:** No

---

## Objective

Integrate AI-powered chatbot with Claude API, user context injection, conversation history management, and helpful response generation.

---

## Implementation Steps

1. [ ] Create support chat API endpoint
   ```typescript
   // api/support/chat/route.ts
   export async function POST(req: Request) {
     const { message, conversation_history } = await req.json();
     const user = await getCurrentUser();

     // Fetch user context
     const context = await getUserContext(user.id);

     // Build messages array
     const messages = [
       { role: 'system', content: buildSupportPrompt(context) },
       ...conversation_history,
       { role: 'user', content: message }
     ];

     // Call Claude
     const response = await anthropic.messages.create({
       model: 'claude-3-5-sonnet-20241022',
       max_tokens: 1024,
       messages
     });

     return Response.json({
       message: response.content[0].text,
       conversation_id: generateConversationId()
     });
   }
   ```

2. [ ] Create support prompt template
   ```typescript
   // lib/supportPrompt.ts
   const SUPPORT_PROMPT = `
   You are Kijko's AI support assistant. You help users with:

   - Understanding Skills, Habits, and Reflexes
   - Creating and configuring skills
   - Troubleshooting integrations
   - Best practices for organizing projects
   - General platform questions

   Current user context:
   - Total projects: {project_count}
   - Active skills: {skills_count}
   - Recent activity: {recent_activity}

   Guidelines:
   - Be concise and actionable
   - Use friendly, conversational tone
   - Offer to help with specific tasks when relevant
   - If you don't know something, admit it
   - Reference the user's existing data when helpful
   `;
   ```

3. [ ] Create user context fetcher
   ```typescript
   // services/supportContext.ts
   async function getUserContext(userId: string) {
     const [projects, skills, executions] = await Promise.all([
       db.projects.count({ user_id: userId }),
       db.skills.count({ user_id: userId }),
       db.skill_executions.findMany({
         user_id: userId,
         limit: 5,
         orderBy: { executed_at: 'desc' }
       })
     ]);

     return {
       project_count: projects,
       skills_count: skills,
       recent_activity: formatRecentActivity(executions)
     };
   }
   ```

4. [ ] Connect UI to API
   ```typescript
   // hooks/useSupportChat.ts
   function useSupportChat() {
     const [messages, setMessages] = useState<Message[]>([]);
     const [isLoading, setIsLoading] = useState(false);
     const conversationRef = useRef<string | null>(null);

     const sendMessage = async (content: string) => {
       setIsLoading(true);
       setMessages(prev => [...prev, { role: 'user', content }]);

       try {
         const response = await fetch('/api/support/chat', {
           method: 'POST',
           body: JSON.stringify({
             message: content,
             conversation_history: messages
           })
         });

         const data = await response.json();
         setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
       } catch (error) {
         // Handle error
       } finally {
         setIsLoading(false);
       }
     };

     return { messages, sendMessage, isLoading };
   }
   ```

5. [ ] Implement conversation session management
   - Store conversation in localStorage or state
   - Clear on explicit close
   - Resume within session

6. [ ] Add error handling
   - Network errors
   - Rate limiting
   - Fallback messages

7. [ ] Implement response streaming (optional)
   ```typescript
   // For better UX with streaming responses
   const stream = await anthropic.messages.stream({...});
   for await (const chunk of stream) {
     // Update UI progressively
   }
   ```

---

## Verification Requirements

**Type:** INTEGRATION_TEST

**Requirements:**
- [ ] Chat gives relevant, helpful responses
- [ ] Responses reference user's actual data
- [ ] Conversation history maintained within session
- [ ] Response time < 3 seconds
- [ ] Errors handled gracefully
- [ ] Can handle follow-up questions
- [ ] Tone is friendly and professional

**Acceptance Criteria:**
- AI responses helpful and contextual
- User data correctly injected
- Session persistence works
- Error handling graceful

**Automation Script:**
```bash
npm run test:integration -- --grep "support chat api"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
Claude API conversation context management patterns 2026
```

**Query 2 (Priority: medium):**
```
React AI chat streaming response patterns TypeScript
```

---

## Files Modified/Created

- [ ] `api/support/chat/route.ts` (create)
- [ ] `lib/supportPrompt.ts` (create)
- [ ] `services/supportContext.ts` (create)
- [ ] `hooks/useSupportChat.ts` (create)
- [ ] `components/SupportChat/SupportChat.tsx` (modify - connect API)

---

## Commit Message

```
feat(support): integrate AI-powered support chat

- Create support chat API endpoint with Claude
- Build context-aware support prompt
- Fetch user data for personalized responses
- Implement conversation session management
- Add error handling and fallbacks
```

**Type:** feat

---

## Git Note

```
Task: task_3_4
Summary: Support Chat AI integration complete
Verification: Integration tests pass, responses helpful
Context: Completes AI support feature
Critical: Claude API key required
```

---

## Risk Assessment

**Risk Level:** MEDIUM

**Potential Risks:**
- Risk 1: Slow responses → Mitigation: Implement streaming
- Risk 2: Unhelpful responses → Mitigation: Refine prompt, add examples
- Risk 3: Context injection errors → Mitigation: Graceful fallbacks

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~30,000 tokens
**Tool Calls:** 25-30 expected
**Agent Session:** 4-5 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
