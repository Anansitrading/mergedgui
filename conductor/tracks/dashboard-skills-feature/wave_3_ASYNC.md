# Wave 3: Profile Dropdown & Migration

**Type:** ASYNC
**Duration:** 0.5-1 day
**Parallel Agents:** 2
**Blocking:** No

---

## Tasks in This Wave

### Async Tasks (can run in parallel)
- [ ] [task_1_3_user-dropdown](./task_1_3_user-dropdown.md) - Create user profile dropdown menu
- [ ] [task_1_5_profile-migration_ASYNC](./task_1_5_profile-migration_ASYNC.md) - Migrate My Profile from Settings

**Note:** While task_1_5 depends on task_1_3, they can be developed in parallel if task_1_5 uses a mock trigger initially.

---

## Wave Dependencies

**Previous Wave:** Wave 2 (header restructuring must be complete for dropdown)
**Next Wave:** Wave 4 (Database Schema - SEQUENTIAL)

---

## Parallelization Strategy

**Max Concurrent Agents:** 2
**Resource Conflicts:**
- task_1_3 creates dropdown component
- task_1_5 needs dropdown trigger but can mock it
- Final integration at end of wave

**Coordination Points:**
- task_1_5 integration with dropdown after task_1_3 completes
- Both modify Settings sidebar

---

## Success Criteria

- ✅ Dropdown opens on avatar click
- ✅ My Profile, Settings, Log out items functional
- ✅ My Profile not in Settings sidebar
- ✅ Profile modal opens from dropdown
- ✅ All profile features work (photo upload, etc.)

---

## Conductor Commands

```bash
# Execute Wave 3

# Option A: Parallel with mock integration
# Terminal 1:
cd worktree-wave3-1 && claude
> Implement task_1_3_user-dropdown.md

# Terminal 2:
cd worktree-wave3-2 && claude
> Implement task_1_5_profile-migration_ASYNC.md (use mock trigger)

# Option B: Sequential
/conductor:implement task_1_3_user-dropdown
/conductor:implement task_1_5_profile-migration_ASYNC
```

---

## Sprint 1 Checkpoint

After Wave 3 completes:
```bash
git commit -m "conductor(checkpoint): Complete Sprint 1 - Navigation Foundation"
```

**Sprint 1 Definition of Done:**
- ✅ Tab navigation fully working
- ✅ User avatar + dropdown implemented
- ✅ Integrations and My Profile migrated
- ✅ Settings menu has correct items
- ✅ No regressions
- ✅ Responsive design

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
