# Kijko Dashboard Refactor + Skills Feature - Implementatieplan

## 📋 Project Overview

**Epic:** Dashboard Navigation Refactor + Skills, Habits & Reflexes Feature
**Timeline:** 3-4 weken (3 sprints)
**Goal:** Refactor dashboard naar tab-based navigatie en implementeer volledige Skills management systeem

---

## 🎯 High-Level Changes

### Navigation & UX Restructurering
- Projects, Integrations, Skills worden tabs binnen hoofddashboard
- User avatar + dropdown toegevoegd (rechtsboven)
- Settings button verplaatst naar user dropdown
- My Profile verhuist van Settings naar user dropdown
- Integrations verhuist van Settings naar dedicated tab
- Support chat widget (rechtsonderhoek)

### New Features
- **Skills:** AI capability management (create, edit, execute AI skills)
- **Habits:** Scheduled/recurring skill executions
- **Reflexes:** Triggered/reactive skill executions
- **Support Chat:** AI-powered help chatbot

### Settings Menu (after migration)
Remaining items:
- General
- Notifications
- Security and Data
- Billing and Usage
- Members (Teams/Enterprise)
- Advanced Security
- Audit Log

---

# Sprint 1: Navigation Foundation & Tab Structure
**Duration:** 1-1.5 weeks
**Goal:** Werkende tab navigatie met bestaande features gemigreerd

## Story 1.1: Tab Navigation Implementatie
**Points:** 5
**Priority:** Critical

### Description
Converteer de huidige Projects pagina naar een tabbed layout met drie tabs: Projects, Integrations, Skills.

### Technical Requirements
- Tab component implementeren (gebruik shadcn/ui Tabs of custom)
- URL routing: `?tab=projects`, `?tab=integrations`, `?tab=skills`
- State management voor active tab
- Default tab: Projects
- Tab persistence in URL voor deep linking

### Implementation Details
```typescript
// Example structure
<Tabs defaultValue="projects" value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="projects">Projects</TabsTrigger>
    <TabsTrigger value="integrations">Integrations</TabsTrigger>
    <TabsTrigger value="skills">Skills</TabsTrigger>
  </TabsList>
  
  <TabsContent value="projects">
    <ProjectsView />
  </TabsContent>
  
  <TabsContent value="integrations">
    <IntegrationsView />
  </TabsContent>
  
  <TabsContent value="skills">
    <SkillsView />
  </TabsContent>
</Tabs>
Acceptatie Criteria
 Drie tabs zichtbaar: Projects, Integrations, Skills

 Active tab visueel gemarkeerd

 Tab switches zonder page reload

 Deep linking werkt (directe URL naar specifieke tab)

 Responsive design (mobile tabs collapse/scroll)

Story 1.2: Header Restructurering
Points: 3
Priority: Critical

Description
Verwijder Settings button uit rechterbovenhoek en voeg User avatar component toe.

Technical Requirements
Avatar component (shadcn/ui Avatar)

Toont eerste letter van naam of uploaded foto

Positionering: rechtsboven, naast "Create new" button

Hover state en click handler

Implementation Details
typescript
// Avatar component
<Avatar className="cursor-pointer" onClick={toggleDropdown}>
  <AvatarImage src={user.photoUrl} />
  <AvatarFallback>{user.name}</AvatarFallback>
</Avatar>
Acceptatie Criteria
 Avatar zichtbaar rechts naast "Create new" button

 Avatar toont foto of fallback letter

 Hover state visible

 Click opent dropdown (Story 1.3)

 Settings button verwijderd uit header

Story 1.3: User Profile Dropdown
Points: 3
Priority: Critical

Description
Dropdown menu bij avatar met opties: My Profile, Settings, Log out.

Technical Requirements
DropdownMenu component (shadcn/ui)

Menu items:

My Profile → opent profile modal/page

Settings → opent settings sidebar

Divider

Log out → logout functionaliteit

Click outside to close

Smooth animations

Implementation Details
typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Avatar>...</Avatar>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={openProfile}>
      <User className="mr-2" /> My Profile
    </DropdownMenuItem>
    <DropdownMenuItem onClick={openSettings}>
      <Settings className="mr-2" /> Settings
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={logout}>
      <LogOut className="mr-2" /> Log out
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
Acceptatie Criteria
 "My Profile" opent profile interface

 "Settings" opent settings menu (huidige functionaliteit)

 "Log out" logt gebruiker uit

 Smooth open/close animations

 Keyboard navigation werkend

Story 1.4: Integrations Tab Migratie
Points: 5
Priority: High

Description
Verplaats volledige Integrations sectie van Settings naar de nieuwe Integrations tab.

Technical Requirements
Copy Integrations UI components van Settings

Paste in nieuwe IntegrationsView component

Update alle internal navigation/links

Remove Integrations van Settings sidebar

Behoud alle state management en functionaliteit

Test alle integration flows (connect, disconnect, configure)

Data Migration
Geen database migratie nodig

UI-only verplaatsing

Behoud bestaande API endpoints

Acceptatie Criteria
 Integrations tab toont alle bestaande integrations

 Connect/disconnect functionaliteit werkt

 Configuration modals/forms werkend

 Geen broken links of references

 Settings menu bevat geen Integrations item meer

 All existing integrations still functional

Story 1.5: My Profile uit Settings
Points: 3
Priority: High

Description
Verplaats My Profile content uit Settings naar dedicated profile view, toegankelijk via user dropdown.

Technical Requirements
Create MyProfile component/modal

Copy content van Settings > My Profile

Trigger via user dropdown "My Profile" item

Modal of full-page view (depending on design preference)

Remove My Profile van Settings sidebar

Behoud functionaliteit:

Profile photo upload

Gravatar toggle

Account information edit

Form submissions

Implementation Details
typescript
// Profile modal/page
<Dialog open={profileOpen} onOpenChange={setProfileOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>My Profile</DialogTitle>
      <DialogDescription>
        Manage your personal information and preferences
      </DialogDescription>
    </DialogHeader>
    
    {/* Photo upload section */}
    {/* Account info form */}
    {/* etc. */}
  </DialogContent>
</Dialog>
Acceptatie Criteria
 My Profile niet meer in Settings sidebar

 Profile view opent via avatar dropdown

 Photo upload functionaliteit werkt

 Account info kan gewijzigd worden

 Form validatie werkend

 Changes worden opgeslagen correct

Sprint 1 Definition of Done
✅ Tab navigatie volledig werkend

✅ User avatar + dropdown geïmplementeerd

✅ Integrations en My Profile succesvol gemigreerd

✅ Settings menu heeft correcte items (General, Notifications, Security, Billing, Members, Advanced Security, Audit Log)

✅ Geen regressions in bestaande functionaliteit

✅ Responsive op mobile/tablet/desktop

✅ All navigation flows tested

Total Sprint 1: 19 story points

Sprint 2: Skills Feature Foundation
Duration: 1.5-2 weeks
Goal: Skills library werkend met CRUD operaties en manual execution

Story 2.1: Database Schema & API
Points: 5
Priority: Critical

Description
Setup database schema voor Skills, Habits, Reflexes + API endpoints.

Database Schema
sql
-- Skills tabel (basis capabilities)
create table skills (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  category text, -- 'Marketing', 'Engineering', 'Planning', etc.
  prompt_template text not null, -- De core AI prompt
  model text default 'claude-3-5-sonnet-20241022',
  parameters jsonb default '{"temperature": 1, "max_tokens": 4096}',
  input_schema jsonb, -- Welke inputs verwacht deze skill
  output_format text default 'markdown', -- 'text', 'json', 'markdown'
  is_active boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Habits tabel (scheduled skills)
create table habits (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references auth.users not null,
  schedule_cron text not null, -- '0 9 * * 1-5' voor dagelijks 9am weekdagen
  schedule_description text, -- 'Every weekday at 9 AM'
  last_run timestamp,
  next_run timestamp,
  is_active boolean default true,
  config jsonb, -- Habit-specific parameter overrides
  created_at timestamp default now()
);

-- Reflexes tabel (triggered skills)
create table reflexes (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references auth.users not null,
  trigger_type text not null, -- 'webhook', 'integration_event', 'pattern'
  trigger_config jsonb not null, -- Trigger specifieke configuratie
  conditions jsonb, -- Wanneer moet deze reflex activeren
  is_active boolean default true,
  created_at timestamp default now()
);

-- Execution logs
create table skill_executions (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references skills(id),
  user_id uuid references auth.users not null,
  execution_type text not null, -- 'manual', 'habit', 'reflex'
  reference_id uuid, -- habit_id of reflex_id indien applicable
  input jsonb,
  output text,
  tokens_used integer,
  duration_ms integer,
  status text not null, -- 'success', 'error'
  error_message text,
  executed_at timestamp default now()
);

-- RLS Policies
alter table skills enable row level security;
alter table habits enable row level security;
alter table reflexes enable row level security;
alter table skill_executions enable row level security;

-- Users can only see/modify their own data
create policy "Users can view own skills" on skills
  for select using (auth.uid() = user_id);
create policy "Users can insert own skills" on skills
  for insert with check (auth.uid() = user_id);
create policy "Users can update own skills" on skills
  for update using (auth.uid() = user_id);
create policy "Users can delete own skills" on skills
  for delete using (auth.uid() = user_id);

-- Repeat for habits, reflexes, skill_executions
API Endpoints
typescript
// Skills CRUD
GET    /api/skills          // List user's skills
POST   /api/skills          // Create new skill
GET    /api/skills/:id      // Get skill details
PUT    /api/skills/:id      // Update skill
DELETE /api/skills/:id      // Delete skill

// Execution
POST   /api/skills/:id/execute  // Execute skill manually

// Habits
GET    /api/skills/:id/habits
POST   /api/skills/:id/habits
PUT    /api/habits/:id
DELETE /api/habits/:id

// Reflexes
GET    /api/skills/:id/reflexes
POST   /api/skills/:id/reflexes
PUT    /api/reflexes/:id
DELETE /api/reflexes/:id

// Execution history
GET    /api/skills/:id/executions
GET    /api/executions/:id  // Single execution detail
TypeScript Types
typescript
// Generate from Supabase
// supabase gen types typescript --project-id [project-id] > types/database.ts

type Skill = Database['public']['Tables']['skills']['Row'];
type SkillInsert = Database['public']['Tables']['skills']['Insert'];
type SkillUpdate = Database['public']['Tables']['skills']['Update'];
// etc.
Acceptatie Criteria
 Database tables deployed op production Supabase

 RLS policies voorkomen unauthorized access

 All CRUD endpoints werkend en getest

 Types gegenereerd en beschikbaar in frontend

 Migrations versioned en reproducible

Story 2.2: Skills Library UI
Points: 8
Priority: Critical

Description
Grid view voor skills library met search, filtering, en empty states.

UI Components
Grid layout (responsive: 1 col mobile, 2 tablet, 3 desktop)

Skill cards met:

Icon/emoji

Name

Description (truncated)

Category badge

Quick actions: Run, Edit, Delete

Usage stats (# of runs)

"Create new skill" button (prominent)

Search bar

Category filter dropdown

Empty state voor nieuwe users

Implementation Details
typescript
// SkillsView component
<div className="skills-container">
  <div className="skills-header">
    <h1>Skills Library</h1>
    <Button onClick={openCreateSkill}>
      <Plus /> Create new skill
    </Button>
  </div>
  
  <div className="skills-filters">
    <Input 
      placeholder="Search skills..." 
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
      <SelectItem value="all">All categories</SelectItem>
      <SelectItem value="marketing">Marketing</SelectItem>
      <SelectItem value="engineering">Engineering</SelectItem>
      {/* etc */}
    </Select>
  </div>
  
  {skills.length === 0 ? (
    <EmptyState />
  ) : (
    <div className="skills-grid">
      {filteredSkills.map(skill => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  )}
</div>
Empty State
typescript
<EmptyState
  icon={<Sparkles />}
  title="No skills yet"
  description="Create your first AI skill to get started"
  action={
    <Button onClick={openCreateSkill}>
      Create your first skill
    </Button>
  }
/>
Acceptatie Criteria
 Skills tonen in responsive grid

 Empty state zichtbaar bij 0 skills

 Search filters skills by name/description

 Category filter werkend

 Create button opent create modal

 Loading state tijdens fetch

 Error state bij fetch failure

Story 2.3: Create Skill Form
Points: 5
Priority: Critical

Description
Modal/drawer voor het creëren van nieuwe skills.

Form Fields
Name (required, text input)

Description (optional, textarea)

Category (required, select: Marketing, Engineering, Planning, Support, Custom)

Icon/Emoji (optional, emoji picker)

Prompt Template (required, textarea with syntax highlighting)

Model Selection (select: Claude 3.5 Sonnet, Claude 3 Opus, etc.)

Parameters (advanced, collapsible):

Temperature (slider 0-1)

Max tokens (input)

Input Schema (optional, JSON editor for structured inputs)

Validation
Name: required, max 100 chars

Prompt template: required, min 20 chars

Category: required

Model: required

Implementation Details
typescript
// CreateSkillModal
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Create New Skill</DialogTitle>
    </DialogHeader>
    
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <FormField name="name" label="Skill Name" required />
        <FormField name="description" label="Description" type="textarea" />
        <FormField name="category" label="Category" type="select" required />
        
        <FormField 
          name="prompt_template" 
          label="Prompt Template" 
          type="textarea"
          placeholder="You are an expert at..."
          required
        />
        
        <FormField name="model" label="AI Model" type="select" required />
        
        <Collapsible>
          <CollapsibleTrigger>Advanced Parameters</CollapsibleTrigger>
          <CollapsibleContent>
            <FormField name="temperature" label="Temperature" type="slider" />
            <FormField name="max_tokens" label="Max Tokens" type="number" />
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Create Skill
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
Acceptatie Criteria
 Form opent bij "Create new skill" click

 All fields render correctly

 Validation errors tonen bij submit

 Successful submission creates skill in DB

 New skill appears in library immediately

 Modal sluit na successful creation

 Error handling voor API failures

Story 2.4: Skill Detail & Edit
Points: 5
Priority: High

Description
Detail view/modal voor skill met edit en delete functionaliteit.

Features
View all skill properties

Edit button → reuse create form with pre-filled data

Delete button with confirmation dialog

Execution history preview (last 5 runs)

Quick "Run" button

Tabs voor: Overview, Habits, Reflexes, History

Implementation Details
typescript
// SkillDetailModal
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <DialogHeader>
      <div className="flex items-center justify-between">
        <DialogTitle>{skill.name}</DialogTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit /> Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash /> Delete
          </Button>
        </div>
      </div>
    </DialogHeader>
    
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="habits">Habits</TabsTrigger>
        <TabsTrigger value="reflexes">Reflexes</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {/* Skill properties */}
        <Button onClick={handleRun}>Run Skill</Button>
      </TabsContent>
      
      {/* Other tabs */}
    </Tabs>
  </DialogContent>
</Dialog>
Delete Confirmation
typescript
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete skill?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete "{skill.name}" and all associated habits, 
        reflexes, and execution history. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={confirmDelete} variant="destructive">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
Acceptatie Criteria
 Click op skill card opent detail view

 All skill properties displayed

 Edit button opent edit form met pre-filled data

 Edit save updates skill correctly

 Delete shows confirmation dialog

 Delete removes skill + associated data

 Tabs navigation werkend

 Run button triggert execution (Story 2.5)

Story 2.5: Manual Skill Execution
Points: 8
Priority: Critical

Description
Systeem voor het handmatig uitvoeren van skills met dynamic input forms en AI response rendering.

Features
Dynamic input form based on skill's input_schema

Execute button triggert AI call

Loading state tijdens execution

Response rendering (markdown support)

Token usage display

Execution time display

Save execution to logs

Error handling & retry

Implementation Details
typescript
// ExecuteSkillModal
function ExecuteSkillModal({ skill }) {
  const [inputs, setInputs] = useState({});
  const [response, setResponse] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const result = await fetch(`/api/skills/${skill.id}/execute`, {
        method: 'POST',
        body: JSON.stringify({ inputs })
      });
      
      const data = await result.json();
      setResponse(data);
    } catch (error) {
      // Error handling
    } finally {
      setIsExecuting(false);
    }
  };
  
  return (
    <div className="execution-container">
      {/* Dynamic input form */}
      <DynamicInputForm 
        schema={skill.input_schema} 
        values={inputs}
        onChange={setInputs}
      />
      
      <Button onClick={handleExecute} loading={isExecuting}>
        Execute Skill
      </Button>
      
      {response && (
        <div className="execution-result">
          <div className="result-meta">
            <span>Tokens: {response.tokens_used}</span>
            <span>Duration: {response.duration_ms}ms</span>
          </div>
          <div className="result-content">
            <ReactMarkdown>{response.output}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
API Endpoint
typescript
// /api/skills/:id/execute
export async function POST(req: Request, { params }) {
  const { inputs } = await req.json();
  const skill = await getSkill(params.id);
  
  const startTime = Date.now();
  
  // Build prompt with inputs
  const prompt = buildPrompt(skill.prompt_template, inputs);
  
  // Call Claude API
  const response = await anthropic.messages.create({
    model: skill.model,
    max_tokens: skill.parameters.max_tokens,
    temperature: skill.parameters.temperature,
    messages: [{ role: 'user', content: prompt }]
  });
  
  const duration = Date.now() - startTime;
  
  // Log execution
  await db.skill_executions.insert({
    skill_id: skill.id,
    user_id: skill.user_id,
    execution_type: 'manual',
    input: inputs,
    output: response.content.text,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    duration_ms: duration,
    status: 'success'
  });
  
  return {
    output: response.content.text,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    duration_ms: duration
  };
}
Acceptatie Criteria
 Input form genereert based on skill's input_schema

 Execute button calls API endpoint

 Loading state shows during execution

 Response renders correctly (markdown formatted)

 Tokens and duration displayed

 Execution logged to database

 Error messages user-friendly

 Retry mogelijk bij failures

Sprint 2 Definition of Done
✅ Skills database volledig operationeel met RLS

✅ Skills CRUD fully functional

✅ Skills library UI polished

✅ Users kunnen skills creëren, bewerken, verwijderen

✅ Manual skill execution werkend

✅ Execution results correct weergegeven

✅ Execution logging functioneel

✅ Error handling robuust

✅ UI consistent met design system

Total Sprint 2: 31 story points

Sprint 3: Habits, Reflexes & Support Chat
Duration: 1.5-2 weeks
Goal: Automation features + AI support chat

Story 3.1: Habits Implementation
Points: 8
Priority: High

Description
Scheduled skill executions - skills die automatisch draaien op basis van cron schedules.

Features
Habits UI within skill detail (tab)

Cron schedule configurator

"Enable habit" toggle on skills

Schedule description generator (human readable)

Background execution systeem

Next run timestamp display

Pause/resume habits

UI Implementation
typescript
// HabitsTab within SkillDetail
<TabsContent value="habits">
  {skill.habits.length === 0 ? (
    <EmptyState 
      title="No habits configured"
      description="Turn this skill into a habit by scheduling it"
      action={<Button onClick={openHabitConfig}>Create Habit</Button>}
    />
  ) : (
    <div className="habits-list">
      {skill.habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </div>
  )}
</TabsContent>

// HabitConfigModal
<Dialog open={isOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Configure Habit</DialogTitle>
    </DialogHeader>
    
    <CronBuilder 
      value={cronExpression}
      onChange={setCronExpression}
    />
    
    <div className="schedule-preview">
      <p>This skill will run: {scheduleDescription}</p>
      <p>Next run: {nextRunTime}</p>
    </div>
    
    <DialogFooter>
      <Button onClick={saveHabit}>Save Habit</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
Cron Builder Options
Presets: Daily, Weekly, Monthly, Custom

Time picker

Day selector (weekdays/specific days)

Human-readable preview

Background Execution
Option A: Supabase pg_cron

sql
-- Enable pg_cron extension
create extension pg_cron;

-- Create function to execute habits
create or replace function execute_due_habits() returns void as $$
begin
  -- Find habits due for execution
  -- Execute each via Edge Function
end;
$$ language plpgsql;

-- Schedule check every minute
select cron.schedule('check-habits', '* * * * *', 'select execute_due_habits()');
Option B: N8N Workflow

N8N workflow checks for due habits every minute

Triggers skill execution via API

Updates last_run and next_run timestamps

Acceptatie Criteria
 Users kunnen habit schedules configureren

 Cron expressions correctly generated

 Schedule description human-readable

 Scheduled skills execute automatically at correct times

 Execution history shows habit runs

 Users kunnen habits pause/resume

 Next run time accurately calculated and displayed

 Error notifications als habit execution faalt

Story 3.2: Reflexes Implementation
Points: 8
Priority: High

Description
Event-triggered skill executions - skills die activeren op basis van triggers (webhooks, integration events).

Features
Reflexes UI within skill detail

Trigger type selection

Webhook URL generation per reflex

Trigger configuration (conditions, filters)

Event listener systeem

Reflex execution logs

Enable/disable toggle

Trigger Types
Webhook: Generate unique webhook URL, skill executes wanneer webhook called

Integration Event: Trigger op events van connected integrations

Pattern Detection: (Future) Trigger op detected patterns in data

UI Implementation
typescript
// ReflexesTab
<TabsContent value="reflexes">
  {skill.reflexes.length === 0 ? (
    <EmptyState 
      title="No reflexes configured"
      description="Make this skill reactive by adding triggers"
      action={<Button onClick={openReflexConfig}>Create Reflex</Button>}
    />
  ) : (
    <div className="reflexes-list">
      {skill.reflexes.map(reflex => (
        <ReflexCard key={reflex.id} reflex={reflex} />
      ))}
    </div>
  )}
</TabsContent>

// ReflexConfigModal
<Dialog open={isOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Configure Reflex</DialogTitle>
    </DialogHeader>
    
    <Select value={triggerType} onValueChange={setTriggerType}>
      <SelectItem value="webhook">Webhook</SelectItem>
      <SelectItem value="integration_event">Integration Event</SelectItem>
    </Select>
    
    {triggerType === 'webhook' && (
      <div className="webhook-config">
        <Label>Webhook URL</Label>
        <div className="flex gap-2">
          <Input value={webhookUrl} readOnly />
          <Button onClick={copyWebhookUrl}>Copy</Button>
        </div>
        <p className="text-sm text-muted">
          POST to this URL to trigger the skill
        </p>
      </div>
    )}
    
    {triggerType === 'integration_event' && (
      <div className="integration-config">
        <Select value={integration} onValueChange={setIntegration}>
          {/* List connected integrations */}
        </Select>
        <Select value={eventType} onValueChange={setEventType}>
          {/* Event types for selected integration */}
        </Select>
      </div>
    )}
    
    <div className="conditions-config">
      <Label>Conditions (optional)</Label>
      <JsonEditor value={conditions} onChange={setConditions} />
    </div>
    
    <DialogFooter>
      <Button onClick={saveReflex}>Save Reflex</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
Webhook Handler
typescript
// /api/webhooks/reflexes/:reflex_id
export async function POST(req: Request, { params }) {
  const reflex = await getReflex(params.reflex_id);
  const payload = await req.json();
  
  // Check if conditions met
  if (reflex.conditions && !evaluateConditions(reflex.conditions, payload)) {
    return { status: 'conditions_not_met' };
  }
  
  // Execute skill
  const result = await executeSkill(reflex.skill_id, {
    inputs: payload,
    execution_type: 'reflex',
    reference_id: reflex.id
  });
  
  return result;
}
Acceptatie Criteria
 Users kunnen reflexes configureren

 Webhook URLs generated and unique

 Webhook calls trigger skill execution

 Integration events can be selected

 Conditions evaluated correctly before execution

 Execution logs show trigger info

 Users can enable/disable reflexes

 Error handling for failed triggers

Story 3.3: Support Chat Widget UI
Points: 5
Priority: Medium

Description
Floating chat widget in rechter onderhoek voor AI-powered support.

Features
Floating chat bubble (collapsed state)

Chat window (expanded state)

Message list (user & assistant bubbles)

Text input + send button

Open/close animations

Typing indicator

Auto-scroll to latest message

Message timestamps

Mobile responsive

Implementation
typescript
// SupportChat component
export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! How can I help you with Kijko today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="support-bubble"
        >
          <MessageCircle size={24} />
          <span className="notification-badge">1</span>
        </button>
      ) : (
        <div className="support-window">
          <div className="support-header">
            <div className="flex items-center gap-2">
              <Sparkles size={20} />
              <span>Kijko Support</span>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <div className="support-messages">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
          
          <div className="support-input">
            <Input 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <Button onClick={sendMessage}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
Styling
css
.support-bubble {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.2s;
  position: relative;
}

.support-bubble:hover {
  transform: scale(1.05);
}

.support-window {
  width: 380px;
  height: 600px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
Acceptatie Criteria
 Chat bubble visible in rechter onderhoek

 Click opens chat window with smooth animation

 Messages display correctly (user vs assistant styling)

 Input field accepts text and Enter key

 Send button functional

 Auto-scroll to latest message

 Close button collapses to bubble

 Responsive on mobile (full-screen or adjusted width)

Story 3.4: Support Chat AI Integration
Points: 5
Priority: Medium

Description
AI-powered support chatbot met context over user's Kijko data.

Features
Dedicated support skill/prompt

Context injection (projects count, skills count, recent activity)

Conversation history (session-based)

Response streaming (optional)

Helpful, concise responses

Can suggest actions ("Would you like me to help you create a skill?")

Support Prompt
typescript
const SUPPORT_PROMPT = `
You are Kijko's AI support assistant. You help users with:

- Understanding Skills, Habits, and Reflexes
- Creating and configuring skills
- Troubleshooting integrations
- Best practices for organizing projects
- General platform questions

Current user context:
- Total projects: {project_count}
- Active skills: {skills_count}
- Recent activity: {recent_activity}

Guidelines:
- Be concise and actionable
- Use friendly, conversational tone
- Offer to help with specific tasks when relevant
- If you don't know something, admit it and suggest alternatives
- Reference the user's existing data when helpful

User message: {user_input}
`;
API Implementation
typescript
// /api/support/chat
export async function POST(req: Request) {
  const { message, conversation_history } = await req.json();
  const user = await getCurrentUser();
  
  // Fetch user context
  const context = await getUserContext(user.id);
  
  // Build messages array
  const messages = [
    {
      role: 'system',
      content: buildSupportPrompt(context)
    },
    ...conversation_history,
    {
      role: 'user',
      content: message
    }
  ];
  
  // Call Claude
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages
  });
  
  return {
    message: response.content.text,
    conversation_id: conversation_id // For session tracking
  };
}
Context Function
typescript
async function getUserContext(userId: string) {
  const [projects, skills, executions] = await Promise.all([
    db.projects.count({ user_id: userId }),
    db.skills.count({ user_id: userId }),
    db.skill_executions.findMany({ 
      user_id: userId, 
      limit: 5,
      orderBy: { executed_at: 'desc' }
    })
  ]);
  
  return {
    project_count: projects,
    skills_count: skills,
    recent_activity: executions.map(e => ({
      skill_name: e.skill.name,
      status: e.status,
      executed_at: e.executed_at
    }))
  };
}
Acceptatie Criteria
 Chat gives relevant, helpful responses

 Responses reference user's actual data (project/skill counts)

 Conversation history maintained within session

 Response time < 3 seconds

 Errors handled gracefully with fallback messages

 Can handle follow-up questions

 Tone is friendly and professional

Story 3.5: Analytics & Polish
Points: 5
Priority: Low

Description
Execution statistics, skill templates, onboarding, en final polish.

Features
1. Execution Statistics

Per-skill stats dashboard

Metrics: total runs, success rate, avg tokens, avg duration

Chart: executions over time (last 30 days)

Top performing skills

typescript
// SkillStats component
<div className="skill-stats">
  <StatCard 
    label="Total Runs"
    value={stats.total_runs}
    icon={<Play />}
  />
  <StatCard 
    label="Success Rate"
    value={`${stats.success_rate}%`}
    icon={<CheckCircle />}
  />
  <StatCard 
    label="Avg Tokens"
    value={stats.avg_tokens}
    icon={<Zap />}
  />
  <StatCard 
    label="Avg Duration"
    value={`${stats.avg_duration}ms`}
    icon={<Clock />}
  />
  
  <LineChart data={stats.executions_over_time} />
</div>
2. Skill Templates
Pre-made skills for common use cases:

"Marketing Copy Generator"

"Code Reviewer"

"Meeting Summarizer"

"Email Drafter"

"Sprint Planner"

Template system:

typescript
const SKILL_TEMPLATES = [
  {
    name: "Marketing Copy Generator",
    category: "Marketing",
    description: "Generate compelling marketing copy for products",
    prompt_template: "You are an expert marketing copywriter...",
    input_schema: {
      product_name: "string",
      target_audience: "string",
      tone: "string"
    }
  },
  // etc.
];

// UI: Template selector in create skill modal
<div className="template-selector">
  <p>Start from a template or create from scratch</p>
  <div className="template-grid">
    {SKILL_TEMPLATES.map(template => (
      <TemplateCard 
        template={template}
        onClick={() => applyTemplate(template)}
      />
    ))}
  </div>
</div>
3. Onboarding Flow
First-time user experience:

Welcome modal explaining Skills concept

Guided tour (tooltips on key UI elements)

Suggest creating first skill from template

Checklist: Create skill, Run skill, Create habit

typescript
// Onboarding component
<OnboardingModal show={isFirstVisit}>
  <OnboardingSlide>
    <h2>Welcome to Skills! 🎉</h2>
    <p>Skills are AI capabilities you can create, schedule, and automate.</p>
  </OnboardingSlide>
  
  <OnboardingSlide>
    <h2>Three types of Skills</h2>
    <ul>
      <li><strong>Skills:</strong> On-demand AI capabilities</li>
      <li><strong>Habits:</strong> Scheduled executions</li>
      <li><strong>Reflexes:</strong> Triggered by events</li>
    </ul>
  </OnboardingSlide>
  
  <OnboardingSlide>
    <h2>Ready to create your first skill?</h2>
    <Button onClick={startWithTemplate}>Start with a template</Button>
  </OnboardingSlide>
</OnboardingModal>
4. Performance Optimizations

Lazy loading for execution history

Pagination for skills list (if > 50 skills)

Caching for frequently accessed skills

Optimistic UI updates

Debounced search

5. Bug Fixes & Testing

Comprehensive testing of all flows

Edge case handling

Error message improvements

Accessibility improvements (keyboard nav, ARIA labels)

Mobile UX refinements

Acceptatie Criteria
 Stats dashboard shows accurate metrics

 Charts render correctly

 Skill templates available and functional

 Onboarding shows for new users only

 Performance acceptable (< 2s load time)

 No critical bugs

 Mobile experience polished

 Accessibility standards met

Sprint 3 Definition of Done
✅ Habits fully functional with scheduling

✅ Reflexes working with webhooks and events

✅ Support chat operational and helpful

✅ Analytics/stats available

✅ Skill templates implemented

✅ Onboarding for new users

✅ Performance optimized

✅ Feature thoroughly tested

✅ Documentation/help content created

✅ Ready for production launch

Total Sprint 3: 31 story points

Technical Stack Summary
Frontend
Framework: React (via Lovable)

UI Components: shadcn/ui (Tabs, Dialog, DropdownMenu, Select, Avatar, etc.)

Forms: react-hook-form + zod validation

Markdown: react-markdown for skill responses

Charts: recharts or lightweight alternative

Cron Builder: react-cron-generator or custom

State: React context or Zustand for global state

Routing: Next.js App Router or similar

Backend
Database: Supabase (PostgreSQL)

Auth: Supabase Auth

APIs: Next.js API routes or Supabase Edge Functions

AI: Anthropic Claude API

Scheduling:

Option A: Supabase pg_cron extension

Option B: N8N workflows

Webhooks: Custom webhook handlers in API routes

External Services
AI Provider: Anthropic (Claude 3.5 Sonnet)

File Storage: Supabase Storage (for profile photos)

Monitoring: Sentry or similar (optional)

Database Tables
skills (AI capabilities)

habits (scheduled executions)

reflexes (triggered executions)

skill_executions (execution logs)

Existing: users, projects, integrations, etc.

Deployment Strategy
Phased Rollout
Phase 1: Internal Testing (Sprint 1 complete)

Deploy navigation changes to staging

Internal team testing

Fix critical bugs

Phase 2: Beta Release (Sprint 2 complete)

Feature flag: enable Skills for select beta users

Gather feedback on Skills creation/execution

Iterate based on feedback

Phase 3: Full Launch (Sprint 3 complete)

Remove feature flag

Public announcement

Marketing push

Monitor for issues

Feature Flags
typescript
// Feature flag system
const FEATURE_FLAGS = {
  skills_enabled: process.env.NEXT_PUBLIC_SKILLS_ENABLED === 'true',
  habits_enabled: process.env.NEXT_PUBLIC_HABITS_ENABLED === 'true',
  reflexes_enabled: process.env.NEXT_PUBLIC_REFLEXES_ENABLED === 'true',
  support_chat_enabled: process.env.NEXT_PUBLIC_SUPPORT_CHAT_ENABLED === 'true'
};

// Usage
{FEATURE_FLAGS.skills_enabled && (
  <TabsTrigger value="skills">Skills</TabsTrigger>
)}
Success Metrics
User Engagement
% of users who create at least 1 skill (target: >60% within 2 weeks)

Average # of skills per active user (target: 3-5)

% of skills that are executed at least once (target: >80%)

Feature Adoption
% of skills with habits configured (target: >30%)

% of skills with reflexes configured (target: >15%)

Support chat engagement rate (target: >25% of users)

Quality Metrics
Skill execution success rate (target: >95%)

Average response time for skill execution (target: <3s)

Support chat satisfaction (target: >4/5 rating)

Business Metrics
User retention improvement (compare pre/post launch)

Feature engagement (DAU/MAU ratio)

Upgrade rate (if Skills are premium feature)

Risks & Mitigations
Risk 1: Complex Migration
Risk: Moving Integrations and My Profile might break existing flows
Mitigation:

Comprehensive testing before deployment

Gradual rollout with feature flags

Rollback plan ready

Risk 2: AI Execution Costs
Risk: High usage of skills could lead to expensive API costs
Mitigation:

Implement usage limits per user tier

Monitor token usage closely

Add cost alerts

Consider caching for common prompts

Risk 3: Scheduling Reliability
Risk: Habits might not execute reliably at scheduled times
Mitigation:

Robust scheduling system (pg_cron or N8N)

Monitoring and alerting for failed executions

Retry logic for transient failures

User notifications for consistent failures

Risk 4: User Adoption
Risk: Users might not understand or use Skills feature
Mitigation:

Strong onboarding experience

Helpful templates to get started quickly

Support chat to answer questions

Video tutorials and documentation

Post-Launch Enhancements (Future Sprints)
Skill Marketplace
Public skill templates from community

Share/discover skills

Ratings and reviews

Team Collaboration
Share skills with team members

Team skill libraries

Collaborative editing

Advanced Triggers
More reflex trigger types

Conditional logic builder

Multi-step workflows (skill chains)

Analytics Enhancements
Cost tracking per skill

ROI calculations

Comparative analytics

Export reports

Integrations
Direct integration with tools (Slack, Email, etc.)

Custom API connectors

Zapier-style automation builder

Questions for Claude Code
When implementing, you might want to ask Claude Code:

Sprint 1:

"Implement tab navigation system for Projects, Integrations, Skills"

"Create user avatar dropdown with My Profile and Settings"

"Migrate Integrations from Settings to dedicated tab"

Sprint 2:

"Create Supabase schema for skills, habits, reflexes tables with RLS"

"Build Skills library UI with grid layout, search, and filtering"

"Implement skill creation form with validation"

"Create skill execution system with Claude API integration"

Sprint 3:

"Implement habits scheduling system with cron"

"Build reflexes with webhook triggers"

"Create support chat widget with AI integration"

"Add execution analytics and charts"

File Structure Suggestion
text
/app
  /dashboard
    /page.tsx (main dashboard with tabs)
    /components
      /DashboardTabs.tsx
      /ProjectsTab.tsx
      /IntegrationsTab.tsx
      /SkillsTab.tsx
      /UserAvatar.tsx
  /skills
    /components
      /SkillsLibrary.tsx
      /SkillCard.tsx
      /CreateSkillModal.tsx
      /SkillDetailModal.tsx
      /ExecuteSkillModal.tsx
      /HabitsTab.tsx
      /ReflexesTab.tsx
      /SkillStats.tsx
  /components
    /SupportChat.tsx
  /api
    /skills
      /route.ts (GET, POST)
      /[id]
        /route.ts (GET, PUT, DELETE)
        /execute
          /route.ts (POST)
        /habits
          /route.ts (GET, POST)
        /reflexes
          /route.ts (GET, POST)
    /support
      /chat
        /route.ts (POST)
    /webhooks
      /reflexes
        /[reflex_id]
          /route.ts (POST)

/lib
  /supabase
    /client.ts
    /types.ts
  /ai
    /claude.ts
    /prompts.ts
  /utils
    /cron.ts
    /validation.ts

/supabase
  /migrations
    /001_create_skills_tables.sql
    /002_add_rls_policies.sql