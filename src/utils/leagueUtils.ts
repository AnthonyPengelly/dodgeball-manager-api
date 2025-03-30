import { Fixture, LeagueTableEntry } from '../types';

/**
 * Generate the league table based on fixtures
 * 
 * @param fixtures The fixtures to calculate the table from
 * @param userTeamId The user's team ID
 * @param userTeamName The user's team name
 * @param opponentTeams The opponent teams
 * @returns The calculated league table
 */
export function generateLeagueTable(
  fixtures: Fixture[], 
  userTeamId: string, 
  userTeamName: string,
  opponentTeams: any[]
): LeagueTableEntry[] {
  // Initialize the table
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

/**
 * Create a team name to ID mapping for easy lookup
 * 
 * @param userTeam The user's team
 * @param opponentTeams The opponent teams
 * @returns Map of team IDs to team names
 */
export function createTeamNameMapping(userTeam: any, opponentTeams: any[]): Map<string, string> {
  const teamNames = new Map<string, string>();
  teamNames.set(userTeam.id, userTeam.name);
  
  opponentTeams?.forEach(team => {
    teamNames.set(team.id, team.name);
  });
  
  return teamNames;
}

/**
 * Enhance fixtures with team names
 * 
 * @param fixtures The fixtures to enhance
 * @param teamNames Map of team IDs to team names
 * @returns Fixtures with added team names
 */
export function enhanceFixturesWithTeamNames(fixtures: Fixture[], teamNames: Map<string, string>): Fixture[] {
  return fixtures.map(fixture => ({
    ...fixture,
    home_team_name: teamNames.get(fixture.home_team_id) || 'Unknown Team',
    away_team_name: teamNames.get(fixture.away_team_id) || 'Unknown Team'
  }));
}

/**
 * Create fixtures for a season between the user team and opponent teams
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param userTeamId The user's team ID
 * @param opponentTeams The opponent teams
 * @returns Array of fixture objects ready to be inserted
 */
export function createSeasonFixtures(
  gameId: string,
  season: number,
  userTeamId: string,
  opponentTeams: any[]
): Partial<Fixture>[] {
  const fixtures: Partial<Fixture>[] = [];
  
  // Create fixtures - one match against each opponent team
  opponentTeams.forEach((team, index) => {
    // Alternate between home and away games
    const isHome = Math.floor(Math.random() * 2) === 0;
    
    if (isHome) {
      fixtures.push({
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
      fixtures.push({
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
  
  return fixtures;
}

/**
 * Create fixtures between opponent teams
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param userFixtures The existing user fixtures
 * @param opponentTeams All opponent teams
 * @returns Array of fixture objects ready to be inserted
 */
export function createOpponentTeamFixtures(
  gameId: string,
  season: number,
  userFixtures: Fixture[],
  opponentTeams: any[]
): Partial<Fixture>[] {
  const fixtures: Partial<Fixture>[] = [];
  
  // For each match day, create a fixture between the two teams not playing against the user
  for (let matchDay = 1; matchDay <= opponentTeams.length; matchDay++) {
    // Find the user's fixture for this match day
    const userFixture = userFixtures?.find(f => f.match_day === matchDay);
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
      
      fixtures.push({
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
  
  return fixtures;
}
