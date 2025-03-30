import { Request, Response } from 'express';
import seasonService from '../services/season.service';
import gameService from '../services/game.service';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../middleware/error.middleware';
import { PlayerStatName } from '../types';
import trainingService from '../services/training.service';
import scoutService from '../services/scout.service';

class SeasonController {
  /**
   * Get training information for the current season
   * @route GET /api/seasons/training-info
   * @access Private
   */
  getSeasonTrainingInfo = asyncHandler(async (req: Request, res: Response) => {
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

  /**
   * Train a player by improving one of their stats
   */
  trainPlayer = asyncHandler(async (req: Request, res: Response) => {
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
    
    const { player_id, stat_name } = req.body;
    
    // Validate required fields
    if (!player_id || !stat_name) {
      return res.status(400).json({
        error: 'Missing required fields: player_id and stat_name are required'
      });
    }
    
    const result = await trainingService.trainPlayer(currentGame.team_id, {
      player_id,
      stat_name: stat_name as PlayerStatName
    }, token);
    
    res.status(200).json(result);
  });

  /**
   * Get scouting information for the current season
   */
  getSeasonScoutingInfo = asyncHandler(async (req: Request, res: Response) => {
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
    
    const scoutingInfo = await seasonService.getSeasonScoutingInfo(currentGame.team_id, token);
    
    res.status(200).json(scoutingInfo);
  });

  /**
   * Get all scouted players for the current season
   */
  getScoutedPlayers = asyncHandler(async (req: Request, res: Response) => {
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
    
    const scoutedPlayers = await seasonService.getScoutedPlayers(currentGame.team_id, token);
    
    res.status(200).json({ scouted_players: scoutedPlayers });
  });

  /**
   * Generate scouted players for the current season
   */
  scoutPlayers = asyncHandler(async (req: Request, res: Response) => {
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
    
    const { count } = req.body;
    
    const result = await scoutService.scoutPlayers(currentGame.team_id, { count }, token);
    
    res.status(200).json(result);
  });

  /**
   * Purchase a scouted player for the team
   */
  purchaseScoutedPlayer = asyncHandler(async (req: Request, res: Response) => {
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
    
    const { scouted_player_id } = req.body;
    
    // Validate required fields
    if (!scouted_player_id) {
      return res.status(400).json({
        error: 'Missing required field: scouted_player_id is required'
      });
    }
    
    const result = await scoutService.purchaseScoutedPlayer(currentGame.team_id, { scouted_player_id }, token);
    
    res.status(200).json(result);
  });

  /**
   * Get facility information for the current team
   * @route GET /api/seasons/facility-info
   * @access Private
   */
  getFacilityInfo = asyncHandler(async (req: Request, res: Response) => {
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
    
    const facilityInfo = await seasonService.getFacilityInfo(currentGame.team_id, token);
    
    res.status(200).json(facilityInfo);
  });

  /**
   * Upgrade a facility (training or scouting)
   * @route POST /api/seasons/upgrade-facility
   * @access Private
   */
  upgradeFacility = asyncHandler(async (req: Request, res: Response) => {
    // Get user ID from the request (set by the auth middleware)
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Validate request body
    const { facility_type } = req.body;
    
    if (!facility_type || !['training', 'scout', 'stadium'].includes(facility_type)) {
      throw new ApiError(400, "facility_type must be one of: 'training', 'scout', or 'stadium'");
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    const result = await seasonService.upgradeFacility(
      currentGame.team_id, 
      facility_type, 
      token
    );
    
    res.status(200).json(result);
  });
}

export default new SeasonController();
