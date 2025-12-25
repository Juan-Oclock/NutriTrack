-- Add usda_fdc_id column to foods table for caching USDA food data
ALTER TABLE foods ADD COLUMN IF NOT EXISTS usda_fdc_id INTEGER UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_foods_usda_fdc_id ON foods(usda_fdc_id);
