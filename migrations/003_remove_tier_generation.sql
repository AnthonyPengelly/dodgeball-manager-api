-- Migration to remove tier generation from the database
-- We'll now calculate tiers in the application code

-- Drop the existing triggers if they exist
DROP TRIGGER IF EXISTS calculate_tier_on_insert ON players;
DROP TRIGGER IF EXISTS calculate_tier_on_update ON players;
DROP TRIGGER IF EXISTS calculate_potential_tier_on_insert ON players;
DROP TRIGGER IF EXISTS calculate_potential_tier_on_update ON players;

-- Drop the functions if they exist
DROP FUNCTION IF EXISTS calculate_player_tier();
DROP FUNCTION IF EXISTS calculate_player_potential_tier();

-- Comment on the migration
COMMENT ON TABLE players IS 'Player data for each game. Tiers are now calculated in the application code.';
