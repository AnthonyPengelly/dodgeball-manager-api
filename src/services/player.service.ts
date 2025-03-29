import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Player, PlayerStatus, GetDraftPlayersResponse } from '../types';
import { PlayerGenerator } from '../utils/player-generator';

class PlayerService {
  /**
   * Generate draft players for a new game
   * @param gameId The game ID to generate players for
   * @returns Array of created player IDs
   */
  async generateDraftPlayers(gameId: string): Promise<string[]> {
    try {
      // Generate players with specific tier distribution: 16 tier 1 players, 8 tier 2 players
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
}

export default new PlayerService();
