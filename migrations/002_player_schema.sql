-- Migration: 002_player_schema.sql
-- Created: 2025-03-29
-- Description: Add player schema for dodgeball manager game

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
  
  -- Calculated fields (will be updated by the API)
  tier INTEGER GENERATED ALWAYS AS (
    (throwing + catching + dodging + blocking + speed + positional_sense + teamwork + clutch_factor) / 8
  ) STORED,
  
  potential_tier INTEGER GENERATED ALWAYS AS (
    (throwing_potential + catching_potential + dodging_potential + blocking_potential + 
     speed_potential + positional_sense_potential + teamwork_potential + clutch_factor_potential) / 8
  ) STORED,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies for data access control
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policy for players - users can only see players in games they have teams in
CREATE POLICY players_user_policy ON players
  USING (game_id IN (
    SELECT game_id FROM teams WHERE owner_id = auth.uid()
  ));

-- Create index for faster lookups
CREATE INDEX players_game_id_idx ON players(game_id);
CREATE INDEX players_status_idx ON players(status);
