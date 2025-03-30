import { createClientFromToken, supabaseAdmin } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Fixture, Game } from '../types';

/**
 * Get all fixtures for a specific match day
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param matchDay The match day number
 * @param token JWT token
 * @returns The fixtures for the match day
 */
export async function getFixturesByMatchDay(
  gameId: string, 
  season: number, 
  matchDay: number, 
  token: string
): Promise<Fixture[]> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season)
    .eq('match_day', matchDay)
    .eq('status', 'scheduled');
    
  if (error) {
    console.error('Error getting fixtures by match day:', error);
    throw new ApiError(500, 'Failed to get fixtures');
  }
  
  return data || [];
}

/**
 * Get all fixtures for a game season
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param token JWT token
 * @returns All fixtures for the season
 */
export async function getSeasonFixtures(
  gameId: string,
  season: number,
  token: string
): Promise<Fixture[]> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season);
    
  if (error) {
    console.error('Error getting season fixtures:', error);
    throw new ApiError(500, 'Failed to get season fixtures');
  }
  
  return data || [];
}

/**
 * Update a fixture with match result
 * 
 * @param fixtureId The fixture ID
 * @param updateData The data to update
 * @returns The updated fixture
 */
export async function updateFixture(
  fixtureId: string, 
  updateData: Partial<Fixture>
): Promise<Fixture> {
  const { data, error } = await supabaseAdmin
    .from('fixtures')
    .update(updateData)
    .eq('id', fixtureId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating fixture:', error);
    throw new ApiError(500, 'Failed to update fixture');
  }
  
  return data;
}

/**
 * Get team name from either teams or opponent_teams table
 * 
 * @param teamId The team ID
 * @param teamType The team type ('user' or 'opponent')
 * @param token JWT token
 * @returns The team name or undefined if not found
 */
export async function getTeamName(
  teamId: string, 
  teamType: 'user' | 'opponent', 
  token: string
): Promise<string | undefined> {
  const tableName = teamType === 'user' ? 'teams' : 'opponent_teams';
  
  const { data, error } = await createClientFromToken(token)
    .from(tableName)
    .select('name')
    .eq('id', teamId)
    .single();
    
  if (error) {
    console.error(`Error getting ${teamType} team name:`, error);
    return undefined;
  }
  
  return data?.name;
}

/**
 * Add a team to the next season
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param opponentTeamId The opponent team ID
 * @returns Whether the operation was successful
 */
export async function addTeamToNextSeason(
  gameId: string,
  nextSeason: number,
  opponentTeamId: string
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('season_opponent_teams')
    .insert({
      game_id: gameId,
      season: nextSeason,
      opponent_team_id: opponentTeamId
    });
    
  if (error) {
    console.error('Error adding team to next season:', error);
    return false;
  }
  
  return true;
}

/**
 * Get the fixtures between two teams
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param teamId1 The first team ID
 * @param teamId2 The second team ID
 * @param token JWT token
 * @returns Fixtures between the two teams
 */
export async function getFixturesBetweenTeams(
  gameId: string,
  season: number,
  teamId1: string,
  teamId2: string,
  token: string
): Promise<Fixture[]> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season)
    .or(`home_team_id.eq.${teamId1},away_team_id.eq.${teamId1}`)
    .or(`home_team_id.eq.${teamId2},away_team_id.eq.${teamId2}`);
    
  if (error) {
    console.error('Error getting fixtures between teams:', error);
    throw new ApiError(500, 'Failed to get fixtures between teams');
  }
  
  // Filter to only include fixtures between the two teams
  return (data || []).filter(fixture => 
    (fixture.home_team_id === teamId1 && fixture.away_team_id === teamId2) ||
    (fixture.home_team_id === teamId2 && fixture.away_team_id === teamId1)
  );
}
