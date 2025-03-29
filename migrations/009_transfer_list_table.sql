-- Migration: 009_transfer_list_table.sql
-- Description: Create a dedicated transfer list table

-- Create transfer_list table
CREATE TABLE IF NOT EXISTS transfer_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  season INT NOT NULL,
  
  -- Enforce uniqueness of player_id in transfer list
  CONSTRAINT unique_player_in_transfer_list UNIQUE (player_id)
);

-- Add RLS policies
ALTER TABLE transfer_list ENABLE ROW LEVEL SECURITY;

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

-- Create index for more efficient queries
CREATE INDEX idx_transfer_list_game_season ON transfer_list (game_id, season);

-- Comment on table
COMMENT ON TABLE transfer_list IS 'Players available on the transfer list for each game and season';
