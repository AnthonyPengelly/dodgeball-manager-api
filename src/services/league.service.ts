import { createClientFromToken, supabaseAdmin } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Fixture, GetLeagueResponse, LeagueTableEntry, OpponentTeam } from '../types';
import TeamNameGenerator from '../utils/team-name-generator';
import * as opponentTeamRepository from '../repositories/opponentTeamRepository';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';
import * as matchRepository from '../repositories/matchRepository';
import { 
  generateLeagueTable,
  createTeamNameMapping,
  enhanceFixturesWithTeamNames,
  createSeasonFixtures,
  createOpponentTeamFixtures
} from '../utils/leagueUtils';

// Number of opponent teams to generate per season
const OPPONENT_TEAMS_COUNT = 3;

/**
 * Service for managing league functionality
 */
class LeagueService {
  /**
   * Generate opponent teams for a season
   * 
   * @param gameId The game ID
   * @param season The season number
   * @param token JWT token
   * @returns Array of created opponent teams
   */
  async generateOpponentTeams(
    gameId: string, 
    season: number, 
    token: string
  ): Promise<OpponentTeam[]> {
    try {
      // Check if opponent teams already exist for this season
      const existingSeasonTeams = await opponentTeamRepository.getSeasonOpponentTeams(gameId, season, token);
      
      // If we already have all the opponent teams for this season, return them
      if (existingSeasonTeams && existingSeasonTeams.length === OPPONENT_TEAMS_COUNT) {
        // Get the opponent team details
        const opponentTeamIds = existingSeasonTeams.map(team => team.opponent_team_id);
        return await opponentTeamRepository.getOpponentTeamsByIds(opponentTeamIds, token);
      }
      
      // We need to generate more teams - determine how many
      const existingCount = existingSeasonTeams ? existingSeasonTeams.length : 0;
      const neededCount = OPPONENT_TEAMS_COUNT - existingCount;
      
      // Get existing opponent team IDs for this season (if any)
      const existingOpponentTeamIds = existingSeasonTeams 
        ? existingSeasonTeams.map(team => team.opponent_team_id) 
        : [];
      
      // Get existing opponent teams for this season (if any)
      let existingOpponentTeams: OpponentTeam[] = [];
      if (existingOpponentTeamIds.length > 0) {
        existingOpponentTeams = await opponentTeamRepository.getOpponentTeamsByIds(existingOpponentTeamIds, token);
      }
      
      // If we need to generate new teams
      let newOpponentTeams: OpponentTeam[] = [];
      if (neededCount > 0) {
        // Generate unique team names
        const teamNames = TeamNameGenerator.generateUniqueTeamNames(neededCount);
        
        // Create opponent teams
        const newTeams: Partial<OpponentTeam>[] = teamNames.map(name => ({
          game_id: gameId,
          name
        }));
        
        // Insert the opponent teams
        newOpponentTeams = await opponentTeamRepository.createOpponentTeams(newTeams);
        
        // Create season opponent team entries for the new teams
        const newSeasonOpponentTeams = newOpponentTeams.map(team => ({
          game_id: gameId,
          season,
          opponent_team_id: team.id
        }));
        
        // Insert the season opponent teams
        const success = await opponentTeamRepository.createSeasonOpponentTeams(newSeasonOpponentTeams);
        if (!success) {
          throw new ApiError(500, 'Failed to create season opponent teams');
        }
      }
      
      // Combine existing and new opponent teams
      return [...existingOpponentTeams, ...newOpponentTeams];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in generateOpponentTeams:', error);
      throw new ApiError(500, 'Failed to generate opponent teams');
    }
  }
  
  /**
   * Generate fixtures for a season
   * 
   * @param gameId The game ID
   * @param season The season number
   * @param userTeamId The user's team ID
   * @param opponentTeams The opponent teams
   * @param token JWT token
   * @returns Array of created fixtures
   */
  async generateFixtures(
    gameId: string, 
    season: number, 
    userTeamId: string, 
    opponentTeams: OpponentTeam[], 
    token: string
  ): Promise<Fixture[]> {
    try {
      const existingFixtures = await matchRepository.getSeasonFixtures(gameId, season, token);
      
      if (existingFixtures && existingFixtures.length > 0) {
        // Fixtures already exist, return them
        return existingFixtures as Fixture[];
      }
      
      // Create fixtures - one match against each opponent team
      const userFixtures = createSeasonFixtures(gameId, season, userTeamId, opponentTeams);
      
      // Insert the user fixtures
      const { data: insertedUserFixtures, error: insertUserError } = await supabaseAdmin
        .from('fixtures')
        .insert(userFixtures)
        .select();
      
      if (insertUserError) {
        console.error('Error inserting user fixtures:', insertUserError);
        throw new ApiError(500, 'Failed to generate user fixtures');
      }
      
      // Generate fixtures for games between opponent teams
      const opponentFixtures = createOpponentTeamFixtures(
        gameId, 
        season, 
        insertedUserFixtures as Fixture[], 
        opponentTeams
      );
      
      // Insert the opponent fixtures if there are any
      if (opponentFixtures.length > 0) {
        const { error: insertOpponentFixturesError } = await supabaseAdmin
          .from('fixtures')
          .insert(opponentFixtures);
        
        if (insertOpponentFixturesError) {
          console.error('Error inserting opponent fixtures:', insertOpponentFixturesError);
          throw new ApiError(500, 'Failed to generate opponent fixtures');
        }
      }
      
      // Get all fixtures for this game and season
      const { data: allFixtures, error: allFixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', season);
      
      if (allFixturesError) {
        console.error('Error getting all fixtures:', allFixturesError);
        throw new ApiError(500, 'Failed to get all fixtures');
      }
      
      return allFixtures as Fixture[];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error generating fixtures:', error);
      throw new ApiError(500, 'Failed to generate fixtures');
    }
  }
  
  /**
   * Get league information including fixtures and table
   * 
   * @param gameId The game ID
   * @param token JWT token
   * @param season Optional season number (defaults to current season)
   * @returns League information
   */
  async getLeague(
    gameId: string, 
    token: string, 
    season?: number
  ): Promise<GetLeagueResponse> {
    try {
      // Get the current game
      const game = await gameRepository.getGameById(gameId, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Use provided season or current season
      const seasonNumber = season || game.season;
      
      // Get the user's team
      const userTeam = await teamRepository.getTeamByGameId(gameId, token);
      if (!userTeam) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Get opponent teams that have fixtures this season
      const seasonOpponentTeams = await opponentTeamRepository.getSeasonOpponentTeams(gameId, seasonNumber, token);
      
      // Get the actual opponent team details
      const opponentTeamIds = seasonOpponentTeams?.map(team => team.opponent_team_id) || [];
      const opponentTeams = await opponentTeamRepository.getOpponentTeamsByIds(opponentTeamIds, token);
      
      // Get fixtures for this season
      const fixtures = await matchRepository.getSeasonFixtures(gameId, seasonNumber, token);
      
      // Create a map of team IDs to names
      const teamNames = createTeamNameMapping(userTeam, opponentTeams);
      
      // Enhance fixtures with team names
      const enhancedFixtures = enhanceFixturesWithTeamNames(fixtures as Fixture[], teamNames);
      
      // Generate league table
      const table = generateLeagueTable(enhancedFixtures, userTeam.id, userTeam.name, opponentTeams);
      
      return {
        success: true,
        message: 'League data retrieved successfully',
        season: seasonNumber,
        fixtures: enhancedFixtures || [],
        table
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error getting league:', error);
      throw new ApiError(500, 'Failed to get league data');
    }
  }
}

export default new LeagueService();
