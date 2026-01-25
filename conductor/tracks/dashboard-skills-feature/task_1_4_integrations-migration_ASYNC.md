# Task 1_4: Integrations Tab Migration

**Phase:** 1
**Sequence:** 4
**Type:** ASYNC
**Duration:** 1-1.5 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** Yes
**Parallel With:** [task_1_2]
**Story Points:** 5

---

## Dependencies

**Depends On:**
- [x] task_1_1 (Tab Navigation Implementation)

**Blocks:**
- [ ] task_2_1 (Database Schema & API)

**Critical Path:** Yes

---

## Objective

Move the complete Integrations section from Settings to the new Integrations tab. Preserve all functionality including connect, disconnect, and configuration flows.

---

## Implementation Steps

1. [ ] Analyze existing Integrations components
   - `components/Settings/Integrations/index.tsx`
   - `components/Settings/Integrations/AppCard.tsx`
   - `components/Settings/Integrations/AppGrid.tsx`
   - `components/Settings/Integrations/IntegrationSearch.tsx`
   - `components/Settings/Integrations/WebhookList.tsx`
   - `components/Settings/Integrations/WebhookForm.tsx`

2. [ ] Create IntegrationsTab wrapper component
   ```typescript
   // components/Dashboard/IntegrationsTab.tsx
   export function IntegrationsTab() {
     // Reuse existing Integrations components
   }
   ```

3. [ ] Move/copy components to new location
   - Create `components/Integrations/` directory
   - Move components preserving structure
   - Update import paths

4. [ ] Update Settings sidebar
   - Remove Integrations item from navigation
   - Update navigation indices

5. [ ] Verify all integration flows work
   - Connect new integration
   - Disconnect existing integration
   - Configure integration settings
   - Webhook management

6. [ ] Update any internal navigation/links
   - Settings → Integrations links
   - Help/documentation links

---

## Verification Requirements

**Type:** INTEGRATION_TEST + PLAYWRIGHT_E2E

**Requirements:**
- [ ] Integrations tab shows all existing integrations
- [ ] Connect flow works (OAuth, API key, etc.)
- [ ] Disconnect flow works with confirmation
- [ ] Configuration modals/forms functional
- [ ] No broken links or references
- [ ] Settings menu no longer shows Integrations
- [ ] All existing integrations still work

**Acceptance Criteria:**
- Feature parity with Settings version
- No regression in functionality
- Clean removal from Settings
- All tests pass

**Automation Script:**
```bash
npm run test:e2e -- --grep "integrations"
npm run test:integration -- --grep "integrations"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
React component migration refactoring patterns without breaking changes
```

---

## Files Modified/Created

- [ ] `components/Dashboard/IntegrationsTab.tsx` (create)
- [ ] `components/Integrations/` (create directory, move components)
- [ ] `components/Settings/SettingsSidebar.tsx` (modify - remove item)
- [ ] `components/Settings/index.tsx` (modify - remove integrations)

---

## Commit Message

```
feat(dashboard): migrate Integrations to dedicated tab

- Move Integrations from Settings to Dashboard tab
- Create IntegrationsTab wrapper component
- Preserve all connect/disconnect/configure flows
- Remove Integrations from Settings sidebar
```

**Type:** feat

---

## Git Note

```
Task: task_1_4
Summary: Integrations migrated to dedicated tab
Verification: All integration flows tested
Context: Part of navigation restructuring
Breaking: Settings → Integrations link removed
```

---

## Risk Assessment

**Risk Level:** MEDIUM

**Potential Risks:**
- Risk 1: Broken imports after move → Mitigation: Update all import paths systematically
- Risk 2: State management issues → Mitigation: Preserve context providers
- Risk 3: OAuth callbacks broken → Mitigation: Update redirect URIs if needed

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~30,000 tokens
**Tool Calls:** 20-30 expected
**Agent Session:** 3-5 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
