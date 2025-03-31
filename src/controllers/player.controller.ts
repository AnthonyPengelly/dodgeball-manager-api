import { Controller, Route, Tags, Get, Post, Body, Request, Security, SuccessResponse } from 'tsoa';
import playerService from '../services/player.service';
import gameService from '../services/game.service';
import draftService from '../services/draft.service';
import { ApiError } from '../middleware/error.middleware';
import { DRAFT_CONSTANTS } from '../utils/constants';
import {
  GetDraftPlayersResponseModel,
  CompleteDraftRequestModel,
  CompleteDraftResponseModel,
  GetSquadResponseModel,
} from '../models/PlayerModels';

@Route('players')
@Tags('Players')
export class PlayerController extends Controller {
  /**
   * Get draft players for the current game
   * @param request Express request with authenticated user
   */
  @Get('draft')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Draft players retrieved successfully')
  public async getDraftPlayers(
    @Request() request: any
  ): Promise<GetDraftPlayersResponseModel> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    // Get draft players for the current game
    const draftPlayersResponse = await draftService.getDraftPlayers(currentGame.game_id, token);
    
    return {
      success: true,
      message: 'Draft players retrieved successfully',
      players: draftPlayersResponse.players
    };
  }
  
  /**
   * Complete the draft by selecting players for the team
   * @param request Express request with authenticated user
   * @param draftData The draft data with selected player IDs
   */
  @Post('draft/complete')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Draft completed successfully')
  public async completeDraft(
    @Request() request: any,
    @Body() draftData: CompleteDraftRequestModel
  ): Promise<CompleteDraftResponseModel> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    // Validate request body
    if (!draftData.player_ids || !Array.isArray(draftData.player_ids)) {
      throw new ApiError(400, 'Invalid request: player_ids must be an array');
    }
    
    if (draftData.player_ids.length !== DRAFT_CONSTANTS.REQUIRED_PLAYERS) {
      throw new ApiError(400, `You must select exactly ${DRAFT_CONSTANTS.REQUIRED_PLAYERS} players to complete the draft`);
    }
    
    // Complete the draft
    const result = await draftService.completeDraft(currentGame.team_id, {
      player_ids: draftData.player_ids
    }, token);
    
    return {
      success: true,
      message: 'Draft completed successfully',
      team_id: result.team_id,
      selected_players: result.selected_players
    };
  }
  
  /**
   * Get the squad (team players) for the current team
   * @param request Express request with authenticated user
   */
  @Get('squad')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Squad retrieved successfully')
  public async getSquad(
    @Request() request: any
  ): Promise<GetSquadResponseModel> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    // Get the squad for the current team
    const squadResponse = await playerService.getSquad(currentGame.team_id, token);
    
    return {
      success: true,
      message: 'Squad retrieved successfully',
      players: squadResponse.players
    };
  }
}
