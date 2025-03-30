import { CurrentGameResponse, Game, CreateTeamRequest, CreateTeamResponse, CancelGameResponse, StartMainSeasonResponse } from '../types';
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
  async getGameByTeamId(teamId: string, token: string) {
    return gameRepository.getGameByTeamId(teamId, token);
  }

  /**
   * Create a new team and game for the authenticated user
   * @param userId The authenticated user's ID
   * @param token The JWT token of the authenticated user
   * @param teamData The team data to create
   * @returns The created team and game data
   */
  async createTeam(userId: string, token: string, teamData: CreateTeamRequest): Promise<CreateTeamResponse> {
    try {
      // First check if the user already has an active game
      const currentGame = await this.getCurrentGame(userId, token);
      if (currentGame) {
        throw new ApiError(400, 'You already have an active game. Please complete or cancel it before starting a new one.');
      }
      
      // Create a new game
      const newGame = await gameRepository.createGame();
      
      // Create the team linked to the new game
      try {
        const newTeam = await teamRepository.createTeam({
          name: teamData.name,
          owner_id: userId,
          game_id: newGame.id,
          stadium_size: 1, 
          training_facility_level: 1,
          scout_level: 1,
          budget: 100 
        }, token);
        
        // Generate draft players for the new game
        try {
          await draftService.generateDraftPlayers(newGame.id);
        } catch (error) {
          console.error('Error generating draft players:', error);
          // Continue even if player generation fails, as the team and game were created successfully
        }
        
        return {
          team_id: newTeam.id,
          team_name: newTeam.name,
          game_id: newGame.id,
          game_season: newGame.season,
          game_match_day: newGame.match_day,
          game_status: newGame.status,
          game_stage: newGame.game_stage
        };
      } catch (error) {
        console.error('Error creating team:', error);
        throw new Error('Failed to create team');
      }
    } catch (error) {
      console.error('GameService.createTeam error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Failed to create team and game');
    }
  }

  /**
   * Cancel an active game for the authenticated user
   * @param userId The authenticated user's ID
   * @param token The JWT token of the authenticated user
   * @param gameId The ID of the game to cancel
   * @returns Success status and message
   */
  async cancelGame(userId: string, token: string, gameId: string): Promise<CancelGameResponse> {
    try {
      // First verify that the game exists and belongs to the user
      const team = await gameRepository.getGameForUser(userId, gameId, token);
      
      if (!team) {
        throw new ApiError(404, 'Game not found or does not belong to you');
      }
      
      // Get the game data
      const gameData = team.games;
      const game: Game = Array.isArray(gameData) ? gameData[0] : gameData;
      
      // Check if the game is already completed
      if (game.status === GAME_STATUS.COMPLETED) {
        throw new ApiError(400, 'This game is already completed and cannot be cancelled');
      }
      
      // Update the game status to completed (effectively cancelling it)
      const success = await gameRepository.updateGameStatus(gameId, GAME_STATUS.COMPLETED);
      
      if (!success) {
        throw new Error('Failed to cancel game');
      }
      
      return {
        success: true,
        message: 'Game has been successfully cancelled'
      };
    } catch (error) {
      console.error('GameService.cancelGame error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Failed to cancel game');
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
      const { opponentTeams, fixtures } = await this.generateLeagueComponents(
        gameId, 
        userTeam.id, 
        token
      );
      
      // Update the game stage to regular season
      const updatedGame = await gameRepository.updateGameStage(gameId, GAME_STAGE.REGULAR_SEASON);
      
      return {
        success: true,
        message: 'Successfully started the main season',
        game: updatedGame,
        fixtures,
        opponent_teams: opponentTeams
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
    opponentTeams: any[], 
    fixtures: any[] 
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
