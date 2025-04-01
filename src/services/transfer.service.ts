import { 
  Player, 
  TransferListedPlayer,
  PlayerStatus
} from '../types';
import { ApiError } from '../middleware/error.middleware';
import { PlayerGenerator } from '../utils/player-generator';
import { PlayerPriceCalculator } from '../utils/player-price-calculator';
import gameService from './game.service';
import { PLAYER_STATUS, TEAM_CONSTANTS } from '../utils/constants';
import * as transferRepository from '../repositories/transferRepository';
import * as playerRepository from '../repositories/playerRepository';
import * as teamRepository from '../repositories/teamRepository';
import { GetTransferListResponse, BuyTransferListedPlayerResponse, SellPlayerResponse } from '../models/TransferModels';

// Number of players on transfer list per season
const TRANSFER_LIST_SIZE = 8;

// Percentage of previous season players to keep (as decimal)
const KEEP_PREVIOUS_RATIO = 0.5;

class TransferService {
  /**
   * Get the list of players available on the transfer market
   * 
   * @param teamId Team ID
   * @param token JWT token
   * @returns List of players available for transfer
   */
  async getTransferList(teamId: string, token: string): Promise<GetTransferListResponse> {
    try {
      // Get the current game and season
      const game = await gameService.getGameByTeamId(teamId, token);
      
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Check if transfer list has been generated for this season
      const transferList = await transferRepository.getTransferList(game.id, game.season, token);
      
      // If transfer list for current season is already generated and complete, return it
      if (transferList && transferList.length === TRANSFER_LIST_SIZE) {
        return this.formatTransferListResponse(transferList, game.season);
      }
      
      // If transfer list needs to be generated, do so now
      return await this.generateTransferList(game.id, game.season, token);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in getTransferList:', error);
      throw new ApiError(500, 'Failed to get transfer list');
    }
  }
  
  /**
   * Format transfer list response with calculated prices
   * 
   * @param transferList Raw transfer list from database
   * @param season Current season number
   * @returns Formatted transfer list response
   */
  private formatTransferListResponse(transferList: any[], season: number): GetTransferListResponse {
    const transferListWithPrices = transferList.map(item => {
      const player = item.players as Player;
      return {
        ...player,
        buy_price: PlayerPriceCalculator.calculateBuyPrice(player),
        sell_price: PlayerPriceCalculator.calculateScoutPrice(player)
      } as TransferListedPlayer;
    });
    
    return {
      success: true,
      message: 'Transfer list retrieved successfully',
      transfer_list: transferListWithPrices,
      season: season
    };
  }
  
  /**
   * Generate the transfer list for a new season
   * 
   * @param gameId Game ID
   * @param season Current season number
   * @param token JWT token
   * @returns Newly generated transfer list
   */
  private async generateTransferList(gameId: string, season: number, token: string): Promise<GetTransferListResponse> {
    try {
      // Check if there are any transfer listed players from previous season
      const previousTransfer = await transferRepository.getPreviousTransferList(gameId, season, token);
      
      // Clear any partial transfer list for the current season
      await transferRepository.clearTransferList(gameId, season);
      
      // Determine how many previous players to keep and how many new ones to generate
      const playersToKeep = this.selectPlayersToKeep(previousTransfer);
      const playersToGenerate = TRANSFER_LIST_SIZE - playersToKeep.length;
      
      // Add kept players to the new transfer list
      if (playersToKeep.length > 0) {
        await this.updateKeptPlayersSeasons(playersToKeep, gameId, season);
      }
      
      // Generate and add new players
      if (playersToGenerate > 0) {
        await this.generateAndAddNewPlayers(gameId, season, playersToGenerate);
      }
      
      // Get the complete transfer list
      const fullTransferList = await transferRepository.getTransferList(gameId, season, token);
      
      return this.formatTransferListResponse(fullTransferList, season);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in generateTransferList:', error);
      throw new ApiError(500, 'Failed to generate transfer list');
    }
  }
  
  /**
   * Select players to keep from previous season
   * 
   * @param previousTransfer Previous season transfer list
   * @returns Array of players to keep
   */
  private selectPlayersToKeep(previousTransfer: any[]): { id: string, player: Player }[] {
    if (!previousTransfer || previousTransfer.length === 0) {
      return [];
    }
    
    // Shuffle previous players
    const shuffled = [...previousTransfer].sort(() => 0.5 - Math.random());
    
    // Calculate how many to keep (up to 50%)
    const keepCount = Math.min(
      Math.floor(TRANSFER_LIST_SIZE * KEEP_PREVIOUS_RATIO),
      shuffled.length
    );
    
    // Select players to keep
    return shuffled.slice(0, keepCount).map(item => ({
      id: item.player_id,
      player: item.players as Player
    }));
  }
  
  /**
   * Update kept players' season in the transfer list
   * 
   * @param playersToKeep Players to keep
   * @param gameId Game ID
   * @param season Current season
   */
  private async updateKeptPlayersSeasons(
    playersToKeep: { id: string, player: Player }[], 
    gameId: string, 
    season: number
  ): Promise<void> {
    await Promise.all(playersToKeep.map(async item => {
      await transferRepository.updateTransferListSeason(item.id, gameId, season);
    }));
  }
  
  /**
   * Generate and add new players to the transfer list
   * 
   * @param gameId Game ID
   * @param season Current season
   * @param count Number of players to generate
   */
  private async generateAndAddNewPlayers(gameId: string, season: number, count: number): Promise<void> {
    // Calculate min and max tiers based on current season
    const minTier = Math.max(1, season - 2);
    const maxTier = Math.min(5, season + 1);
    
    // Generate new players
    const generatedPlayers = PlayerGenerator.generatePlayersInTierRange(
      count,
      minTier,
      maxTier
    );
    
    // Prepare players for insertion
    const playersToInsert = generatedPlayers.map(player => ({
      game_id: gameId,
      name: player.name,
      status: PLAYER_STATUS.TRANSFER as PlayerStatus,
      tier: player.tier,
      potential_tier: player.potentialTier,
      ...player.stats,
      ...player.potentialStats
    }));
    
    // Insert new players into database
    const insertedPlayers = await playerRepository.createPlayers(playersToInsert);
    
    // Add new players to transfer list
    const transferEntries = insertedPlayers.map(player => ({
      game_id: gameId,
      player_id: player.id,
      season: season
    }));
    
    await transferRepository.addPlayersToTransferList(transferEntries);
  }
  
  /**
   * Purchase a player from the transfer list
   * 
   * @param teamId Team ID
   * @param playerId ID of player to buy
   * @param token JWT token
   * @returns Response with purchased player details
   */
  async buyPlayer(teamId: string, playerId: string, token: string): Promise<BuyTransferListedPlayerResponse> {
    try {
      // Get the team information
      const team = await teamRepository.getTeamWithGameInfo(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      const game = team.games;
      
      // Get the player from the transfer list
      const transferItem = await transferRepository.getTransferListPlayer(playerId, game.id, token);
      if (!transferItem) {
        throw new ApiError(404, 'Player not found on transfer list');
      }
      
      const player = transferItem.players as Player;
      
      // Calculate buy price
      const buyPrice = PlayerPriceCalculator.calculateBuyPrice(player);
      
      // Check if team can afford the player
      if (team.budget < buyPrice) {
        throw new ApiError(400, `Insufficient funds to purchase player. Required: ${buyPrice}, Available: ${team.budget}`);
      }
      
      // Purchase process
      await this.executePurchase(playerId, game, team, teamId, buyPrice);
      
      // Get the updated player
      const updatedPlayer = await playerRepository.getPlayerById(playerId, token);
      if (!updatedPlayer) {
        throw new ApiError(500, 'Failed to retrieve updated player');
      }
      
      // Calculate new budget
      const newBudget = team.budget - buyPrice;
      
      return {
        success: true,
        message: `Successfully purchased ${updatedPlayer.name} for ${buyPrice}`,
        player: updatedPlayer,
        budget_remaining: newBudget
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in buyPlayer:', error);
      throw new ApiError(500, 'Failed to buy player');
    }
  }
  
  /**
   * Execute player purchase transaction
   * 
   * @param playerId Player ID
   * @param game Game data
   * @param team Team data
   * @param teamId Team ID
   * @param buyPrice Purchase price
   */
  private async executePurchase(
    playerId: string,
    game: any,
    team: any,
    teamId: string,
    buyPrice: number
  ): Promise<void> {
    // Update player status to team
    await playerRepository.updatePlayer(playerId, { status: PLAYER_STATUS.TEAM as PlayerStatus });
    
    // Remove player from transfer list
    await transferRepository.removePlayerFromTransferList(playerId);
    
    // Generate a replacement player
    await this.generateReplacementPlayer(game);
    
    // Update team budget
    await teamRepository.updateTeamBudget(teamId, team.budget - buyPrice);
  }
  
  /**
   * Generate a replacement player for the transfer list
   * 
   * @param game Game data
   */
  private async generateReplacementPlayer(game: any): Promise<void> {
    try {
      // Calculate tier range
      const minTier = Math.max(1, game.season - 2);
      const maxTier = Math.min(5, game.season + 1);
      
      // Generate a new player
      const generatedPlayer = PlayerGenerator.generatePlayersInTierRange(1, minTier, maxTier)[0];
      
      // Insert new player
      const playersToInsert = [{
        game_id: game.id,
        name: generatedPlayer.name,
        status: PLAYER_STATUS.TRANSFER as PlayerStatus,
        tier: generatedPlayer.tier,
        potential_tier: generatedPlayer.potentialTier,
        ...generatedPlayer.stats,
        ...generatedPlayer.potentialStats
      }];
      
      const newPlayers = await playerRepository.createPlayers(playersToInsert);
      
      if (newPlayers && newPlayers.length > 0) {
        // Add to transfer list
        await transferRepository.addPlayersToTransferList([{
          game_id: game.id,
          player_id: newPlayers[0].id,
          season: game.season
        }]);
      }
    } catch (error) {
      // Just log the error, don't throw since this is a non-critical operation
      console.error('Error generating replacement player:', error);
    }
  }
  
  /**
   * Sell a player from the team
   * 
   * @param teamId Team ID
   * @param playerId ID of player to sell
   * @param token JWT token
   * @returns Response with sold player details
   */
  async sellPlayer(teamId: string, playerId: string, token: string): Promise<SellPlayerResponse> {
    try {
      // Get the game ID for the team
      const team = await teamRepository.getTeamById(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Check team has enough players
      await this.validateTeamSize(team.game_id, token);
      
      // Get the player to sell
      const player = await playerRepository.getPlayerById(playerId, token);
      if (!player) {
        throw new ApiError(404, 'Player not found');
      }
      
      // Calculate sell price
      const sellPrice = PlayerPriceCalculator.calculateScoutPrice(player);
      
      // Execute the sale
      await this.executeSale(playerId, teamId, team.budget, sellPrice);
      
      // Get the updated player
      const updatedPlayer = await playerRepository.getPlayerById(playerId, token);
      if (!updatedPlayer) {
        throw new ApiError(500, 'Failed to retrieve updated player');
      }
      
      // Calculate new budget
      const newBudget = team.budget + sellPrice;
      
      return {
        success: true,
        message: `Successfully sold ${updatedPlayer.name} for ${sellPrice}`,
        sold_player: updatedPlayer,
        budget: newBudget
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in sellPlayer:', error);
      throw new ApiError(500, 'Failed to sell player');
    }
  }
  
  /**
   * Validate that the team has enough players
   * 
   * @param gameId Game ID
   * @param token JWT token
   */
  private async validateTeamSize(gameId: string, token: string): Promise<void> {
    // Query to find team players for the game
    const teamPlayers = await playerRepository.getTeamPlayers(gameId, token);
    
    // Check if team has sufficient players
    if (!teamPlayers || teamPlayers.length <= TEAM_CONSTANTS.MIN_PLAYERS) {
      throw new ApiError(400, 'Cannot sell player. Team must maintain a minimum of 8 players.');
    }
  }
  
  /**
   * Execute player sale transaction
   * 
   * @param playerId Player ID
   * @param teamId Team ID
   * @param currentBudget Current team budget
   * @param sellPrice Sale price
   */
  private async executeSale(
    playerId: string, 
    teamId: string, 
    currentBudget: number, 
    sellPrice: number
  ): Promise<void> {
    // Update player status to sold
    await playerRepository.updatePlayer(playerId, { status: PLAYER_STATUS.SOLD as PlayerStatus });
    
    // Update team budget
    await teamRepository.updateTeamBudget(teamId, currentBudget + sellPrice);
  }
}

export default new TransferService();
