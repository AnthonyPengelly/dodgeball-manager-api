-- Migration: 001_initial_schema.sql
-- Created: 2025-03-29
-- Description: Initial schema for dodgeball manager game

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS dodgeball_manager;

-- Set default schema
SET search_path TO dodgeball_manager;

-- Create games table
CREATE TABLE IF NOT EXISTS dodgeball_manager.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season INTEGER NOT NULL DEFAULT 1,
  match_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS dodgeball_manager.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  budget INTEGER NOT NULL DEFAULT 1000,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  game_id UUID NOT NULL REFERENCES dodgeball_manager.games(id) ON DELETE CASCADE,
  stadium_size INTEGER NOT NULL DEFAULT 1,
  training_facility_level INTEGER NOT NULL DEFAULT 1,
  scout_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies for data access control
-- Enable RLS on tables
ALTER TABLE dodgeball_manager.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE dodgeball_manager.games ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Teams: users can only see and modify their own teams
CREATE POLICY teams_user_policy ON dodgeball_manager.teams
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Games: users can only see games they have teams in
CREATE POLICY games_user_policy ON dodgeball_manager.games
  USING (id IN (
    SELECT game_id FROM dodgeball_manager.teams WHERE owner_id = auth.uid()
  ));
