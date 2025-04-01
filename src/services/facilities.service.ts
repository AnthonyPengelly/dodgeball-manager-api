import { FacilityInfo } from '../types';
import { GAME_STAGE } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { FacilityUpgradeCalculator } from '../utils/facility-upgrade-calculator';
import * as teamRepository from '../repositories/teamRepository';
import { UpgradeFacilityResponse, UpgradeFacilityResponseModel } from '../models/FacilitiesModels';

class FacilitiesService {
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

export default new FacilitiesService();
