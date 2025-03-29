import { Request, Response } from 'express';
import playerService from '../services/player.service';
import gameService from '../services/game.service';
import { ApiError } from '../middleware/error.middleware';
import { CompleteDraftRequest } from '../types';
import { DRAFT_CONSTANTS } from '../utils/constants';

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

/**
 * Complete the draft by selecting players for the team
 * @param req Express request
 * @param res Express response
 */
export const completeDraft = async (req: Request, res: Response) => {
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
    
    // Validate request body
    const draftData = req.body as CompleteDraftRequest;
    
    if (!draftData.player_ids || !Array.isArray(draftData.player_ids)) {
      throw new ApiError(400, 'Invalid request: player_ids must be an array');
    }
    
    if (draftData.player_ids.length !== DRAFT_CONSTANTS.REQUIRED_PLAYERS) {
      throw new ApiError(400, `You must select exactly ${DRAFT_CONSTANTS.REQUIRED_PLAYERS} players to complete the draft`);
    }
    
    // Set the game_id from the current game
    draftData.game_id = currentGame.game_id;
    
    // Complete the draft
    const result = await playerService.completeDraft(currentGame.team_id, draftData, token);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in completeDraft controller:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to complete draft' });
    }
  }
};

/**
 * Get the squad (team players) for the current team
 * @param req Express request
 * @param res Express response
 */
export const getSquad = async (req: Request, res: Response) => {
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
    
    // Get the squad for the current team
    const squad = await playerService.getSquad(currentGame.team_id, token);
    
    res.status(200).json(squad);
  } catch (error) {
    console.error('Error in getSquad controller:', error);
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to get squad' });
    }
  }
};
