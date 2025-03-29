import { Request, Response } from 'express';
import playerService from '../services/player.service';
import gameService from '../services/game.service';
import { ApiError } from '../middleware/error.middleware';

/**
 * Get draft players for the current game
 * @param req Express request
 * @param res Express response
 */
export const getDraftPlayers = async (req: Request, res: Response) => {
  try {
    // Get user ID from the request (set by the auth middleware)
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
    
    // Get draft players for the current game
    const draftPlayers = await playerService.getDraftPlayers(currentGame.game_id, token);
    
    res.status(200).json(draftPlayers);
  } catch (error) {
    console.error('Error in getDraftPlayers controller:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to get draft players' });
    }
  }
};
