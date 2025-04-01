import { ApiError } from '../middleware/error.middleware';
import { Fixture, Game, PlayerInstructions, PlayerStatus, TargetPriority } from '../types';
import { getFixturesByMatchDay, updateFixture, getTeamName } from '../repositories/matchRepository';
import { getGameById, getGameByTeamId, updateGame } from '../repositories/gameRepository';
import { getTeamByGameId, getTeamById } from '../repositories/teamRepository';
import { createPlayers, getTeamPlayers } from '../repositories/playerRepository';
// Import match engine components
import { runMatchSimulation, convertToMatchTeams } from '../match-engine';
import { PlayerGenerator } from '../utils/player-generator';
import { PlayMatchResponse } from '../models/MatchModels';
import { MATCH_CONSTANTS, GAME_STAGE } from '../utils/constants';
import { getPlayerInstructionsByFixtureId, upsertPlayerInstructions } from '../repositories/playerInstructions.repository';
import { getOpponentTeamPlayers, addPlayersToOpponentTeam, getOpponentTeamWithPlayers } from '../repositories/opponentTeamRepository';
import { generateMatchScore } from '../utils/matchUtils';

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
      const playerInstructions = await getPlayerInstructionsByFixtureId(gameId, userFixture.id, token);
      if (!playerInstructions || playerInstructions.length !== MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
        throw new ApiError(400, 'Full team player instructions not found');
      }

      // For user's fixture: Full match simulation with match engine
      let userMatchSimulation = null;
      let userHomeScore = 0;
      let userAwayScore = 0;

      if (userFixture) {
        // Get detailed team information for match simulation
        const isHomeTeam = userFixture.home_team_id === userTeam.id;
        
        // Ensure opponent team has 8 players
        if (isHomeTeam) {
          await this.ensureOpponentTeamHasPlayers(
            gameId, 
            userFixture.away_team_id, 
            game.season, 
            token
          );
        } else {
          await this.ensureOpponentTeamHasPlayers(
            gameId, 
            userFixture.home_team_id, 
            game.season, 
            token
          );
        }
        
        // Get team players for match simulation
        const userTeamPlayers = await getTeamPlayers(gameId, token);
        
        let opponentTeamId: string;
        let opponentTeamData: any;
        
        if (isHomeTeam) {
          opponentTeamId = userFixture.away_team_id;
          opponentTeamData = await this.getOpponentTeamData(
            opponentTeamId, 
            userFixture.away_team_type, 
            game.season, 
            token
          );
        } else {
          opponentTeamId = userFixture.home_team_id;
          opponentTeamData = await this.getOpponentTeamData(
            opponentTeamId, 
            userFixture.home_team_type, 
            game.season, 
            token
          );
        }
        
        // Get team names
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
        
        // Prepare teams for match simulation
        const { homeTeam, awayTeam } = isHomeTeam 
          ? convertToMatchTeams(
              userTeam.id, 
              homeTeamName || 'Home Team', 
              userTeamPlayers, 
              opponentTeamId, 
              awayTeamName || 'Away Team', 
              opponentTeamData.players,
              playerInstructions
            )
          : convertToMatchTeams(
              opponentTeamId, 
              homeTeamName || 'Home Team', 
              opponentTeamData.players, 
              userTeam.id, 
              awayTeamName || 'Away Team', 
              userTeamPlayers,
              playerInstructions
            );
        
        // Run the match simulation
        userMatchSimulation = runMatchSimulation(homeTeam, awayTeam);
        
        // Extract scores from the simulation
        userHomeScore = userMatchSimulation.homeScore;
        userAwayScore = userMatchSimulation.awayScore;
        
        // Update fixture with the results
        await this.updateFixtureWithResult(
          userFixture.id, 
          userHomeScore, 
          userAwayScore
        );
      } else {
        // Fallback to random score if no user fixture (shouldn't happen)
        const { homeScore, awayScore } = generateMatchScore();
        userHomeScore = homeScore;
        userAwayScore = awayScore;
        if (userFixture) {
          await this.updateFixtureWithResult(
            userFixture.id, 
            homeScore, 
            awayScore
          );
        }
      }
      
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
        userFixture,
        otherFixture,
        nextMatchDay,
        {
          homeTeamName: homeTeamName || 'Unknown Team',
          awayTeamName: awayTeamName || 'Unknown Team',
          userHomeScore: userHomeScore,
          userAwayScore: userAwayScore,
          otherHomeTeamName: otherHomeTeamName || 'Unknown Team',
          otherAwayTeamName: otherAwayTeamName || 'Unknown Team',
          otherHomeScore: otherHomeScore,
          otherAwayScore: otherAwayScore
        },
        userMatchSimulation // Pass the full match simulation data
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
   * Ensures an opponent team has at least 8 players
   * Generates new players if needed based on season tier
   * 
   * @param gameId The game ID
   * @param opponentTeamId The opponent team ID
   * @param season The current season number
   * @param token JWT token
   */
  private async ensureOpponentTeamHasPlayers(
    gameId: string,
    opponentTeamId: string,
    season: number,
    token: string
  ): Promise<void> {
    try {
      // Check if team already has players
      const existingPlayerIds = await getOpponentTeamPlayers(opponentTeamId, season, token);
      
      // If team already has at least 8 players, we're good
      if (existingPlayerIds.length >= 8) {
        return;
      }
      
      // Calculate how many more players we need
      const playersNeeded = 8 - existingPlayerIds.length;
      
      // Generate new players based on season tier (+/- 1)
      // Generate players
      const generatedPlayers = PlayerGenerator.generatePlayersInTierRange(
        playersNeeded,
        Math.max(1, season - 1),
        Math.min(5, season + 1)
      );
      
      // Prepare players for database insertion
      const playersToInsert = generatedPlayers.map(player => ({
        game_id: gameId,
        name: player.name,
        status: 'opponent' as PlayerStatus,
        tier: player.tier,
        potential_tier: player.potentialTier,
        ...player.stats,
        ...player.potentialStats
      }));

      const players = await createPlayers(playersToInsert);
      const playerIds = players.map(player => player.id);
      // Associate players with the opponent team
      await addPlayersToOpponentTeam(gameId, opponentTeamId, playerIds, season);
    } catch (error) {
      console.error('Error ensuring opponent team has players:', error);
      throw error;
    }
  }

  /**
   * Get opponent team data including players
   * 
   * @param teamId The team ID
   * @param teamType The team type (user or opponent)
   * @param season The current season
   * @param token JWT token
   * @returns The team with players
   */
  private async getOpponentTeamData(
    teamId: string,
    teamType: string,
    season: number,
    token: string
  ): Promise<any> {
    if (teamType === 'opponent') {
      // Get opponent team with players
      return await getOpponentTeamWithPlayers(teamId, season, token);
    } else {
      // Get user team players
      const players = await getTeamPlayers(teamId, token);
      return { id: teamId, players };
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
    userFixture: Fixture,
    otherFixture: Fixture,
    matchDay: number,
    teamInfo: {
      homeTeamName: string;
      awayTeamName: string;
      userHomeScore: number;
      userAwayScore: number;
      otherHomeTeamName: string;
      otherAwayTeamName: string;
      otherHomeScore: number;
      otherAwayScore: number;
    },
    simulatedMatch?: any
  ): PlayMatchResponse {
    return {
      success: true,
      message: 'Match played successfully',
      match: {
        id: userFixture.id,
        game_id: userFixture.game_id,
        home_team_id: userFixture.home_team_id,
        away_team_id: userFixture.away_team_id,
        home_team_type: userFixture.home_team_type,
        away_team_type: userFixture.away_team_type,
        home_team_name: teamInfo.homeTeamName,
        away_team_name: teamInfo.awayTeamName,
        home_score: teamInfo.userHomeScore,
        away_score: teamInfo.userAwayScore,
        match_day: userFixture.match_day,
        season: userFixture.season,
        status: 'completed',
        played_at: new Date().toISOString(),
        created_at: userFixture.created_at
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
      },
      simulated_match: simulatedMatch
    };
  }

  /**
   * Get player instructions for a specific fixture
   * @param fixtureId The ID of the fixture
   * @param token JWT token
   * @returns Array of player instructions
   */
  async getPlayerInstructions(teamId: string, fixtureId: string | undefined, token: string): Promise<PlayerInstructions[]> {
    try {
      const game = await getGameByTeamId(teamId, token);
      if (!game) {
        throw new ApiError(404, 'Game not found');
      }
      const instructions = await getPlayerInstructionsByFixtureId(game.id, fixtureId || await this.getNextFixtureId(game, teamId, token), token);
      
      if (!instructions) {
        return [];
      }
      
      return instructions;
    } catch (error) {
      console.error('Error getting player instructions:', error);
      throw new ApiError(500, 'Failed to get player instructions');
    }
  }

  /**
   * Save player instructions for a specific fixture
   * @param gameId The ID of the game
   * @param teamId The ID of the team
   * @param fixtureId The ID of the fixture
   * @param instructions Array of player instructions to save
   * @returns Boolean indicating success
   */
  async savePlayerInstructions(
    gameId: string, 
    teamId: string, 
    fixtureId: string | undefined, 
    instructions: Omit<PlayerInstructions, 'id' | 'created_at' | 'updated_at' | 'fixture_id'>[],
    token: string,
  ): Promise<boolean> {
    // Get the team data
    const team = await getTeamById(teamId, token);
    if (!team) {
      throw new ApiError(404, 'Team not found');
    }
    
    // Get the game data
    const game = await getGameById(team.game_id, token);
    if (!game) {
      throw new ApiError(404, 'Game not found');
    }

    // Check game stage
    if (game.game_stage !== GAME_STAGE.REGULAR_SEASON) {
      throw new ApiError(400, 'Player instructions can only be set during regular season');
    }

    // Validate fixture exists and is for the next match
    const fixtures = await getFixturesByMatchDay(
      gameId, 
      game.season, 
      game.match_day + 1,
      token,
    );
    const fixture = fixtureId ? fixtures.find((f: Fixture) => f.id === fixtureId) : fixtures.find((f: Fixture) => f.home_team_id === teamId || f.away_team_id === teamId);
    if (!fixture) {
      throw new ApiError(400, 'Invalid fixture');
    }
    if (!fixture.status || fixture.status !== 'scheduled') {
      throw new ApiError(400, 'Fixture is not scheduled');
    }

    // Validate instructions
    const { isValid, errors } = await this.validateInstructions(instructions);

    if (!isValid) {
      throw new ApiError(400, errors.join('; '));
    }

    // Save player instructions
    return await upsertPlayerInstructions(fixture.id, instructions, token);
  }

  /**
   * Validate player instructions
   * @param instructions Array of player instructions to validate
   * @returns Validation result
   */
  private async validateInstructions (
    instructions: Omit<PlayerInstructions, 'id' | 'created_at' | 'updated_at' | 'fixture_id'>[]
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate number of instructions
    if (instructions.length !== MATCH_CONSTANTS.PLAYERS_PER_TEAM) {
      errors.push(`Must provide exactly ${MATCH_CONSTANTS.PLAYERS_PER_TEAM} player instructions`);
    }

    // Validate individual instruction constraints
    instructions.forEach((instruction, index) => {
      // Validate aggression levels
      if (instruction.throw_aggression < 0 || instruction.throw_aggression > 100) {
        errors.push(`Instruction ${index + 1}: Throw aggression must be between 0 and 100`);
      }
      if (instruction.catch_aggression < 0 || instruction.catch_aggression > 100) {
        errors.push(`Instruction ${index + 1}: Catch aggression must be between 0 and 100`);
      }

      // Validate target priority
      const validTargetPriorities = Object.values(TargetPriority);
      if (!validTargetPriorities.includes(instruction.target_priority)) {
        errors.push(`Instruction ${index + 1}: Invalid target priority`);
      }
    });

    // Validate unique players
    const uniquePlayers = new Set(instructions.map(i => i.player_id));
    if (uniquePlayers.size !== instructions.length) {
      errors.push('Each instruction must be for a unique player');
    }

    return { 
      isValid: errors.length === 0, 
      errors 
    };
  }

  private async getNextFixtureId(game: Game, teamId: string, token: string): Promise<string> {
    const fixtures = await getFixturesByMatchDay(game.id, game.season, game.match_day + 1, token);
    if (!fixtures || fixtures.length === 0) {
      throw new ApiError(404, 'No fixtures found for this game');
    }
    const fixture = fixtures.find(f => f.status === 'scheduled' && (f.home_team_id === teamId || f.away_team_id === teamId));
    if (!fixture) {
      throw new ApiError(404, 'No scheduled fixture found for this team');
    }
    return fixture.id;
  }
}

export default new MatchService();
