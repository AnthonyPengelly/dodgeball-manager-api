import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { OpponentTeam } from '../types';
import { ApiError } from '../middleware/error.middleware';

/**
 * Get opponent teams by game ID
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns Array of opponent teams
 */
export async function getOpponentTeamsByGameId(gameId: string, token: string): Promise<OpponentTeam[]> {
  const { data, error } = await createClientFromToken(token)
    .from('opponent_teams')
    .select('*')
    .eq('game_id', gameId);
  
  if (error) {
    console.error('Error getting opponent teams:', error);
    throw new ApiError(500, 'Failed to get opponent teams');
  }
  
  return data as OpponentTeam[];
}

/**
 * Get opponent teams by IDs
 * 
 * @param teamIds Array of team IDs
 * @param token JWT token
 * @returns Array of opponent teams
 */
export async function getOpponentTeamsByIds(teamIds: string[], token: string): Promise<OpponentTeam[]> {
  if (teamIds.length === 0) {
    return [];
  }
  
  const { data, error } = await createClientFromToken(token)
    .from('opponent_teams')
    .select('*')
    .in('id', teamIds);
  
  if (error) {
    console.error('Error getting opponent teams by IDs:', error);
    throw new ApiError(500, 'Failed to get opponent teams');
  }
  
  return data as OpponentTeam[];
}

/**
 * Create opponent teams
 * 
 * @param teams Array of opponent team data
 * @returns Array of created opponent teams
 */
export async function createOpponentTeams(teams: Partial<OpponentTeam>[]): Promise<OpponentTeam[]> {
  const { data, error } = await supabaseAdmin
    .from('opponent_teams')
    .insert(teams)
    .select();
  
  if (error) {
    console.error('Error creating opponent teams:', error);
    throw new ApiError(500, 'Failed to create opponent teams');
  }
  
  return data as OpponentTeam[];
}

/**
 * Get season opponent teams
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param token JWT token
 * @returns Array of season opponent team entries
 */
export async function getSeasonOpponentTeams(gameId: string, season: number, token: string): Promise<any[]> {
  const { data, error } = await createClientFromToken(token)
    .from('season_opponent_teams')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season);
  
  if (error) {
    console.error('Error getting season opponent teams:', error);
    throw new ApiError(500, 'Failed to get season opponent teams');
  }
  
  return data;
}

/**
 * Create season opponent team entries
 * 
 * @param entries Array of season opponent team entries
 * @returns Whether the operation was successful
 */
export async function createSeasonOpponentTeams(entries: any[]): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('season_opponent_teams')
    .insert(entries);
  
  if (error) {
    console.error('Error creating season opponent teams:', error);
    return false;
  }
  
  return true;
}

/**
 * Get opponent team players
 * 
 * @param opponentTeamId The opponent team ID
 * @param season The season number
 * @param token JWT token
 * @returns Array of player IDs associated with the opponent team
 */
export async function getOpponentTeamPlayers(
  opponentTeamId: string, 
  season: number, 
  token: string
): Promise<string[]> {
  const { data, error } = await createClientFromToken(token)
    .from('opponent_team_players')
    .select('player_id')
    .eq('opponent_team_id', opponentTeamId)
    .eq('season', season);
  
  if (error) {
    console.error('Error getting opponent team players:', error);
    throw new ApiError(500, 'Failed to get opponent team players');
  }
  
  return data.map(item => item.player_id);
}

/**
 * Add player to opponent team
 * 
 * @param gameId The game ID
 * @param opponentTeamId The opponent team ID 
 * @param playerId The player ID
 * @param season The season number
 * @returns Whether the operation was successful
 */
export async function addPlayerToOpponentTeam(
  gameId: string,
  opponentTeamId: string,
  playerId: string,
  season: number
): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('opponent_team_players')
    .insert({
      game_id: gameId,
      opponent_team_id: opponentTeamId,
      player_id: playerId,
      season
    });
  
  if (error) {
    // If it's a uniqueness constraint error, that's ok (player already on team)
    if (error.code === '23505') {
      return true;
    }
    console.error('Error adding player to opponent team:', error);
    return false;
  }
  
  return true;
}

/**
 * Add multiple players to opponent team
 * 
 * @param gameId The game ID
 * @param opponentTeamId The opponent team ID
 * @param playerIds Array of player IDs
 * @param season The season number
 * @returns Whether the operation was successful
 */
export async function addPlayersToOpponentTeam(
  gameId: string,
  opponentTeamId: string,
  playerIds: string[],
  season: number
): Promise<boolean> {
  if (playerIds.length === 0) {
    return true;
  }
  
  const entries = playerIds.map(playerId => ({
    game_id: gameId,
    opponent_team_id: opponentTeamId,
    player_id: playerId,
    season
  }));
  
  const { error } = await supabaseAdmin
    .from('opponent_team_players')
    .insert(entries);
  
  if (error) {
    console.error('Error adding players to opponent team:', error);
    return false;
  }
  
  return true;
}

/**
 * Get opponent team with players
 * 
 * @param opponentTeamId The opponent team ID
 * @param season The season number
 * @param token JWT token
 * @returns Opponent team with detailed player information
 */
export async function getOpponentTeamWithPlayers(
  opponentTeamId: string,
  season: number,
  token: string
): Promise<any> {
  try {
    // Get the opponent team
    const { data: teamData, error: teamError } = await createClientFromToken(token)
      .from('opponent_teams')
      .select('*')
      .eq('id', opponentTeamId)
      .single();
    
    if (teamError) {
      console.error('Error getting opponent team:', teamError);
      throw new ApiError(500, 'Failed to get opponent team');
    }
    
    // Get the player IDs for this team
    const playerIds = await getOpponentTeamPlayers(opponentTeamId, season, token);
    
    // Get the detailed player information
    const { data: playersData, error: playersError } = await createClientFromToken(token)
      .from('players')
      .select('*')
      .in('id', playerIds);
    
    if (playersError) {
      console.error('Error getting players:', playersError);
      throw new ApiError(500, 'Failed to get players');
    }
    
    return {
      ...teamData,
      players: playersData
    };
  } catch (error) {
    console.error('Error in getOpponentTeamWithPlayers:', error);
    throw error;
  }
}
