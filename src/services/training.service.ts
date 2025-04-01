import { 
  Player,
  PlayerStatName
} from '../types';
import { TrainPlayerRequestModel } from '../models/PlayerModels';
import { GAME_STAGE, PLAYER_STATUS, TRAINING_CONSTANTS, PLAYER_STATS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { TierCalculator } from '../utils/tier-calculator';
import seasonService from './season.service';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';
import * as playerRepository from '../repositories/playerRepository';
import { TrainPlayerResponseModel } from '../models/SeasonModels';

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
      const trainingInfo = seasonService.calculateTrainingCredits(currentSeason, team.training_facility_level);
      
      if (trainingInfo.training_credits_remaining <= 0) {
        throw new ApiError(400, 'No training credits remaining for this season');
      }
      
      // Get the player to train
      const player = await this.getAndValidatePlayer(trainingData.player_id, team.game_id, token);
      
      // Validate and perform the stat improvement
      const { statName, oldValue, newValue } = await this.improvePlayerStat(player, trainingData.stat_name);
      
      // Update the season's training credits used
      const updatedSeason = await seasonService.updateTrainingCreditsUsed(currentSeason.id, 1);
      
      // Calculate updated training info
      const updatedTrainingInfo = seasonService.calculateTrainingCredits(updatedSeason, team.training_facility_level);
      
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
