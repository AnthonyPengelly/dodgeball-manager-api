import { 
  Player,
  PlayerStatName,
  Season,
  SeasonTrainingInfo
} from '../types';
import { TrainPlayerRequestModel } from '../models/PlayerModels';
import { GAME_STAGE, PLAYER_STATUS, TRAINING_CONSTANTS, PLAYER_STATS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { TierCalculator } from '../utils/tier-calculator';
import seasonService from './season.service';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';
import * as playerRepository from '../repositories/playerRepository';
import * as seasonRepository from '../repositories/seasonRepository';
import { TrainPlayerResponseModel } from '../models/TrainingModels';

class TrainingService {
  /**
   * Train a player by improving one of their stats
   * @param teamId The team ID
   * @param trainingData The training data
   * @param token The JWT token of the authenticated user
   * @returns The updated player and training info
   */
  async trainPlayer(teamId: string, trainingData: TrainPlayerRequestModel, token: string): Promise<TrainPlayerResponseModel> {
    try {
      // Validate the stat name
      if (!PLAYER_STATS.includes(trainingData.stat_name)) {
        throw new ApiError(400, `Invalid stat name: ${trainingData.stat_name}`);
      }
      
      // Get the team data
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Get the game data
      const game = await gameRepository.getGameById(team.game_id, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Validate the game is in the pre_season stage
      if (game.game_stage !== GAME_STAGE.PRE_SEASON) {
        throw new ApiError(400, 'Training can only be done during the pre-season');
      }
      
      // Get the current season and calculate training credits
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      const trainingInfo = this.calculateTrainingCredits(currentSeason, team.training_facility_level);
      
      if (trainingInfo.training_credits_remaining <= 0) {
        throw new ApiError(400, 'No training credits remaining for this season');
      }
      
      // Get the player to train
      const player = await this.getAndValidatePlayer(trainingData.player_id, team.game_id, token);
      
      // Validate and perform the stat improvement
      const { statName, oldValue, newValue } = await this.improvePlayerStat(player, trainingData.stat_name);
      
      // Update the season's training credits used
      const updatedSeason = await this.updateTrainingCreditsUsed(currentSeason.id, 1);
      
      // Calculate updated training info
      const updatedTrainingInfo = this.calculateTrainingCredits(updatedSeason, team.training_facility_level);
      
      return {
        success: true,
        message: `Successfully improved ${statName} from ${oldValue} to ${newValue}`,
        player: player,
        season: updatedTrainingInfo
      };
    } catch (error) {
      console.error('TrainingService.trainPlayer error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to train player');
    }
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
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      
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
   * Get and validate a player for training
   * 
   * @param playerId The player ID
   * @param gameId The game ID
   * @param token JWT token
   * @returns The player if valid
   */
  private async getAndValidatePlayer(playerId: string, gameId: string, token: string): Promise<Player> {
    // Get the player by ID
    const player = await playerRepository.getPlayerById(playerId, token);
    
    if (!player) {
      throw new ApiError(404, 'Player not found');
    }
    
    // Verify the player is on the team
    if (player.status !== PLAYER_STATUS.TEAM) {
      throw new ApiError(400, 'Player is not on your team');
    }
    
    // Verify the player belongs to the game
    if (player.game_id !== gameId) {
      throw new ApiError(400, 'Player does not belong to your team');
    }
    
    return player;
  }
  
  /**
   * Improve a player's stat and update the database
   * 
   * @param player The player to update
   * @param statName The stat to improve
   * @returns The updated information
   */
  private async improvePlayerStat(player: Player, statName: PlayerStatName): Promise<{ statName: string, oldValue: number, newValue: number, player: Player }> {
    // Get the current stat value and potential
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
    
    // Calculate the new stat value
    const newStatValue = Math.min(currentValue + 1, potentialValue, TRAINING_CONSTANTS.MAX_STAT_VALUE);
    
    // Create an update object with just the stat to update
    const updateData: Record<string, any> = {
      [statName]: newStatValue
    };
    
    // Update the player
    await playerRepository.updatePlayer(player.id, updateData);
    
    // Update the player object with the new stat value
    player[statName] = newStatValue;
    
    // Recalculate player tier
    await this.recalculatePlayerTier(player);
    
    return {
      statName,
      oldValue: currentValue,
      newValue: newStatValue,
      player: player
    };
  }
  
  /**
   * Recalculate and update a player's tier
   * 
   * @param player The player to update
   * @returns The updated player
   */
  private async recalculatePlayerTier(player: Player): Promise<Player> {
    // Extract player stats
    const playerStats = {
      throwing: player.throwing,
      catching: player.catching,
      dodging: player.dodging,
      blocking: player.blocking,
      speed: player.speed,
      positional_sense: player.positional_sense,
      teamwork: player.teamwork,
      clutch_factor: player.clutch_factor
    };
    
    // Calculate new tier
    const newTier = TierCalculator.calculateTier(playerStats);
    
    // Update tier if it changed
    if (newTier !== player.tier) {
      await playerRepository.updatePlayer(player.id, { tier: newTier });
      player.tier = newTier;
    }
    
    return player;
  }
}

export default new TrainingService();
