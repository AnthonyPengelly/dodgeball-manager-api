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
