import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Season, SeasonTrainingInfo, GetSeasonTrainingInfoResponse, SeasonScoutingInfo, GetSeasonScoutingInfoResponse, ScoutedPlayer, Player, GetFacilityInfoResponse, UpgradeFacilityResponse } from '../types';
import { TRAINING_CONSTANTS, SCOUTING_CONSTANTS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { FacilityUpgradeCalculator } from '../utils/facility-upgrade-calculator';
import { GAME_STAGE } from '../utils/constants';

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
          training_credits_used: 0,
          scouting_credits_used: 0
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
   * Get scouting information for the current season
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The season's scouting information
   */
  async getSeasonScoutingInfo(teamId: string, token: string): Promise<GetSeasonScoutingInfoResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get the team's scout level
      const { data: team, error: teamError } = await supabaseClient
        .from('teams')
        .select('scout_level')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate scouting credits
      const scoutingInfo = this.calculateScoutingCredits(currentSeason, team.scout_level);
      
      return { season: scoutingInfo };
    } catch (error) {
      console.error('SeasonService.getSeasonScoutingInfo error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get season scouting info');
    }
  }

  /**
   * Get all scouted players for the current season
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns All scouted players including their player details
   */
  async getScoutedPlayers(teamId: string, token: string): Promise<(ScoutedPlayer & { player: Player })[]> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);
      
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get all scouted players for this season with their player details
      const { data: scoutedPlayers, error } = await supabaseClient
        .from('scouted_players')
        .select(`
          *,
          player:player_id (*)
        `)
        .eq('season_id', currentSeason.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error getting scouted players:', error);
        throw new ApiError(500, 'Failed to get scouted players');
      }
      
      return scoutedPlayers as unknown as (ScoutedPlayer & { player: Player })[];
    } catch (error) {
      console.error('SeasonService.getScoutedPlayers error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get scouted players');
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
   * Update the scouting credits used for a season
   * @param seasonId The season ID to update
   * @param creditsUsed The number of credits to add to the used count
   * @returns The updated season data
   */
  async updateScoutingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
    try {
      // Get the current season data
      const { data: currentSeason, error: getError } = await supabaseAdmin
        .from('seasons')
        .select('scouting_credits_used')
        .eq('id', seasonId)
        .single();
      
      if (getError) {
        console.error('Error getting season for credits update:', getError);
        throw new ApiError(404, 'Season not found');
      }
      
      // Calculate the new credits used
      const newCreditsUsed = (currentSeason.scouting_credits_used || 0) + creditsUsed;
      
      // Update the season
      const { data: updatedSeason, error: updateError } = await supabaseAdmin
        .from('seasons')
        .update({ scouting_credits_used: newCreditsUsed })
        .eq('id', seasonId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating season scouting credits:', updateError);
        throw new ApiError(500, 'Failed to update scouting credits');
      }
      
      return updatedSeason as Season;
    } catch (error) {
      console.error('SeasonService.updateScoutingCreditsUsed error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to update scouting credits');
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

  /**
   * Calculate scouting credits for a season
   * @param season The season to calculate credits for
   * @param scoutLevel The team's scout level
   * @returns The season's scouting information
   */
  calculateScoutingCredits(season: Season, scoutLevel: number): SeasonScoutingInfo {
    // Get the total credits available based on scout level
    const level = Math.min(Math.max(scoutLevel, 1), 5);
    const creditsAvailable = SCOUTING_CONSTANTS.CREDITS_BY_LEVEL[level as 1 | 2 | 3 | 4 | 5];
    
    // Calculate remaining credits
    const creditsUsed = season.scouting_credits_used || 0;
    const creditsRemaining = Math.max(0, creditsAvailable - creditsUsed);
    
    return {
      id: season.id,
      season_number: season.season_number,
      team_id: season.team_id,
      scout_level: scoutLevel,
      scouting_credits_used: creditsUsed,
      scouting_credits_available: creditsAvailable,
      scouting_credits_remaining: creditsRemaining
    };
  }

  /**
   * Get information about team facilities and possible upgrades
   * 
   * @param teamId Team ID
   * @param token JWT token
   * @returns Facility information including current levels and upgrade costs
   */
  async getFacilityInfo(teamId: string, token: string): Promise<GetFacilityInfoResponse> {
    try {
      // Get the team information
      const { data: team, error: teamError } = await createClientFromToken(token)
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error getting team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate upgrade costs
      const trainingUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.training_facility_level, 'training');
      const scoutUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.scout_level, 'scout');
      const stadiumUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.stadium_size, 'stadium');
      
      // Check if the team can afford upgrades
      const canAffordTraining = team.budget >= trainingUpgradeCost && trainingUpgradeCost > 0;
      const canAffordScout = team.budget >= scoutUpgradeCost && scoutUpgradeCost > 0;
      const canAffordStadium = team.budget >= stadiumUpgradeCost && stadiumUpgradeCost > 0;
      
      return {
        facility: {
          training_facility_level: team.training_facility_level,
          scout_level: team.scout_level,
          stadium_size: team.stadium_size,
          training_facility_upgrade_cost: trainingUpgradeCost,
          scout_upgrade_cost: scoutUpgradeCost,
          stadium_upgrade_cost: stadiumUpgradeCost,
          can_afford_training_upgrade: canAffordTraining,
          can_afford_scout_upgrade: canAffordScout,
          can_afford_stadium_upgrade: canAffordStadium,
          budget: team.budget
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in getFacilityInfo:', error);
      throw new ApiError(500, 'Failed to get facility information');
    }
  }
  
  /**
   * Upgrade a team's facility (training or scouting)
   * 
   * @param teamId Team ID
   * @param facilityType Type of facility to upgrade ('training', 'scout', or 'stadium')
   * @param token JWT token
   * @returns Response with updated team information
   */
  async upgradeFacility(teamId: string, facilityType: 'training' | 'scout' | 'stadium', token: string): Promise<UpgradeFacilityResponse> {
    try {
      // Get the team and game information
      const { data: team, error: teamError } = await createClientFromToken(token)
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
      const gameData = team.games as { id: string; game_stage: string; } | { id: string; game_stage: string; }[];
      
      // Validate the game is in the pre_season stage
      let isPreseason = false;
      
      if (Array.isArray(gameData)) {
        isPreseason = gameData.length > 0 && gameData[0].game_stage === GAME_STAGE.PRE_SEASON;
      } else {
        isPreseason = gameData.game_stage === GAME_STAGE.PRE_SEASON;
      }
      
      if (!isPreseason) {
        throw new ApiError(400, 'Facility upgrades can only be done during the pre-season');
      }
      
      // Determine which facility to upgrade and calculate cost
      let currentLevel: number;
      let fieldToUpdate: string;
      
      if (facilityType === 'training') {
        currentLevel = team.training_facility_level;
        fieldToUpdate = 'training_facility_level';
      } else if (facilityType === 'scout') {
        currentLevel = team.scout_level;
        fieldToUpdate = 'scout_level';
      } else {
        currentLevel = team.stadium_size;
        fieldToUpdate = 'stadium_size';
      }
      
      // Check if the facility can be upgraded
      const upgradeCheck = FacilityUpgradeCalculator.canUpgrade(currentLevel, team.budget, facilityType);
      
      if (!upgradeCheck.canUpgrade) {
        throw new ApiError(400, upgradeCheck.reason || 'Cannot upgrade facility');
      }
      
      // Calculate the new budget after upgrade
      const newBudget = team.budget - upgradeCheck.cost!;
      const newLevel = currentLevel + 1;
      
      // Update the team record
      const { data: updatedTeam, error: updateError } = await supabaseAdmin
        .from('teams')
        .update({ 
          [fieldToUpdate]: newLevel,
          budget: newBudget
        })
        .eq('id', teamId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error upgrading facility:', updateError);
        throw new ApiError(500, 'Failed to upgrade facility');
      }
      
      let facilityName: string;
      if (facilityType === 'training') {
        facilityName = 'Training Facility';
      } else if (facilityType === 'scout') {
        facilityName = 'Scouting Department';
      } else {
        facilityName = 'Stadium';
      }
      
      return {
        success: true,
        message: `Successfully upgraded ${facilityName} to level ${newLevel}`,
        team: {
          id: updatedTeam.id,
          name: updatedTeam.name,
          budget: updatedTeam.budget,
          [fieldToUpdate]: updatedTeam[fieldToUpdate]
        },
        cost: upgradeCheck.cost!
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in upgradeFacility:', error);
      throw new ApiError(500, 'Failed to upgrade facility');
    }
  }
}

export default new SeasonService();
