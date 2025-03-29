import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Fixture, GetLeagueResponse, LeagueTableEntry, OpponentTeam } from '../types';
import TeamNameGenerator from '../utils/team-name-generator';

// Number of opponent teams to generate per season
const OPPONENT_TEAMS_COUNT = 3;

class LeagueService {
  /**
   * Generate opponent teams for a season if they don't exist
   * 
   * @param gameId The game ID
   * @param season The season number
   * @param token JWT token for authentication
   * @returns The generated opponent teams
   */
  async generateOpponentTeams(gameId: string, season: number, token: string): Promise<OpponentTeam[]> {
    try {
      // Check if we already have opponent teams for this season
      const { data: existingSeasonTeams, error: existingSeasonTeamsError } = await createClientFromToken(token)
        .from('season_opponent_teams')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', season);
      
      if (existingSeasonTeamsError) {
        console.error('Error checking existing season opponent teams:', existingSeasonTeamsError);
        throw new ApiError(500, 'Failed to check existing season opponent teams');
      }
      
      // If we already have all the opponent teams for this season, return them
      if (existingSeasonTeams && existingSeasonTeams.length === OPPONENT_TEAMS_COUNT) {
        // Get the opponent team details
        const opponentTeamIds = existingSeasonTeams.map(team => team.opponent_team_id);
        
        const { data: opponentTeams, error: opponentTeamsError } = await createClientFromToken(token)
          .from('opponent_teams')
          .select('*')
          .in('id', opponentTeamIds);
          
        if (opponentTeamsError) {
          console.error('Error getting opponent teams:', opponentTeamsError);
          throw new ApiError(500, 'Failed to get opponent teams');
        }
        
        return opponentTeams as OpponentTeam[];
      }
      
      // We need to generate more teams - determine how many
      const existingCount = existingSeasonTeams ? existingSeasonTeams.length : 0;
      const neededCount = OPPONENT_TEAMS_COUNT - existingCount;
      
      // Get existing opponent team IDs for this season (if any)
      const existingOpponentTeamIds = existingSeasonTeams 
        ? existingSeasonTeams.map(team => team.opponent_team_id) 
        : [];
      
      // Get existing opponent teams for this season (if any)
      let existingOpponentTeams: OpponentTeam[] = [];
      if (existingOpponentTeamIds.length > 0) {
        const { data: teams, error: teamsError } = await createClientFromToken(token)
          .from('opponent_teams')
          .select('*')
          .in('id', existingOpponentTeamIds);
          
        if (teamsError) {
          console.error('Error getting existing opponent teams:', teamsError);
          throw new ApiError(500, 'Failed to get existing opponent teams');
        }
        
        existingOpponentTeams = teams as OpponentTeam[];
      }
      
      // If we need to generate new teams
      let newOpponentTeams: OpponentTeam[] = [];
      if (neededCount > 0) {
        // Generate unique team names
        const teamNames = TeamNameGenerator.generateUniqueTeamNames(neededCount);
        
        // Create opponent teams
        const newTeams: Partial<OpponentTeam>[] = teamNames.map(name => ({
          game_id: gameId,
          name
        }));
        
        // Insert the opponent teams
        const { data: insertedTeams, error: insertError } = await supabaseAdmin
          .from('opponent_teams')
          .insert(newTeams)
          .select();
          
        if (insertError) {
          console.error('Error inserting opponent teams:', insertError);
          throw new ApiError(500, 'Failed to create opponent teams');
        }
        
        newOpponentTeams = [...newOpponentTeams, ...(insertedTeams as OpponentTeam[])];
        
        // Create season opponent team entries for the new teams
        const newSeasonOpponentTeams = newOpponentTeams.map(team => ({
          game_id: gameId,
          season,
          opponent_team_id: team.id
        }));
        
        // Insert the season opponent teams
        const { error: seasonInsertError } = await supabaseAdmin
          .from('season_opponent_teams')
          .insert(newSeasonOpponentTeams);
          
        if (seasonInsertError) {
          console.error('Error inserting season opponent teams:', seasonInsertError);
          throw new ApiError(500, 'Failed to create season opponent teams');
        }
      }
      
      // Combine existing and new opponent teams
      return [...existingOpponentTeams, ...newOpponentTeams];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in generateOpponentTeams:', error);
      throw new ApiError(500, 'Failed to generate opponent teams');
    }
  }
  
  /**
   * Generate fixtures for a game season
   * 
   * @param gameId The game ID
   * @param season The season number
   * @param userTeamId The user's team ID
   * @param opponentTeams The opponent teams
   * @param token JWT token for authentication
   * @returns The generated fixtures
   */
  async generateFixtures(
    gameId: string, 
    season: number, 
    userTeamId: string, 
    opponentTeams: OpponentTeam[], 
    token: string
  ): Promise<Fixture[]> {
    try {
      // Check if fixtures already exist for this game and season
      const { data: existingFixtures, error: existingFixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', season);
      
      if (existingFixturesError) {
        console.error('Error checking existing fixtures:', existingFixturesError);
        throw new ApiError(500, 'Failed to check existing fixtures');
      }
      
      // If fixtures already exist, return them
      if (existingFixtures && existingFixtures.length > 0) {
        return existingFixtures as Fixture[];
      }
      
      // Create fixtures - one match against each opponent team
      const userFixtures: Partial<Fixture>[] = [];
      
      // For each opponent team, create a fixture
      opponentTeams.forEach((team, index) => {
        // Alternate between home and away games
        const isHome = Math.floor(Math.random() * 2) === 0;
        
        if (isHome) {
          userFixtures.push({
            game_id: gameId,
            season,
            match_day: index + 1,
            home_team_id: userTeamId,
            away_team_id: team.id,
            home_team_type: 'user',
            away_team_type: 'opponent',
            status: 'scheduled'
          });
        } else {
          userFixtures.push({
            game_id: gameId,
            season,
            match_day: index + 1,
            home_team_id: team.id,
            away_team_id: userTeamId,
            home_team_type: 'opponent',
            away_team_type: 'user',
            status: 'scheduled'
          });
        }
      });
      
      // Insert the user fixtures
      const { data: insertedUserFixtures, error: insertUserError } = await supabaseAdmin
        .from('fixtures')
        .insert(userFixtures)
        .select();
      
      if (insertUserError) {
        console.error('Error inserting user fixtures:', insertUserError);
        throw new ApiError(500, 'Failed to generate user fixtures');
      }
      
      // Generate fixtures for games between opponent teams
      const opponentFixtures: Partial<Fixture>[] = [];
      
      // For each match day, create a fixture between the two teams not playing against the user
      for (let matchDay = 1; matchDay <= opponentTeams.length; matchDay++) {
        // Find the user's fixture for this match day
        const userFixture = insertedUserFixtures?.find(f => f.match_day === matchDay);
        if (!userFixture) continue;
        
        // Find the two teams not involved in the user's fixture
        const teamsInUserFixture = [userFixture.home_team_id, userFixture.away_team_id];
        const teamsNotInUserFixture = opponentTeams
          .filter(team => !teamsInUserFixture.includes(team.id))
          .map(team => team.id);
        
        // If we have exactly 2 teams not in the user's fixture, create a fixture between them
        if (teamsNotInUserFixture.length === 2) {
          // Randomly decide home and away
          const isFirstTeamHome = Math.random() >= 0.5;
          const homeTeamId = isFirstTeamHome ? teamsNotInUserFixture[0] : teamsNotInUserFixture[1];
          const awayTeamId = isFirstTeamHome ? teamsNotInUserFixture[1] : teamsNotInUserFixture[0];
          
          opponentFixtures.push({
            game_id: gameId,
            season: season,
            match_day: matchDay,
            home_team_id: homeTeamId,
            away_team_id: awayTeamId,
            home_team_type: 'opponent',
            away_team_type: 'opponent',
            status: 'scheduled'
          });
        }
      }
      
      // Insert the opponent fixtures if there are any
      if (opponentFixtures.length > 0) {
        const { error: insertOpponentFixturesError } = await supabaseAdmin
          .from('fixtures')
          .insert(opponentFixtures);
        
        if (insertOpponentFixturesError) {
          console.error('Error inserting opponent fixtures:', insertOpponentFixturesError);
          throw new ApiError(500, 'Failed to generate opponent fixtures');
        }
      }
      
      // Get all fixtures for this game and season
      const { data: allFixtures, error: allFixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', season);
      
      if (allFixturesError) {
        console.error('Error getting all fixtures:', allFixturesError);
        throw new ApiError(500, 'Failed to get all fixtures');
      }
      
      return allFixtures as Fixture[];
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in generateFixtures:', error);
      throw new ApiError(500, 'Failed to generate fixtures');
    }
  }
  
  /**
   * Get the league data for a specific season
   * 
   * @param gameId The game ID
   * @param token JWT token for authentication
   * @param season The season number (optional, defaults to current season)
   * @returns The league data including fixtures and table
   */
  async getLeague(gameId: string, token: string, season?: number): Promise<GetLeagueResponse> {
    try {
      // If season is not provided, get the current game to determine the season
      if (!season) {
        const { data: game, error: gameError } = await createClientFromToken(token)
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();
          
        if (gameError || !game) {
          console.error('Error getting game:', gameError);
          throw new ApiError(404, 'Game not found');
        }
        
        season = game.season;
      }
      
      // Get the user's team
      const { data: userTeam, error: userTeamError } = await createClientFromToken(token)
        .from('teams')
        .select('id, name')
        .eq('game_id', gameId)
        .single();
      
      if (userTeamError || !userTeam) {
        console.error('Error getting user team:', userTeamError);
        throw new ApiError(404, 'User team not found');
      }
      
      // Get opponent teams that have fixtures this season
      const { data: seasonOpponentTeams, error: seasonOpponentTeamsError } = await createClientFromToken(token)
        .from('season_opponent_teams')
        .select('opponent_team_id')
        .eq('game_id', gameId)
        .eq('season', season);
      
      if (seasonOpponentTeamsError) {
        console.error('Error getting season opponent teams:', seasonOpponentTeamsError);
        throw new ApiError(500, 'Failed to get season opponent teams');
      }
      
      // Get the actual opponent team details
      const opponentTeamIds = seasonOpponentTeams?.map(team => team.opponent_team_id) || [];
      
      const { data: opponentTeams, error: opponentTeamsError } = await createClientFromToken(token)
        .from('opponent_teams')
        .select('id, name')
        .in('id', opponentTeamIds);
      
      if (opponentTeamsError) {
        console.error('Error getting opponent teams:', opponentTeamsError);
        throw new ApiError(500, 'Failed to get opponent teams');
      }
      
      // Get fixtures for this season
      const { data: fixtures, error: fixturesError } = await createClientFromToken(token)
        .from('fixtures')
        .select('*')
        .eq('game_id', gameId)
        .eq('season', season)
        .order('match_day', { ascending: true });
      
      if (fixturesError) {
        console.error('Error getting fixtures:', fixturesError);
        throw new ApiError(500, 'Failed to get fixtures');
      }
      
      // Create a map of team IDs to names
      const teamNames = new Map<string, string>();
      teamNames.set(userTeam.id, userTeam.name);
      
      opponentTeams?.forEach(team => {
        teamNames.set(team.id, team.name);
      });
      
      // Enhance fixtures with team names
      const enhancedFixtures = fixtures?.map(fixture => ({
        ...fixture,
        home_team_name: teamNames.get(fixture.home_team_id) || 'Unknown Team',
        away_team_name: teamNames.get(fixture.away_team_id) || 'Unknown Team'
      })) as Fixture[];
      
      // Generate league table
      const table = this.generateLeagueTable(enhancedFixtures, userTeam.id, userTeam.name, opponentTeams);
      
      return {
        success: true,
        message: 'League data retrieved successfully',
        season: season || 1, // Default to season 1 if undefined
        fixtures: enhancedFixtures || [],
        table
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('Error in getLeague:', error);
      throw new ApiError(500, 'Failed to get league data');
    }
  }
  
  /**
   * Generate the league table based on fixtures
   * 
   * @param fixtures The fixtures to calculate the table from
   * @param userTeamId The user's team ID
   * @param userTeamName The user's team name
   * @param opponentTeams The opponent teams
   * @returns The calculated league table
   */
  private generateLeagueTable(
    fixtures: Fixture[], 
    userTeamId: string, 
    userTeamName: string,
    opponentTeams: any[]
  ): LeagueTableEntry[] {
    // Calculate the league table
    const table: LeagueTableEntry[] = [];
    
    // Add user team to the table
    table.push({
      team_id: userTeamId,
      team_name: userTeamName,
      team_type: 'user',
      played: 0,
      won: 0,
      lost: 0,
      points: 0
    });
    
    // Add opponent teams to the table
    opponentTeams?.forEach(team => {
      table.push({
        team_id: team.id,
        team_name: team.name,
        team_type: 'opponent',
        played: 0,
        won: 0,
        lost: 0,
        points: 0
      });
    });
    
    // Update the table with fixture results
    fixtures?.filter(fixture => fixture.status === 'completed' && 
                      fixture.home_score !== undefined && 
                      fixture.away_score !== undefined)
              .forEach(fixture => {
        const homeTeam = table.find(team => team.team_id === fixture.home_team_id);
        const awayTeam = table.find(team => team.team_id === fixture.away_team_id);
        
        if (homeTeam && awayTeam) {
          // Update played games
          homeTeam.played += 1;
          awayTeam.played += 1;
          
          // Update wins, losses and points
          if (fixture.home_score! > fixture.away_score!) {
            homeTeam.won += 1;
            awayTeam.lost += 1;
          } else if (fixture.home_score! < fixture.away_score!) {
            awayTeam.won += 1;
            homeTeam.lost += 1;
          }
          homeTeam.points += fixture.home_score!;
          awayTeam.points += fixture.away_score!;
        }
      });
    
    // Sort the table by points (descending)
    return table.sort((a, b) => b.points - a.points);
  }
}

export default new LeagueService();
