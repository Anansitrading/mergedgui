-- =============================================================================
-- Migration: 003_habits_scheduler
-- Description: Background execution system for Habits using pg_cron
-- Sprint: Dashboard Skills Feature - Task 3_1
-- =============================================================================

-- NOTE: pg_cron must be enabled in your Supabase project settings:
-- Dashboard > Database > Extensions > Enable pg_cron
-- This is available on Pro plan and above.

-- =============================================================================
-- Enable pg_cron Extension
-- =============================================================================

-- Uncomment this if pg_cron is available in your Supabase plan
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =============================================================================
-- Helper Functions for Habit Execution
-- =============================================================================

/**
 * Calculate the next run time based on cron expression and timezone
 * This is a simplified implementation - production should use a proper cron parser
 */
CREATE OR REPLACE FUNCTION calculate_next_run(
  cron_expr VARCHAR(100),
  tz VARCHAR(50),
  base_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  parts TEXT[];
  minute_part TEXT;
  hour_part TEXT;
  dow_part TEXT;
  dom_part TEXT;
  next_run TIMESTAMP WITH TIME ZONE;
  current_local TIMESTAMP;
BEGIN
  -- Parse cron expression (minute hour day-of-month month day-of-week)
  parts := regexp_split_to_array(cron_expr, '\s+');

  IF array_length(parts, 1) != 5 THEN
    RETURN NULL;
  END IF;

  minute_part := parts[1];
  hour_part := parts[2];
  dow_part := parts[5];
  dom_part := parts[3];

  -- Get current time in the habit's timezone
  current_local := (base_time AT TIME ZONE tz);

  -- Simple calculation: next occurrence at specified time tomorrow
  -- In production, this would use a proper cron parser
  IF minute_part ~ '^\d+$' AND hour_part ~ '^\d+$' THEN
    next_run := (current_local::DATE + 1 +
                 (hour_part::INT || ' hours')::INTERVAL +
                 (minute_part::INT || ' minutes')::INTERVAL) AT TIME ZONE tz;
  ELSE
    -- Default: 1 hour from now
    next_run := base_time + INTERVAL '1 hour';
  END IF;

  RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Function to Execute Due Habits
-- =============================================================================

/**
 * Find and execute habits that are due for execution
 * Called by pg_cron every minute
 */
CREATE OR REPLACE FUNCTION execute_due_habits()
RETURNS TABLE(
  habit_id UUID,
  skill_id UUID,
  execution_status TEXT
) AS $$
DECLARE
  habit_record RECORD;
  edge_function_url TEXT;
  execution_id UUID;
BEGIN
  -- Get the Edge Function URL from environment (or use a default for development)
  edge_function_url := COALESCE(
    current_setting('app.edge_function_url', true),
    'https://your-project.supabase.co/functions/v1/execute-habit'
  );

  -- Find all active habits that are due
  FOR habit_record IN
    SELECT h.id, h.skill_id, h.user_id, h.schedule_cron, h.timezone, h.config
    FROM habits h
    INNER JOIN skills s ON s.id = h.skill_id
    WHERE h.is_active = TRUE
      AND h.next_run_at IS NOT NULL
      AND h.next_run_at <= NOW()
      AND s.is_active = TRUE
    ORDER BY h.next_run_at ASC
    LIMIT 10  -- Process max 10 habits per run to avoid timeouts
    FOR UPDATE OF h SKIP LOCKED  -- Prevent concurrent execution
  LOOP
    -- Create execution record
    INSERT INTO skill_executions (
      skill_id,
      user_id,
      execution_type,
      reference_id,
      input,
      status,
      executed_at
    ) VALUES (
      habit_record.skill_id,
      habit_record.user_id,
      'habit',
      habit_record.id,
      habit_record.config,
      'pending',
      NOW()
    )
    RETURNING id INTO execution_id;

    -- Update habit timestamps
    UPDATE habits
    SET
      last_run_at = NOW(),
      next_run_at = calculate_next_run(schedule_cron, timezone, NOW()),
      run_count = run_count + 1,
      updated_at = NOW()
    WHERE id = habit_record.id;

    -- Return the queued habit
    habit_id := habit_record.id;
    skill_id := habit_record.skill_id;
    execution_status := 'queued';
    RETURN NEXT;

    -- NOTE: In production, this would trigger the Edge Function via:
    -- 1. pg_net extension for HTTP calls
    -- 2. Supabase Database Webhooks
    -- 3. Or the Edge Function polls for pending executions

  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Function to Mark Habit Execution Complete
-- =============================================================================

/**
 * Called by the Edge Function after habit execution completes
 */
CREATE OR REPLACE FUNCTION complete_habit_execution(
  p_execution_id UUID,
  p_status execution_status,
  p_output TEXT DEFAULT NULL,
  p_tokens_used INTEGER DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_habit_id UUID;
BEGIN
  -- Update the execution record
  UPDATE skill_executions
  SET
    status = p_status,
    output = p_output,
    tokens_used = p_tokens_used,
    duration_ms = p_duration_ms,
    error_message = p_error_message,
    completed_at = NOW()
  WHERE id = p_execution_id
  RETURNING reference_id INTO v_habit_id;

  -- Update habit error tracking
  IF v_habit_id IS NOT NULL THEN
    IF p_status = 'completed' THEN
      -- Reset consecutive failures on success
      UPDATE habits
      SET
        consecutive_failures = 0,
        last_error_message = NULL,
        updated_at = NOW()
      WHERE id = v_habit_id;
    ELSIF p_status = 'failed' THEN
      -- Increment failure count and potentially deactivate
      UPDATE habits
      SET
        consecutive_failures = consecutive_failures + 1,
        last_error_message = p_error_message,
        -- Deactivate after 3 consecutive failures
        is_active = CASE WHEN consecutive_failures >= 2 THEN FALSE ELSE is_active END,
        updated_at = NOW()
      WHERE id = v_habit_id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Trigger to Calculate Next Run on Insert/Update
-- =============================================================================

/**
 * Automatically calculate next_run_at when a habit is created or schedule changed
 */
CREATE OR REPLACE FUNCTION trigger_calculate_next_run()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate if active and schedule changed
  IF NEW.is_active = TRUE AND (
    TG_OP = 'INSERT' OR
    NEW.schedule_cron != OLD.schedule_cron OR
    NEW.timezone != OLD.timezone OR
    (NEW.is_active = TRUE AND OLD.is_active = FALSE)
  ) THEN
    NEW.next_run_at := calculate_next_run(NEW.schedule_cron, NEW.timezone, NOW());
  END IF;

  -- Clear next_run if deactivated
  IF NEW.is_active = FALSE THEN
    NEW.next_run_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_habits_next_run ON habits;
CREATE TRIGGER trigger_habits_next_run
  BEFORE INSERT OR UPDATE ON habits
  FOR EACH ROW
  EXECUTE FUNCTION trigger_calculate_next_run();

-- =============================================================================
-- pg_cron Job Schedule
-- =============================================================================

-- Schedule the habit checker to run every minute
-- NOTE: This requires pg_cron extension to be enabled
-- Uncomment when pg_cron is available:

/*
SELECT cron.schedule(
  'execute-habits',           -- job name
  '* * * * *',               -- every minute
  'SELECT * FROM execute_due_habits()'
);
*/

-- Alternative: Use Supabase Edge Function with a cron trigger
-- Create a database webhook or use pg_net for HTTP calls

-- =============================================================================
-- View for Upcoming Habit Runs
-- =============================================================================

CREATE OR REPLACE VIEW upcoming_habit_runs AS
SELECT
  h.id AS habit_id,
  h.schedule_cron,
  h.schedule_description,
  h.timezone,
  h.next_run_at,
  h.last_run_at,
  h.run_count,
  h.consecutive_failures,
  h.is_active,
  s.id AS skill_id,
  s.name AS skill_name,
  s.category AS skill_category,
  s.is_active AS skill_active
FROM habits h
INNER JOIN skills s ON s.id = h.skill_id
WHERE h.is_active = TRUE
  AND s.is_active = TRUE
  AND h.next_run_at IS NOT NULL
ORDER BY h.next_run_at ASC;

-- Grant access to the view
-- GRANT SELECT ON upcoming_habit_runs TO authenticated;

-- =============================================================================
-- View for Habit Execution History
-- =============================================================================

CREATE OR REPLACE VIEW habit_execution_history AS
SELECT
  e.id AS execution_id,
  e.skill_id,
  e.reference_id AS habit_id,
  e.status,
  e.output,
  e.tokens_used,
  e.duration_ms,
  e.error_message,
  e.executed_at,
  e.completed_at,
  s.name AS skill_name,
  h.schedule_description
FROM skill_executions e
LEFT JOIN skills s ON s.id = e.skill_id
LEFT JOIN habits h ON h.id = e.reference_id
WHERE e.execution_type = 'habit'
ORDER BY e.executed_at DESC;

-- Grant access to the view
-- GRANT SELECT ON habit_execution_history TO authenticated;

-- =============================================================================
-- Function to Get Habit Stats
-- =============================================================================

CREATE OR REPLACE FUNCTION get_habit_stats(p_user_id UUID)
RETURNS TABLE(
  total_habits BIGINT,
  active_habits BIGINT,
  total_runs BIGINT,
  failed_habits BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_habits,
    COUNT(*) FILTER (WHERE is_active = TRUE)::BIGINT AS active_habits,
    COALESCE(SUM(run_count)::BIGINT, 0) AS total_runs,
    COUNT(*) FILTER (WHERE consecutive_failures > 0)::BIGINT AS failed_habits,
    CASE
      WHEN SUM(run_count) > 0 THEN
        ROUND((SUM(run_count) - SUM(consecutive_failures))::NUMERIC / SUM(run_count) * 100, 2)
      ELSE 100
    END AS success_rate
  FROM habits
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON FUNCTION execute_due_habits() IS 'Finds and queues habits that are due for execution';
COMMENT ON FUNCTION complete_habit_execution(UUID, execution_status, TEXT, INTEGER, INTEGER, TEXT) IS 'Updates execution record and habit status after Edge Function completes';
COMMENT ON FUNCTION calculate_next_run(VARCHAR, VARCHAR, TIMESTAMP WITH TIME ZONE) IS 'Calculates the next run time for a habit based on its cron expression';
COMMENT ON VIEW upcoming_habit_runs IS 'View of all active habits with their next scheduled run times';
COMMENT ON VIEW habit_execution_history IS 'View of all habit execution records with related skill and habit info';
