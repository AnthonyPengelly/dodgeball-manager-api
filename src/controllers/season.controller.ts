import { Request, Response } from 'express';
import seasonService from '../services/season.service';
import gameService from '../services/game.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/error.middleware';

/**
 * Get training information for the current season
 * @route GET /api/seasons/training-info
 * @access Private
 */
export const getSeasonTrainingInfo = asyncHandler(async (req: Request, res: Response) => {
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
  
  const trainingInfo = await seasonService.getSeasonTrainingInfo(currentGame.team_id, token);
  
  res.status(200).json(trainingInfo);
});
