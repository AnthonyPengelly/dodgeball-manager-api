-- Migration: 007_add_scouting.sql
-- Created: 2023-05-20
-- Description: Add scouting functionality tables and columns

-- Add scouting_credits_used column to seasons table
ALTER TABLE IF EXISTS seasons ADD COLUMN IF NOT EXISTS scouting_credits_used INTEGER NOT NULL DEFAULT 0;

-- Create scouted_players table
CREATE TABLE IF NOT EXISTS scouted_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  scout_price INTEGER NOT NULL,
  buy_price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, season_id)
);

-- Add RLS policies for scouted_players table
ALTER TABLE scouted_players ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own scouted players
CREATE POLICY scouted_players_select_policy ON scouted_players
  FOR SELECT
  USING (
    season_id IN (
      SELECT seasons.id FROM seasons
      JOIN teams ON teams.id = seasons.team_id
      WHERE teams.owner_id = auth.uid()
    )
  );

-- Policy for users to insert their own scouted players (though this is typically done by the API)
CREATE POLICY scouted_players_insert_policy ON scouted_players
  FOR INSERT
  WITH CHECK (
    season_id IN (
      SELECT seasons.id FROM seasons
      JOIN teams ON teams.id = seasons.team_id
      WHERE teams.owner_id = auth.uid()
    )
  );

-- Policy for users to update their own scouted players
CREATE POLICY scouted_players_update_policy ON scouted_players
  FOR UPDATE
  USING (
    season_id IN (
      SELECT seasons.id FROM seasons
      JOIN teams ON teams.id = seasons.team_id
      WHERE teams.owner_id = auth.uid()
    )
  );
