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
import { ApiError } from '../middleware/error.middleware';
import { 
  GetFacilityInfoResponseModel,
  UpgradeFacilityRequestModel,
  UpgradeFacilityResponseModel,
} from '../models/FacilitiesModels';
import facilitiesService from '../services/facilities.service';

@Route('facilities')
@Tags('Facilities')
export class FacilitiesController extends Controller {
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
    
    const facilityInfo = await facilitiesService.getFacilityInfo(currentGame.team_id, token);
    
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
    const { team, cost } = await facilitiesService.upgradeFacility(
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
