# Task 1_2: Header Restructuring

**Phase:** 1
**Sequence:** 2
**Type:** ASYNC
**Duration:** 0.5-1 day
**Agent Assignment:** frontend-design:frontend-design
**Blocking:** No
**Parallel With:** [task_1_4]
**Story Points:** 3

---

## Dependencies

**Depends On:**
- [x] task_1_1 (Tab Navigation Implementation)

**Blocks:**
- [ ] task_1_3 (User Profile Dropdown)

**Critical Path:** No

---

## Objective

Remove Settings button from header and add User avatar component. Position avatar next to "Create new" button in the top right corner.

---

## Implementation Steps

1. [ ] Create UserAvatar component
   ```typescript
   // components/Dashboard/UserAvatar.tsx
   interface UserAvatarProps {
     user: {
       name: string;
       email: string;
       photoUrl?: string;
     };
     onClick: () => void;
   }
   ```

2. [ ] Implement avatar display logic
   - Show uploaded photo if available
   - Fallback to first letter of name
   - Use initials from first + last name if available

3. [ ] Style avatar using Tailwind
   - Size: 40x40px
   - Border radius: full (circle)
   - Hover state: slight scale + ring
   - Focus state: visible ring for accessibility

4. [ ] Update header layout
   - Remove existing Settings button/icon
   - Add UserAvatar right of "Create new" button
   - Maintain responsive layout

5. [ ] Connect to user context/state
   - Get user data from SettingsContext
   - Handle loading state

---

## Verification Requirements

**Type:** PLAYWRIGHT_SCREENSHOT

**Requirements:**
- [ ] Avatar visible in header right section
- [ ] Avatar shows photo or fallback letter
- [ ] Hover state visible (scale + ring)
- [ ] Settings button removed from header
- [ ] Responsive on all breakpoints

**Acceptance Criteria:**
- Avatar displays correctly with photo
- Avatar displays correctly with fallback
- Hover animation smooth
- No layout shift on load

**Automation Script:**
```bash
# Screenshot test
npm run test:screenshot -- --grep "header avatar"
```

---

## Enhancement Queries

**Query 1 (Priority: medium):**
```
React avatar component with image fallback patterns 2026
```

---

## Files Modified/Created

- [ ] `components/Dashboard/UserAvatar.tsx` (create)
- [ ] `components/Sidebar.tsx` (modify - remove settings button)
- [ ] `App.tsx` or header component (modify - add avatar)

---

## Commit Message

```
feat(header): add user avatar component

- Create UserAvatar with photo/fallback support
- Remove Settings button from header
- Position avatar next to Create new button
- Add hover/focus states for accessibility
```

**Type:** feat

---

## Git Note

```
Task: task_1_2
Summary: Header restructured with user avatar
Verification: Screenshot tests pass
Context: Part of navigation refactor
```

---

## Risk Assessment

**Risk Level:** LOW

**Potential Risks:**
- Risk 1: Image loading flicker → Mitigation: Show skeleton while loading
- Risk 2: Layout shift → Mitigation: Reserve space with fixed dimensions

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~15,000 tokens
**Tool Calls:** 10-15 expected
**Agent Session:** 1-2 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
