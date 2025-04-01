import { 
  Controller, 
  Route, 
  Tags, 
  Post, 
  Request, 
  Security, 
  SuccessResponse 
} from 'tsoa';
import gameService from '../services/game.service';
import seasonService from '../services/season.service';
import { ApiError } from '../middleware/error.middleware';
import { 
  EndSeasonResponse
} from '../models/SeasonModels';
import { StartMainSeasonResponseModel } from '../models/GameModels';

@Route('seasons')
@Tags('Seasons')
export class SeasonController extends Controller {
  /**
   * Start the main season by transitioning from pre-season to regular season
   * 
   * @summary Start main season
   */
  @Post('start-main-season')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Main season started successfully')
  public async startMainSeason(
    @Request() request: any
  ): Promise<StartMainSeasonResponseModel> {
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
    
    // Check if the game is in the pre-season stage
    if (currentGame.game_stage !== 'pre_season') {
      throw new ApiError(400, 'Game must be in pre-season stage to start the main season');
    }
    
    // Start the main season
    const result = await seasonService.startMainSeason(currentGame.game_id, token);
    
    return {
      success: true,
      message: 'Main season started successfully',
      ...result,
    };
  }

  /**
   * End the current season and handle promotions/relegations
   * @returns The result of ending the season
   */
  @Post('end-season')
  @Security('bearerAuth')
  @SuccessResponse(200, 'Season ended successfully')
  public async endSeason(@Request() req: any): Promise<EndSeasonResponse> {
    const userId = req.user?.id;
    const token = req.headers.authorization?.split(' ')[1] || '';
    
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Get the current game
    const currentGame = await gameService.getCurrentGame(userId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'Game not found');
    }
    
    // End the season
    const result = await seasonService.endSeason(currentGame.game_id, token);
    return result;
  }
}
