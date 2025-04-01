import { Body, Controller, Get, Post, Request, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Request as ExpressRequest, Response } from 'express';
import { ApiError } from '../middleware/error.middleware';
import matchService from '../services/match.service';
import gameService from '../services/game.service';
import { PlayMatchResponse } from '../models/MatchModels';

/**
 * Handles match-related operations for the game
 */
@Route('matches')
@Tags('Matches')
export class MatchController extends Controller {
  /**
   * Play the next scheduled match
   * @returns The result of playing the next match
   */
  @Post('play-next')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Match played successfully')
  public async playNextMatch(@Request() req: ExpressRequest): Promise<PlayMatchResponse> {
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
    return result;
  }
}

