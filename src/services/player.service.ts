import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Player, PlayerStatus, GetDraftPlayersResponse, CompleteDraftRequest, CompleteDraftResponse, GetSquadResponse } from '../types';
import { PlayerGenerator } from '../utils/player-generator';
import { DRAFT_CONSTANTS, GAME_STAGE, PLAYER_STATUS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';

class PlayerService {
  /**
   * Generate draft players for a new game
   * @param gameId The game ID to generate players for
   * @returns Array of created player IDs
   */
  async generateDraftPlayers(gameId: string): Promise<string[]> {
    try {
      // Generate players with specific tier distribution: 20 tier 1 players, 4 tier 2 players
      const tierDistribution = {
        1: 20, // 20 tier 1 players
        2: 4   // 4 tier 2 players
      };
      
      const generatedPlayers = PlayerGenerator.generatePlayers(24, tierDistribution);
      
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
      
      // Insert players into the database
      const { data: players, error } = await supabaseAdmin
        .from('players')
        .insert(playersToInsert)
        .select('id');
      
      if (error) {
        console.error('Error generating draft players:', error);
        throw new Error('Failed to generate draft players');
      }
      
      return players.map(player => player.id);
    } catch (error) {
      console.error('PlayerService.generateDraftPlayers error:', error);
      throw error;
    }
  }

  /**
   * Get draft players for a game
   * @param gameId The game ID to get draft players for
   * @param token The JWT token of the authenticated user
   * @returns Array of draft players
   */
  async getDraftPlayers(gameId: string, token: string): Promise<GetDraftPlayersResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Query to find draft players for the game
      const { data: players, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'draft')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error getting draft players:', error);
        throw new Error('Failed to get draft players');
      }
      
      return { players: players as Player[] };
    } catch (error) {
      console.error('PlayerService.getDraftPlayers error:', error);
      throw error;
    }
  }

  /**
   * Complete the draft by selecting players for the team
   * @param teamId The team ID to assign players to
   * @param draftData The draft completion data
   * @param token The JWT token of the authenticated user
   * @returns The completed draft response
   */
  async completeDraft(teamId: string, draftData: CompleteDraftRequest, token: string): Promise<CompleteDraftResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Validate that the correct number of players are selected
      if (draftData.player_ids.length !== DRAFT_CONSTANTS.REQUIRED_PLAYERS) {
        throw new ApiError(400, `You must select exactly ${DRAFT_CONSTANTS.REQUIRED_PLAYERS} players to complete the draft`);
      }
      
      // Get the game to check if it's in the draft stage
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select(`
          id,
          game_id,
          games:game_id (
            id,
            game_stage
          )
        `)
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Extract game data
      const gameData = team.games as { id: string; game_stage: string } | { id: string; game_stage: string }[];
      const gameId = team.game_id;
      
      // Validate the game is in the draft stage
      let isInDraftStage = false;
      
      if (Array.isArray(gameData)) {
        // If it's an array, check the first game
        isInDraftStage = gameData.length > 0 && gameData[0].game_stage === GAME_STAGE.DRAFT;
      } else {
        // If it's a single object
        isInDraftStage = gameData.game_stage === GAME_STAGE.DRAFT;
      }
      
      if (!isInDraftStage) {
        throw new ApiError(400, 'Draft has already been completed for this game');
      }
      
      // Validate that the game_id in the request matches the team's game_id
      if (draftData.game_id !== gameId) {
        throw new ApiError(400, 'Game ID does not match the team\'s game');
      }
      
      // Validate that all selected players are draft players for this game
      const { data: validPlayers, error: validationError } = await supabaseClient
        .from('players')
        .select('id')
        .eq('game_id', gameId)
        .eq('status', PLAYER_STATUS.DRAFT)
        .in('id', draftData.player_ids);
      
      if (validationError) {
        console.error('Error validating players:', validationError);
        throw new ApiError(500, 'Failed to validate selected players');
      }
      
      if (!validPlayers || validPlayers.length !== draftData.player_ids.length) {
        throw new ApiError(400, 'One or more selected players are not valid draft players for this game');
      }
      
      // Update the selected players to be team players
      const { data: updatedPlayers, error: updateError } = await supabaseAdmin
        .from('players')
        .update({ status: PLAYER_STATUS.TEAM })
        .eq('game_id', gameId)
        .in('id', draftData.player_ids)
        .select('*');
      
      if (updateError) {
        console.error('Error updating players:', updateError);
        throw new ApiError(500, 'Failed to update player status');
      }
      
      // Update the game stage to pre_season
      const { error: gameUpdateError } = await supabaseAdmin
        .from('games')
        .update({ game_stage: GAME_STAGE.PRE_SEASON })
        .eq('id', gameId);
      
      if (gameUpdateError) {
        console.error('Error updating game stage:', gameUpdateError);
        throw new ApiError(500, 'Failed to update game stage');
      }
      
      return {
        success: true,
        message: 'Draft completed successfully',
        team_id: teamId,
        selected_players: updatedPlayers as Player[]
      };
    } catch (error) {
      console.error('PlayerService.completeDraft error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to complete draft');
    }
  }

  /**
   * Get the squad (team players) for a team
   * @param teamId The team ID to get the squad for
   * @param token The JWT token of the authenticated user
   * @returns The team's squad
   */
  async getSquad(teamId: string, token: string): Promise<GetSquadResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Get the game ID for the team
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select('game_id')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Query to find team players for the game
      const { data: players, error } = await supabaseClient
        .from('players')
        .select('*')
        .eq('game_id', team.game_id)
        .eq('status', PLAYER_STATUS.TEAM)
        .order('tier', { ascending: false });
      
      if (error) {
        console.error('Error getting squad players:', error);
        throw new ApiError(500, 'Failed to get squad players');
      }
      
      return { players: players as Player[] };
    } catch (error) {
      console.error('PlayerService.getSquad error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get squad');
    }
  }
}

export default new PlayerService();
