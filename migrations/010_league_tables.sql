-- Create teams table for opponent teams
CREATE TABLE IF NOT EXISTS opponent_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraints
  CONSTRAINT unique_opponent_team_per_game_season UNIQUE (game_id, name)
);

-- Create season_opponent_teams join table
CREATE TABLE IF NOT EXISTS season_opponent_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  season INT NOT NULL,
  opponent_team_id UUID NOT NULL REFERENCES opponent_teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Add constraints
  CONSTRAINT unique_opponent_team_per_season UNIQUE (game_id, season, opponent_team_id)
);

-- Create fixtures table
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

-- Add RLS policies
ALTER TABLE opponent_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE season_opponent_teams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view opponent teams for their games
CREATE POLICY opponent_teams_select_policy ON opponent_teams 
  FOR SELECT 
  USING (
    game_id IN (
      SELECT g.id FROM games g
      JOIN teams t ON t.game_id = g.id
      WHERE t.owner_id = auth.uid()
    )
  );

-- Create policy to allow users to view fixtures for their games
CREATE POLICY fixtures_select_policy ON fixtures 
  FOR SELECT 
  USING (
    game_id IN (
      SELECT g.id FROM games g
      JOIN teams t ON t.game_id = g.id
      WHERE t.owner_id = auth.uid()
    )
  );

-- Create policy to allow users to view season opponent teams for their games
CREATE POLICY season_opponent_teams_select_policy ON season_opponent_teams 
  FOR SELECT 
  USING (
    game_id IN (
      SELECT g.id FROM games g
      JOIN teams t ON t.game_id = g.id
      WHERE t.owner_id = auth.uid()
    )
  );

-- Create indexes for faster lookups
CREATE INDEX idx_opponent_teams_game ON opponent_teams (game_id);
CREATE INDEX idx_fixtures_game_season ON fixtures (game_id, season);
CREATE INDEX idx_fixtures_home_team ON fixtures (home_team_id);
CREATE INDEX idx_fixtures_away_team ON fixtures (away_team_id);
CREATE INDEX idx_season_opponent_teams_game ON season_opponent_teams (game_id);
CREATE INDEX idx_season_opponent_teams_opponent_team ON season_opponent_teams (opponent_team_id);

-- Add comments
COMMENT ON TABLE opponent_teams IS 'Opponent teams for each game and season';
COMMENT ON TABLE fixtures IS 'Match fixtures for each game and season';
COMMENT ON TABLE season_opponent_teams IS 'Opponent teams for each game and season';
