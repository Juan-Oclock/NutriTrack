-- Create food_serving_options table for storing serving size options
CREATE TABLE IF NOT EXISTS food_serving_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  user_food_id UUID REFERENCES user_foods(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  serving_size DECIMAL(10,2) NOT NULL,
  serving_unit TEXT NOT NULL,
  multiplier DECIMAL(10,4) NOT NULL DEFAULT 1,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure either food_id or user_food_id is set, but not both
  CONSTRAINT food_or_user_food CHECK (
    (food_id IS NOT NULL AND user_food_id IS NULL) OR
    (food_id IS NULL AND user_food_id IS NOT NULL) OR
    (food_id IS NULL AND user_food_id IS NULL)
  )
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_food_serving_options_food_id ON food_serving_options(food_id);
CREATE INDEX IF NOT EXISTS idx_food_serving_options_user_food_id ON food_serving_options(user_food_id);

-- Enable RLS
ALTER TABLE food_serving_options ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Anyone can read serving options for public foods
CREATE POLICY "Anyone can read food serving options"
  ON food_serving_options
  FOR SELECT
  USING (
    food_id IS NOT NULL OR
    (user_food_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_foods WHERE id = user_food_id AND user_id = auth.uid()
    ))
  );

-- Users can manage serving options for their own user foods
CREATE POLICY "Users can insert serving options for their foods"
  ON food_serving_options
  FOR INSERT
  WITH CHECK (
    user_food_id IS NULL OR
    EXISTS (SELECT 1 FROM user_foods WHERE id = user_food_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update serving options for their foods"
  ON food_serving_options
  FOR UPDATE
  USING (
    user_food_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_foods WHERE id = user_food_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete serving options for their foods"
  ON food_serving_options
  FOR DELETE
  USING (
    user_food_id IS NOT NULL AND
    EXISTS (SELECT 1 FROM user_foods WHERE id = user_food_id AND user_id = auth.uid())
  );
