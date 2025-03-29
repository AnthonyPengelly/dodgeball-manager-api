export interface Team {
  id: string;
  name: string;
  budget: number;
  owner_id: string;
  game_id: string;
  stadium_size: number;
  training_facility_level: number;
  scout_level: number;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  season: number;
  match_day: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}

// Supabase join response type
// Supabase returns joined records as an array, even when there's just one item
export interface TeamWithGame {
  id: string;
  name: string;
  games: Game | Game[];
}

export interface CurrentGameResponse {
  game_id: string;
  game_season: number;
  game_match_day: number;
  game_status: string;
  team_id: string;
  team_name: string;
}

// Matches the Supabase auth user type
export interface User {
  id: string;
  email?: string; // Make email optional to match Supabase type
  aud?: string;
  role?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

// Request to create a new team and game
export interface CreateTeamRequest {
  name: string;
}

// Response for team creation
export interface CreateTeamResponse {
  team_id: string;
  team_name: string;
  game_id: string;
  game_season: number;
  game_match_day: number;
  game_status: string;
}

// Response for game cancellation
export interface CancelGameResponse {
  success: boolean;
  message: string;
}
