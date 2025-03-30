import { Fixture, LeagueTableEntry } from '../types';

/**
 * Generate a random score for a match with a specified total score
 * 
 * @param totalPoints Total points to distribute between home and away
 * @returns Object with home and away scores
 */
export function generateMatchScore(totalPoints: number = 3): { homeScore: number, awayScore: number } {
  const homeScore = Math.floor(Math.random() * (totalPoints + 1)); // 0 to totalPoints
  const awayScore = totalPoints - homeScore; // Remaining points
  
  return { 
    homeScore, 
    awayScore 
  };
}

/**
 * Calculate head-to-head points between two teams
 * 
 * @param fixtures Fixtures between the two teams
 * @param teamId1 The first team ID
 * @param teamId2 The second team ID
 * @returns Object with points for each team
 */
export function calculateHeadToHeadPoints(
  fixtures: Fixture[],
  teamId1: string,
  teamId2: string
): { team1Points: number, team2Points: number } {
  let team1Points = 0;
  let team2Points = 0;
  
  fixtures.forEach(fixture => {
    if (fixture.home_team_id === teamId1 && fixture.away_team_id === teamId2) {
      team1Points += fixture.home_score || 0;
      team2Points += fixture.away_score || 0;
    } else if (fixture.home_team_id === teamId2 && fixture.away_team_id === teamId1) {
      team1Points += fixture.away_score || 0;
      team2Points += fixture.home_score || 0;
    }
  });
  
  return { team1Points, team2Points };
}

/**
 * Check if a team is eligible for promotion based on league position and tie-breakers
 * 
 * @param leagueTable The league table entries
 * @param teamId The team ID to check
 * @param fixtures All fixtures for the season
 * @returns Whether the team should be promoted
 */
export function checkTeamPromotion(
  leagueTable: LeagueTableEntry[],
  teamId: string,
  fixtures: Fixture[]
): { isPromoted: boolean, isChampion: boolean } {
  // Find team's position in the league table
  const teamEntry = leagueTable.find(entry => entry.team_id === teamId);
  if (!teamEntry) {
    return { isPromoted: false, isChampion: false };
  }
  
  // Get position (1-based index)
  const position = leagueTable.findIndex(entry => entry.team_id === teamId) + 1;
  
  // Champion if in 1st position
  const isChampion = position === 1;
  
  // Promoted if in top 2
  let isPromoted = position <= 2;
  
  // Check tie-breakers if not already promoted
  if (!isPromoted && position > 2) {
    const teamPoints = teamEntry.points;
    const secondPlacePoints = leagueTable[1]?.points;
    
    // Check if team is tied with 2nd place
    if (teamPoints === secondPlacePoints) {
      // Get the team(s) tied with our team
      const tiedTeams = leagueTable.filter(entry => 
        entry.team_id !== teamId && entry.points === teamPoints
      );
      
      // If multiple teams tied for 2nd place, give benefit of the doubt
      if (tiedTeams.length > 1) {
        isPromoted = true;
      } else if (tiedTeams.length === 1) {
        // Check head-to-head with the tied team
        const tiedTeamId = tiedTeams[0].team_id;
        
        // Find relevant fixtures
        const headToHeadFixtures = fixtures.filter(fixture => 
          (fixture.home_team_id === teamId && fixture.away_team_id === tiedTeamId) ||
          (fixture.home_team_id === tiedTeamId && fixture.away_team_id === teamId)
        );
        
        // Calculate points
        const { team1Points, team2Points } = calculateHeadToHeadPoints(
          headToHeadFixtures,
          teamId,
          tiedTeamId
        );
        
        // Team wins tie-breaker if they have more head-to-head points
        isPromoted = team1Points >= team2Points;
      }
    }
  }
  
  return { isPromoted, isChampion };
}

