import { 
  SeasonTrainingInfo, 
  PlayerStatName,
  Player,
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
