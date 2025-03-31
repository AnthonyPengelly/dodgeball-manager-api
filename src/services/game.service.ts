import { CurrentGameResponse, CreateTeamResponse, CancelGameResponseModel, StartMainSeasonResponse } from '../models/GameModels';
import { Fixture, Game, OpponentTeam } from '../types';
import { GAME_STATUS, GAME_STAGE } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import leagueService from './league.service';
import * as gameRepository from '../repositories/gameRepository';
import * as teamRepository from '../repositories/teamRepository';
import { formatGameResponse } from '../utils/gameUtils';
import draftService from './draft.service';

class GameService {
  /**
   * Get the current game for the authenticated user
   * @param userId The authenticated user's ID
   * @param token The JWT token of the authenticated user
   * @returns The current game data or null if no game exists
   */
  async getCurrentGame(userId: string, token: string): Promise<CurrentGameResponse | null> {
    try {
      const team = await gameRepository.getCurrentGameForUser(userId, token);
      
      if (!team) {
        return null;
      }
      
      return formatGameResponse(team);
    } catch (error) {
      console.error('GameService.getCurrentGame error:', error);
      throw error;
    }
  }

  /**
   * Get game by team ID
   * 
   * @param teamId The team ID to find the game for
   * @param token JWT token
   * @returns The game associated with the team
   */
  async getGameByTeamId(teamId: string, token: string): Promise<Game | null> {
    return gameRepository.getGameByTeamId(teamId, token);
  }

  /**
   * Create a new team and game for the authenticated user
   * @param userId The authenticated user's ID
   * @param teamName The name of the team to create
   * @param token The JWT token of the authenticated user
   * @returns The created team and game data
   */
  async createTeam(userId: string, teamName: string, token: string): Promise<CreateTeamResponse> {
    try {
      // Check if user already has an active game
      const existingGame = await this.getCurrentGame(userId, token);
      
      if (existingGame) {
        throw new ApiError(400, 'User already has an active game');
      }
      
      // Create a new game
      const game = await gameRepository.createGame();
      
      // Create the team
      const team = await teamRepository.createTeam({
        name: teamName,
        owner_id: userId,
        game_id: game.id,
        stadium_size: 1,
        training_facility_level: 1,
        scout_level: 1,
        budget: 100
      }, token);
      
      // Initialize the draft (assuming this is handled by the draft service)
      try {
        await draftService.generateDraftPlayers(game.id);
      } catch (error) {
        console.error('Error generating draft players:', error);
        // Continue even if player generation fails
      }
      
      return {
        team_id: team.id,
        team_name: team.name,
        game_id: game.id,
        game_season: game.season,
        game_match_day: game.match_day,
        game_status: game.status,
        game_stage: game.game_stage
      };
    } catch (error) {
      console.error('GameService.createTeam error:', error);
      throw error;
    }
  }

  /**
   * Cancel an active game
   * @param gameId The ID of the game to cancel
   * @param token The JWT token of the authenticated user
   * @returns The result of the operation
   */
  async cancelGame(gameId: string, token: string): Promise<CancelGameResponseModel> {
    try {
      // Get the game
      const game = await gameRepository.getGameById(gameId, token);
      
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Update game status to cancelled
      const success = await gameRepository.updateGameStatus(gameId, GAME_STATUS.COMPLETED);
      
      if (!success) {
        throw new ApiError(500, 'Failed to cancel game');
      }
      
      return {
        success: true,
        message: 'Game cancelled successfully'
      };
    } catch (error) {
      console.error('GameService.cancelGame error:', error);
      throw error;
    }
  }

  /**
   * Start the main season for a game
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The updated game
   */
  async startMainSeason(gameId: string, token: string): Promise<StartMainSeasonResponse> {
    try {
      // Validate game state
      await this.validateGameForSeasonStart(gameId, token);
      
      // Get the user's team
      const userTeam = await teamRepository.getTeamByGameId(gameId, token);
      
      if (!userTeam) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Generate league components
      await this.generateLeagueComponents(
        gameId, 
        userTeam.id, 
        token
      );

      const league = await leagueService.getLeague(gameId, token);
      
      // Update the game stage to regular season
      const updatedGame = await gameRepository.updateGameStage(gameId, GAME_STAGE.REGULAR_SEASON);
      
      return {
        game: updatedGame,
        fixtures: league.fixtures,
        table: league.table
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in startMainSeason:', error);
      throw new ApiError(500, 'Failed to start main season');
    }
  }
  
  /**
   * Validate that a game is in the correct state to start the season
   * 
   * @param gameId The game ID
   * @param token JWT token
   */
  private async validateGameForSeasonStart(gameId: string, token: string): Promise<void> {
    const currentGame = await gameRepository.getGameById(gameId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'Game not found');
    }
    
    // Check if game is in pre-season
    if (currentGame.game_stage !== GAME_STAGE.PRE_SEASON) {
      throw new ApiError(400, 'Game is not in pre-season');
    }
  }
  
  /**
   * Generate opponent teams and fixtures for the league
   * 
   * @param gameId The game ID
   * @param userTeamId The user's team ID
   * @param token JWT token
   */
  private async generateLeagueComponents(
    gameId: string, 
    userTeamId: string, 
    token: string
  ): Promise<{ 
    opponentTeams: OpponentTeam[], 
    fixtures: Fixture[] 
  }> {
    // Get the current game (needed for season info)
    const currentGame = await gameRepository.getGameById(gameId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'Game not found');
    }
    
    // Generate opponent teams for the season
    const opponentTeams = await leagueService.generateOpponentTeams(
      gameId, 
      currentGame.season, 
      token
    );
    
    // Generate fixtures for the season (including opponent fixtures)
    const fixtures = await leagueService.generateFixtures(
      gameId,
      currentGame.season,
      userTeamId,
      opponentTeams,
      token
    );
    
    return { opponentTeams, fixtures };
  }
}

export default new GameService();
