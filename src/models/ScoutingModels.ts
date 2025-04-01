import { 
  SeasonScoutingInfo, 
  Player,
  ScoutedPlayer
} from '../types';

/**
 * Get season scouting info response model for tsoa documentation
 */
export interface GetSeasonScoutingInfoResponseModel extends SeasonScoutingInfo {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Season scouting info retrieved successfully" 
   */
  message: string;
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
 * Scout players request model
 */
export interface ScoutPlayersRequestModel {
  /** 
   * Number of players to scout
   * @example 3 
   */
  count: number;
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
   * @example "Scouted players generated successfully" 
   */
  message: string;
  
  /** 
   * List of newly scouted players
   */
  scouted_players: ScoutedPlayer[];
}

/**
 * Purchase scouted player request model
 */
export interface PurchaseScoutedPlayerRequestModel {
  /** 
   * ID of the scouted player to purchase
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  scouted_player_id: string;
}

/**
 * Purchase scouted player response model
 */
export interface PurchaseScoutedPlayerResponseModel extends PurchaseScoutedPlayerResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Scouted player purchased successfully" 
   */
  message: string;
}

export interface PurchaseScoutedPlayerResponse {
  /** 
   * Result of the purchase operation
   */
  result: {
    /** 
     * Purchased player details
     */
    player: Player;
    
    /** 
     * Updated team budget
     * @example 500 
     */
    team_budget: number;
  };
}
