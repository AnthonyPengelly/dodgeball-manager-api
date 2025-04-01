import { Controller, Get, Post, Route, Security, Tags, SuccessResponse, Request, Body } from 'tsoa';
import gameService from '../services/game.service';
import { ApiError } from '../middleware/error.middleware';
import { 
  CreateTeamRequest, 
  CreateTeamResponseModel, 
  CancelGameResponseModel,
  StartMainSeasonResponseModel,
  CurrentGameResponseModel
} from '../models/GameModels';

@Route('games')
@Tags('Games')
export class GameController extends Controller {
  /**
   * Get the current game for the authenticated user
   * 
   * @summary Get current game
   */
  @Get('current')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Current game retrieved successfully')
  public async getCurrentGame(
    @Request() request: any
  ): Promise<CurrentGameResponseModel> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'No active game found');
    }
    
    return {
      success: true,
      message: 'Current game retrieved successfully',
      ...currentGame
    };
  }

  /**
   * Create a new team and game for the authenticated user
   * 
   * @summary Create new team and game
   */
  @Post('teams')
  @Security('bearerAuth')
  @SuccessResponse('201', 'Team created successfully')
  public async createTeam(
    @Request() request: any,
    @Body() teamData: CreateTeamRequest
  ): Promise<CreateTeamResponseModel> {
    if (!request || !request.user || !request.user.id) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    const userId = request.user.id;
    const token = request.headers.authorization?.split(' ')[1] || '';
    
    // Validate team name is provided
    if (!teamData.name || typeof teamData.name !== 'string' || teamData.name.trim() === '') {
      throw new ApiError(400, 'Team name is required');
    }
    
    // Check if user already has an active game
    const existingGame = await gameService.getCurrentGame(userId, token);
    
    if (existingGame) {
      throw new ApiError(400, 'User already has an active game');
    }
    
    // Create the team and game
    const result = await gameService.createTeam(userId, teamData.name, token);
    
    this.setStatus(201);
    return {
      success: true,
      message: 'Team created successfully',
      ...result,
    };
  }

  /**
   * Cancel an active game for the authenticated user
   * 
   * @summary Cancel active game
   */
  @Post('cancel')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Game cancelled successfully')
  public async cancelGame(
    @Request() request: any
  ): Promise<CancelGameResponseModel> {
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
    
    // Cancel the game
    await gameService.cancelGame(currentGame.game_id, token);
    
    return {
      success: true,
      message: 'Game cancelled successfully'
    };
  }
}
