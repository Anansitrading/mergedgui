-- =============================================================================
-- Migration: 002_skills_tables
-- Description: Database schema for Skills, Habits, Reflexes, and Execution Logs
-- Sprint: Dashboard Skills Feature
-- =============================================================================

-- =============================================================================
-- ENUM Types
-- =============================================================================

-- Skill category for organization
CREATE TYPE skill_category AS ENUM (
  'analysis',
  'generation',
  'transformation',
  'communication',
  'automation',
  'custom'
);

-- Output format for skill results
CREATE TYPE skill_output_format AS ENUM ('markdown', 'json', 'text', 'html', 'code');

-- Execution status
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Execution type (how the skill was triggered)
CREATE TYPE execution_type AS ENUM ('manual', 'habit', 'reflex', 'api');

-- Trigger types for reflexes
CREATE TYPE reflex_trigger_type AS ENUM (
  'webhook',
  'email',
  'file_change',
  'api_call',
  'schedule',
  'event'
);

-- =============================================================================
-- Table: skills
-- Core AI capabilities/prompts that users can create and execute
-- =============================================================================

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,

  -- Basic info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category skill_category DEFAULT 'custom',

  -- AI Configuration
  prompt_template TEXT NOT NULL,
  model VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
  parameters JSONB DEFAULT '{"temperature": 1, "max_tokens": 4096}'::JSONB,

  -- Input/Output configuration
  input_schema JSONB,
  output_format skill_output_format DEFAULT 'markdown',

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Usage stats
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT skills_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  CONSTRAINT skills_prompt_not_empty CHECK (char_length(prompt_template) >= 10)
);

-- Indexes for skills
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_is_active ON skills(is_active);
CREATE INDEX idx_skills_created_at ON skills(created_at DESC);
CREATE UNIQUE INDEX idx_skills_name_user ON skills(user_id, LOWER(name));

-- =============================================================================
-- Table: habits
-- Scheduled execution of skills (cron-based automation)
-- =============================================================================

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- Schedule configuration
  schedule_cron VARCHAR(100) NOT NULL,
  schedule_description VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Execution tracking
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Configuration for execution
  config JSONB DEFAULT '{}'::JSONB,

  -- Error tracking
  consecutive_failures INTEGER DEFAULT 0,
  last_error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT habits_cron_not_empty CHECK (char_length(schedule_cron) >= 9)
);

-- Indexes for habits
CREATE INDEX idx_habits_skill_id ON habits(skill_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);
CREATE INDEX idx_habits_next_run_at ON habits(next_run_at) WHERE is_active = TRUE;

-- =============================================================================
-- Table: reflexes
-- Event-triggered execution of skills (webhooks, file changes, etc.)
-- =============================================================================

CREATE TABLE reflexes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- Trigger configuration
  trigger_type reflex_trigger_type NOT NULL,
  trigger_config JSONB NOT NULL,

  -- Conditions for execution (optional filters)
  conditions JSONB,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Usage stats
  trigger_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP WITH TIME ZONE,

  -- Error tracking
  consecutive_failures INTEGER DEFAULT 0,
  last_error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for reflexes
CREATE INDEX idx_reflexes_skill_id ON reflexes(skill_id);
CREATE INDEX idx_reflexes_user_id ON reflexes(user_id);
CREATE INDEX idx_reflexes_trigger_type ON reflexes(trigger_type);
CREATE INDEX idx_reflexes_is_active ON reflexes(is_active);

-- =============================================================================
-- Table: skill_executions
-- Execution history and logs for all skill runs
-- =============================================================================

CREATE TABLE skill_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,

  -- Execution context
  execution_type execution_type NOT NULL,
  reference_id UUID, -- habit_id or reflex_id if applicable

  -- Input/Output
  input JSONB,
  output TEXT,

  -- Usage metrics
  tokens_used INTEGER,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  duration_ms INTEGER,

  -- Cost tracking (in cents)
  cost_cents INTEGER,

  -- Status
  status execution_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  error_code VARCHAR(50),

  -- Timestamps
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for skill_executions
CREATE INDEX idx_skill_executions_skill_id ON skill_executions(skill_id);
CREATE INDEX idx_skill_executions_user_id ON skill_executions(user_id);
CREATE INDEX idx_skill_executions_execution_type ON skill_executions(execution_type);
CREATE INDEX idx_skill_executions_status ON skill_executions(status);
CREATE INDEX idx_skill_executions_executed_at ON skill_executions(executed_at DESC);
CREATE INDEX idx_skill_executions_reference_id ON skill_executions(reference_id) WHERE reference_id IS NOT NULL;

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

-- Apply updated_at triggers to new tables
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reflexes_updated_at
  BEFORE UPDATE ON reflexes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Trigger to update skill execution count
-- =============================================================================

CREATE OR REPLACE FUNCTION update_skill_execution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    UPDATE skills
    SET
      execution_count = execution_count + 1,
      last_executed_at = NEW.completed_at,
      updated_at = NOW()
    WHERE id = NEW.skill_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_skill_execution_count
  AFTER INSERT OR UPDATE OF status ON skill_executions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_skill_execution_count();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_executions ENABLE ROW LEVEL SECURITY;

-- Skills: Users can only access their own skills
CREATE POLICY "Users can view own skills" ON skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own skills" ON skills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON skills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" ON skills
  FOR DELETE USING (auth.uid() = user_id);

-- Habits: Users can only access their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Reflexes: Users can only access their own reflexes
CREATE POLICY "Users can view own reflexes" ON reflexes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reflexes" ON reflexes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflexes" ON reflexes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflexes" ON reflexes
  FOR DELETE USING (auth.uid() = user_id);

-- Skill Executions: Users can only access their own executions
CREATE POLICY "Users can view own executions" ON skill_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own executions" ON skill_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Note: Users should not be able to update or delete execution history

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE skills IS 'AI skill templates with prompt configurations';
COMMENT ON TABLE habits IS 'Scheduled executions of skills (cron-based)';
COMMENT ON TABLE reflexes IS 'Event-triggered executions of skills';
COMMENT ON TABLE skill_executions IS 'Execution history and logs for all skill runs';

COMMENT ON COLUMN skills.prompt_template IS 'The prompt template with optional {{variable}} placeholders';
COMMENT ON COLUMN skills.parameters IS 'JSON object with model parameters: temperature, max_tokens, etc.';
COMMENT ON COLUMN skills.input_schema IS 'JSON Schema defining expected input variables for the prompt';
COMMENT ON COLUMN habits.schedule_cron IS 'Cron expression for scheduling (e.g., "0 9 * * 1-5" for weekday mornings)';
COMMENT ON COLUMN habits.config IS 'JSON object with input values for the skill execution';
COMMENT ON COLUMN reflexes.trigger_config IS 'JSON object with trigger-specific configuration (webhook URL, file patterns, etc.)';
COMMENT ON COLUMN reflexes.conditions IS 'JSON object with conditions that must be met before executing';
COMMENT ON COLUMN skill_executions.reference_id IS 'ID of the habit or reflex that triggered this execution (if applicable)';
