-- Migration to add game stage column to games table
-- This will be used to track the current stage of the game

-- Add the game_stage column to the games table
ALTER TABLE games ADD COLUMN game_stage TEXT NOT NULL DEFAULT 'draft' 
  CHECK (game_stage IN ('draft', 'pre_season', 'regular_season', 'post_season', 'off_season'));

-- Add a comment to the column
COMMENT ON COLUMN games.game_stage IS 'Current stage of the game (draft, pre_season, regular_season, post_season, off_season)';
