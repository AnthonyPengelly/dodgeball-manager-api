import { 
  Player, 
  PlayerStatName, 
  ScoutedPlayer,
  SeasonTrainingInfo,
  SeasonScoutingInfo
} from '../types';

/**
 * Get draft players response model for tsoa documentation
 */
export interface GetDraftPlayersResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Draft players retrieved successfully" 
   */
  message: string;
  
  /** 
   * List of draft players
   */
  players: Player[];
}

/**
 * Complete draft request model
 */
export interface CompleteDraftRequestModel {
  /** 
   * Array of player IDs to select for the team
   * @example ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"] 
   */
  player_ids: string[];
}

/**
 * Complete draft response model for tsoa documentation
 */
export interface CompleteDraftResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Draft completed successfully" 
   */
  message: string;
  
  /** 
   * Team ID
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  team_id: string;
  
  /** 
   * Selected players
   */
  selected_players: Player[];
}

/**
 * Get squad response model for tsoa documentation
 */
export interface GetSquadResponseModel extends GetSquadResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Squad retrieved successfully" 
   */
  message: string;
}

export interface GetSquadResponse {
  /** 
   * List of players in the squad
   */
  players: Player[];
}

/**
 * Train player request model
 */
export interface TrainPlayerRequestModel {
  /** 
   * Player ID to train
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  player_id: string;
  
  /** 
   * Stat name to train
   * @example "throwing" 
   */
  stat_name: PlayerStatName;
}

/**
 * Train player response model
 */
export interface TrainPlayerResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Player trained successfully" 
   */
  message: string;
  
  /** 
   * Updated player data
   */
  player: Player;
  
  /** 
   * Season training information
   */
  season: SeasonTrainingInfo;
}

/**
 * Scout players request model
 */
export interface ScoutPlayersRequestModel {
  /** 
   * Number of players to scout
   * @example 3 
   */
  count?: number;
}

/**
 * Scout players response model
 */
export interface ScoutPlayersResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Players scouted successfully" 
   */
  message: string;
  
  /** 
   * Scouted players
   */
  players: Player[];
  
  /** 
   * Scouted player records
   */
  scouted_players: ScoutedPlayer[];
  
  /** 
   * Season scouting information
   */
  season: SeasonScoutingInfo;
}

/**
 * Get scouted players response model
 */
export interface GetScoutedPlayersResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Scouted players retrieved successfully" 
   */
  message: string;
  
  /** 
   * List of scouted players
   */
  scouted_players: ScoutedPlayer[];
}

/**
 * Purchase scouted player request model
 */
export interface PurchaseScoutedPlayerRequestModel {
  /** 
   * Scouted player ID to purchase
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  scouted_player_id: string;
}

/**
 * Purchase scouted player response model
 */
export interface PurchaseScoutedPlayerResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Player purchased successfully" 
   */
  message: string;
  
  /** 
   * Purchased player data
   */
  player: Player;
  
  /** 
   * Updated team data
   */
  team: {
    /** 
     * Team ID
     * @example "550e8400-e29b-41d4-a716-446655440000" 
     */
    id: string;
    
    /** 
     * Team name
     * @example "Dodgeball Dynamos" 
     */
    name: string;
    
    /** 
     * Team budget
     * @example 1000 
     */
    budget: number;
  };
}
