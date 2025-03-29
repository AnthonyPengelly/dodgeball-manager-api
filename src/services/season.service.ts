import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Season, SeasonTrainingInfo, GetSeasonTrainingInfoResponse } from '../types';
import { TRAINING_CONSTANTS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';

class SeasonService {
  /**
   * Get the current season for a team
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The current season data
   */
  async getCurrentSeason(teamId: string, token: string): Promise<Season> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Get the team to find the game and current season number
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select(`
          id,
          game_id,
          games:game_id (
            id,
            season
          )
        `)
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Extract game data
      const gameData = team.games as { id: string; season: number } | { id: string; season: number }[];
      let gameId = '';
      let seasonNumber = 1;
      
      if (Array.isArray(gameData)) {
        // If it's an array, get the first game
        gameId = gameData.length > 0 ? gameData[0].id : '';
        seasonNumber = gameData.length > 0 ? gameData[0].season : 1;
      } else {
        // If it's a single object
        gameId = gameData.id;
        seasonNumber = gameData.season;
      }
      
      // Check if a season record already exists for this team and season
      const { data: existingSeason, error: seasonError } = await supabaseClient
        .from('seasons')
        .select('*')
        .eq('team_id', teamId)
        .eq('game_id', gameId)
        .eq('season_number', seasonNumber)
        .single();
      
      if (seasonError && seasonError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error getting season:', seasonError);
        throw new ApiError(500, 'Failed to get season data');
      }
      
      if (existingSeason) {
        return existingSeason as Season;
      }
      
      // If no season record exists, create one
      const { data: newSeason, error: createError } = await supabaseAdmin
        .from('seasons')
        .insert({
          team_id: teamId,
          game_id: gameId,
          season_number: seasonNumber,
          training_credits_used: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating season:', createError);
        throw new ApiError(500, 'Failed to create season record');
      }
      
      return newSeason as Season;
    } catch (error) {
      console.error('SeasonService.getCurrentSeason error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get current season');
    }
  }

  /**
   * Get training information for the current season
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The season's training information
   */
  async getSeasonTrainingInfo(teamId: string, token: string): Promise<GetSeasonTrainingInfoResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get the team's training facility level
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select('training_facility_level')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate training credits
      const trainingInfo = this.calculateTrainingCredits(currentSeason, team.training_facility_level);
      
      return { season: trainingInfo };
    } catch (error) {
      console.error('SeasonService.getSeasonTrainingInfo error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get season training info');
    }
  }

  /**
   * Update the training credits used for a season
   * @param seasonId The season ID to update
   * @param creditsUsed The number of credits to add to the used count
   * @returns The updated season data
   */
  async updateTrainingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
    try {
      // Get the current season data
      const { data: currentSeason, error: getError } = await supabaseAdmin
        .from('seasons')
        .select('training_credits_used')
        .eq('id', seasonId)
        .single();
      
      if (getError) {
        console.error('Error getting season for credits update:', getError);
        throw new ApiError(404, 'Season not found');
      }
      
      // Calculate the new credits used
      const newCreditsUsed = (currentSeason.training_credits_used || 0) + creditsUsed;
      
      // Update the season
      const { data: updatedSeason, error: updateError } = await supabaseAdmin
        .from('seasons')
        .update({ training_credits_used: newCreditsUsed })
        .eq('id', seasonId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating season training credits:', updateError);
        throw new ApiError(500, 'Failed to update training credits');
      }
      
      return updatedSeason as Season;
    } catch (error) {
      console.error('SeasonService.updateTrainingCreditsUsed error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update training credits');
    }
  }

  /**
   * Calculate training credits for a season
   * @param season The season to calculate credits for
   * @param trainingFacilityLevel The team's training facility level
   * @returns The season's training information
   */
  calculateTrainingCredits(season: Season, trainingFacilityLevel: number): SeasonTrainingInfo {
    // Get the total credits available based on training facility level
    const level = Math.min(Math.max(trainingFacilityLevel, 1), 5);
    const creditsAvailable = TRAINING_CONSTANTS.CREDITS_BY_LEVEL[level as 1 | 2 | 3 | 4 | 5];
    
    // Calculate remaining credits
    const creditsUsed = season.training_credits_used || 0;
    const creditsRemaining = Math.max(0, creditsAvailable - creditsUsed);
    
    return {
      id: season.id,
      season_number: season.season_number,
      team_id: season.team_id,
      training_facility_level: trainingFacilityLevel,
      training_credits_used: creditsUsed,
      training_credits_available: creditsAvailable,
      training_credits_remaining: creditsRemaining
    };
  }
}

export default new SeasonService();
