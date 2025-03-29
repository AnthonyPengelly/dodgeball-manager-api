-- Migration to create a season table to track season-specific data
-- This will track training credits used per season

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  training_credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure uniqueness of game_id, team_id, and season_number combination
  UNIQUE(game_id, team_id, season_number)
);

-- Add RLS policies for seasons table
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

-- Seasons: users can only see seasons of their own teams
CREATE POLICY seasons_user_policy ON seasons
  USING (team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  ));

-- Add comment to the table
COMMENT ON TABLE seasons IS 'Tracks season-specific data for each team in a game';
