# Task 3_2: Reflexes Implementation

**Phase:** 3
**Sequence:** 2
**Type:** ASYNC
**Duration:** 2-3 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** No
**Parallel With:** [task_3_1, task_3_3]
**Story Points:** 8

---

## Dependencies

**Depends On:**
- [x] task_2_4 (Skill Detail & Edit)
- [x] task_2_5 (Manual Skill Execution)

**Blocks:**
- [ ] task_3_5 (Analytics & Polish)

**Critical Path:** No

---

## Objective

Implement event-triggered skill executions (Reflexes) with webhook URL generation, trigger configuration, and event listener system.

---

## Implementation Steps

1. [ ] Create ReflexesTab component for skill detail
   ```typescript
   // components/Skills/ReflexesTab.tsx
   interface ReflexesTabProps {
     skillId: string;
     reflexes: Reflex[];
     onReflexCreated: (reflex: Reflex) => void;
     onReflexUpdated: (reflex: Reflex) => void;
     onReflexDeleted: (reflexId: string) => void;
   }
   ```

2. [ ] Create ReflexCard component
   - Trigger type badge
   - Webhook URL (if applicable)
   - Conditions summary
   - Enable/disable toggle
   - Last triggered timestamp
   - Edit/delete actions

3. [ ] Create ReflexConfigModal
   ```typescript
   // components/Skills/ReflexConfigModal.tsx
   <Dialog>
     <Select value={triggerType}>
       <SelectItem value="webhook">Webhook</SelectItem>
       <SelectItem value="integration_event">Integration Event</SelectItem>
     </Select>

     {triggerType === 'webhook' && <WebhookConfig />}
     {triggerType === 'integration_event' && <IntegrationEventConfig />}

     <ConditionsEditor value={conditions} onChange={setConditions} />
   </Dialog>
   ```

4. [ ] Create WebhookConfig component
   - Auto-generated unique webhook URL
   - Copy to clipboard button
   - URL format: `/api/webhooks/reflexes/{reflex_id}`
   - Instructions/documentation

5. [ ] Create IntegrationEventConfig component
   - Select connected integration
   - Select event type from integration
   - Filter/conditions for events

6. [ ] Create ConditionsEditor component
   - JSON-based conditions
   - Visual builder (optional)
   - Condition evaluation preview

7. [ ] Implement webhook handler
   ```typescript
   // api/webhooks/reflexes/[reflex_id]/route.ts
   export async function POST(req: Request, { params }) {
     const reflex = await getReflex(params.reflex_id);
     const payload = await req.json();

     // Verify reflex is active
     if (!reflex.is_active) {
       return Response.json({ status: 'inactive' }, { status: 400 });
     }

     // Evaluate conditions
     if (reflex.conditions && !evaluateConditions(reflex.conditions, payload)) {
       return Response.json({ status: 'conditions_not_met' });
     }

     // Execute skill
     const result = await executeSkill(reflex.skill_id, {
       inputs: payload,
       execution_type: 'reflex',
       reference_id: reflex.id
     });

     return Response.json(result);
   }
   ```

8. [ ] Create reflexes API service
   ```typescript
   // services/reflexesApi.ts
   async function createReflex(skillId: string, data: ReflexInput);
   async function updateReflex(reflexId: string, data: ReflexUpdate);
   async function deleteReflex(reflexId: string);
   async function toggleReflex(reflexId: string, isActive: boolean);
   async function generateWebhookUrl(reflexId: string): string;
   ```

9. [ ] Implement condition evaluation
   ```typescript
   // lib/conditions.ts
   function evaluateConditions(conditions: object, payload: object): boolean {
     // Support: equals, contains, gt, lt, regex, and, or, not
   }
   ```

---

## Verification Requirements

**Type:** TDD + INTEGRATION_TEST

**Requirements:**
- [ ] Users can create reflexes
- [ ] Webhook URLs generated and unique
- [ ] Webhook calls trigger skill execution
- [ ] Integration events can be selected
- [ ] Conditions evaluated correctly
- [ ] Execution logs show trigger info
- [ ] Users can enable/disable reflexes
- [ ] Error handling for failed triggers

**Acceptance Criteria:**
- Reflexes CRUD works correctly
- Webhooks trigger reliably
- Conditions evaluate properly
- Integration with existing integrations

**Automation Script:**
```bash
npm run test:unit -- --grep "reflexes"
npm run test:integration -- --grep "webhook trigger"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
Webhook handler security best practices Node.js 2026
```

**Query 2 (Priority: medium):**
```
JSON condition evaluation engine patterns JavaScript
```

---

## Files Modified/Created

- [ ] `components/Skills/ReflexesTab.tsx` (create)
- [ ] `components/Skills/ReflexCard.tsx` (create)
- [ ] `components/Skills/ReflexConfigModal.tsx` (create)
- [ ] `components/Skills/WebhookConfig.tsx` (create)
- [ ] `components/Skills/IntegrationEventConfig.tsx` (create)
- [ ] `components/Skills/ConditionsEditor.tsx` (create)
- [ ] `lib/conditions.ts` (create)
- [ ] `services/reflexesApi.ts` (create)
- [ ] `hooks/useReflexes.ts` (create)
- [ ] `api/webhooks/reflexes/[reflex_id]/route.ts` (create)

---

## Commit Message

```
feat(skills): implement Reflexes triggered execution

- Create ReflexesTab with reflex list and config
- Add webhook URL generation and handling
- Implement condition evaluation engine
- Support integration event triggers
- Add enable/disable functionality
```

**Type:** feat

---

## Git Note

```
Task: task_3_2
Summary: Reflexes event-triggered execution complete
Verification: Integration tests pass, webhooks work
Context: Automation feature for Skills
```

---

## Risk Assessment

**Risk Level:** MEDIUM

**Potential Risks:**
- Risk 1: Webhook security (abuse) → Mitigation: Rate limiting, signature verification
- Risk 2: Condition evaluation DoS → Mitigation: Timeout and complexity limits
- Risk 3: Infinite loops → Mitigation: Circuit breaker pattern

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~45,000 tokens
**Tool Calls:** 35-45 expected
**Agent Session:** 6-8 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
