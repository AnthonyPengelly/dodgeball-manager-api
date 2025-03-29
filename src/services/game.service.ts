import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { CurrentGameResponse, TeamWithGame, Game } from '../types';
import { GAME_STATUS } from '../utils/constants';

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
            status
          )
        `)
        .eq('owner_id', userId)
        .not('games.status', 'eq', GAME_STATUS.COMPLETED)
        .order('games.created_at', { ascending: false })
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
        team_id: team.id,
        team_name: team.name
      };
    } catch (error) {
      console.error('GameService.getCurrentGame error:', error);
      throw error;
    }
  }
}

export default new GameService();
