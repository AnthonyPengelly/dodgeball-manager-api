-- Migration: 008_facility_upgrades.sql
-- Description: Ensure facility upgrade fields and constraints exist

-- The teams table already has the required fields for facility upgrades:
-- training_facility_level INTEGER NOT NULL DEFAULT 1,
-- scout_level INTEGER NOT NULL DEFAULT 1,
-- stadium_size INTEGER NOT NULL DEFAULT 1,

-- This migration is to ensure the fields have the right constraints if the table already exists

-- Add constraints to check that facility levels are between 1 and 5
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_training_facility_level_check;
ALTER TABLE teams ADD CONSTRAINT teams_training_facility_level_check CHECK (training_facility_level BETWEEN 1 AND 5);

ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_scout_level_check;
ALTER TABLE teams ADD CONSTRAINT teams_scout_level_check CHECK (scout_level BETWEEN 1 AND 5);

ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_stadium_size_check;
ALTER TABLE teams ADD CONSTRAINT teams_stadium_size_check CHECK (stadium_size BETWEEN 1 AND 5);

-- Add comment to document the purpose of these fields
COMMENT ON COLUMN teams.training_facility_level IS 'Current level of the training facility (1-5). Higher levels provide more training credits and faster stat improvements.';
COMMENT ON COLUMN teams.scout_level IS 'Current level of the scouting department (1-5). Higher levels provide more scouting credits and better player discovery.';
COMMENT ON COLUMN teams.stadium_size IS 'Current size/level of the stadium (1-5). Higher levels provide more revenue from home games.';
