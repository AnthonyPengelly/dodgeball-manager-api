import { 
  Player,ScoutedPlayer, PlayerStatus,
  Season,
  SeasonScoutingInfo
} from '../types';
import { PurchaseScoutedPlayerRequestModel, PurchaseScoutedPlayerResponse, ScoutPlayersRequestModel } from '../models/ScoutingModels'
import { GAME_STAGE, PLAYER_STATUS, SCOUTING_CONSTANTS } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { PlayerGenerator } from '../utils/player-generator';
import { PlayerPriceCalculator } from '../utils/player-price-calculator';
import seasonService from './season.service';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';
import * as playerRepository from '../repositories/playerRepository';
import * as scoutRepository from '../repositories/scoutRepository';
import * as seasonRepository from '../repositories/seasonRepository';

class ScoutService {
  /**
   * Generate players to scout for the current season
   * @param teamId The team ID to scout players for
   * @param scoutData Optional data for scouting including number of credits to use
   * @param token The JWT token of the authenticated user
   * @returns The scouted players and updated season scouting info
   */
  async scoutPlayers(teamId: string, scoutData: ScoutPlayersRequestModel, token: string): Promise<ScoutedPlayer[]> {
    try {
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
        throw new ApiError(400, 'Scouting can only be done during the pre-season');
      }
      
      // Get the current season and calculate scouting credits
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      const scoutingInfo = this.calculateScoutingCredits(currentSeason, team.scout_level);
      
      // Determine how many credits to use and validate
      const creditsToUse = this.validateAndCalculateCreditsToUse(scoutData, scoutingInfo);
      
      // Generate and insert scout players
      const { insertedPlayers, scoutedPlayers } = await this.generateAndInsertScoutPlayers(
        game.id, 
        game.season, 
        currentSeason.id, 
        creditsToUse
      );
      
      // Update the scouting credits used
      const updatedSeason = await this.updateScoutingCreditsUsed(currentSeason.id, creditsToUse);
      
      // Calculate updated scouting info
      const updatedScoutingInfo = this.calculateScoutingCredits(updatedSeason, team.scout_level);
      
      return scoutedPlayers;
    } catch (error) {
      console.error('ScoutService.scoutPlayers error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to scout players');
    }
  }

  /**
   * Get scouted players for a team's current season
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The scouted players
   */
  async getScoutedPlayers(teamId: string, token: string): Promise<ScoutedPlayer[]> {
    try {
      // Get the current season for the team
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      
      // Get scouted players for this season using repository
      const scoutedPlayers = await scoutRepository.getScoutedPlayersForSeason(currentSeason.id, token);
      
      return scoutedPlayers;
    } catch (error) {
      console.error('ScoutService.getScoutedPlayers error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get scouted players');
    }
  }

  /**
   * Purchase a scouted player for the team
   * @param teamId The team ID
   * @param purchaseData The purchase data
   * @param token The JWT token of the authenticated user
   * @returns The purchased player and updated team budget
   */
  async purchaseScoutedPlayer(teamId: string, purchaseData: PurchaseScoutedPlayerRequestModel, token: string): Promise<PurchaseScoutedPlayerResponse> {
    try {
      // Get and validate the scouted player
      const scoutedPlayer = await scoutRepository.getAndValidateScoutedPlayer(purchaseData.scouted_player_id, teamId, token);
      
      // Get the team's current data
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Check if the team can afford the player
      if (team.budget < scoutedPlayer.scout_price) {
        throw new ApiError(400, `Insufficient funds: The player costs ${scoutedPlayer.scout_price} but you only have ${team.budget} available`);
      }
      
      // Process the purchase
      const { updatedPlayer, newBudget } = await this.processPlayerPurchase(
        scoutedPlayer, 
        teamId, 
        team.budget,
        token
      );
      
      // Return the response with updated data
      return {
        result: {
          player: updatedPlayer,
          team_budget: newBudget
        }
      };
    } catch (error) {
      console.error('ScoutService.purchaseScoutedPlayer error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to purchase scouted player');
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
      const currentSeason = await seasonService.getCurrentSeason(teamId, token);
      
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
   * Validate and calculate how many scouting credits to use
   * @param scoutData The scout players request data
   * @param scoutingInfo The current scouting info
   * @returns The number of credits to use
   */
  private validateAndCalculateCreditsToUse(
    scoutData: ScoutPlayersRequestModel,
    scoutingInfo: { scouting_credits_remaining: number }
  ): number {
    // Determine how many credits to use (default to 1)
    const creditsToUse = scoutData.count ? Math.min(scoutData.count, scoutingInfo.scouting_credits_remaining) : 1;
    
    if (creditsToUse <= 0 || scoutingInfo.scouting_credits_remaining <= 0) {
      throw new ApiError(400, 'No scouting credits remaining for this season');
    }
    
    if (creditsToUse > scoutingInfo.scouting_credits_remaining) {
      throw new ApiError(400, `Not enough scouting credits. Requested: ${creditsToUse}, Available: ${scoutingInfo.scouting_credits_remaining}`);
    }
    
    return creditsToUse;
  }
  
  /**
   * Generate and insert scouted players
   * @param gameId The game ID
   * @param gameSeason The current game season number
   * @param seasonId The season ID for scouted player records
   * @param creditsToUse The number of scouting credits to use
   * @returns The generated and inserted players and scouted player records
   */
  private async generateAndInsertScoutPlayers(
    gameId: string,
    gameSeason: number,
    seasonId: string,
    creditsToUse: number
  ): Promise<{ insertedPlayers: Player[], scoutedPlayers: ScoutedPlayer[] }> {
    // Calculate how many players to generate
    const playersToGenerate = creditsToUse * SCOUTING_CONSTANTS.PLAYERS_PER_CREDIT;
    
    // Generate players with tier distribution based on current game season
    const minTier = Math.max(1, gameSeason - SCOUTING_CONSTANTS.MAX_TIER_DIFF);
    const maxTier = gameSeason + SCOUTING_CONSTANTS.MAX_TIER_DIFF;
    
    // Generate players
    const generatedPlayers = PlayerGenerator.generatePlayersInTierRange(playersToGenerate, minTier, maxTier);

    // Prepare players for database insertion
    const playersToInsert = generatedPlayers.map(player => ({
      game_id: gameId,
      name: player.name,
      status: 'scout' as PlayerStatus,
      tier: player.tier,
      potential_tier: player.potentialTier,
      ...player.stats,
      ...player.potentialStats
    }));
    
    // Insert players using repository
    const insertedPlayers = await playerRepository.createPlayers(playersToInsert);
    
    // Create scouted player records
    const scoutedPlayerRecords = await this.createScoutedPlayerRecords(insertedPlayers, seasonId);
    
    return { insertedPlayers, scoutedPlayers: scoutedPlayerRecords };
  }
  
  /**
   * Create scouted player records in the database
   * @param players The players to create scouted records for
   * @param seasonId The season ID
   * @returns The created scouted player records
   */
  private async createScoutedPlayerRecords(players: Player[], seasonId: string): Promise<ScoutedPlayer[]> {
    // Calculate prices and create scouted_players records
    const scoutedPlayerRecords = [];
    
    for (const player of players) {
      const scoutPrice = PlayerPriceCalculator.calculateScoutPrice(player);
      const buyPrice = PlayerPriceCalculator.calculateBuyPrice(player);
      
      // Create the scouted player record
      const scoutedPlayerId = await playerRepository.createScoutedPlayer({
        player_id: player.id,
        season_id: seasonId,
        is_purchased: false,
        scout_price: scoutPrice,
        buy_price: buyPrice
      });
      
      scoutedPlayerRecords.push({
        id: scoutedPlayerId,
        player_id: player.id,
        season_id: seasonId,
        is_purchased: false,
        scout_price: scoutPrice,
        buy_price: buyPrice,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    return scoutedPlayerRecords;
  }
  
  /**
   * Process the purchase of a player
   * @param scoutedPlayer The scouted player to purchase
   * @param teamId The team ID
   * @param currentBudget The team's current budget
   * @param token JWT token
   * @returns The updated player and new budget
   */
  private async processPlayerPurchase(
    scoutedPlayer: ScoutedPlayer & { player_id: string },
    teamId: string,
    currentBudget: number,
    token: string
  ): Promise<{ updatedPlayer: Player, newBudget: number }> {
    // Mark the scouted player as purchased using repository method
    const updateResult = await scoutRepository.updateScoutedPlayer(scoutedPlayer.id, { is_purchased: true });
    
    if (!updateResult.success) {
      throw new ApiError(500, 'Failed to update scouted player');
    }
    
    // Update the player status to team
    await playerRepository.updatePlayer(scoutedPlayer.player_id, { status: PLAYER_STATUS.TEAM as PlayerStatus });
    
    // Get the updated player data
    const updatedPlayer = await playerRepository.getPlayerById(scoutedPlayer.player_id, token);
    if (!updatedPlayer) {
      throw new ApiError(500, 'Failed to get updated player data');
    }
    
    // Calculate new budget
    const newBudget = currentBudget - scoutedPlayer.scout_price;
    
    // Update the team's budget
    await teamRepository.updateTeamBudget(teamId, newBudget);
    
    return { updatedPlayer, newBudget };
  }
}

export default new ScoutService();
