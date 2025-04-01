import { 
  SeasonTrainingInfo, 
  SeasonScoutingInfo, 
  PlayerStatName,
  FacilityInfo,
  Player,
  ScoutedPlayer
} from '../types';

/**
 * Get season training info response model for tsoa documentation
 */
export interface GetSeasonTrainingInfoResponseModel extends SeasonTrainingInfo {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Season training info retrieved successfully" 
   */
  message: string;
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
export interface TrainPlayerResponseModel extends TrainPlayerResponse {
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
}

export interface TrainPlayerResponse {
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

/**
 * Get facility info response model for tsoa documentation
 */
export interface GetFacilityInfoResponseModel extends FacilityInfo {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Facility info retrieved successfully" 
   */
  message: string;
}

/**
 * Upgrade facility request model
 */
export interface UpgradeFacilityRequestModel {
  /** 
   * Type of facility to upgrade
   * @example "training" 
   */
  facility_type: 'training' | 'scout' | 'stadium';
}

/**
 * Upgrade facility response model
 */
export interface UpgradeFacilityResponseModel extends UpgradeFacilityResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Facility upgraded successfully" 
   */
  message: string;
}

export interface UpgradeFacilityResponse {
  /** 
   * Updated team information
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
    
    /** 
     * Training facility level (optional)
     * @example 2 
     */
    training_facility_level?: number;
    
    /** 
     * Scout level (optional)
     * @example 2 
     */
    scout_level?: number;
  };
  
  /** 
   * Upgrade cost
   * @example 500 
   */
  cost: number;
}

/**
 * End season response model
 */
export interface EndSeasonResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the season ending result */
  message: string;

  /** Indicates if the entire game has ended */
  game_ended: boolean;

  /** The season number that was just completed */
  season_completed: number;

  /** The upcoming season number, if applicable */
  next_season?: number;

  /** Indicates if the team was promoted to a higher league */
  promoted?: boolean;

  /** Indicates if the team won the championship */
  champion?: boolean;

  /** Details of budget changes at the end of the season */
  budget_update?: {
    /** Previous budget amount */
    previous: number;

    /** Income generated from stadium during the season */
    stadium_income: number;

    /** Total wages paid to players */
    wages_paid: number;

    /** Updated budget after all financial transactions */
    new_budget: number;
  };

  /** Details of the team promoted to a higher league */
  promoted_team?: {
    /** Unique identifier of the promoted team */
    id: string;

    /** Name of the promoted team */
    name: string;
  };
}
