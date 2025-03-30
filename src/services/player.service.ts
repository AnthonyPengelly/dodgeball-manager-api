import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { 
  Player, PlayerStatus, GetDraftPlayersResponse, CompleteDraftRequest, 
  CompleteDraftResponse, GetSquadResponse, TrainPlayerRequest, 
  TrainPlayerResponse, PlayerStatName, ScoutPlayersRequest, 
  ScoutPlayersResponse, PurchaseScoutedPlayerRequest, 
  PurchaseScoutedPlayerResponse, ScoutedPlayer, GetScoutedPlayersResponse
} from '../types';
import { PlayerGenerator } from '../utils/player-generator';
import { DRAFT_CONSTANTS, GAME_STAGE, PLAYER_STATUS, TRAINING_CONSTANTS, PLAYER_STATS, SCOUTING_CONSTANTS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import seasonService from './season.service';
import { TierCalculator } from '../utils/tier-calculator';
import { PlayerPriceCalculator } from '../utils/player-price-calculator';

class PlayerService {
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
