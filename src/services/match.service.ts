import { createClientFromToken, supabaseAdmin } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Fixture, PlayMatchResponse } from '../types';

class MatchService {
  /**
   * Play the next scheduled match for a game
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The match result
   */
  async playNextMatch(gameId: string, token: string): Promise<PlayMatchResponse> {
    try {
      // Get the current game to check the match day
      const { data: game, error: gameError } = await createClientFromToken(token)
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
        
      if (gameError || !game) {
        console.error('Error getting game:', gameError);
        throw new ApiError(404, 'Game not found');
      }
      
      // Check if game is in regular season
      if (game.game_stage !== 'regular_season') {
        throw new ApiError(400, `Cannot play match. Game is in ${game.game_stage} stage.`);
      }
      
      const currentMatchDay = game.match_day || 0;
      const nextMatchDay = currentMatchDay + 1;
      
      // Get the next fixture
      const { data: fixtures, error: fixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', game.season)
        .eq('match_day', nextMatchDay)
        .eq('status', 'scheduled');
        
      if (fixturesError) {
        console.error('Error getting next fixture:', fixturesError);
        throw new ApiError(500, 'Failed to get next fixture');
      }
      
      if (!fixtures || fixtures.length === 0) {
        throw new ApiError(404, 'No more fixtures scheduled for this season');
      }
      
      // Get the fixture to play
      const fixture = fixtures[0];
      
      // Generate random scores (total of 3 points to split between teams)
      const totalPoints = 3;
      const homeScore = Math.floor(Math.random() * (totalPoints + 1)); // 0 to 3
      const awayScore = totalPoints - homeScore; // Remaining points
      
      // Update the fixture with the result
      const { data: updatedFixture, error: updateError } = await supabaseAdmin
        .from('fixtures')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: 'completed',
          played_at: new Date().toISOString()
        })
        .eq('id', fixture.id)
        .select()
        .single();
        
      if (updateError) {
        console.error('Error updating fixture:', updateError);
        throw new ApiError(500, 'Failed to update fixture with match result');
      }
      
      // Update the game's match day
      const { error: gameUpdateError } = await supabaseAdmin
        .from('games')
        .update({ match_day: nextMatchDay })
        .eq('id', gameId);
        
      if (gameUpdateError) {
        console.error('Error updating game match day:', gameUpdateError);
        throw new ApiError(500, 'Failed to update game match day');
      }
      
      // Get team names for the response
      const { data: homeTeam, error: homeTeamError } = await createClientFromToken(token)
        .from(fixture.home_team_type === 'user' ? 'teams' : 'opponent_teams')
        .select('name')
        .eq('id', fixture.home_team_id)
        .single();
        
      if (homeTeamError) {
        console.error('Error getting home team:', homeTeamError);
      }
      
      const { data: awayTeam, error: awayTeamError } = await createClientFromToken(token)
        .from(fixture.away_team_type === 'user' ? 'teams' : 'opponent_teams')
        .select('name')
        .eq('id', fixture.away_team_id)
        .single();
        
      if (awayTeamError) {
        console.error('Error getting away team:', awayTeamError);
      }
      
      return {
        success: true,
        message: 'Match played successfully',
        match: {
          ...updatedFixture,
          home_team_name: homeTeam?.name || 'Unknown Team',
          away_team_name: awayTeam?.name || 'Unknown Team'
        },
        match_day: nextMatchDay
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in playNextMatch:', error);
      throw new ApiError(500, 'Failed to play next match');
    }
  }
}

export default new MatchService();
