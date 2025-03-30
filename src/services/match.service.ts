import { ApiError } from '../middleware/error.middleware';
import { EndSeasonResponse, PlayMatchResponse } from '../types';
import { getFixturesByMatchDay, getSeasonFixtures, updateFixture, getTeamName, addTeamToNextSeason } from '../repositories/matchRepository';
import { getGameById, updateGame } from '../repositories/gameRepository';
import { getTeamByGameId } from '../repositories/teamRepository';
import { getIncompleteFixtures } from '../repositories/fixtureRepository';
import { updateTeamFinances } from '../repositories/budgetRepository';
import { generateMatchScore, checkTeamPromotion } from '../utils/matchUtils';
import { calculateStadiumIncome } from '../utils/seasonUtils';
import leagueService from './league.service';
import { getTeamPlayers } from '../repositories/playerRepository';

class MatchService {
  /**
   * Play the next scheduled match for a game
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The match result
   */
  async playNextMatch(gameId: string, token: string): Promise<PlayMatchResponse> {
    try {
      // Get current game data
      const game = await getGameById(gameId, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      // Validate game is in regular season
      this.validateGameStage(game.game_stage);
      
      // Calculate the next match day
      const currentMatchDay = game.match_day || 0;
      const nextMatchDay = currentMatchDay + 1;
      
      // Get fixtures for the next match day
      const fixtures = await getFixturesByMatchDay(gameId, game.season, nextMatchDay, token);
      
      // Validate fixtures exist
      if (!fixtures || fixtures.length === 0) {
        throw new ApiError(404, 'No more fixtures scheduled for this season');
      }
      
      // Get user's team
      const userTeam = await getTeamByGameId(gameId, token);
      if (!userTeam) {
        throw new ApiError(404, 'User team not found');
      }
      
      // Find fixtures for this match day
      const { userFixture, otherFixture } = this.findMatchDayFixtures(fixtures, userTeam.id);
      
      // Generate and update scores for user's fixture
      const { homeScore: userHomeScore, awayScore: userAwayScore } = generateMatchScore();
      const updatedUserFixture = await this.updateFixtureWithResult(
        userFixture.id, 
        userHomeScore, 
        userAwayScore
      );
      
      // Generate and update scores for other fixture
      const { homeScore: otherHomeScore, awayScore: otherAwayScore } = generateMatchScore();
      await this.updateFixtureWithResult(
        otherFixture.id, 
        otherHomeScore, 
        otherAwayScore
      );
      
      // Update the game's match day
      await updateGame(gameId, { match_day: nextMatchDay });
      
      // Get team names for response
      const homeTeamName = await getTeamName(
        userFixture.home_team_id, 
        userFixture.home_team_type, 
        token
      );
      
      const awayTeamName = await getTeamName(
        userFixture.away_team_id, 
        userFixture.away_team_type, 
        token
      );
      
      const otherHomeTeamName = await getTeamName(
        otherFixture.home_team_id, 
        otherFixture.home_team_type, 
        token
      );
      
      const otherAwayTeamName = await getTeamName(
        otherFixture.away_team_id, 
        otherFixture.away_team_type, 
        token
      );
      
      // Construct and return response
      return this.constructPlayMatchResponse(
        updatedUserFixture,
        otherFixture,
        nextMatchDay,
        {
          homeTeamName: homeTeamName || 'Unknown Team',
          awayTeamName: awayTeamName || 'Unknown Team',
          otherHomeTeamName: otherHomeTeamName || 'Unknown Team',
          otherAwayTeamName: otherAwayTeamName || 'Unknown Team',
          otherHomeScore: otherHomeScore,
          otherAwayScore: otherAwayScore
        }
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in playNextMatch:', error);
      throw new ApiError(500, 'Failed to play next match');
    }
  }

  /**
   * End the current season, handle promotions, and prepare for the next season
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The end season result
   */
  async endSeason(gameId: string, token: string): Promise<EndSeasonResponse> {
    try {
      // Get current game data
      const game = await getGameById(gameId, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      const currentSeason = game.season;
      
      // Validate all fixtures are completed
      await this.validateAllFixturesCompleted(gameId, currentSeason, token);
      
      // Get user's team
      const userTeam = await getTeamByGameId(gameId, token);
      if (!userTeam) {
        throw new ApiError(404, 'User team not found');
      }
      
      // Get current league standings
      const leagueData = await leagueService.getLeague(gameId, token, currentSeason);
      const leagueTable = leagueData.table;
      
      // Get all fixtures for the season
      const fixtures = await getSeasonFixtures(gameId, currentSeason, token);
      
      // Check promotion status
      const { isPromoted, isChampion } = checkTeamPromotion(leagueTable, userTeam.id, fixtures);
      
      // If not promoted, end the game
      if (!isPromoted) {
        await updateGame(gameId, { status: 'completed' });
        
        return {
          success: true,
          message: 'Season ended. Your team did not finish in the top 2. Game over!',
          game_ended: true,
          season_completed: currentSeason,
          promoted: false
        };
      }
      
      // If season 5 and promoted, they've won the game
      if (currentSeason === 5) {
        await updateGame(gameId, { status: 'completed' });
        
        return {
          success: true,
          message: 'Congratulations! You\'ve completed all 5 seasons and won the game!',
          game_ended: true,
          season_completed: currentSeason,
          promoted: true,
          champion: isChampion
        };
      }
      
      // Game continues - prepare for next season
      const nextSeason = currentSeason + 1;
      
      // Get the other promoted team (the other team in top 2 that isn't the user's team)
      const otherPromotedTeamEntry = this.findOtherPromotedTeam(leagueTable, userTeam.id);
      
      // Calculate financial updates
      const financeUpdate = await this.updateFinancesForNewSeason(userTeam, token);
    
      // If other promoted team exists, add it to the next season
      if (otherPromotedTeamEntry) {
        await addTeamToNextSeason(gameId, nextSeason, otherPromotedTeamEntry.team_id);
      }
      
      // Update game for next season
      await updateGame(gameId, {
        season: nextSeason,
        match_day: 0,
        game_stage: 'pre_season'
      });
      
      // Map the finance update to match the expected format in the response
      const budgetUpdate = {
        previous: financeUpdate.previousBudget,
        stadium_income: financeUpdate.stadiumIncome,
        wages_paid: financeUpdate.wagesPaid,
        new_budget: financeUpdate.newBudget
      };
      
      return {
        success: true,
        message: `Season ${currentSeason} completed! Your team ${isChampion ? 'won the championship' : 'was promoted'} and advances to season ${nextSeason}.`,
        game_ended: false,
        season_completed: currentSeason,
        next_season: nextSeason,
        promoted: true,
        champion: isChampion,
        budget_update: budgetUpdate,
        promoted_team: otherPromotedTeamEntry ? {
          id: otherPromotedTeamEntry.team_id,
          name: otherPromotedTeamEntry.team_name
        } : undefined
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in endSeason:', error);
      throw new ApiError(500, 'Failed to end season');
    }
  }

  /**
   * Validate that the game is in the correct stage
   * 
   * @param gameStage The current game stage
   * @throws ApiError if game is not in regular season
   */
  private validateGameStage(gameStage: string): void {
    if (gameStage !== 'regular_season') {
      throw new ApiError(400, `Cannot play match. Game is in ${gameStage} stage.`);
    }
  }

  /**
   * Find the user and other fixture for a match day
   * 
   * @param fixtures All fixtures for the match day
   * @param userTeamId The user's team ID
   * @returns Object with user and other fixtures
   */
  private findMatchDayFixtures(fixtures: any[], userTeamId: string) {
    const userFixture = fixtures.find(fixture => 
      fixture.home_team_id === userTeamId || fixture.away_team_id === userTeamId
    );
    
    if (!userFixture) {
      throw new ApiError(404, 'No fixture found for user team');
    }
    
    const otherFixture = fixtures.find(fixture => 
      fixture.home_team_id !== userTeamId && fixture.away_team_id !== userTeamId
    );
    
    if (!otherFixture) {
      throw new ApiError(404, 'No fixture found for other teams');
    }
    
    return { userFixture, otherFixture };
  }

  /**
   * Update a fixture with match result
   * 
   * @param fixtureId The fixture ID
   * @param homeScore Home team score
   * @param awayScore Away team score
   * @returns The updated fixture
   */
  private async updateFixtureWithResult(fixtureId: string, homeScore: number, awayScore: number) {
    return await updateFixture(fixtureId, {
      home_score: homeScore,
      away_score: awayScore,
      status: 'completed',
      played_at: new Date().toISOString()
    });
  }

  /**
   * Construct response for playNextMatch
   */
  private constructPlayMatchResponse(
    userFixture: any,
    otherFixture: any,
    matchDay: number,
    teamInfo: {
      homeTeamName: string;
      awayTeamName: string;
      otherHomeTeamName: string;
      otherAwayTeamName: string;
      otherHomeScore: number;
      otherAwayScore: number;
    }
  ): PlayMatchResponse {
    return {
      success: true,
      message: 'Match played successfully',
      match: {
        ...userFixture,
        home_team_name: teamInfo.homeTeamName,
        away_team_name: teamInfo.awayTeamName
      },
      match_day: matchDay,
      other_match: {
        id: otherFixture.id,
        game_id: otherFixture.game_id,
        home_team_id: otherFixture.home_team_id,
        away_team_id: otherFixture.away_team_id,
        home_team_type: otherFixture.home_team_type,
        away_team_type: otherFixture.away_team_type,
        home_team_name: teamInfo.otherHomeTeamName,
        away_team_name: teamInfo.otherAwayTeamName,
        home_score: teamInfo.otherHomeScore,
        away_score: teamInfo.otherAwayScore,
        match_day: otherFixture.match_day,
        season: otherFixture.season,
        status: 'completed',
        played_at: new Date().toISOString(),
        created_at: otherFixture.created_at
      }
    };
  }

  /**
   * Validate that all fixtures for a season are completed
   * 
   * @param gameId The game ID
   * @param season The season number
   * @param token JWT token
   * @throws ApiError if any fixtures are not completed
   */
  private async validateAllFixturesCompleted(gameId: string, season: number, token: string): Promise<void> {
    const incompleteFixtures = await getIncompleteFixtures(gameId, season, token);
    
    if (incompleteFixtures.length > 0) {
      throw new ApiError(400, `Cannot end season. ${incompleteFixtures.length} fixtures are not completed.`);
    }
  }

  /**
   * Find the other team that is being promoted
   * 
   * @param leagueTable The league table
   * @param userTeamId The user's team ID
   * @returns The other promoted team entry
   */
  private findOtherPromotedTeam(leagueTable: any[], userTeamId: string) {
    return leagueTable
      .filter(entry => entry.team_id !== userTeamId && entry.team_type === 'opponent')
      .find((_, index) => index < 2);
  }

  /**
   * Update finances for the new season
   * 
   * @param userTeam The user's team
   * @param token JWT token
   * @returns Financial update information
   */
  private async updateFinancesForNewSeason(userTeam: any, token: string) {
    // Calculate stadium income
    const stadiumIncome = calculateStadiumIncome(userTeam.stadium_size);
    
    // Get player wages
    const players = await getTeamPlayers(userTeam.game_id, token);
      
    // Calculate wages
    const wagesPaid = players?.reduce((total, player) => {
      return total + (player.tier * 2);
    }, 0) || 0;
    
    // Update team finances
    return await updateTeamFinances(userTeam.id, stadiumIncome, wagesPaid);
  }
}

export default new MatchService();
