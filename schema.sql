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

-- Opponent teams table
CREATE TABLE IF NOT EXISTS opponent_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraints
  CONSTRAINT unique_opponent_team_per_game_season UNIQUE (game_id, name)
);

-- Season opponent teams join table
CREATE TABLE IF NOT EXISTS season_opponent_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  season INT NOT NULL,
  opponent_team_id UUID NOT NULL REFERENCES opponent_teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraints
  CONSTRAINT unique_opponent_team_per_season UNIQUE (game_id, season, opponent_team_id)
);

-- Opponent team players join table
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

-- Fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  season INT NOT NULL,
  match_day INT NOT NULL,
  home_team_id UUID NOT NULL,
  away_team_id UUID NOT NULL,
  home_team_type VARCHAR(20) NOT NULL, -- 'user' or 'opponent'
  away_team_type VARCHAR(20) NOT NULL, -- 'user' or 'opponent'
  home_score INT,
  away_score INT,
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed'
  played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraints
  CONSTRAINT unique_fixture_per_game_season_matchday UNIQUE (game_id, season, match_day, home_team_id, away_team_id)
);

-- Add RLS (Row Level Security) policies for data access control
-- Enable RLS on tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE opponent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_opponent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE opponent_team_players ENABLE ROW LEVEL SECURITY;

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

-- Opponent teams: users can only see opponent teams in games they have teams in
CREATE POLICY opponent_teams_user_policy ON opponent_teams
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Season opponent teams: users can only see season opponent teams in games they have teams in
CREATE POLICY season_opponent_teams_user_policy ON season_opponent_teams
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Opponent team players: users can only see opponent team players in games they have teams in
CREATE POLICY opponent_team_players_user_policy ON opponent_team_players
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Fixtures: users can only see fixtures in games they have teams in
CREATE POLICY fixtures_user_policy ON fixtures
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
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
CREATE INDEX idx_opponent_teams_game ON opponent_teams (game_id);
CREATE INDEX idx_fixtures_game_season ON fixtures (game_id, season);
CREATE INDEX idx_fixtures_home_team ON fixtures (home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures (away_team_id);
CREATE INDEX idx_season_opponent_teams_game_season ON season_opponent_teams (game_id, season);
CREATE INDEX idx_season_opponent_teams_opponent_team ON season_opponent_teams (opponent_team_id);
