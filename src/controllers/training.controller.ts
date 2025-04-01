import { 
  Controller, 
  Route, 
  Tags, 
  Get, 
  Post, 
  Body, 
  Request, 
  Security, 
  SuccessResponse 
} from 'tsoa';
import gameService from '../services/game.service';
import trainingService from '../services/training.service';
import { ApiError } from '../middleware/error.middleware';
import { 
  GetSeasonTrainingInfoResponseModel, 
  TrainPlayerRequestModel, 
  TrainPlayerResponseModel,
} from '../models/TrainingModels';

@Route('training')
@Tags('Training')
export class TrainingController extends Controller {
  /**
   * Get training information for the current season
   * @param request Express request with authenticated user
   */
  @Get('training-info')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Season training info retrieved successfully')
  public async getSeasonTrainingInfo(
    @Request() request: any
  ): Promise<GetSeasonTrainingInfoResponseModel> {
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
    
    const trainingInfo = await trainingService.getSeasonTrainingInfo(currentGame.team_id, token);
    
    return {
      success: true,
      message: 'Season training info retrieved successfully',
      ...trainingInfo
    };
  }

  /**
   * Train a player by improving one of their stats
   * @param request Express request with authenticated user
   * @param requestBody Details of the player to train
   */
  @Post('train-player')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Player trained successfully')
  public async trainPlayer(
    @Request() request: any,
    @Body() requestBody: TrainPlayerRequestModel
  ): Promise<TrainPlayerResponseModel> {
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
    
    // Train the player
    const { player, season } = await trainingService.trainPlayer(
      currentGame.team_id, 
      requestBody,
      token
    );
    
    return {
      success: true,
      message: 'Player trained successfully',
      player,
      season
    };
  }
}
