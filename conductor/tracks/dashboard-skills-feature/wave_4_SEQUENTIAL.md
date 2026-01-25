# Wave 4: Database Schema & API Foundation

**Type:** SEQUENTIAL
**Duration:** 1-2 days
**Parallel Agents:** 1
**Blocking:** Yes (critical path)

---

## Tasks in This Wave

### Sequential Tasks (must run in order)
1. [ ] [task_2_1_database-schema](./task_2_1_database-schema.md) - Create Skills/Habits/Reflexes database schema with RLS

---

## Wave Dependencies

**Previous Wave:** Wave 3 (Sprint 1 must be complete)
**Next Wave:** Wave 5 (Skills UI & Create Form - ASYNC)

**Critical Blocking:**
- ALL subsequent skills tasks depend on this
- Database must be deployed before UI work begins
- Types must be generated for frontend

---

## Parallelization Strategy

**Max Concurrent Agents:** 1
**Resource Conflicts:** Creates new database tables - must be done atomically
**Coordination Points:**
- Migration must complete successfully
- RLS policies must be tested
- TypeScript types must be generated

---

## Success Criteria

- ✅ skills, habits, reflexes, skill_executions tables created
- ✅ RLS policies prevent unauthorized access
- ✅ All CRUD endpoints working
- ✅ TypeScript types generated and importable
- ✅ Migrations versioned and reproducible

---

## Conductor Commands

```bash
# Execute Wave 4
/conductor:implement task_2_1_database-schema

# Verify database deployment
supabase db push
supabase gen types typescript > types/database.ts

# Run integration tests
npm run test:integration -- --grep "skills api"
```

---

## Wave Status

**Status:** [ ] Not Started
**Started:**
**Completed:**
**Checkpoint SHA:**
