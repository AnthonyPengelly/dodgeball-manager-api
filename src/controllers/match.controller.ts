import { Body, Controller, Get, Post, Query, Request, Route, Security, SuccessResponse, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import { ApiError } from '../middleware/error.middleware';
import matchService from '../services/match.service';
import gameService from '../services/game.service';
import { GetPlayerinstructionsResponse, PlayMatchResponse, SavePlayerinstructionsRequest, SavePlayerinstructionsResponse } from '../models/MatchModels';

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

  /**
   * Save player instructions for a specific fixture
   * @param requestBody Player instructions to save
   * @returns The result of saving player instructions
   */
  @Post('save-player-instructions')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Player instructions saved successfully')
  public async savePlayerInstructions(@Request() req: ExpressRequest, @Body() requestBody: SavePlayerinstructionsRequest): Promise<SavePlayerinstructionsResponse> {
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
    const result = await matchService.savePlayerInstructions(currentGame.game_id, currentGame.team_id, requestBody.fixture_id, requestBody.players, token);
    return { success: result, message: result ? 'Player instructions saved successfully' : 'Failed to save player instructions' };
  }

  /**
   * Get the player instructions for a fixture
   * 
   * @summary Get player instructions
   */
  @Get('player-instructions')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Player instructions retrieved successfully')
  public async getPlayerInstructions(
    @Request() request: any,
    @Query() fixtureId?: string
  ): Promise<GetPlayerinstructionsResponse> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }

    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }

    const playerInstructions = await matchService.getPlayerInstructions(currentGame.team_id, fixtureId, token);
    
    return {
      success: true,
      message: 'Player instructions retrieved successfully',
      player_instructions: playerInstructions
    };
  }
}

