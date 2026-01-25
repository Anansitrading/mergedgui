# Wave 2: Header & Integrations Migration

**Type:** ASYNC
**Duration:** 1-1.5 days
**Parallel Agents:** 2
**Blocking:** No (partial - task_1_4 blocks Wave 4)

---

## Tasks in This Wave

### Async Tasks (can run in parallel)
- [ ] [task_1_2_header-restructuring_ASYNC](./task_1_2_header-restructuring_ASYNC.md) - Add user avatar, remove settings button
- [ ] [task_1_4_integrations-migration_ASYNC](./task_1_4_integrations-migration_ASYNC.md) - Migrate Integrations from Settings to tab

---

## Wave Dependencies

**Previous Wave:** Wave 1 (tab navigation must be complete)
**Next Wave:** Wave 3 (Profile Dropdown & Migration - ASYNC)

**Inter-task Dependencies:**
- task_1_2 → task_1_3 (header must be done before dropdown)
- task_1_4 → task_2_1 (integrations migration before skills schema)

---

## Parallelization Strategy

**Max Concurrent Agents:** 2
**Resource Conflicts:**
- Both modify different parts of the app
- No shared state conflicts
- Can safely run in parallel

**Coordination Points:**
- Both depend on tab navigation being stable
- task_1_4 modifies Settings sidebar (coordinate if needed)

---

## Success Criteria

- ✅ User avatar visible in header
- ✅ Settings button removed from header
- ✅ Integrations tab shows all existing integrations
- ✅ Connect/disconnect flows work
- ✅ Settings menu no longer has Integrations item

---

## Conductor Commands

```bash
# Execute Wave 2 in parallel (2 terminals)

# Terminal 1:
cd worktree-wave2-1 && claude
> Implement task_1_2_header-restructuring_ASYNC.md

# Terminal 2:
cd worktree-wave2-2 && claude
> Implement task_1_4_integrations-migration_ASYNC.md

# Or sequentially if preferred:
/conductor:implement task_1_2_header-restructuring_ASYNC
/conductor:implement task_1_4_integrations-migration_ASYNC
```

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
