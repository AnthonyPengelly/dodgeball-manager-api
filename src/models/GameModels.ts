import { GameStage, GameStatus } from '../types';
import { FixtureModel, LeagueTableEntryModel } from './LeagueModels';

/**
 * Current game response model for tsoa documentation
 */
export interface CurrentGameResponseModel extends CurrentGameResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Current game retrieved successfully" 
   */
  message: string;
}

export interface CurrentGameResponse {
  
  /** 
   * Game ID
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  game_id: string;
  
  /** 
   * Game season number
   * @example 1 
   */
  game_season: number;
  
  /** 
   * Game match day
   * @example 3 
   */
  game_match_day: number;
  
  /** 
   * Game status
   * @example "in_progress" 
   */
  game_status: GameStatus;
  
  /** 
   * Game stage
   * @example "regular_season" 
   */
  game_stage: GameStage;
  
  /** 
   * Team ID
   * @example "550e8400-e29b-41d4-a716-446655440001" 
   */
  team_id: string;
  
  /** 
   * Team name
   * @example "Dodgeball Dynamos" 
   */
  team_name: string;

  /** 
   * Team budget
   * @example 100 
   */
  budget: number;
}

/**
 * Create team request model
 */
export interface CreateTeamRequest {
  /** 
   * Team name
   * @example "Dodgeball Dynamos" 
   */
  name: string;
}

/**
 * Create team response model
 */
export interface CreateTeamResponseModel extends CreateTeamResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Team created successfully" 
   */
  message: string;
}  

/** 
 * Create team response model
 */
export interface CreateTeamResponse {
  /** 
   * Team ID
   * @example "550e8400-e29b-41d4-a716-446655440001" 
   */
  team_id: string;
  
  /** 
   * Team name
   * @example "Dodgeball Dynamos" 
   */
  team_name: string;
  
  /** 
   * Game ID
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  game_id: string;
  
  /** 
   * Game season
   * @example 1 
   */
  game_season: number;
  
  /** 
   * Game match day
   * @example 1 
   */
  game_match_day: number;
  
  /** 
   * Game status
   * @example "in_progress" 
   */
  game_status: GameStatus;
  
  /** 
   * Game stage
   * @example "draft" 
   */
  game_stage: GameStage;
}

/**
 * Cancel game response model
 */
export interface CancelGameResponseModel {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Game cancelled successfully" 
   */
  message: string;
}

/**
 * Start main season response model
 */
export interface StartMainSeasonResponseModel extends StartMainSeasonResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Main season started successfully" 
   */
  message: string;
}

export interface StartMainSeasonResponse {
  /** 
   * Game data
   */
  game: {
    /** 
     * Game ID
     * @example "550e8400-e29b-41d4-a716-446655440000" 
     */
    id: string;
    
    /** 
     * Game season
     * @example 1 
     */
    season: number;
    
    /** 
     * Game match day
     * @example 1 
     */
    match_day: number;
    
    /** 
     * Game status
     * @example "in_progress" 
     */
    status: GameStatus;
    
    /** 
     * Game stage
     * @example "regular_season" 
     */
    game_stage: GameStage;
  };
  
  /** 
   * List of fixtures
   */
  fixtures: FixtureModel[];
  
  /** 
   * League table
   */
  table: LeagueTableEntryModel[];
}
