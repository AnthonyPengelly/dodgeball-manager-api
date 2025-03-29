import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { CurrentGameResponse, TeamWithGame, Game, CreateTeamRequest, CreateTeamResponse, CancelGameResponse, StartMainSeasonResponse } from '../types';
import { GAME_STATUS, GAME_STAGE } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import playerService from './player.service';
import leagueService from './league.service';

class GameService {
  /**
   * Get the current game for the authenticated user
   * @param userId The authenticated user's ID
   * @param token The JWT token of the authenticated user
   * @returns The current game data or null if no game exists
   */
  async getCurrentGame(userId: string, token: string): Promise<CurrentGameResponse | null> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Query to find the user's current active game
      // Look for games with status not 'completed' that are linked to teams owned by this user
      const { data: teams, error: teamsError } = await supabaseClient
        .from('teams')
        .select(`
          id,
          name,
          games:game_id (
            id,
            season,
            match_day,
            status,
            game_stage
          )
        `)
        .eq('owner_id', userId)
        .not('games.status', 'eq', GAME_STATUS.COMPLETED)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (teamsError) {
        console.error('Error getting teams with active games:', teamsError);
        throw new Error('Failed to get current game');
      }
      
      // If no active game found, return null
      if (!teams || teams.length === 0 || !teams[0].games) {
        return null;
      }
      
      // Map the data to the expected response format
      const team = teams[0] as TeamWithGame;
      
      // Handle the joined game data - Supabase might return an array or a single object
      const gameData = team.games;
      const game: Game = Array.isArray(gameData) ? gameData[0] : gameData;
      
      return {
        game_id: game.id,
        game_season: game.season,
        game_match_day: game.match_day,
        game_status: game.status,
        game_stage: game.game_stage,
        team_id: team.id,
        team_name: team.name
      };
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
    try {
      const { data, error } = await createClientFromToken(token)
        .from('games')
        .select('*, teams!inner(*)')
        .eq('teams.id', teamId)
        .single();
      
      if (error) {
        console.error('Error getting game by team ID:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getGameByTeamId:', error);
      return null;
    }
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
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // First check if the user already has an active game
      const currentGame = await this.getCurrentGame(userId, token);
      if (currentGame) {
        throw new ApiError(400, 'You already have an active game. Please complete or cancel it before starting a new one.');
      }
      
      // Use a transaction to create both the game and team
      // Since we need to use the service role for this, we'll use supabaseAdmin
      const { data: newGame, error: gameError } = await supabaseAdmin
        .from('games')
        .insert({
          season: 1,
          match_day: 0,
          status: GAME_STATUS.IN_PROGRESS,
          game_stage: GAME_STAGE.DRAFT
        })
        .select()
        .single();
      
      if (gameError) {
        console.error('Error creating new game:', gameError);
        throw new Error('Failed to create new game');
      }
      
      // Create the team linked to the new game
      const { data: newTeam, error: teamError } = await supabaseClient
        .from('teams')
        .insert({
          name: teamData.name,
          owner_id: userId,
          game_id: newGame.id,
          stadium_size: 1, 
          training_facility_level: 1,
          scout_level: 1,
          budget: 100 
        })
        .select()
        .single();
      
      if (teamError) {
        console.error('Error creating new team:', teamError);
        // Attempt to clean up the game if team creation fails
        await supabaseAdmin.from('games').delete().eq('id', newGame.id);
        throw new Error('Failed to create new team');
      }
      
      // Generate draft players for the new game (24 players with tier cap of 2)
      try {
        await playerService.generateDraftPlayers(newGame.id);
      } catch (error) {
        console.error('Error generating draft players:', error);
        // Continue even if player generation fails, as the team and game were created successfully
        // We'll log the error but not fail the whole operation
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
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // First verify that the game exists and belongs to the user
      const { data: teams, error: teamsError } = await supabaseClient
        .from('teams')
        .select(`
          id,
          games:game_id (
            id,
            status
          )
        `)
        .eq('owner_id', userId)
        .eq('game_id', gameId)
        .limit(1);
      
      if (teamsError) {
        console.error('Error verifying game ownership:', teamsError);
        throw new Error('Failed to verify game ownership');
      }
      
      if (!teams || teams.length === 0 || !teams[0].games) {
        throw new ApiError(404, 'Game not found or does not belong to you');
      }
      
      // Get the game data
      const team = teams[0] as TeamWithGame;
      const gameData = team.games;
      const game: Game = Array.isArray(gameData) ? gameData[0] : gameData;
      
      // Check if the game is already completed
      if (game.status === GAME_STATUS.COMPLETED) {
        throw new ApiError(400, 'This game is already completed and cannot be cancelled');
      }
      
      // Update the game status to completed (effectively cancelling it)
      const { error: updateError } = await supabaseAdmin
        .from('games')
        .update({ status: GAME_STATUS.COMPLETED })
        .eq('id', gameId);
      
      if (updateError) {
        console.error('Error cancelling game:', updateError);
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
   * Start the main season by changing the game stage from pre-season to regular season
   * 
   * @param gameId The ID of the game to update
   * @param token JWT token for authentication
   * @returns The updated game, opponent teams, and fixtures
   */
  async startMainSeason(gameId: string, token: string): Promise<StartMainSeasonResponse> {
    try {
      // Get the current game to verify it's in pre-season
      const { data: currentGame, error: gameError } = await createClientFromToken(token)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
        
      if (gameError || !currentGame) {
        console.error('Error getting game:', gameError);
        throw new ApiError(404, 'Game not found');
      }
      
      // Check if game is in the correct stage for transition
      if (currentGame.game_stage !== GAME_STAGE.PRE_SEASON) {
        throw new ApiError(400, `Cannot start main season. Game is in ${currentGame.game_stage} stage.`);
      }
      
      // Get the user's team for this game
      const { data: userTeam, error: teamError } = await createClientFromToken(token)
        .from('teams')
        .select('*')
        .eq('game_id', gameId)
        .single();
        
      if (teamError || !userTeam) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Generate opponent teams for the season
      const opponentTeams = await leagueService.generateOpponentTeams(
        gameId, 
        currentGame.season, 
        token
      );
      
      // Generate fixtures for the season
      const fixtures = await leagueService.generateFixtures(
        gameId,
        currentGame.season,
        userTeam.id,
        opponentTeams,
        token
      );
      
      // Update the game stage to regular season
      const { data: updatedGame, error: updateError } = await supabaseAdmin
        .from('games')
        .update({ game_stage: GAME_STAGE.REGULAR_SEASON })
        .eq('id', gameId)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating game stage:', updateError);
        throw new ApiError(500, 'Failed to start main season');
      }
      
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
}

export default new GameService();
