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
import trainingService from '../services/training.service';
import scoutService from '../services/scout.service';
import { ApiError } from '../middleware/error.middleware';
import { 
  GetSeasonTrainingInfoResponseModel, 
  TrainPlayerRequestModel, 
  TrainPlayerResponseModel,
  GetSeasonScoutingInfoResponseModel,
  GetFacilityInfoResponseModel,
  UpgradeFacilityRequestModel,
  UpgradeFacilityResponseModel,
  GetScoutedPlayersResponseModel,
  ScoutPlayersRequestModel,
  ScoutPlayersResponseModel,
  PurchaseScoutedPlayerRequestModel,
  PurchaseScoutedPlayerResponseModel
} from '../models/SeasonModels';

@Route('seasons')
@Tags('Seasons')
export class SeasonController extends Controller {
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
    
    const trainingInfo = await seasonService.getSeasonTrainingInfo(currentGame.team_id, token);
    
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
    
    const scoutingInfo = await seasonService.getSeasonScoutingInfo(currentGame.team_id, token);
    
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
    
    const scoutedPlayers = await seasonService.getScoutedPlayers(currentGame.team_id, token);
    
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

  /**
   * Get facility information
   * @param request Express request with authenticated user
   */
  @Get('facility-info')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Facility info retrieved successfully')
  public async getFacilityInfo(
    @Request() request: any
  ): Promise<GetFacilityInfoResponseModel> {
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
    
    const facilityInfo = await seasonService.getFacilityInfo(currentGame.team_id, token);
    
    return {
      success: true,
      message: 'Facility info retrieved successfully',
      ...facilityInfo,
    };
  }

  /**
   * Upgrade a facility
   * @param request Express request with authenticated user
   * @param requestBody Details of the facility to upgrade
   */
  @Post('upgrade-facility')
  @Security('bearerAuth')
  @SuccessResponse('200', 'Facility upgraded successfully')
  public async upgradeFacility(
    @Request() request: any,
    @Body() requestBody: UpgradeFacilityRequestModel
  ): Promise<UpgradeFacilityResponseModel> {
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
    
    // Upgrade the facility
    const { team, cost } = await seasonService.upgradeFacility(
      currentGame.team_id, 
      requestBody.facility_type, 
      token
    );
    
    return {
      success: true,
      message: 'Facility upgraded successfully',
      team: {
        id: team.id,
        name: team.name,
        budget: team.budget,
        training_facility_level: team.training_facility_level,
        scout_level: team.scout_level
      },
      cost
    };
  }
}
