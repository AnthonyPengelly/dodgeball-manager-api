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
  game_stage: GameStage;
  created_at?: string;
  updated_at?: string;
}

export type GameStage = 'draft' | 'pre_season' | 'regular_season' | 'post_season' | 'off_season';

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
  game_stage: GameStage;
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
  game_stage: GameStage;
}

// Response for game cancellation
export interface CancelGameResponse {
  success: boolean;
  message: string;
}

// Player types
export interface Player {
  id: string;
  game_id: string;
  name: string;
  status: PlayerStatus;
  
  // Stats
  throwing: number;
  catching: number;
  dodging: number;
  blocking: number;
  speed: number;
  positional_sense: number;
  teamwork: number;
  clutch_factor: number;
  
  // Potential stats
  throwing_potential: number;
  catching_potential: number;
  dodging_potential: number;
  blocking_potential: number;
  speed_potential: number;
  positional_sense_potential: number;
  teamwork_potential: number;
  clutch_factor_potential: number;
  
  // Calculated fields
  tier: number;
  potential_tier: number;
  
  created_at: string;
  updated_at: string;
}

export type PlayerStatus = 'draft' | 'team' | 'opponent' | 'scout' | 'transfer' | 'sold' | 'rejected';

export interface PlayerStats {
  throwing: number;
  catching: number;
  dodging: number;
  blocking: number;
  speed: number;
  positional_sense: number;
  teamwork: number;
  clutch_factor: number;
}

export interface PlayerPotentialStats {
  throwing_potential: number;
  catching_potential: number;
  dodging_potential: number;
  blocking_potential: number;
  speed_potential: number;
  positional_sense_potential: number;
  teamwork_potential: number;
  clutch_factor_potential: number;
}

export interface GetDraftPlayersResponse {
  players: Player[];
}

// Request for completing the draft
export interface CompleteDraftRequest {
  game_id: string;
  player_ids: string[];
}

// Response for completing the draft
export interface CompleteDraftResponse {
  success: boolean;
  message: string;
  team_id: string;
  selected_players: Player[];
}

// Response for getting the team squad
export interface GetSquadResponse {
  players: Player[];
}

export interface Season {
  id: string;
  game_id: string;
  team_id: string;
  season_number: number;
  training_credits_used: number;
  created_at: string;
  updated_at: string;
}

// Training related types
export interface TrainPlayerRequest {
  player_id: string;
  stat_name: PlayerStatName;
}

export interface TrainPlayerResponse {
  success: boolean;
  message: string;
  player: Player;
  season: SeasonTrainingInfo;
}

export interface SeasonTrainingInfo {
  id: string;
  season_number: number;
  team_id: string;
  training_facility_level: number;
  training_credits_used: number;
  training_credits_available: number;
  training_credits_remaining: number;
}

export interface GetSeasonTrainingInfoResponse {
  season: SeasonTrainingInfo;
}

export type PlayerStatName = 
  | 'throwing'
  | 'catching'
  | 'dodging'
  | 'blocking'
  | 'speed'
  | 'positional_sense'
  | 'teamwork'
  | 'clutch_factor';
