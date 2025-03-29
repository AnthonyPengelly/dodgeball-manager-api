import { Request, Response, NextFunction } from 'express';
import gameService from '../services/game.service';

// Create controller object without class
const gameController = {
  /**
   * Get the current game for the authenticated user
   */
  getCurrentGame: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      const currentGame = await gameService.getCurrentGame(userId, token);
      
      if (!currentGame) {
        res.status(404).json({ error: 'No active game found for this user' });
        return;
      }
      
      res.status(200).json({ data: currentGame });
    } catch (error) {
      next(error);
    }
  }
};

export default gameController;
