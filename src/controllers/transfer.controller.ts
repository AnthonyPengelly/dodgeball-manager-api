import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/error.middleware';
import transferService from '../services/transfer.service';
import gameService from '../services/game.service';

class TransferController {
  /**
   * Get the list of players available for transfer
   * @route GET /api/transfers
   * @access Private
   */
  getTransferList = asyncHandler(async (req: Request, res: Response) => {
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
    
    res.status(200).json(transferList);
  });
  
  /**
   * Buy a player from the transfer list
   * @route POST /api/transfers/buy
   * @access Private
   */
  buyPlayer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Validate request body
    const { player_id } = req.body;
    
    if (!player_id) {
      throw new ApiError(400, 'player_id is required');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const result = await transferService.buyPlayer(currentGame.team_id, player_id, token);
    
    res.status(200).json(result);
  });
  
  /**
   * Sell a player from the team
   * @route POST /api/transfers/sell
   * @access Private
   */
  sellPlayer = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Validate request body
    const { player_id } = req.body;
    
    if (!player_id) {
      throw new ApiError(400, 'player_id is required');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const result = await transferService.sellPlayer(currentGame.team_id, player_id, token);
    
    res.status(200).json(result);
  });
}

export default new TransferController();
