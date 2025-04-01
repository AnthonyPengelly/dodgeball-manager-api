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
  status: GameStatus;
  game_stage: GameStage;
  created_at?: string;
  updated_at?: string;
}

export type GameStatus = 'pending' | 'in_progress' | 'completed';

export type GameStage = 'draft' | 'pre_season' | 'regular_season' | 'post_season' | 'off_season';

// Supabase join response type
// Supabase returns joined records as an array, even when there's just one item
export interface TeamWithGame {
  id: string;
  name: string;
  games: Game | Game[];
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


export interface Season {
  id: string;
  game_id: string;
  team_id: string;
  season_number: number;
  training_credits_used: number;
  scouting_credits_used: number;
  created_at: string;
  updated_at: string;
}

// Scouted player information
export interface ScoutedPlayer {
  id: string;
  player_id: string;
  season_id: string;
  is_purchased: boolean;
  scout_price: number;
  buy_price: number;
  created_at: string;
  updated_at: string;
  player?: Player; // Included when joined with players table
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

export interface SeasonScoutingInfo {
  id: string;
  season_number: number;
  team_id: string;
  scout_level: number;
  scouting_credits_used: number;
  scouting_credits_available: number;
  scouting_credits_remaining: number;
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

// Facility upgrade types
export interface FacilityInfo {
  training_facility_level: number;
  scout_level: number;
  stadium_size: number;
  training_facility_upgrade_cost: number;
  scout_upgrade_cost: number;
  stadium_upgrade_cost: number;
  can_afford_training_upgrade: boolean;
  can_afford_scout_upgrade: boolean;
  can_afford_stadium_upgrade: boolean;
  budget: number;
}

// Transfer list types
export interface TransferListedPlayer extends Player {
  buy_price: number;
  sell_price: number;
}

// League related types
export interface OpponentTeam {
  id: string;
  game_id: string;
  name: string;
  created_at: string;
}

export interface SeasonOpponentTeam {
  id: string;
  game_id: string;
  season: number;
  opponent_team_id: string;
  created_at: string;
}

export interface Fixture {
  id: string;
  game_id: string;
  season: number;
  match_day: number;
  home_team_id: string;
  away_team_id: string;
  home_team_type: 'user' | 'opponent';
  away_team_type: 'user' | 'opponent';
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'completed';
  played_at?: string;
  created_at: string;
  home_team_name?: string; // Populated when fetching fixtures
  away_team_name?: string; // Populated when fetching fixtures
}

export interface LeagueTableEntry {
  team_id: string;
  team_name: string;
  team_type: 'user' | 'opponent';
  played: number;
  won: number;
  lost: number;
  points: number;
}

export interface EnhancedFixture extends Fixture {
  home_team_name: string;
  away_team_name: string;
}
