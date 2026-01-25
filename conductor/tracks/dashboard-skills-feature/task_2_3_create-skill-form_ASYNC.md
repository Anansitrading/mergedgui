# Task 2_3: Create Skill Form

**Phase:** 2
**Sequence:** 3
**Type:** ASYNC
**Duration:** 1-2 days
**Agent Assignment:** frontend-design:frontend-design
**Blocking:** Yes
**Parallel With:** [task_2_2]
**Story Points:** 5

---

## Dependencies

**Depends On:**
- [x] task_2_1 (Database Schema & API)

**Blocks:**
- [ ] task_2_4 (Skill Detail & Edit)
- [ ] task_2_5 (Manual Skill Execution)

**Critical Path:** Yes

---

## Objective

Create a modal/drawer form for creating new skills with validation, model selection, and advanced parameter configuration.

---

## Implementation Steps

1. [x] Create CreateSkillModal component
   ```typescript
   // components/Skills/CreateSkillModal.tsx
   interface CreateSkillModalProps {
     isOpen: boolean;
     onClose: () => void;
     onCreated: (skill: Skill) => void;
   }
   ```

2. [x] Implement form fields
   - **Name** (required, text, max 100 chars)
   - **Description** (optional, textarea)
   - **Category** (required, select: Marketing, Engineering, Planning, Support, Custom)
   - **Icon/Emoji** (optional, emoji picker)
   - **Prompt Template** (required, textarea, min 20 chars)
   - **Model Selection** (select: Claude models)

3. [x] Create advanced parameters section (collapsible)
   - Temperature slider (0-1)
   - Max tokens input
   - Input schema (JSON editor)
   - Output format (text/json/markdown)

4. [x] Implement form validation
   ```typescript
   const schema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().optional(),
     category: z.enum(['Marketing', 'Engineering', 'Planning', 'Support', 'Custom']),
     prompt_template: z.string().min(20),
     model: z.string(),
     parameters: z.object({
       temperature: z.number().min(0).max(1),
       max_tokens: z.number().min(1).max(8192)
     })
   });
   ```

5. [x] Connect to API
   - Submit creates skill via POST /api/skills
   - Handle loading state
   - Handle error responses
   - Show success feedback

6. [x] Style modal for large forms
   - Scrollable content area
   - Sticky header and footer
   - Clear section separation
   - Field labels and hints

---

## Verification Requirements

**Type:** TDD + PLAYWRIGHT_E2E

**Requirements:**
- [ ] Form opens on "Create new skill" click
- [ ] All fields render correctly
- [ ] Validation errors show on submit
- [ ] Successful submission creates skill in DB
- [ ] New skill appears in library immediately
- [ ] Modal closes after successful creation
- [ ] Error handling for API failures

**Acceptance Criteria:**
- Form validates all inputs correctly
- API integration works
- Optimistic UI update on success
- Clear error messages

**Automation Script:**
```bash
npm run test:unit -- --grep "CreateSkillModal"
npm run test:e2e -- --grep "create skill"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
React Hook Form Zod validation patterns 2026
```

**Query 2 (Priority: medium):**
```
Monaco editor React integration for prompt templates
```

---

## Files Modified/Created

- [x] `components/Skills/CreateSkillModal.tsx` (create)
- [x] `components/Skills/SkillForm.tsx` (create - reusable form)
- [x] `components/Skills/PromptEditor.tsx` (create)
- [x] `components/Skills/ModelSelect.tsx` (create)
- [x] `components/Skills/CategorySelect.tsx` (create)
- [x] `components/Skills/ParametersPanel.tsx` (create)
- [x] `lib/skillValidation.ts` (create - Zod schema)
- [x] `components/Skills/index.tsx` (updated - barrel export)
- [x] `components/Dashboard/SkillsTab.tsx` (updated - integration)

---

## Commit Message

```
feat(skills): implement Create Skill form

- Create modal form with all skill fields
- Add validation with Zod schema
- Implement advanced parameters panel
- Connect to skills API for creation
- Add prompt template editor
```

**Type:** feat

---

## Git Note

```
Task: task_2_3
Summary: Create Skill form complete
Verification: Unit and E2E tests pass
Context: Enables skill creation in Sprint 2
```

---

## Risk Assessment

**Risk Level:** MEDIUM

**Potential Risks:**
- Risk 1: Complex form state → Mitigation: Use react-hook-form
- Risk 2: Large modal on mobile → Mitigation: Full-screen on mobile

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~30,000 tokens
**Tool Calls:** 25-30 expected
**Agent Session:** 3-5 hours

---

## Status Tracking

**Status:** [x] Completed
**Assigned Agent:** Claude Opus 4.5
**Started:** 2026-01-25
**Completed:** 2026-01-25
**Checkpoint SHA:**
