import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { 
  Player, PlayerStatus, GetDraftPlayersResponse, CompleteDraftRequest, 
  CompleteDraftResponse
} from '../types';
import { PlayerGenerator } from '../utils/player-generator';
import { DRAFT_CONSTANTS, GAME_STAGE, PLAYER_STATUS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import * as playerRepository from '../repositories/playerRepository';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';

class DraftService {
  /**
   * Generate draft players for a game
   * @param gameId The game ID to generate players for
   * @returns Array of created player IDs
   */
  async generateDraftPlayers(gameId: string): Promise<string[]> {
    try {
      // Generate players with specific tier distribution: 20 tier 1 players, 4 tier 2 players
      const tierDistribution = {
        1: 20,
        2: DRAFT_CONSTANTS.GENERATED_PLAYERS_COUNT - 20
      };
      
      // Generate players
      const generatedPlayers = PlayerGenerator.generatePlayers(
        DRAFT_CONSTANTS.GENERATED_PLAYERS_COUNT,
        tierDistribution
      );
      
      // Prepare players for database insertion
      const playersToInsert = generatedPlayers.map(player => ({
        game_id: gameId,
        name: player.name,
        status: 'draft' as PlayerStatus,
        tier: player.tier,
        potential_tier: player.potentialTier,
        ...player.stats,
        ...player.potentialStats
      }));
      
      const players = await playerRepository.createPlayers(playersToInsert);
      return players.map(player => player.id);
    } catch (error) {
      console.error('DraftService.generateDraftPlayers error:', error);
      throw error;
    }
  }

  /**
   * Get draft players for a game
   * @param gameId The game ID to get draft players for
   * @param token JWT token of the authenticated user
   * @returns Response with draft players
   */
  async getDraftPlayers(gameId: string, token: string): Promise<GetDraftPlayersResponse> {
    try {
      const players = await playerRepository.getDraftPlayersByGameId(gameId, token);
      return { players };
    } catch (error) {
      console.error('DraftService.getDraftPlayers error:', error);
      throw error;
    }
  }

  /**
   * Complete the draft by selecting players for a team
   * @param teamId The team ID
   * @param draftData The draft data
   * @param token JWT token of the authenticated user
   * @returns Response with selected players
   */
  async completeDraft(teamId: string, draftData: CompleteDraftRequest, token: string): Promise<CompleteDraftResponse> {
    try {
      // Validate that the correct number of players are selected
      if (draftData.player_ids.length !== DRAFT_CONSTANTS.REQUIRED_PLAYERS) {
        throw new ApiError(400, `You must select exactly ${DRAFT_CONSTANTS.REQUIRED_PLAYERS} players to complete the draft`);
      }
      
      // Get the team and associated game
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Get the game to check if it's in the draft stage
      const game = await gameRepository.getGameById(team.game_id, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Validate the game is in the draft stage
      if (game.game_stage !== GAME_STAGE.DRAFT) {
        throw new ApiError(400, 'Draft has already been completed');
      }
      
      // Ensure all selected players exist and are in draft status
      const selectedPlayers = await this.validateAndGetSelectedPlayers(draftData.player_ids, team.game_id, token);
      
      // Update the players to assign them to the team
      await this.assignPlayersToTeam(selectedPlayers);
      
      // Update the game stage to pre-season
      await gameRepository.updateGameStage(team.game_id, GAME_STAGE.PRE_SEASON);
      
      return {
        success: true,
        message: 'Draft completed successfully',
        team_id: teamId,
        selected_players: selectedPlayers
      };
    } catch (error) {
      console.error('DraftService.completeDraft error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to complete draft');
    }
  }
  
  /**
   * Validate and retrieve the selected players
   * @param playerIds Array of player IDs
   * @param gameId The game ID
   * @param token JWT token
   * @returns Array of selected players
   */
  private async validateAndGetSelectedPlayers(playerIds: string[], gameId: string, token: string): Promise<Player[]> {
    const allDraftPlayers = await playerRepository.getDraftPlayersByGameId(gameId, token);
    
    // Create a map of all draft players for easy lookup
    const draftPlayersMap = new Map<string, Player>();
    allDraftPlayers.forEach(player => {
      draftPlayersMap.set(player.id, player);
    });
    
    // Check if all selected players exist and are in draft status
    const selectedPlayers: Player[] = [];
    for (const playerId of playerIds) {
      const player = draftPlayersMap.get(playerId);
      if (!player) {
        throw new ApiError(400, `Player with ID ${playerId} is not available for draft`);
      }
      selectedPlayers.push(player);
    }
    
    return selectedPlayers;
  }
  
  /**
   * Assign players to the team by updating their status
   * @param players Array of players to assign
   * @returns Boolean indicating success
   */
  private async assignPlayersToTeam(players: Player[]): Promise<boolean> {
    // Prepare player updates
    const playerUpdates = players.map(player => ({
      id: player.id,
      status: PLAYER_STATUS.TEAM as PlayerStatus
    }));
    
    // Update all players in a batch
    return playerRepository.updatePlayers(playerUpdates);
  }
}

export default new DraftService();
