-- Fix duplicate active nutrition goals
-- For users with multiple active goals, keep only the most recent one active

-- First, deactivate all goals except the most recent active one per user
UPDATE nutrition_goals
SET is_active = false, updated_at = now()
WHERE id IN (
  SELECT id FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM nutrition_goals
    WHERE is_active = true
  ) ranked
  WHERE rn > 1
);
