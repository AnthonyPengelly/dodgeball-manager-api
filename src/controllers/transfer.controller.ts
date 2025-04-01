import { Body, Controller, Get, Post, Request, Route, Security, SuccessResponse } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { ApiError } from '../middleware/error.middleware';
import transferService from '../services/transfer.service';
import gameService from '../services/game.service';

/**
 * Handles player transfer operations
 */
@Route('transfers')
@Security('jwt')
export class TransferController extends Controller {
  /**
   * Get the list of players available for transfer
   * @returns The list of players available for transfer
   */
  @Get()
  @SuccessResponse(200, 'Transfer list retrieved successfully')
  public async getTransferList(@Request() req: ExpressRequest): Promise<any> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      this.setStatus(401);
      return { message: 'Unauthorized' };
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      this.setStatus(404);
      return { message: 'No active game found' };
    }
    
    const transferList = await transferService.getTransferList(currentGame.team_id, token);
    
    this.setStatus(200);
    return transferList;
  }
  
  /**
   * Buy a player from the transfer list
   * @param player_id The ID of the player to buy
   * @returns The result of buying the player
   */
  @Post('buy')
  @SuccessResponse(200, 'Player bought successfully')
  public async buyPlayer(
    @Request() req: ExpressRequest,
    @Body() requestBody: { player_id: string }
  ): Promise<any> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      this.setStatus(401);
      return { message: 'Unauthorized' };
    }
    
    // Validate request body
    const { player_id } = requestBody;
    
    if (!player_id) {
      this.setStatus(400);
      return { message: 'player_id is required' };
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      this.setStatus(404);
      return { message: 'No active game found' };
    }
    
    const result = await transferService.buyPlayer(currentGame.team_id, player_id, token);
    
    this.setStatus(200);
    return result;
  }
  
  /**
   * Sell a player from the team
   * @param player_id The ID of the player to sell
   * @returns The result of selling the player
   */
  @Post('sell')
  @SuccessResponse(200, 'Player sold successfully')
  public async sellPlayer(
    @Request() req: ExpressRequest,
    @Body() requestBody: { player_id: string }
  ): Promise<any> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      this.setStatus(401);
      return { message: 'Unauthorized' };
    }
    
    // Validate request body
    const { player_id } = requestBody;
    
    if (!player_id) {
      this.setStatus(400);
      return { message: 'player_id is required' };
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      this.setStatus(404);
      return { message: 'No active game found' };
    }
    
    const result = await transferService.sellPlayer(currentGame.team_id, player_id, token);
    
    this.setStatus(200);
    return result;
  }
}

export default new TransferController();
