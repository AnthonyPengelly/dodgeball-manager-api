/**
 * League table entry for tsoa documentation
 */
export interface LeagueTableEntryModel {
  /** 
   * Team ID
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  team_id: string;
  
  /** 
   * Team name
   * @example "Dodgeball Dynamos" 
   */
  team_name: string;
  
  /** 
   * Type of team
   * @example "user" 
   */
  team_type: 'user' | 'opponent';
  
  /** 
   * Number of matches played
   * @example 5 
   */
  played: number;
  
  /** 
   * Number of matches won
   * @example 3 
   */
  won: number;
  
  /** 
   * Number of matches lost
   * @example 2 
   */
  lost: number;
  
  /** 
   * Total points
   * @example 9 
   */
  points: number;
}

/**
 * Fixture with team names
 */
export interface FixtureModel {
  /** 
   * Fixture ID
   * @example "550e8400-e29b-41d4-a716-446655440000" 
   */
  id: string;
  
  /** 
   * Game ID
   * @example "550e8400-e29b-41d4-a716-446655440001" 
   */
  game_id: string;
  
  /** 
   * Season number
   * @example 1 
   */
  season: number;
  
  /** 
   * Match day number
   * @example 3 
   */
  match_day: number;
  
  /** 
   * Home team ID
   * @example "550e8400-e29b-41d4-a716-446655440002" 
   */
  home_team_id: string;
  
  /** 
   * Away team ID
   * @example "550e8400-e29b-41d4-a716-446655440003" 
   */
  away_team_id: string;
  
  /** 
   * Home team type
   * @example "user" 
   */
  home_team_type: 'user' | 'opponent';
  
  /** 
   * Away team type
   * @example "opponent" 
   */
  away_team_type: 'user' | 'opponent';
  
  /** 
   * Home team score
   * @example 5 
   */
  home_score?: number;
  
  /** 
   * Away team score
   * @example 3 
   */
  away_score?: number;
  
  /** 
   * Match status
   * @example "completed" 
   */
  status: 'scheduled' | 'completed';
  
  /** 
   * When the match was played
   * @example "2025-03-31T14:30:00Z" 
   */
  played_at?: string;
  
  /** 
   * When the fixture was created
   * @example "2025-03-30T10:00:00Z" 
   */
  created_at: string;
  
  /** 
   * Home team name
   * @example "Dodgeball Dynamos" 
   */
  home_team_name?: string;
  
  /** 
   * Away team name
   * @example "Throwback Titans" 
   */
  away_team_name?: string;
}

/**
 * League data response
 */
export interface GetLeagueResponseModel {
  /** 
   * Whether the request was successful
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "League data retrieved successfully" 
   */
  message: string;

  /** 
   * Season number
   * @example 1 
   */
  season: number;
  
  /** 
   * List of fixtures
   */
  fixtures: FixtureModel[];
  
  /** 
   * League table
   */
  table: LeagueTableEntryModel[];
}
