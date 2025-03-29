import { Request, Response } from 'express';
import { ApiError } from '../middleware/error.middleware';
import leagueService from '../services/league.service';
import gameService from '../services/game.service';

export default {
  /**
   * Get the league data for the current or specified season
   * @route GET /api/leagues
   * @access Private
   */
  async getLeague(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      const season = req.query.season ? parseInt(req.query.season as string) : undefined;
      
      if (!userId) {
        throw new ApiError(401, 'Unauthorized');
      }
      
      // Get the current game
      const currentGame = await gameService.getCurrentGame(userId, token);
      
      if (!currentGame) {
        throw new ApiError(404, 'No active game found');
      }
      
      // Get the league data
      const leagueData = await leagueService.getLeague(currentGame.game_id, token, season);
      
      res.status(200).json(leagueData);
    } catch (error) {
      console.error('Error in getLeague controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};
