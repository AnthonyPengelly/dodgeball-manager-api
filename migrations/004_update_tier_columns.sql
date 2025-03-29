-- Migration to update tier columns from generated to regular columns
-- This is needed because we're now calculating tiers in the application code

-- First, add temporary columns to store the current tier values
ALTER TABLE players ADD COLUMN temp_tier INTEGER;
ALTER TABLE players ADD COLUMN temp_potential_tier INTEGER;

-- Copy the current values to the temporary columns
UPDATE players SET 
  temp_tier = tier,
  temp_potential_tier = potential_tier;

-- Drop the generated columns
ALTER TABLE players DROP COLUMN tier;
ALTER TABLE players DROP COLUMN potential_tier;

-- Add the new regular columns
ALTER TABLE players ADD COLUMN tier INTEGER NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 5);
ALTER TABLE players ADD COLUMN potential_tier INTEGER NOT NULL DEFAULT 1 CHECK (potential_tier BETWEEN 1 AND 5);

-- Copy the values back from the temporary columns
UPDATE players SET 
  tier = temp_tier,
  potential_tier = temp_potential_tier;

-- Drop the temporary columns
ALTER TABLE players DROP COLUMN temp_tier;
ALTER TABLE players DROP COLUMN temp_potential_tier;

-- Create an index on the tier column for faster sorting
CREATE INDEX IF NOT EXISTS players_tier_idx ON players(tier);

-- Comment on the columns
COMMENT ON COLUMN players.tier IS 'Player tier (1-5) calculated in application code';
COMMENT ON COLUMN players.potential_tier IS 'Player potential tier (1-5) calculated in application code';
