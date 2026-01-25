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

1. [x] Create TabNavigation component in `components/Dashboard/`
   ```typescript
   // DashboardTabs.tsx
   interface DashboardTabsProps {
     activeTab: 'projects' | 'integrations' | 'skills';
     onTabChange: (tab: string) => void;
   }
   ```

2. [x] Implement URL state synchronization
   - Parse `?tab=` query parameter on mount
   - Update URL on tab change without page reload
   - Default to 'projects' if no parameter

3. [x] Create tab content wrapper components
   - ProjectsTab.tsx (wraps existing ProjectsDashboard)
   - IntegrationsTab.tsx (placeholder for migration)
   - SkillsTab.tsx (placeholder for Sprint 2)

4. [x] Update App.tsx routing to support tabs
   - Add tabs state management
   - Connect to URL parameters

5. [x] Style tabs using existing design tokens
   - Active/inactive states
   - Hover effects
   - Responsive behavior (mobile scroll/collapse)

6. [x] Add keyboard navigation support (arrow keys, Enter)

---

## Verification Requirements

**Type:** PLAYWRIGHT_E2E

**Requirements:**
- [x] Three tabs visible: Projects, Integrations, Skills
- [x] Active tab visually distinct
- [x] Tab switches without page reload
- [x] Deep linking works (`?tab=integrations` loads correct tab)
- [x] Responsive on mobile (tabs scroll horizontally)
- [x] Keyboard navigation works

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

- [x] `components/Dashboard/DashboardTabs.tsx` (create)
- [x] `components/Dashboard/ProjectsTab.tsx` (create)
- [x] `components/Dashboard/IntegrationsTab.tsx` (create - placeholder)
- [x] `components/Dashboard/SkillsTab.tsx` (create - placeholder)
- [x] `components/Dashboard/index.tsx` (create)
- [x] `App.tsx` (modify - add tab routing)
- [x] `hooks/useTabNavigation.ts` (create)
- [x] `components/ProjectOverview/ProjectsDashboard.tsx` (modify - add embedded prop)

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

**Status:** [x] Completed
**Assigned Agent:** Claude Opus 4.5
**Started:** 2026-01-25
**Completed:** 2026-01-25
**Checkpoint SHA:** (pending commit)
