import { Request, Response } from 'express';
import gameService from '../services/game.service';
import { ApiError } from '../middleware/error.middleware';

const gameController = {
  /**
   * Get the current game for the authenticated user
   */
  async getCurrentGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      
      const currentGame = await gameService.getCurrentGame(userId, token);
      
      if (!currentGame) {
        res.status(404).json({ message: 'No active game found' });
        return;
      }
      
      res.status(200).json({ data: currentGame });
    } catch (error) {
      console.error('Error in getCurrentGame controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  /**
   * Create a new team and game for the authenticated user
   */
  async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      
      const teamData = req.body;
      
      // Validate team name is provided
      if (!teamData.name || typeof teamData.name !== 'string' || teamData.name.trim() === '') {
        throw new ApiError(400, 'Team name is required');
      }
      
      const result = await gameService.createTeam(userId, token, teamData);
      
      res.status(201).json({ data: result });
    } catch (error) {
      console.error('Error in createTeam controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  /**
   * Cancel an active game for the authenticated user
   */
  async cancelGame(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      const { gameId } = req.params;
      
      if (!userId) {
        throw new ApiError(401, 'User not authenticated');
      }
      
      if (!gameId) {
        throw new ApiError(400, 'Game ID is required');
      }
      
      const result = await gameService.cancelGame(userId, token, gameId);
      
      res.status(200).json({ data: result });
    } catch (error) {
      console.error('Error in cancelGame controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },

  /**
   * Start the main season by transitioning from pre-season to regular season
   * @route POST /api/games/start-main-season
   * @access Private
   */
  async startMainSeason(req: Request, res: Response): Promise<void> {
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
      
      // Start the main season
      const result = await gameService.startMainSeason(currentGame.game_id, token);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in startMainSeason controller:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
};

export default gameController;
