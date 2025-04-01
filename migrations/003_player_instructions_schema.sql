-- Migration: 003_player_instructions_schema.sql
-- Created: 2025-04-01
-- Description: Add player_instructions table to track player-specific instructions for fixtures

-- Create an enum for target priority
CREATE TYPE target_priority AS ENUM (
    'highest_threat',
    'weakest_defence', 
    'nearest', 
    'random'
);

-- Create player_instructions table
CREATE TABLE IF NOT EXISTS player_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    
    -- Aggression levels for throwing and catching (0-100)
    throw_aggression INTEGER NOT NULL CHECK (throw_aggression BETWEEN 0 AND 100),
    catch_aggression INTEGER NOT NULL CHECK (catch_aggression BETWEEN 0 AND 100),
    
    -- Target priority enum
    target_priority target_priority NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique instructions per player per fixture
    UNIQUE(fixture_id, player_id)
);

-- Enable Row Level Security for player_instructions
ALTER TABLE player_instructions ENABLE ROW LEVEL SECURITY;

-- Policy to allow access only to users who have teams in the game
CREATE POLICY player_instructions_user_policy ON player_instructions
USING (
    fixture_id IN (
        SELECT id FROM fixtures 
        WHERE game_id IN (
            SELECT game_id FROM teams 
            WHERE owner_id = auth.uid()
        )
    )
);
