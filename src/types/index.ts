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

// Scouting related types
export interface ScoutPlayersRequest {
  count?: number; // Optional: Number of scouting credits to use, defaults to 1
}

export interface ScoutPlayersResponse {
  success: boolean;
  message: string;
  players: Player[];
  scouted_players: ScoutedPlayer[];
  season: SeasonScoutingInfo;
}

export interface PurchaseScoutedPlayerRequest {
  scouted_player_id: string;
}

export interface PurchaseScoutedPlayerResponse {
  success: boolean;
  message: string;
  player: Player;
  team: {
    id: string;
    name: string;
    budget: number;
  };
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

export interface GetSeasonScoutingInfoResponse {
  season: SeasonScoutingInfo;
}

export interface GetScoutedPlayersResponse {
  scouted_players: ScoutedPlayer[];
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

export interface GetFacilityInfoResponse {
  facility: FacilityInfo;
}

export interface UpgradeFacilityRequest {
  facility_type: 'training' | 'scout' | 'stadium';
}

export interface UpgradeFacilityResponse {
  success: boolean;
  message: string;
  team: {
    id: string;
    name: string;
    budget: number;
    training_facility_level?: number;
    scout_level?: number;
  };
  cost: number;
}

// Transfer list types
export interface TransferListedPlayer extends Player {
  buy_price: number;
  sell_price: number;
}

export interface GetTransferListResponse {
  success: boolean;
  message: string;
  transfer_list: TransferListedPlayer[];
  season: number;
}

export interface BuyTransferListedPlayerRequest {
  player_id: string;
}

export interface BuyTransferListedPlayerResponse {
  success: boolean;
  message: string;
  player: Player;
  budget_remaining: number;
}

export interface SellPlayerRequest {
  player_id: string;
}

export interface SellPlayerResponse {
  success: boolean;
  message: string;
  sold_player: Player;
  budget: number;
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

export interface GetLeagueResponse {
  success: boolean;
  message: string;
  season: number;
  fixtures: Fixture[];
  table: LeagueTableEntry[];
}

export interface EnhancedFixture extends Fixture {
  home_team_name: string;
  away_team_name: string;
}

export interface PlayMatchResponse {
  success: boolean;
  message: string;
  match: EnhancedFixture;
  match_day: number;
  other_match?: EnhancedFixture;
}

export interface EndSeasonResponse {
  success: boolean;
  message: string;
  game_ended: boolean;
  season_completed: number;
  next_season?: number;
  promoted?: boolean;
  champion?: boolean;
  budget_update?: {
    previous: number;
    stadium_income: number;
    wages_paid: number;
    new_budget: number;
  };
  promoted_team?: {
    id: string;
    name: string;
  };
}

export interface StartMainSeasonResponse {
  success: boolean;
  message: string;
  game: Game;
  fixtures: Fixture[];
  opponent_teams: OpponentTeam[];
}
