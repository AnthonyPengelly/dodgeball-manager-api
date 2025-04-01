import { Season, SeasonTrainingInfo, SeasonScoutingInfo, ScoutedPlayer, FacilityInfo } from '../types';
import { TRAINING_CONSTANTS, SCOUTING_CONSTANTS, GAME_STAGE } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { FacilityUpgradeCalculator } from '../utils/facility-upgrade-calculator';
import * as seasonRepository from '../repositories/seasonRepository';
import * as teamRepository from '../repositories/teamRepository';
import * as scoutRepository from '../repositories/scoutRepository';
import { UpgradeFacilityResponse, UpgradeFacilityResponseModel } from '../models/SeasonModels';

class SeasonService {
  /**
   * Get the current season for a team
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The current season data
   */
  async getCurrentSeason(teamId: string, token: string): Promise<Season> {
    try {
      // Get team with game information
      const team = await teamRepository.getTeamWithGameInfo(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Extract game data and season number
      const { gameId, seasonNumber } = this.extractGameInfo(team);
      
      // Try to get existing season for this team and season number
      const existingSeason = await seasonRepository.getSeasonByTeamAndNumber(
        teamId, 
        gameId, 
        seasonNumber, 
        token
      );
      
      // Return existing season if found
      if (existingSeason) {
        return existingSeason;
      }
      
      // Create a new season if none exists
      return await seasonRepository.createSeason({
        team_id: teamId,
        game_id: gameId,
        season_number: seasonNumber,
        training_credits_used: 0,
        scouting_credits_used: 0
      });
    } catch (error) {
      console.error('SeasonService.getCurrentSeason error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get current season');
    }
  }

  /**
   * Extract game ID and season number from team data
   * @param team Team data with game information
   * @returns Game ID and season number
   */
  private extractGameInfo(team: any): { gameId: string; seasonNumber: number } {
    const gameData = team.games;
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
    
    return { gameId, seasonNumber };
  }

  /**
   * Get training information for the current season
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The season's training information
   */
  async getSeasonTrainingInfo(teamId: string, token: string): Promise<SeasonTrainingInfo> {
    try {
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get the team's training facility level
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate and return training credits info
      const trainingInfo = this.calculateTrainingCredits(currentSeason, team.training_facility_level);
      return trainingInfo;
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
  async getSeasonScoutingInfo(teamId: string, token: string): Promise<SeasonScoutingInfo> {
    try {
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get the team's scout level
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate and return scouting credits info
      const scoutingInfo = this.calculateScoutingCredits(currentSeason, team.scout_level);
      return scoutingInfo;
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
  async getScoutedPlayers(teamId: string, token: string): Promise<ScoutedPlayer[]> {
    try {
      // Get the current season
      const currentSeason = await this.getCurrentSeason(teamId, token);
      
      // Get scouted players using the repository
      return await scoutRepository.getScoutedPlayersForSeason(currentSeason.id, token);
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
   * @param seasonId The season ID
   * @param creditsUsed The number of credits to add to the used count
   * @returns The updated season data
   */
  async updateTrainingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
    try {
      return await seasonRepository.updateTrainingCreditsUsed(seasonId, creditsUsed);
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
   * @param seasonId The season ID
   * @param creditsUsed The number of credits to add to the used count
   * @returns The updated season data
   */
  async updateScoutingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
    try {
      return await seasonRepository.updateScoutingCreditsUsed(seasonId, creditsUsed);
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
  async getFacilityInfo(teamId: string, token: string): Promise<FacilityInfo> {
    try {
      // Get the team information
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Calculate upgrade costs and affordability
      const { upgradeCosts, affordability } = this.calculateFacilityUpgrades(team);
      
      return {
        training_facility_level: team.training_facility_level,
        scout_level: team.scout_level,
        stadium_size: team.stadium_size,
        training_facility_upgrade_cost: upgradeCosts.training,
        scout_upgrade_cost: upgradeCosts.scout,
        stadium_upgrade_cost: upgradeCosts.stadium,
        can_afford_training_upgrade: affordability.training,
        can_afford_scout_upgrade: affordability.scout,
        can_afford_stadium_upgrade: affordability.stadium,
        budget: team.budget
        
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
   * Calculate facility upgrade costs and affordability
   * @param team Team data with budget and facility levels
   * @returns Upgrade costs and affordability for each facility
   */
  private calculateFacilityUpgrades(team: any): { 
    upgradeCosts: { training: number; scout: number; stadium: number },
    affordability: { training: boolean; scout: boolean; stadium: boolean }
  } {
    // Calculate upgrade costs
    const trainingUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.training_facility_level, 'training');
    const scoutUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.scout_level, 'scout');
    const stadiumUpgradeCost = FacilityUpgradeCalculator.calculateUpgradeCost(team.stadium_size, 'stadium');
    
    // Check if the team can afford upgrades
    const canAffordTraining = team.budget >= trainingUpgradeCost && trainingUpgradeCost > 0;
    const canAffordScout = team.budget >= scoutUpgradeCost && scoutUpgradeCost > 0;
    const canAffordStadium = team.budget >= stadiumUpgradeCost && stadiumUpgradeCost > 0;
    
    return {
      upgradeCosts: {
        training: trainingUpgradeCost,
        scout: scoutUpgradeCost,
        stadium: stadiumUpgradeCost
      },
      affordability: {
        training: canAffordTraining,
        scout: canAffordScout,
        stadium: canAffordStadium
      }
    };
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
      // Get the team with game stage information
      const team = await teamRepository.getTeamWithGameInfo(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Validate game stage is pre-season
      this.validatePreSeasonStage(team);
      
      // Determine which facility to upgrade and calculate cost
      const { currentLevel, fieldName, facilityName } = this.getFacilityFieldInfo(team, facilityType);
      
      // Check if the facility can be upgraded
      const upgradeCheck = FacilityUpgradeCalculator.canUpgrade(currentLevel, team.budget, facilityType);
      if (!upgradeCheck.canUpgrade) {
        throw new ApiError(400, upgradeCheck.reason || 'Cannot upgrade facility');
      }
      
      // Calculate the new budget and level
      const newBudget = team.budget - upgradeCheck.cost!;
      const newLevel = currentLevel + 1;
      
      // Update the team
      const updatedTeam = await teamRepository.updateTeam(teamId, {
        [fieldName]: newLevel,
        budget: newBudget
      });
      
      return this.createUpgradeResponse(updatedTeam, facilityName, fieldName, newLevel, upgradeCheck.cost!);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in upgradeFacility:', error);
      throw new ApiError(500, 'Failed to upgrade facility');
    }
  }
  
  /**
   * Validate the game is in pre-season stage
   * @param team Team data with game information
   */
  private validatePreSeasonStage(team: any): void {
    const gameData = team.games;
    let isPreseason = false;
    
    if (Array.isArray(gameData)) {
      isPreseason = gameData.length > 0 && gameData[0].game_stage === GAME_STAGE.PRE_SEASON;
    } else {
      isPreseason = gameData.game_stage === GAME_STAGE.PRE_SEASON;
    }
    
    if (!isPreseason) {
      throw new ApiError(400, 'Facility upgrades can only be done during the pre-season');
    }
  }
  
  /**
   * Get facility field information
   * @param team Team data
   * @param facilityType Type of facility
   * @returns Current level, field name, and display name
   */
  private getFacilityFieldInfo(
    team: any, 
    facilityType: 'training' | 'scout' | 'stadium'
  ): { currentLevel: number; fieldName: string; facilityName: string } {
    let currentLevel: number;
    let fieldName: string;
    let facilityName: string;
    
    if (facilityType === 'training') {
      currentLevel = team.training_facility_level;
      fieldName = 'training_facility_level';
      facilityName = 'Training Facility';
    } else if (facilityType === 'scout') {
      currentLevel = team.scout_level;
      fieldName = 'scout_level';
      facilityName = 'Scouting Department';
    } else {
      currentLevel = team.stadium_size;
      fieldName = 'stadium_size';
      facilityName = 'Stadium';
    }
    
    return { currentLevel, fieldName, facilityName };
  }
  
  /**
   * Create facility upgrade response
   * @param updatedTeam Updated team data
   * @param facilityName Display name of the facility
   * @param fieldName Database field name
   * @param newLevel New level after upgrade
   * @param cost Cost of the upgrade
   * @returns Formatted upgrade response
   */
  private createUpgradeResponse(
    updatedTeam: any, 
    facilityName: string, 
    fieldName: string, 
    newLevel: number, 
    cost: number
  ): UpgradeFacilityResponseModel {
    return {
      success: true,
      message: `Successfully upgraded ${facilityName} to level ${newLevel}`,
      team: {
        id: updatedTeam.id,
        name: updatedTeam.name,
        budget: updatedTeam.budget,
        [fieldName]: updatedTeam[fieldName]
      },
      cost: cost
    };
  }
}

export default new SeasonService();
