import { Controller, Get, Route, Security, Tags, Query, SuccessResponse, Request } from 'tsoa';
import { ApiError } from '../middleware/error.middleware';
import leagueService from '../services/league.service';
import gameService from '../services/game.service';
import { GetLeagueResponseModel } from '../models/LeagueModels';

@Route('leagues')
@Tags('Leagues')
export class LeagueController extends Controller {
  /**
   * Get the league data for the current or specified season
   * 
   * @summary Get league data
   */
  @Get()
  @Security('bearerAuth')
  @SuccessResponse('200', 'League data retrieved successfully')
  public async getLeague(
    @Request() request: any,
    @Query() season?: number
  ): Promise<GetLeagueResponseModel> {
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
    
    // Get the league data
    const leagueData = await leagueService.getLeague(currentGame.game_id, token, season);
    
    // Return the data (it's already compatible with GetLeagueResponseModel)
    return leagueData as unknown as GetLeagueResponseModel;
  }
}
