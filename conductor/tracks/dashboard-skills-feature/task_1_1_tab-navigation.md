# Task 1_1: Tab Navigation Implementation

**Phase:** 1
**Sequence:** 1
**Type:** SEQUENTIAL
**Duration:** 1-2 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** Yes
**Parallel With:** []
**Story Points:** 5

---

## Dependencies

**Depends On:**
- [x] task_0_1 (Environment Validation)

**Blocks:**
- [ ] task_1_2 (Header Restructuring)
- [ ] task_1_4 (Integrations Tab Migration)
- [ ] task_2_1 (Database Schema & API)

**Critical Path:** Yes

---

## Objective

Convert the current Projects page to a tabbed layout with three tabs: Projects, Integrations, Skills. Implement URL routing with query parameters for deep linking.

---

## Implementation Steps

1. [ ] Create TabNavigation component in `components/Dashboard/`
   ```typescript
   // DashboardTabs.tsx
   interface DashboardTabsProps {
     activeTab: 'projects' | 'integrations' | 'skills';
     onTabChange: (tab: string) => void;
   }
   ```

2. [ ] Implement URL state synchronization
   - Parse `?tab=` query parameter on mount
   - Update URL on tab change without page reload
   - Default to 'projects' if no parameter

3. [ ] Create tab content wrapper components
   - ProjectsTab.tsx (wraps existing ProjectsDashboard)
   - IntegrationsTab.tsx (placeholder for migration)
   - SkillsTab.tsx (placeholder for Sprint 2)

4. [ ] Update App.tsx routing to support tabs
   - Add tabs state management
   - Connect to URL parameters

5. [ ] Style tabs using existing design tokens
   - Active/inactive states
   - Hover effects
   - Responsive behavior (mobile scroll/collapse)

6. [ ] Add keyboard navigation support (arrow keys, Enter)

---

## Verification Requirements

**Type:** PLAYWRIGHT_E2E

**Requirements:**
- [ ] Three tabs visible: Projects, Integrations, Skills
- [ ] Active tab visually distinct
- [ ] Tab switches without page reload
- [ ] Deep linking works (`?tab=integrations` loads correct tab)
- [ ] Responsive on mobile (tabs scroll horizontally)
- [ ] Keyboard navigation works

**Acceptance Criteria:**
- Tabs render correctly on all screen sizes
- URL updates on tab change
- Direct URL navigation to tab works
- No console errors during tab switching

**Automation Script:**
```bash
# Playwright test
npm run test:e2e -- --grep "tab navigation"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
React Router v7 query parameter state management patterns 2026
```

**Query 2 (Priority: medium):**
```
Accessible tab component ARIA patterns React TypeScript
```

---

## Files Modified/Created

- [ ] `components/Dashboard/DashboardTabs.tsx` (create)
- [ ] `components/Dashboard/ProjectsTab.tsx` (create)
- [ ] `components/Dashboard/IntegrationsTab.tsx` (create - placeholder)
- [ ] `components/Dashboard/SkillsTab.tsx` (create - placeholder)
- [ ] `components/Dashboard/index.tsx` (create)
- [ ] `App.tsx` (modify - add tab routing)
- [ ] `hooks/useTabNavigation.ts` (create)

---

## Commit Message

```
feat(dashboard): implement tab navigation system

- Add DashboardTabs component with Projects/Integrations/Skills
- Implement URL query parameter state sync
- Add keyboard navigation and ARIA support
- Create placeholder tabs for future content
```

**Type:** feat

---

## Git Note

```
Task: task_1_1
Summary: Tab navigation foundation complete
Verification: E2E tests pass, deep linking works
Context: Foundation for Sprint 1 migrations
Files: 7 created/modified
```

---

## Risk Assessment

**Risk Level:** MEDIUM

**Potential Risks:**
- Risk 1: URL state conflicts with React Router → Mitigation: Use useSearchParams hook
- Risk 2: Mobile tab overflow → Mitigation: Horizontal scroll with fade indicators

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~25,000 tokens
**Tool Calls:** 15-25 expected
**Agent Session:** 2-4 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
