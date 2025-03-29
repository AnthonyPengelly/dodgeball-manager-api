-- Migration: 001_initial_schema.sql
-- Created: 2025-03-29
-- Description: Initial schema for dodgeball manager game

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season INTEGER NOT NULL DEFAULT 1,
  match_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  game_stage TEXT NOT NULL DEFAULT 'draft' CHECK (game_stage IN ('draft', 'pre_season', 'regular_season', 'post_season', 'off_season')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  budget INTEGER NOT NULL DEFAULT 100,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  stadium_size INTEGER NOT NULL DEFAULT 1,
  training_facility_level INTEGER NOT NULL DEFAULT 1,
  scout_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create seasons table
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  training_credits_used INTEGER NOT NULL DEFAULT 0,
  scouting_credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Ensure uniqueness of game_id, team_id, and season_number combination
  UNIQUE(game_id, team_id, season_number)
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'team', 'opponent', 'scout', 'transfer', 'sold', 'rejected')),
  
  -- Player stats (1-5 scale)
  throwing INTEGER NOT NULL CHECK (throwing BETWEEN 1 AND 5),
  catching INTEGER NOT NULL CHECK (catching BETWEEN 1 AND 5),
  dodging INTEGER NOT NULL CHECK (dodging BETWEEN 1 AND 5),
  blocking INTEGER NOT NULL CHECK (blocking BETWEEN 1 AND 5),
  speed INTEGER NOT NULL CHECK (speed BETWEEN 1 AND 5),
  positional_sense INTEGER NOT NULL CHECK (positional_sense BETWEEN 1 AND 5),
  teamwork INTEGER NOT NULL CHECK (teamwork BETWEEN 1 AND 5),
  clutch_factor INTEGER NOT NULL CHECK (clutch_factor BETWEEN 1 AND 5),
  
  -- Player potential stats (1-5 scale)
  throwing_potential INTEGER NOT NULL CHECK (throwing_potential BETWEEN 1 AND 5),
  catching_potential INTEGER NOT NULL CHECK (catching_potential BETWEEN 1 AND 5),
  dodging_potential INTEGER NOT NULL CHECK (dodging_potential BETWEEN 1 AND 5),
  blocking_potential INTEGER NOT NULL CHECK (blocking_potential BETWEEN 1 AND 5),
  speed_potential INTEGER NOT NULL CHECK (speed_potential BETWEEN 1 AND 5),
  positional_sense_potential INTEGER NOT NULL CHECK (positional_sense_potential BETWEEN 1 AND 5),
  teamwork_potential INTEGER NOT NULL CHECK (teamwork_potential BETWEEN 1 AND 5),
  clutch_factor_potential INTEGER NOT NULL CHECK (clutch_factor_potential BETWEEN 1 AND 5),
  
  -- Tier fields (calculated in application code)
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 5),
  potential_tier INTEGER NOT NULL CHECK (potential_tier BETWEEN 1 AND 5),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Transfer list table
CREATE TABLE IF NOT EXISTS transfer_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  season INT NOT NULL,
  
  -- Enforce uniqueness of player_id in transfer list
  CONSTRAINT unique_player_in_transfer_list UNIQUE (player_id)
);

-- Add RLS (Row Level Security) policies for data access control
-- Enable RLS on tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_list ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teams: users can only see and modify their own teams
CREATE POLICY teams_user_policy ON teams
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Games: users can only see games they have teams in
CREATE POLICY games_user_policy ON games
  USING (id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Players: users can only see players in games they have teams in
CREATE POLICY players_user_policy ON players
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Seasons: users can only see seasons of their own teams
CREATE POLICY seasons_user_policy ON seasons
  USING (team_id IN (
    SELECT id FROM teams WHERE owner_id = auth.uid()
  ));

-- Create policy to allow users to view transfer list for their games
CREATE POLICY transfer_list_select_policy ON transfer_list 
  FOR SELECT 
  USING (
    game_id IN (
      SELECT g.id FROM games g
      JOIN teams t ON t.game_id = g.id
      WHERE t.owner_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX players_game_id_idx ON players(game_id);
CREATE INDEX players_status_idx ON players(status);
CREATE INDEX idx_transfer_list_game_season ON transfer_list (game_id, season);
