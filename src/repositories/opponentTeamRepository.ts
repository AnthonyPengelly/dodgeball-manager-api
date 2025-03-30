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
