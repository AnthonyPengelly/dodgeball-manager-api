-- Migration: 009_opponent_team_players.sql
-- Created: 2025-03-30
-- Description: Add join table for opponent teams and players

-- Create opponent_team_players join table
CREATE TABLE IF NOT EXISTS opponent_team_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  opponent_team_id UUID NOT NULL REFERENCES opponent_teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  season INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Add constraint to ensure uniqueness
  CONSTRAINT unique_player_opponent_team_season UNIQUE (opponent_team_id, player_id, season)
);

-- Enable RLS
ALTER TABLE opponent_team_players ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY opponent_team_players_user_policy ON opponent_team_players
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Add index for performance
CREATE INDEX idx_opponent_team_players_team_id ON opponent_team_players(opponent_team_id);
CREATE INDEX idx_opponent_team_players_season ON opponent_team_players(season);
