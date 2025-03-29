import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Player, PlayerStatus, GetDraftPlayersResponse, CompleteDraftRequest, CompleteDraftResponse, GetSquadResponse, TrainPlayerRequest, TrainPlayerResponse, PlayerStatName } from '../types';
import { PlayerGenerator } from '../utils/player-generator';
import { DRAFT_CONSTANTS, GAME_STAGE, PLAYER_STATUS, TRAINING_CONSTANTS, PLAYER_STATS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import seasonService from './season.service';
import { TierCalculator } from '../utils/tier-calculator';

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

  /**
   * Train a player by improving one of their stats
   * @param teamId The team ID that owns the player
   * @param trainingData The training data with player ID and stat to improve
   * @param token The JWT token of the authenticated user
   * @returns The updated player and season training info
   */
  async trainPlayer(teamId: string, trainingData: TrainPlayerRequest, token: string): Promise<TrainPlayerResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Validate the stat name
      if (!PLAYER_STATS.includes(trainingData.stat_name)) {
        throw new ApiError(400, `Invalid stat name: ${trainingData.stat_name}`);
      }
      
      // Get the team and game information
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select(`
          *,
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
      
      // Validate the game is in the pre_season stage
      let isInPreSeason = false;
      let gameId = '';
      
      if (Array.isArray(gameData)) {
        // If it's an array, check the first game
        isInPreSeason = gameData.length > 0 && gameData[0].game_stage === GAME_STAGE.PRE_SEASON;
        gameId = gameData.length > 0 ? gameData[0].id : '';
      } else {
        // If it's a single object
        isInPreSeason = gameData.game_stage === GAME_STAGE.PRE_SEASON;
        gameId = gameData.id;
      }
      
      if (!isInPreSeason) {
        throw new ApiError(400, 'Training can only be done during the pre-season');
      }
      
      // Get the current season and calculate training credits
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      const trainingInfo = seasonService.calculateTrainingCredits(currentSeason, team.training_facility_level);
      
      if (trainingInfo.training_credits_remaining <= 0) {
        throw new ApiError(400, 'No training credits remaining for this season');
      }
      
      // Get the player to train
      const { data: player, error: playerError } = await supabaseClient
        .from('players')
        .select('*')
        .eq('id', trainingData.player_id)
        .eq('status', PLAYER_STATUS.TEAM)
        .single();
      
      if (playerError || !player) {
        console.error('Error getting player:', playerError);
        throw new ApiError(404, 'Player not found or not on your team');
      }
      
      // Check if the player belongs to the team's game
      if (player.game_id !== gameId) {
        throw new ApiError(400, 'Player does not belong to your team');
      }
      
      // Get the current stat value and potential
      const statName = trainingData.stat_name;
      const currentValue = player[statName];
      const potentialStatName = `${statName}_potential` as keyof Player;
      const potentialValue = player[potentialStatName] as number;
      
      // Validate the stat can be improved
      if (currentValue >= potentialValue) {
        throw new ApiError(400, `Player's ${statName} is already at maximum potential`);
      }
      
      if (currentValue >= TRAINING_CONSTANTS.MAX_STAT_VALUE) {
        throw new ApiError(400, `Player's ${statName} is already at maximum value (${TRAINING_CONSTANTS.MAX_STAT_VALUE})`);
      }
      
      // Update the player's stat
      const newStatValue = Math.min(currentValue + 1, potentialValue, TRAINING_CONSTANTS.MAX_STAT_VALUE);
      
      // Create an update object with just the stat to update
      const updateData: Record<string, any> = {
        [statName]: newStatValue
      };
      
      // Update the player
      const { data: updatedPlayer, error: updateError } = await supabaseAdmin
        .from('players')
        .update(updateData)
        .eq('id', trainingData.player_id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating player:', updateError);
        throw new ApiError(500, 'Failed to update player');
      }
      
      // Recalculate player tier
      const playerStats = {
        throwing: updatedPlayer.throwing,
        catching: updatedPlayer.catching,
        dodging: updatedPlayer.dodging,
        blocking: updatedPlayer.blocking,
        speed: updatedPlayer.speed,
        positional_sense: updatedPlayer.positional_sense,
        teamwork: updatedPlayer.teamwork,
        clutch_factor: updatedPlayer.clutch_factor
      };
      
      const newTier = TierCalculator.calculateTier(playerStats);
      
      // Update tier if it changed
      if (newTier !== updatedPlayer.tier) {
        const { data: tierUpdatedPlayer, error: tierUpdateError } = await supabaseAdmin
          .from('players')
          .update({ tier: newTier })
          .eq('id', trainingData.player_id)
          .select()
          .single();
        
        if (tierUpdateError) {
          console.error('Error updating player tier:', tierUpdateError);
          throw new ApiError(500, 'Failed to update player tier');
        }
        
        updatedPlayer.tier = newTier;
      }
      
      // Update the season's training credits used
      const updatedSeason = await seasonService.updateTrainingCreditsUsed(currentSeason.id, 1);
      
      // Calculate updated training info
      const updatedTrainingInfo = seasonService.calculateTrainingCredits(updatedSeason, team.training_facility_level);
      
      return {
        success: true,
        message: `Successfully improved ${statName} from ${currentValue} to ${newStatValue}`,
        player: updatedPlayer as Player,
        season: updatedTrainingInfo
      };
    } catch (error) {
      console.error('PlayerService.trainPlayer error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to train player');
    }
  }
}

export default new PlayerService();
