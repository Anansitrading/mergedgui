# Wave 1: Tab Navigation Foundation

**Type:** SEQUENTIAL
**Duration:** 1-2 days
**Parallel Agents:** 1
**Blocking:** Yes

---

## Tasks in This Wave

### Sequential Tasks (must run in order)
1. [ ] [task_1_1_tab-navigation](./task_1_1_tab-navigation.md) - Implement tab navigation with Projects/Integrations/Skills

---

## Wave Dependencies

**Previous Wave:** Wave 0 (environment validation must complete)
**Next Wave:** Wave 2 (Header & Integrations Migration - ASYNC)

---

## Parallelization Strategy

**Max Concurrent Agents:** 1
**Resource Conflicts:** Modifies App.tsx and creates new component structure
**Coordination Points:** URL routing pattern must be established first

---

## Success Criteria

- ✅ Three tabs visible: Projects, Integrations, Skills
- ✅ Tab switching works without page reload
- ✅ URL query parameter sync (?tab=projects)
- ✅ Deep linking functional
- ✅ Responsive on mobile

---

## Conductor Commands

```bash
# Execute Wave 1
/conductor:implement task_1_1_tab-navigation
# Wait for completion, verify E2E tests pass
```

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
