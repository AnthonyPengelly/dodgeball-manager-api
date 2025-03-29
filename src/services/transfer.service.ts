import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { 
  Player, 
  TransferListedPlayer, 
  GetTransferListResponse, 
  BuyTransferListedPlayerResponse, 
  SellPlayerResponse,
  PlayerStatus
} from '../types';
import { ApiError } from '../middleware/error.middleware';
import { PlayerGenerator } from '../utils/player-generator';
import { PlayerPriceCalculator } from '../utils/player-price-calculator';
import gameService from './game.service';
import { PLAYER_STATUS } from '../utils/constants';

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
      const { data: transferList, error: transferListError } = await createClientFromToken(token)
        .from('transfer_list')
        .select('*, players(*)')
        .eq('game_id', game.id)
        .eq('season', game.season);
      
      if (transferListError) {
        console.error('Error fetching transfer list:', transferListError);
        throw new ApiError(500, 'Failed to fetch transfer list');
      }
      
      // If transfer list for current season is already generated and complete, return it
      if (transferList && transferList.length === TRANSFER_LIST_SIZE) {
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
          season: game.season
        };
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
      const { data: previousTransfer, error: previousError } = await createClientFromToken(token)
        .from('transfer_list')
        .select('*, players(*)')
        .eq('game_id', gameId)
        .eq('season', season - 1);
      
      if (previousError) {
        console.error('Error fetching previous transfer list:', previousError);
        throw new ApiError(500, 'Failed to fetch previous transfer list');
      }
      
      // Clear any partial transfer list for the current season
      const { error: clearError } = await supabaseAdmin
        .from('transfer_list')
        .delete()
        .eq('game_id', gameId)
        .eq('season', season);
        
      if (clearError) {
        console.error('Error clearing current transfer list:', clearError);
        throw new ApiError(500, 'Failed to clear current transfer list');
      }
      
      // Determine how many previous players to keep and how many new ones to generate
      const playersToKeep: { id: string, player: Player }[] = [];
      let playersToGenerate = TRANSFER_LIST_SIZE;
      
      if (previousTransfer && previousTransfer.length > 0) {
        // Shuffle previous players
        const shuffled = [...previousTransfer].sort(() => 0.5 - Math.random());
        
        // Calculate how many to keep (up to 50%)
        const keepCount = Math.min(
          Math.floor(TRANSFER_LIST_SIZE * KEEP_PREVIOUS_RATIO),
          shuffled.length
        );
        
        // Select players to keep
        playersToKeep.push(...shuffled.slice(0, keepCount).map(item => ({
          id: item.player_id,
          player: item.players as Player
        })));
        
        // Update how many new players to generate
        playersToGenerate = TRANSFER_LIST_SIZE - keepCount;
      }
      
      // Add kept players to the new transfer list
      if (playersToKeep.length > 0) {
        const transferEntries = playersToKeep.map(item => ({
          game_id: gameId,
          player_id: item.id,
          season: season
        }));
        
        const { error: keepError } = await supabaseAdmin
          .from('transfer_list')
          .insert(transferEntries);
          
        if (keepError) {
          console.error('Error keeping previous transfer players:', keepError);
          throw new ApiError(500, 'Failed to keep previous transfer players');
        }
      }
      
      // Calculate min and max tiers based on current season
      const minTier = Math.max(1, season - 1);
      const maxTier = Math.min(5, season + 1);
      
      // Generate new players
      const generatedPlayers = PlayerGenerator.generatePlayersInTierRange(
        playersToGenerate,
        minTier,
        maxTier
      );
      
      // Prepare players for insertion
      const playersToInsert = generatedPlayers.map(player => ({
        game_id: gameId,
        name: player.name,
        status: 'transfer' as PlayerStatus,
        tier: player.tier,
        potential_tier: player.potentialTier,
        ...player.stats,
        ...player.potentialStats
      }));
      
      // Insert new players into database
      const { data: insertedPlayers, error: insertError } = await supabaseAdmin
        .from('players')
        .insert(playersToInsert)
        .select();
      
      if (insertError || !insertedPlayers) {
        console.error('Error inserting transfer players:', insertError);
        throw new ApiError(500, 'Failed to generate transfer players');
      }
      
      // Add new players to transfer list
      const transferEntries = insertedPlayers.map(player => ({
        game_id: gameId,
        player_id: player.id,
        season: season
      }));
      
      const { error: transferError } = await supabaseAdmin
        .from('transfer_list')
        .insert(transferEntries);
        
      if (transferError) {
        console.error('Error adding players to transfer list:', transferError);
        throw new ApiError(500, 'Failed to add players to transfer list');
      }
      
      // Get the complete transfer list
      const { data: fullTransferList, error: fullError } = await createClientFromToken(token)
        .from('transfer_list')
        .select('*, players(*)')
        .eq('game_id', gameId)
        .eq('season', season);
        
      if (fullError || !fullTransferList) {
        console.error('Error retrieving full transfer list:', fullError);
        throw new ApiError(500, 'Failed to retrieve full transfer list');
      }
      
      // Add price information
      const transferListWithPrices = fullTransferList.map(item => {
        const player = item.players as Player;
        return {
          ...player,
          buy_price: PlayerPriceCalculator.calculateBuyPrice(player),
          sell_price: PlayerPriceCalculator.calculateScoutPrice(player)
        } as TransferListedPlayer;
      });
      
      return {
        success: true,
        message: 'Transfer list generated successfully',
        transfer_list: transferListWithPrices,
        season: season
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in generateTransferList:', error);
      throw new ApiError(500, 'Failed to generate transfer list');
    }
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
      const { data: team, error: teamError } = await createClientFromToken(token)
        .from('teams')
        .select('*, games(*)')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error fetching team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      const game = team.games;
      
      // Get the player from the transfer list
      const { data: transferItem, error: transferError } = await createClientFromToken(token)
        .from('transfer_list')
        .select('*, players(*)')
        .eq('player_id', playerId)
        .eq('game_id', game.id)
        .single();
      
      if (transferError || !transferItem) {
        console.error('Error fetching transfer player:', transferError);
        throw new ApiError(404, 'Player not found on transfer list');
      }
      
      const player = transferItem.players as Player;
      
      // Calculate buy price
      const buyPrice = PlayerPriceCalculator.calculateBuyPrice(player);
      
      // Check if team can afford the player
      if (team.budget < buyPrice) {
        throw new ApiError(400, `Insufficient funds to purchase player. Required: ${buyPrice}, Available: ${team.budget}`);
      }
      
      // Update player status and assign to team
      const { data: updatedPlayer, error: updateError } = await supabaseAdmin
        .from('players')
        .update({
          status: 'team'
        })
        .eq('id', playerId)
        .select()
        .single();
      
      if (updateError || !updatedPlayer) {
        console.error('Error updating player:', updateError);
        throw new ApiError(500, 'Failed to purchase player');
      }
      
      // Remove player from transfer list
      const { error: removeError } = await supabaseAdmin
        .from('transfer_list')
        .delete()
        .eq('player_id', playerId);
        
      if (removeError) {
        console.error('Error removing player from transfer list:', removeError);
        throw new ApiError(500, 'Failed to update transfer list');
      }
      
      // Generate a new player to replace the purchased one
      const minTier = Math.max(1, game.season - 1);
      const maxTier = Math.min(5, game.season + 1);
      
      const generatedPlayer = PlayerGenerator.generatePlayersInTierRange(1, minTier, maxTier)[0];
      
      // Insert new player
      const { data: newPlayer, error: newPlayerError } = await supabaseAdmin
        .from('players')
        .insert({
          game_id: game.id,
          name: generatedPlayer.name,
          status: 'transfer' as PlayerStatus,
          tier: generatedPlayer.tier,
          potential_tier: generatedPlayer.potentialTier,
          ...generatedPlayer.stats,
          ...generatedPlayer.potentialStats
        })
        .select()
        .single();
        
      if (newPlayerError || !newPlayer) {
        console.error('Error creating replacement player:', newPlayerError);
        // Don't throw here, just log the error since the main purchase was successful
      } else {
        // Add new player to transfer list
        await supabaseAdmin
          .from('transfer_list')
          .insert({
            game_id: game.id,
            player_id: newPlayer.id,
            season: game.season
          });
      }
      
      // Update team budget
      const newBudget = team.budget - buyPrice;
      
      const { error: budgetError } = await supabaseAdmin
        .from('teams')
        .update({ budget: newBudget })
        .eq('id', teamId);
      
      if (budgetError) {
        console.error('Error updating team budget:', budgetError);
        throw new ApiError(500, 'Failed to update team budget');
      }
      
      return {
        success: true,
        message: `Successfully purchased ${updatedPlayer.name} for ${buyPrice}`,
        player: updatedPlayer as Player,
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
   * Sell a player from the team
   * 
   * @param teamId Team ID
   * @param playerId ID of player to sell
   * @param token JWT token
   * @returns Response with sold player details
   */
  async sellPlayer(teamId: string, playerId: string, token: string): Promise<SellPlayerResponse> {
    try {
      // Create a client with the user's token to respect RLS policies
      const supabaseClient = createClientFromToken(token);

      // Get the game ID for the team
      const { data: teamWithGame, error: teamWithGameError } = await supabaseClient
        .from('teams')
        .select('game_id')
        .eq('id', teamId)
        .single();
      
      if (teamWithGameError || !teamWithGame) {
        console.error('Error getting team:', teamWithGameError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Query to find team players for the game
      const { data: teamPlayers, error: teamPlayersError } = await supabaseClient
        .from('players')
        .select('*')
        .eq('game_id', teamWithGame.game_id)
        .eq('status', PLAYER_STATUS.TEAM)
        .order('tier', { ascending: false });
        
      if (teamPlayersError) {
        console.error('Error fetching team players:', teamPlayersError);
        throw new ApiError(500, 'Failed to fetch team players');
      }
      
      // Check if team has sufficient players
      if (!teamPlayers || teamPlayers.length <= 8) {
        throw new ApiError(400, 'Cannot sell player. Team must maintain a minimum of 8 players.');
      }
      
      // Get the player to sell
      const player = teamPlayers.find(p => p.id === playerId);
            
      // Calculate sell price
      const sellPrice = PlayerPriceCalculator.calculateScoutPrice(player as Player);
      
      // Get team for budget update
      const { data: team, error: teamError } = await createClientFromToken(token)
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (teamError || !team) {
        console.error('Error fetching team:', teamError);
        throw new ApiError(404, 'Team not found');
      }
      
      // Update player status to sold
      const { data: updatedPlayer, error: updateError } = await supabaseAdmin
        .from('players')
        .update({
          status: PLAYER_STATUS.SOLD
        })
        .eq('id', playerId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating player:', updateError);
        throw new ApiError(500, 'Failed to sell player');
      }
      
      // Update team budget
      const newBudget = team.budget + sellPrice;
      
      const { error: budgetError } = await supabaseAdmin
        .from('teams')
        .update({ budget: newBudget })
        .eq('id', teamId);
      
      if (budgetError) {
        console.error('Error updating team budget:', budgetError);
        throw new ApiError(500, 'Failed to update team budget');
      }
      
      return {
        success: true,
        message: `Successfully sold ${updatedPlayer.name} for ${sellPrice}`,
        sold_player: updatedPlayer as Player,
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
}

export default new TransferService();
