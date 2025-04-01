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
import seasonService from '../services/season.service';
import scoutService from '../services/scout.service';
import { ApiError } from '../middleware/error.middleware';
import { 
  GetSeasonScoutingInfoResponseModel,
  GetScoutedPlayersResponseModel,
  ScoutPlayersRequestModel,
  ScoutPlayersResponseModel,
  PurchaseScoutedPlayerRequestModel,
  PurchaseScoutedPlayerResponseModel,
} from '../models/ScoutingModels';

@Route('scouting')
@Tags('Scouting')
export class ScoutingController extends Controller {
  /**
   * Get scouting information for the current season
   * @param request Express request with authenticated user
   */
  @Get('scouting-info')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Season scouting info retrieved successfully')
  public async getSeasonScoutingInfo(
    @Request() request: any
  ): Promise<GetSeasonScoutingInfoResponseModel> {
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
    
    const scoutingInfo = await scoutService.getSeasonScoutingInfo(currentGame.team_id, token);
    
    return {
      success: true,
      message: 'Season scouting info retrieved successfully',
      ...scoutingInfo
    };
  }

  /**
   * Get all scouted players for the current season
   * @param request Express request with authenticated user
   */
  @Get('scouted-players')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Scouted players retrieved successfully')
  public async getScoutedPlayers(
    @Request() request: any
  ): Promise<GetScoutedPlayersResponseModel> {
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
    
    const scoutedPlayers = await scoutService.getScoutedPlayers(currentGame.team_id, token);
    
    return {
      success: true,
      message: 'Scouted players retrieved successfully',
      scouted_players: scoutedPlayers
    };
  }

  /**
   * Generate scouted players for the current season
   * @param request Express request with authenticated user
   * @param requestBody Details of the scouted players to generate
   */
  @Post('scout-players')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Scouted players generated successfully')
  public async scoutPlayers(
    @Request() request: any,
    @Body() requestBody: ScoutPlayersRequestModel
  ): Promise<ScoutPlayersResponseModel> {
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
    
    // Scout players
    const scoutedPlayers = await scoutService.scoutPlayers(currentGame.team_id, requestBody, token);
    
    return {
      success: true,
      message: 'Scouted players generated successfully',
      scouted_players: scoutedPlayers
    };
  }

  /**
   * Purchase a scouted player for the team
   * @param request Express request with authenticated user
   * @param requestBody Details of the scouted player to purchase
   */
  @Post('purchase-scouted-player')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Scouted player purchased successfully')
  public async purchaseScoutedPlayer(
    @Request() request: any,
    @Body() requestBody: PurchaseScoutedPlayerRequestModel
  ): Promise<PurchaseScoutedPlayerResponseModel> {
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
    
    // Purchase the scouted player
    const result = await scoutService.purchaseScoutedPlayer(currentGame.team_id, requestBody, token);
    
    return {
      success: true,
      message: 'Scouted player purchased successfully',
      ...result
    };
  }
}
