# Task 2_1: Database Schema & API

**Phase:** 2
**Sequence:** 1
**Type:** SEQUENTIAL
**Duration:** 1-2 days
**Agent Assignment:** feature-dev:code-architect
**Blocking:** Yes
**Parallel With:** []
**Story Points:** 5

---

## Dependencies

**Depends On:**
- [x] task_1_1 (Tab Navigation Implementation)
- [x] task_1_4 (Integrations Tab Migration)

**Blocks:**
- [ ] task_2_2 (Skills Library UI)
- [ ] task_2_3 (Create Skill Form)

**Critical Path:** Yes

---

## Objective

Create Supabase database schema for Skills, Habits, Reflexes, and Execution Logs. Implement API endpoints for full CRUD operations with Row Level Security.

---

## Implementation Steps

1. [ ] Create database migration file
   ```sql
   -- database/migrations/002_skills_tables.sql

   -- Skills table (core AI capabilities)
   create table skills (
     id uuid primary key default uuid_generate_v4(),
     user_id uuid references auth.users not null,
     name text not null,
     description text,
     category text,
     prompt_template text not null,
     model text default 'claude-3-5-sonnet-20241022',
     parameters jsonb default '{"temperature": 1, "max_tokens": 4096}',
     input_schema jsonb,
     output_format text default 'markdown',
     is_active boolean default true,
     created_at timestamp default now(),
     updated_at timestamp default now()
   );
   ```

2. [ ] Create habits table
   ```sql
   create table habits (
     id uuid primary key default uuid_generate_v4(),
     skill_id uuid references skills(id) on delete cascade,
     user_id uuid references auth.users not null,
     schedule_cron text not null,
     schedule_description text,
     last_run timestamp,
     next_run timestamp,
     is_active boolean default true,
     config jsonb,
     created_at timestamp default now()
   );
   ```

3. [ ] Create reflexes table
   ```sql
   create table reflexes (
     id uuid primary key default uuid_generate_v4(),
     skill_id uuid references skills(id) on delete cascade,
     user_id uuid references auth.users not null,
     trigger_type text not null,
     trigger_config jsonb not null,
     conditions jsonb,
     is_active boolean default true,
     created_at timestamp default now()
   );
   ```

4. [ ] Create execution logs table
   ```sql
   create table skill_executions (
     id uuid primary key default uuid_generate_v4(),
     skill_id uuid references skills(id),
     user_id uuid references auth.users not null,
     execution_type text not null,
     reference_id uuid,
     input jsonb,
     output text,
     tokens_used integer,
     duration_ms integer,
     status text not null,
     error_message text,
     executed_at timestamp default now()
   );
   ```

5. [ ] Implement Row Level Security policies
   ```sql
   alter table skills enable row level security;
   create policy "Users can view own skills" on skills
     for select using (auth.uid() = user_id);
   -- Repeat for insert, update, delete
   ```

6. [ ] Generate TypeScript types
   ```bash
   supabase gen types typescript --project-id [id] > types/database.ts
   ```

7. [ ] Create API service layer
   - `services/skillsApi.ts` - CRUD operations
   - `services/habitsApi.ts` - Habits CRUD
   - `services/reflexesApi.ts` - Reflexes CRUD
   - `services/executionsApi.ts` - Execution logging

8. [ ] Create API route handlers (if using Next.js style)
   - GET/POST `/api/skills`
   - GET/PUT/DELETE `/api/skills/:id`
   - POST `/api/skills/:id/execute`

---

## Verification Requirements

**Type:** TDD + INTEGRATION_TEST

**Requirements:**
- [ ] All tables created successfully in Supabase
- [ ] RLS policies prevent unauthorized access
- [ ] CRUD endpoints work correctly
- [ ] Types generated and importable
- [ ] Migrations versioned and reproducible

**Acceptance Criteria:**
- Database tables deployed
- All CRUD operations work via API
- TypeScript types match schema
- RLS blocks cross-user access

**Automation Script:**
```bash
# Run migrations
supabase db push

# Generate types
supabase gen types typescript > types/database.ts

# Test API endpoints
npm run test:integration -- --grep "skills api"
```

---

## Enhancement Queries

**Query 1 (Priority: high):**
```
Supabase Row Level Security best practices multi-tenant 2026
```

**Query 2 (Priority: high):**
```
TypeScript Supabase client type generation patterns
```

---

## Files Modified/Created

- [ ] `database/migrations/002_skills_tables.sql` (create)
- [ ] `types/database.ts` (generate)
- [ ] `types/skills.ts` (create - domain types)
- [ ] `services/skillsApi.ts` (create)
- [ ] `services/habitsApi.ts` (create)
- [ ] `services/reflexesApi.ts` (create)
- [ ] `services/executionsApi.ts` (create)

---

## Commit Message

```
feat(db): add Skills, Habits, Reflexes schema with RLS

- Create skills, habits, reflexes, skill_executions tables
- Implement Row Level Security policies
- Generate TypeScript types from schema
- Add API service layer for CRUD operations
```

**Type:** feat

---

## Git Note

```
Task: task_2_1
Summary: Database schema and API foundation complete
Verification: Migrations applied, RLS tested, types generated
Context: Foundation for Skills feature (Sprint 2)
Breaking: New tables added to database
```

---

## Risk Assessment

**Risk Level:** HIGH

**Potential Risks:**
- Risk 1: RLS policy misconfiguration → Mitigation: Thorough security testing
- Risk 2: Schema changes break existing data → Mitigation: Use migrations properly
- Risk 3: Type generation drift → Mitigation: Automate type generation in CI

**Critical Blocker:** Yes - All Skills features depend on this

---

## Context Cost Estimate

**Estimated Tokens:** ~35,000 tokens
**Tool Calls:** 25-35 expected
**Agent Session:** 4-6 hours

---

## Status Tracking

**Status:** [ ] Not Started
**Assigned Agent:**
**Started:**
**Completed:**
**Checkpoint SHA:**
