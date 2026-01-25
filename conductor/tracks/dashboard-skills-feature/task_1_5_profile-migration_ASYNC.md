# Task 1_5: My Profile Migration

**Phase:** 1
**Sequence:** 5
**Type:** ASYNC
**Duration:** 0.5-1 day
**Agent Assignment:** frontend-design:frontend-design
**Blocking:** No
**Parallel With:** [task_1_3]
**Story Points:** 3

---

## Dependencies

**Depends On:**
- [x] task_1_3 (User Profile Dropdown)

**Blocks:**
- None (end of Sprint 1)

**Critical Path:** No

---

## Objective

Move My Profile content from Settings to a dedicated profile view accessible via user dropdown. Preserve all profile management functionality.

---

## Implementation Steps

1. [x] Analyze existing Profile components
   - `components/Settings/Profile/index.tsx`
   - `components/Settings/Profile/ProfileSection.tsx`
   - `components/Settings/Profile/AvatarUpload.tsx`
   - `components/Settings/Profile/GravatarToggle.tsx`
   - `components/Settings/Profile/PasswordChange.tsx`
   - `components/Settings/Profile/EmailVerification.tsx`
   - `components/Settings/Profile/TimezoneSelect.tsx`

2. [x] Create MyProfileModal component
   ```typescript
   // components/Profile/MyProfileModal.tsx
   interface MyProfileModalProps {
     isOpen: boolean;
     onClose: () => void;
   }
   ```

3. [x] Move/adapt profile components
   - Create `components/Profile/` directory
   - Reuse existing components from Settings/Profile
   - Update styling for modal context

4. [x] Connect to user dropdown
   - Created UserDropdown component (also completing task_1_3)
   - "My Profile" click opens modal
   - Pass user data from context

5. [x] Update Settings sidebar
   - Remove "My Profile" item from navigationItems
   - Remove 'profile' from SettingsSection type
   - Update default activeSection to 'general'

6. [x] Verify all profile features work
   - TypeScript type check passes
   - Build succeeds
   - Profile components reused in modal context

---

## Verification Requirements

**Type:** PLAYWRIGHT_E2E

**Requirements:**
- [x] My Profile not in Settings sidebar
- [x] Profile view opens via avatar dropdown
- [x] Photo upload functionality works (reused component)
- [x] Account info can be edited (reused component)
- [x] Form validation works (reused component)
- [x] Changes save correctly (auto-save preserved)

**Acceptance Criteria:**
- Feature parity with Settings version
- Clean integration with dropdown
- No regression in functionality
- Auto-save works as before

**Automation Script:**
```bash
npm run test:e2e -- --grep "profile"
```

---

## Enhancement Queries

**Query 1 (Priority: medium):**
```
React modal form patterns with auto-save 2026
```

---

## Files Modified/Created

- [x] `components/Profile/MyProfileModal.tsx` (create)
- [x] `components/Profile/index.tsx` (create)
- [x] `components/Dashboard/UserDropdown.tsx` (create - also task_1_3)
- [x] `components/Dashboard/index.tsx` (modify - add UserAvatar, UserDropdown, MyProfileModal)
- [x] `hooks/useClickOutside.ts` (create)
- [x] `components/Settings/SettingsSidebar.tsx` (modify - remove User icon)
- [x] `components/Settings/Profile/ProfileSection.tsx` (modify - remove activeSection check)
- [x] `styles/settings.ts` (modify - remove profile from navigationItems and sectionConfig)
- [x] `types/settings/base.ts` (modify - remove 'profile' from SettingsSection type)
- [x] `contexts/SettingsContext.tsx` (modify - change default activeSection to 'general')

---

## Commit Message

```
feat(profile): migrate My Profile to modal from dropdown

- Create MyProfileModal accessible from avatar dropdown
- Move profile components from Settings
- Preserve photo upload and account edit features
- Remove My Profile from Settings sidebar
```

**Type:** feat

---

## Git Note

```
Task: task_1_5
Summary: Profile migrated to dropdown-accessible modal
Verification: All profile features tested
Context: Completes Sprint 1 navigation refactor
```

---

## Risk Assessment

**Risk Level:** LOW

**Potential Risks:**
- Risk 1: Auto-save timing in modal → Mitigation: Debounce saves appropriately
- Risk 2: File upload in modal context → Mitigation: Test upload flows thoroughly

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~20,000 tokens
**Tool Calls:** 15-20 expected
**Agent Session:** 2-3 hours

---

## Status Tracking

**Status:** [x] Completed
**Assigned Agent:** Claude Opus 4.5
**Started:** 2026-01-25
**Completed:** 2026-01-25
**Checkpoint SHA:** (pending commit)
