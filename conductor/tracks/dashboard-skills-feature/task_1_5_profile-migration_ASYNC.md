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

1. [ ] Analyze existing Profile components
   - `components/Settings/Profile/index.tsx`
   - `components/Settings/Profile/ProfileSection.tsx`
   - `components/Settings/Profile/AvatarUpload.tsx`
   - `components/Settings/Profile/GravatarToggle.tsx`
   - `components/Settings/Profile/PasswordChange.tsx`
   - `components/Settings/Profile/EmailVerification.tsx`
   - `components/Settings/Profile/TimezoneSelect.tsx`

2. [ ] Create MyProfileModal component
   ```typescript
   // components/Profile/MyProfileModal.tsx
   interface MyProfileModalProps {
     isOpen: boolean;
     onClose: () => void;
   }
   ```

3. [ ] Move/adapt profile components
   - Create `components/Profile/` directory
   - Move relevant components
   - Update styling for modal context

4. [ ] Connect to user dropdown
   - "My Profile" click opens modal
   - Pass user data from context

5. [ ] Update Settings sidebar
   - Remove "My Profile" item
   - Update navigation order

6. [ ] Verify all profile features work
   - Photo upload
   - Gravatar toggle
   - Account information edit
   - Password change
   - Form submissions

---

## Verification Requirements

**Type:** PLAYWRIGHT_E2E

**Requirements:**
- [ ] My Profile not in Settings sidebar
- [ ] Profile view opens via avatar dropdown
- [ ] Photo upload functionality works
- [ ] Account info can be edited
- [ ] Form validation works
- [ ] Changes save correctly

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

- [ ] `components/Profile/MyProfileModal.tsx` (create)
- [ ] `components/Profile/` (create directory, move components)
- [ ] `components/Dashboard/UserDropdown.tsx` (modify - connect profile)
- [ ] `components/Settings/SettingsSidebar.tsx` (modify - remove item)
- [ ] `components/Settings/index.tsx` (modify - remove profile)

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

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
