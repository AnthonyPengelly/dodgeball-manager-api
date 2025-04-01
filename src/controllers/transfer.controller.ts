import { Body, Controller, Get, Post, Request, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { ApiError } from '../middleware/error.middleware';
import transferService from '../services/transfer.service';
import gameService from '../services/game.service';
import { BuyTransferListedPlayerRequest, BuyTransferListedPlayerResponse, GetTransferListResponse, SellPlayerRequest, SellPlayerResponse } from '../models/TransferModels';

/**
 * Handles player transfer operations
 */
@Route('transfers')
@Tags('Transfers')
export class TransferController extends Controller {
  /**
   * Get the list of players available for transfer
   * @returns The list of players available for transfer
   */
  @Get()
  @Security('bearerAuth')
  @SuccessResponse(200, 'Transfer list retrieved successfully')
  public async getTransferList(@Request() req: ExpressRequest): Promise<GetTransferListResponse> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const transferList = await transferService.getTransferList(currentGame.team_id, token);
    
    return transferList;
  }
  
  /**
   * Buy a player from the transfer list
   * @param player_id The ID of the player to buy
   * @returns The result of buying the player
   */
  @Post('buy')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Player bought successfully')
  public async buyPlayer(
    @Request() req: ExpressRequest,
    @Body() requestBody: BuyTransferListedPlayerRequest
  ): Promise<BuyTransferListedPlayerResponse> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Validate request body
    const { player_id } = requestBody;
    
    if (!player_id) {
      throw new ApiError(400, 'player_id is required');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const result = await transferService.buyPlayer(currentGame.team_id, player_id, token);
    
    return result;
  }
  
  /**
   * Sell a player from the team
   * @param player_id The ID of the player to sell
   * @returns The result of selling the player
   */
  @Post('sell')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Player sold successfully')
  public async sellPlayer(
    @Request() req: ExpressRequest,
    @Body() requestBody: SellPlayerRequest
  ): Promise<SellPlayerResponse> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Validate request body
    const { player_id } = requestBody;
    
    if (!player_id) {
      throw new ApiError(400, 'player_id is required');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const result = await transferService.sellPlayer(currentGame.team_id, player_id, token);
    
    return result;
  }
}
