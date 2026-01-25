# Wave 7: Habits, Reflexes & Support Chat UI

**Type:** ASYNC
**Duration:** 2-3 days
**Parallel Agents:** 3
**Blocking:** Partial

---

## Tasks in This Wave

### Async Tasks (can run in parallel)
- [ ] [task_3_1_habits-implementation_ASYNC](./task_3_1_habits-implementation_ASYNC.md) - Scheduled skill executions (8 pts)
- [ ] [task_3_2_reflexes-implementation_ASYNC](./task_3_2_reflexes-implementation_ASYNC.md) - Event-triggered executions (8 pts)
- [ ] [task_3_3_support-chat-ui_ASYNC](./task_3_3_support-chat-ui_ASYNC.md) - Chat widget UI (5 pts)

---

## Wave Dependencies

**Previous Wave:** Wave 6 (Skill execution must be complete)
**Next Wave:** Wave 8 (Chat AI Integration & Polish - SEQUENTIAL)

**Inter-task Dependencies:**
- task_3_1 and task_3_2 both depend on skill execution engine
- task_3_1 and task_3_2 are independent of each other
- task_3_3 is completely independent (UI only)
- task_3_3 → task_3_4 (UI before AI integration)

---

## Parallelization Strategy

**Max Concurrent Agents:** 3
**Resource Conflicts:**
- task_3_1: Creates pg_cron scheduler, edge functions
- task_3_2: Creates webhook handlers
- task_3_3: Creates new component tree (no overlap)
- No conflicts - completely different domains

**Coordination Points:**
- All three can proceed independently
- task_3_1 and task_3_2 both update skill_executions table

---

## Success Criteria

### Habits (task_3_1)
- ✅ Users can create habit schedules
- ✅ Cron expressions correctly generated
- ✅ Scheduled skills execute automatically
- ✅ Pause/resume habits works

### Reflexes (task_3_2)
- ✅ Users can create reflexes
- ✅ Webhook URLs generated and unique
- ✅ Webhook calls trigger execution
- ✅ Enable/disable works

### Support Chat UI (task_3_3)
- ✅ Chat bubble visible bottom-right
- ✅ Click opens chat window
- ✅ Messages display correctly
- ✅ Animations smooth

---

## Conductor Commands

```bash
# Execute Wave 7 in parallel (3 agents)

# Terminal 1:
cd worktree-wave7-1 && claude
> Implement task_3_1_habits-implementation_ASYNC.md

# Terminal 2:
cd worktree-wave7-2 && claude
> Implement task_3_2_reflexes-implementation_ASYNC.md

# Terminal 3:
cd worktree-wave7-3 && claude
> Implement task_3_3_support-chat-ui_ASYNC.md
```

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
