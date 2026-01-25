# Task 1_3: User Profile Dropdown

**Phase:** 1
**Sequence:** 3
**Type:** SEQUENTIAL
**Duration:** 0.5-1 day
**Agent Assignment:** frontend-design:frontend-design
**Blocking:** No
**Parallel With:** [task_1_5]
**Story Points:** 3

---

## Dependencies

**Depends On:**
- [x] task_1_2 (Header Restructuring)

**Blocks:**
- [ ] task_1_5 (My Profile Migration)

**Critical Path:** No

---

## Objective

Create dropdown menu triggered by avatar click with options: My Profile, Settings, Log out. Implement smooth animations and keyboard navigation.

---

## Implementation Steps

1. [x] Create UserDropdown component
   ```typescript
   // components/Dashboard/UserDropdown.tsx
   interface UserDropdownProps {
     isOpen: boolean;
     onClose: () => void;
     onOpenProfile: () => void;
     onOpenSettings: () => void;
     onLogout: () => void;
   }
   ```

2. [x] Implement dropdown menu items
   - My Profile (icon: User)
   - Settings (icon: Settings/Gear)
   - Divider
   - Log out (icon: LogOut)

3. [x] Add animation and transitions
   - Fade in/out
   - Slide down from avatar
   - Duration: 150-200ms

4. [x] Implement click outside to close
   - Use useClickOutside hook or similar
   - Close on Escape key

5. [x] Add keyboard navigation
   - Arrow keys to navigate items
   - Enter to select
   - Tab to cycle through items

6. [x] Connect actions to existing functionality
   - Settings opens SettingsModal
   - Logout triggers auth logout
   - Profile opens new profile view (placeholder for task_1_5)

---

## Verification Requirements

**Type:** PLAYWRIGHT_E2E

**Requirements:**
- [x] Dropdown opens on avatar click
- [x] "My Profile" item present and clickable
- [x] "Settings" opens settings modal
- [x] "Log out" triggers logout flow
- [x] Smooth open/close animations
- [x] Keyboard navigation works
- [x] Click outside closes dropdown

**Acceptance Criteria:**
- All menu items functional
- Animations smooth (no jank)
- Accessible with keyboard only
- Works on mobile

**Automation Script:**
```bash
npm run test:e2e -- --grep "user dropdown"
```

---

## Enhancement Queries

**Query 1 (Priority: medium):**
```
React dropdown menu accessibility ARIA patterns 2026
```

---

## Files Modified/Created

- [x] `components/Dashboard/UserDropdown.tsx` (create)
- [x] `components/Dashboard/UserAvatar.tsx` (modify - add dropdown trigger)
- [x] `hooks/useClickOutside.ts` (create if not exists)

---

## Commit Message

```
feat(header): add user profile dropdown

- Create UserDropdown component with My Profile/Settings/Logout
- Add smooth open/close animations
- Implement keyboard navigation and ARIA
- Connect to existing settings and logout flows
```

**Type:** feat

---

## Git Note

```
Task: task_1_3
Summary: User dropdown menu complete
Verification: E2E tests pass, keyboard nav works
Context: Enables profile access from header
```

---

## Risk Assessment

**Risk Level:** LOW

**Potential Risks:**
- Risk 1: Z-index conflicts → Mitigation: Use portal for dropdown
- Risk 2: Focus trap issues → Mitigation: Proper focus management

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~18,000 tokens
**Tool Calls:** 12-18 expected
**Agent Session:** 1.5-2.5 hours

---

## Status Tracking

**Status:** [x] Completed
**Assigned Agent:** claude-opus-4-5
**Started:** 2026-01-25
**Completed:** 2026-01-25
**Checkpoint SHA:** pending-commit
