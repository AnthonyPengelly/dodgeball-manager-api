import { Season, SeasonTrainingInfo, SeasonScoutingInfo, ScoutedPlayer, FacilityInfo, Fixture, OpponentTeam } from '../types';
import { TRAINING_CONSTANTS, SCOUTING_CONSTANTS, GAME_STAGE } from '../utils/constants';
import { ApiError } from '../middleware/error.middleware';
import { FacilityUpgradeCalculator } from '../utils/facility-upgrade-calculator';
import * as seasonRepository from '../repositories/seasonRepository';
import * as teamRepository from '../repositories/teamRepository';
import * as gameRepository from '../repositories/gameRepository';
import { EndSeasonResponse } from '../models/SeasonModels';
import leagueService from './league.service';
import { StartMainSeasonResponse } from '../models/GameModels';
import { getSeasonFixtures, addTeamToNextSeason } from '../repositories/matchRepository';
import { checkTeamPromotion } from '../utils/matchUtils';
import { updateTeamFinances } from '../repositories/budgetRepository';
import { getIncompleteFixtures } from '../repositories/fixtureRepository';
import { getTeamPlayers } from '../repositories/playerRepository';
import { calculateStadiumIncome } from '../utils/seasonUtils';

class SeasonService {
  /**
   * Get the current season for a team
   * @param teamId The team ID
   * @param token The JWT token of the authenticated user
   * @returns The current season data
   */
  async getCurrentSeason(teamId: string, token: string): Promise<Season> {
    try {
      // Get team with game information
      const team = await teamRepository.getTeamWithGameInfo(teamId, token);
      if (!team) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Extract game data and season number
      const { gameId, seasonNumber } = this.extractGameInfo(team);
      
      // Try to get existing season for this team and season number
      const existingSeason = await seasonRepository.getSeasonByTeamAndNumber(
        teamId, 
        gameId, 
        seasonNumber, 
        token
      );
      
      // Return existing season if found
      if (existingSeason) {
        return existingSeason;
      }
      
      // Create a new season if none exists
      return await seasonRepository.createSeason({
        team_id: teamId,
        game_id: gameId,
        season_number: seasonNumber,
        training_credits_used: 0,
        scouting_credits_used: 0
      });
    } catch (error) {
      console.error('SeasonService.getCurrentSeason error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to get current season');
    }
  }

  /**
   * Extract game ID and season number from team data
   * @param team Team data with game information
   * @returns Game ID and season number
   */
  private extractGameInfo(team: any): { gameId: string; seasonNumber: number } {
    const gameData = team.games;
    let gameId = '';
    let seasonNumber = 1;
    
    if (Array.isArray(gameData)) {
      // If it's an array, get the first game
      gameId = gameData.length > 0 ? gameData[0].id : '';
      seasonNumber = gameData.length > 0 ? gameData[0].season : 1;
    } else {
      // If it's a single object
      gameId = gameData.id;
      seasonNumber = gameData.season;
    }
    
    return { gameId, seasonNumber };
  }

  /**
   * Start the main season for a game
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @returns The updated game
   */
  async startMainSeason(gameId: string, token: string): Promise<StartMainSeasonResponse> {
    try {
      // Validate game state
      await this.validateGameForSeasonStart(gameId, token);
      
      // Get the user's team
      const userTeam = await teamRepository.getTeamByGameId(gameId, token);
      
      if (!userTeam) {
        throw new ApiError(404, 'Team not found');
      }
      
      // Generate league components
      await this.generateLeagueComponents(
        gameId, 
        userTeam.id, 
        token
      );

      const league = await leagueService.getLeague(gameId, token);
      
      // Update the game stage to regular season
      const updatedGame = await gameRepository.updateGameStage(gameId, GAME_STAGE.REGULAR_SEASON);
      
      return {
        game: updatedGame,
        fixtures: league.fixtures,
        table: league.table
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in startMainSeason:', error);
      throw new ApiError(500, 'Failed to start main season');
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
      const game = await gameRepository.getGameById(gameId, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      
      const currentSeason = game.season;
      
      // Validate all fixtures are completed
      await this.validateAllFixturesCompleted(gameId, currentSeason, token);
      
      // Get user's team
      const userTeam = await teamRepository.getTeamByGameId(gameId, token);
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
        await gameRepository.updateGame(gameId, { status: 'completed' });
        
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
        await gameRepository.updateGame(gameId, { status: 'completed' });
        
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
      await gameRepository.updateGame(gameId, {
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
   * Validate that a game is in the correct state to start the season
   * 
   * @param gameId The game ID
   * @param token JWT token
   */
  private async validateGameForSeasonStart(gameId: string, token: string): Promise<void> {
    const currentGame = await gameRepository.getGameById(gameId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'Game not found');
    }
    
    // Check if game is in pre-season
    if (currentGame.game_stage !== GAME_STAGE.PRE_SEASON) {
      throw new ApiError(400, 'Game is not in pre-season');
    }
  }

  /**
   * Generate opponent teams and fixtures for the league
   * 
   * @param gameId The game ID
   * @param userTeamId The user's team ID
   * @param token JWT token
   */
  private async generateLeagueComponents(
    gameId: string, 
    userTeamId: string, 
    token: string
  ): Promise<{ 
    opponentTeams: OpponentTeam[], 
    fixtures: Fixture[] 
  }> {
    // Get the current game (needed for season info)
    const currentGame = await gameRepository.getGameById(gameId, token);
    
    if (!currentGame) {
      throw new ApiError(404, 'Game not found');
    }
    
    // Generate opponent teams for the season
    const opponentTeams = await leagueService.generateOpponentTeams(
      gameId, 
      currentGame.season, 
      token
    );
    
    // Generate fixtures for the season (including opponent fixtures)
    const fixtures = await leagueService.generateFixtures(
      gameId,
      currentGame.season,
      userTeamId,
      opponentTeams,
      token
    );
    
    return { opponentTeams, fixtures };
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

export default new SeasonService();
