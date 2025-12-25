-- Fix RLS policy for foods table to allow authenticated users to insert
-- This is needed for caching USDA foods when users log them

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can insert foods" ON foods;

-- Create policy that allows any authenticated user to insert foods
CREATE POLICY "Authenticated users can insert foods" ON foods
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
