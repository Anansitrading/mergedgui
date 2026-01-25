# Wave 6: Skill Detail & Execution

**Type:** ASYNC
**Duration:** 2-3 days
**Parallel Agents:** 2
**Blocking:** Yes (execution blocks Sprint 3)

---

## Tasks in This Wave

### Async Tasks (can run in parallel)
- [ ] [task_2_4_skill-detail-edit_ASYNC](./task_2_4_skill-detail-edit_ASYNC.md) - Skill detail view with edit/delete
- [ ] [task_2_5_skill-execution_ASYNC](./task_2_5_skill-execution_ASYNC.md) - Manual skill execution with Claude API

---

## Wave Dependencies

**Previous Wave:** Wave 5 (Skills UI and Create Form must be complete)
**Next Wave:** Wave 7 (Habits, Reflexes & Support Chat - ASYNC)

**Inter-task Dependencies:**
- Both depend on skills library UI from task_2_2
- task_2_4 uses form from task_2_3 for editing
- task_2_5 can run independently
- Execution button in detail triggers execution modal

---

## Parallelization Strategy

**Max Concurrent Agents:** 2
**Resource Conflicts:**
- Both read from skills API
- task_2_4 updates skills
- task_2_5 creates executions
- No conflicts - different operations

**Coordination Points:**
- Detail view needs "Run" button that triggers execution
- Both can develop independently, integrate at end

---

## Success Criteria

- ✅ Click on skill opens detail view
- ✅ Edit pre-fills form, saves correctly
- ✅ Delete confirms and removes skill
- ✅ Tabs in detail working (Overview, Habits, Reflexes, History)
- ✅ Execute skill calls Claude API
- ✅ Response renders with markdown
- ✅ Execution logged to database

---

## Conductor Commands

```bash
# Execute Wave 6 in parallel

# Terminal 1:
cd worktree-wave6-1 && claude
> Implement task_2_4_skill-detail-edit_ASYNC.md

# Terminal 2:
cd worktree-wave6-2 && claude
> Implement task_2_5_skill-execution_ASYNC.md

# After both complete:
npm run test:e2e -- --grep "skill detail"
npm run test:e2e -- --grep "skill execution"
```

---

## Sprint 2 Checkpoint

After Wave 6 completes:
```bash
git commit -m "conductor(checkpoint): Complete Sprint 2 - Skills Feature Foundation"
```

**Sprint 2 Definition of Done:**
- ✅ Skills database operational with RLS
- ✅ Skills CRUD fully functional
- ✅ Skills library UI polished
- ✅ Manual skill execution working
- ✅ Execution results rendered correctly
- ✅ Execution logging functional
- ✅ Error handling robust

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
