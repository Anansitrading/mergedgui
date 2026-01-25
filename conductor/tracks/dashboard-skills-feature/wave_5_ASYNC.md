# Wave 5: Skills UI & Create Form

**Type:** ASYNC
**Duration:** 2-3 days
**Parallel Agents:** 2
**Blocking:** Yes (partial)

---

## Tasks in This Wave

### Async Tasks (can run in parallel)
- [ ] [task_2_2_skills-library-ui_ASYNC](./task_2_2_skills-library-ui_ASYNC.md) - Skills grid, cards, search, filtering
- [ ] [task_2_3_create-skill-form_ASYNC](./task_2_3_create-skill-form_ASYNC.md) - Create skill modal with validation

---

## Wave Dependencies

**Previous Wave:** Wave 4 (database schema must be complete)
**Next Wave:** Wave 6 (Skill Detail & Execution - ASYNC)

**Inter-task Dependencies:**
- Both depend on database schema and API from task_2_1
- Both independent of each other - can develop in parallel
- task_2_2 needs create modal trigger, can mock initially

---

## Parallelization Strategy

**Max Concurrent Agents:** 2
**Resource Conflicts:**
- Both use skills API but for different operations
- No write conflicts (list vs create)
- Share types/hooks but no conflicts

**Coordination Points:**
- Integration point: Create button in Library opens Create Modal
- Final integration after both complete

---

## Success Criteria

- ✅ Skills display in responsive grid
- ✅ Empty state for 0 skills
- ✅ Search and filter working
- ✅ Create form validates all inputs
- ✅ Skills created successfully via API
- ✅ New skill appears in library

---

## Conductor Commands

```bash
# Execute Wave 5 in parallel

# Terminal 1:
cd worktree-wave5-1 && claude
> Implement task_2_2_skills-library-ui_ASYNC.md

# Terminal 2:
cd worktree-wave5-2 && claude
> Implement task_2_3_create-skill-form_ASYNC.md

# After both complete, verify integration:
npm run test:e2e -- --grep "skills library"
npm run test:e2e -- --grep "create skill"
```

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
