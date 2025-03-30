import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Team } from '../types';

/**
 * Get a team by its ID
 * 
 * @param teamId The team ID
 * @param token JWT token
 * @returns The team or null if not found
 */
export async function getTeamById(teamId: string, token: string): Promise<Team | null> {
  const { data, error } = await createClientFromToken(token)
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();
  
  if (error) {
    console.error('Error getting team by ID:', error);
    return null;
  }
  
  return data as Team;
}

/**
 * Get a team by game ID
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns The team or null if not found
 */
export async function getTeamByGameId(gameId: string, token: string): Promise<Team | null> {
  const { data, error } = await createClientFromToken(token)
    .from('teams')
    .select('*')
    .eq('game_id', gameId)
    .single();
  
  if (error) {
    console.error('Error getting team by game ID:', error);
    return null;
  }
  
  return data as Team;
}

/**
 * Create a new team
 * 
 * @param teamData The team data
 * @param token JWT token
 * @returns The created team
 */
export async function createTeam(teamData: {
  name: string;
  owner_id: string;
  game_id: string;
  stadium_size?: number;
  training_facility_level?: number;
  scout_level?: number;
  budget?: number;
}, token: string): Promise<Team> {
  const supabaseClient = createClientFromToken(token);
  
  const { data, error } = await supabaseClient
    .from('teams')
    .insert({
      name: teamData.name,
      owner_id: teamData.owner_id,
      game_id: teamData.game_id,
      stadium_size: teamData.stadium_size || 1,
      training_facility_level: teamData.training_facility_level || 1,
      scout_level: teamData.scout_level || 1,
      budget: teamData.budget || 100
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating new team:', error);
    throw new Error('Failed to create new team');
  }
  
  return data as Team;
}

/**
 * Update a team
 * 
 * @param teamId The team ID
 * @param updates The updates to apply
 * @returns The updated team
 */
export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<Team> {
  const { data, error } = await supabaseAdmin
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating team:', error);
    throw new ApiError(500, 'Failed to update team');
  }
  
  return data as Team;
}

/**
 * Update team budget
 * 
 * @param teamId The team ID
 * @param newBudget The new budget amount
 * @returns The updated team
 */
export async function updateTeamBudget(teamId: string, newBudget: number): Promise<Team> {
  return updateTeam(teamId, { budget: newBudget });
}

/**
 * Get team with game information
 * 
 * @param teamId The team ID
 * @param token JWT token
 * @returns The team with game information or null if not found
 */
export async function getTeamWithGameInfo(teamId: string, token: string): Promise<any | null> {
  const { data, error } = await createClientFromToken(token)
    .from('teams')
    .select(`
      *,
      games:game_id (
        id,
        season,
        game_stage
      )
    `)
    .eq('id', teamId)
    .single();
  
  if (error) {
    console.error('Error getting team with game info:', error);
    return null;
  }
  
  return data;
}

