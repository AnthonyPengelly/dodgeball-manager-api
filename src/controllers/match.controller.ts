import { Request, Response } from 'express';
import { ApiError } from '../middleware/error.middleware';
import matchService from '../services/match.service';
import gameService from '../services/game.service';

export default {
  /**
   * Play the next scheduled match
   * @route POST /api/matches/play-next
   * @access Private
   */
  async playNextMatch(req: Request, res: Response): Promise<void> {
    try {
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
      
      // Play the next match
      const result = await matchService.playNextMatch(currentGame.game_id, token);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in playNextMatch controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  /**
   * End the current season and handle promotions/relegations
   * @route POST /api/matches/end-season
   * @access Private
   */
  async endSeason(req: Request, res: Response): Promise<void> {
    try {
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
      
      // End the season
      const result = await matchService.endSeason(currentGame.game_id, token);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in endSeason controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};
