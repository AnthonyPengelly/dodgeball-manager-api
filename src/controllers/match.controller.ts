import { Body, Controller, Get, Post, Request, Route, Security, SuccessResponse } from 'tsoa';
import { Request as ExpressRequest, Response } from 'express';
import { ApiError } from '../middleware/error.middleware';
import matchService from '../services/match.service';
import gameService from '../services/game.service';

/**
 * Handles match-related operations for the game
 */
@Route('matches')
@Security('jwt')
export class MatchController extends Controller {
  /**
   * Play the next scheduled match
   * @returns The result of playing the next match
   */
  @Post('play-next')
  @SuccessResponse(200, 'Match played successfully')
  public async playNextMatch(@Request() req: ExpressRequest): Promise<any> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      if (!userId) {
        this.setStatus(401);
        return { message: 'Unauthorized' };
      }
      
      // Get the current game
      const currentGame = await gameService.getCurrentGame(userId, token);
      
      if (!currentGame) {
        this.setStatus(404);
        return { message: 'No active game found' };
      }
      
      // Play the next match
      const result = await matchService.playNextMatch(currentGame.game_id, token);
      
      this.setStatus(200);
      return result;
    } catch (error) {
      console.error('Error in playNextMatch controller:', error);
      if (error instanceof ApiError) {
        this.setStatus(error.statusCode);
        return { message: error.message };
      } else {
        this.setStatus(500);
        return { message: 'Internal server error' };
      }
    }
  }

  /**
   * End the current season and handle promotions/relegations
   * @returns The result of ending the season
   */
  @Post('end-season')
  @SuccessResponse(200, 'Season ended successfully')
  public async endSeason(@Request() req: ExpressRequest): Promise<any> {
    try {
      const userId = req.user?.id;
      const token = req.headers.authorization?.split(' ')[1] || '';
      
      if (!userId) {
        this.setStatus(401);
        return { message: 'Unauthorized' };
      }
      
      // Get the current game
      const currentGame = await gameService.getCurrentGame(userId, token);
      
      if (!currentGame) {
        this.setStatus(404);
        return { message: 'No active game found' };
      }
      
      // End the season
      const result = await matchService.endSeason(currentGame.game_id, token);
      
      this.setStatus(200);
      return result;
    } catch (error) {
      console.error('Error in endSeason controller:', error);
      if (error instanceof ApiError) {
        this.setStatus(error.statusCode);
        return { message: error.message };
      } else {
        this.setStatus(500);
        return { message: 'Internal server error' };
      }
    }
  }
}

export default new MatchController();
