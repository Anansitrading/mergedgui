# Task 3_1: Habits Implementation

**Phase:** 3
**Sequence:** 1
**Type:** ASYNC
**Duration:** 2-3 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** Yes
**Parallel With:** [task_3_2, task_3_3]
**Story Points:** 8

---

## Dependencies

**Depends On:**
- [x] task_2_4 (Skill Detail & Edit)
- [x] task_2_5 (Manual Skill Execution)

**Blocks:**
- [ ] task_3_5 (Analytics & Polish)

**Critical Path:** Yes

---

## Objective

Implement scheduled skill executions (Habits) with cron scheduling, UI configuration, and background execution system.

---

## Implementation Steps

1. [ ] Create HabitsTab component for skill detail
   ```typescript
   // components/Skills/HabitsTab.tsx
   interface HabitsTabProps {
     skillId: string;
     habits: Habit[];
     onHabitCreated: (habit: Habit) => void;
     onHabitUpdated: (habit: Habit) => void;
     onHabitDeleted: (habitId: string) => void;
   }
   ```

2. [ ] Create HabitCard component
   - Schedule description
   - Next run time
   - Last run status
   - Enable/disable toggle
   - Edit/delete actions

3. [ ] Create HabitConfigModal
   ```typescript
   // components/Skills/HabitConfigModal.tsx
   <Dialog>
     <CronBuilder value={cron} onChange={setCron} />
     <div className="schedule-preview">
       <p>This skill will run: {scheduleDescription}</p>
       <p>Next run: {nextRunTime}</p>
     </div>
   </Dialog>
   ```

4. [ ] Create CronBuilder component
   - Presets: Daily, Weekly, Monthly, Custom
   - Time picker
   - Day selector
   - Human-readable preview

5. [ ] Implement cron utilities
   ```typescript
   // lib/cron.ts
   function cronToDescription(cron: string): string;
   function getNextRun(cron: string): Date;
   function validateCron(cron: string): boolean;
   ```

6. [ ] Create habits API service
   ```typescript
   // services/habitsApi.ts
   async function createHabit(skillId: string, data: HabitInput);
   async function updateHabit(habitId: string, data: HabitUpdate);
   async function deleteHabit(habitId: string);
   async function toggleHabit(habitId: string, isActive: boolean);
   ```

7. [ ] Implement background execution (Option A: pg_cron)
   ```sql
   -- Enable pg_cron extension
   create extension pg_cron;

   -- Create function to execute due habits
   create or replace function execute_due_habits() returns void as $$
   begin
     -- Find habits where next_run <= now() and is_active
     -- Execute each via Edge Function call
     -- Update last_run and calculate next_run
   end;
   $$ language plpgsql;

   -- Schedule check every minute
   select cron.schedule('check-habits', '* * * * *',
     'select execute_due_habits()');
   ```

8. [ ] Create Edge Function for habit execution
   ```typescript
   // supabase/functions/execute-habit/index.ts
   Deno.serve(async (req) => {
     const { habitId } = await req.json();
     // Load habit and skill
     // Execute skill
     // Update habit timestamps
   });
   ```

---

## Verification Requirements

**Type:** TDD + INTEGRATION_TEST

**Requirements:**
- [ ] Users can create habit schedules
- [ ] Cron expressions correctly generated
- [ ] Schedule description human-readable
- [ ] Scheduled skills execute at correct times
- [ ] Execution history shows habit runs
- [ ] Users can pause/resume habits
- [ ] Next run time accurate
- [ ] Error notifications on failure

**Acceptance Criteria:**
- Habits CRUD works correctly
- Cron scheduling accurate
- Background execution reliable
- Error handling robust

**Automation Script:**
```bash
npm run test:unit -- --grep "habits"
npm run test:integration -- --grep "habit execution"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
Supabase pg_cron scheduled jobs patterns 2026
```

**Query 2 (Priority: high):**
```
React cron expression builder component TypeScript
```

---

## Files Modified/Created

- [ ] `components/Skills/HabitsTab.tsx` (create)
- [ ] `components/Skills/HabitCard.tsx` (create)
- [ ] `components/Skills/HabitConfigModal.tsx` (create)
- [ ] `components/Skills/CronBuilder.tsx` (create)
- [ ] `lib/cron.ts` (create)
- [ ] `services/habitsApi.ts` (create)
- [ ] `hooks/useHabits.ts` (create)
- [ ] `supabase/functions/execute-habit/index.ts` (create)
- [ ] `database/migrations/003_habits_scheduler.sql` (create)

---

## Commit Message

```
feat(skills): implement Habits scheduled execution

- Create HabitsTab with habit list and config
- Add CronBuilder for schedule configuration
- Implement background execution with pg_cron
- Create Edge Function for habit execution
- Add pause/resume functionality
```

**Type:** feat

---

## Git Note

```
Task: task_3_1
Summary: Habits scheduling complete
Verification: Integration tests pass, scheduling works
Context: Automation feature for Skills
Critical: Requires pg_cron extension
```

---

## Risk Assessment

**Risk Level:** HIGH

**Potential Risks:**
- Risk 1: pg_cron reliability → Mitigation: Monitoring and alerting
- Risk 2: Missed executions → Mitigation: Retry logic, catch-up runs
- Risk 3: Edge function timeout → Mitigation: Async execution pattern

**Critical Blocker:** No

---

## Context Cost Estimate

**Estimated Tokens:** ~50,000 tokens
**Tool Calls:** 40-50 expected
**Agent Session:** 7-9 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
