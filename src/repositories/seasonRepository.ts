import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Season } from '../types';
import { ApiError } from '../middleware/error.middleware';

/**
 * Get the current season for a game
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns The current season or null if not found
 */
export async function getCurrentSeason(gameId: string, token: string): Promise<Season | null> {
  const { data, error } = await createClientFromToken(token)
    .from('seasons')
    .select('*')
    .eq('game_id', gameId)
    .order('season_number', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error getting current season:', error);
    return null;
  }
  
  return data as Season;
}

/**
 * Create a new season
 * 
 * @param seasonData The season data
 * @returns The created season
 */
export async function createSeason(seasonData: Partial<Season>): Promise<Season> {
  const { data, error } = await supabaseAdmin
    .from('seasons')
    .insert(seasonData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating season:', error);
    throw new ApiError(500, 'Failed to create season');
  }
  
  return data as Season;
}

/**
 * Update a season
 * 
 * @param seasonId The season ID
 * @param updates The updates to apply
 * @returns The updated season
 */
export async function updateSeason(seasonId: string, updates: Partial<Season>): Promise<Season> {
  const { data, error } = await supabaseAdmin
    .from('seasons')
    .update(updates)
    .eq('id', seasonId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating season:', error);
    throw new ApiError(500, 'Failed to update season');
  }
  
  return data as Season;
}

/**
 * Get a season by team ID and season number
 * 
 * @param teamId The team ID
 * @param gameId The game ID
 * @param seasonNumber The season number
 * @param token JWT token
 * @returns The season or null if not found
 */
export async function getSeasonByTeamAndNumber(
  teamId: string, 
  gameId: string, 
  seasonNumber: number, 
  token: string
): Promise<Season | null> {
  const { data, error } = await createClientFromToken(token)
    .from('seasons')
    .select('*')
    .eq('team_id', teamId)
    .eq('game_id', gameId)
    .eq('season_number', seasonNumber)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error getting season by team and number:', error);
    }
    return null;
  }
  
  return data as Season;
}

/**
 * Get a season by ID
 * 
 * @param seasonId The season ID
 * @returns The season or null if not found
 */
export async function getSeasonById(seasonId: string): Promise<Season | null> {
  const { data, error } = await supabaseAdmin
    .from('seasons')
    .select('*')
    .eq('id', seasonId)
    .single();
  
  if (error) {
    console.error('Error getting season by ID:', error);
    return null;
  }
  
  return data as Season;
}

/**
 * Update the training credits used for a season
 * 
 * @param seasonId The season ID
 * @param creditsUsed Additional credits to use
 * @returns The updated season
 */
export async function updateTrainingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
  // Get current season data
  const { data: currentSeason, error: getError } = await supabaseAdmin
    .from('seasons')
    .select('training_credits_used')
    .eq('id', seasonId)
    .single();
  
  if (getError) {
    console.error('Error getting season for training credits update:', getError);
    throw new ApiError(404, 'Season not found');
  }
  
  // Calculate new credits used
  const newCreditsUsed = (currentSeason.training_credits_used || 0) + creditsUsed;
  
  // Update the season
  return await updateSeason(seasonId, { training_credits_used: newCreditsUsed });
}

/**
 * Update the scouting credits used for a season
 * 
 * @param seasonId The season ID
 * @param creditsUsed Additional credits to use
 * @returns The updated season
 */
export async function updateScoutingCreditsUsed(seasonId: string, creditsUsed: number = 1): Promise<Season> {
  // Get current season data
  const { data: currentSeason, error: getError } = await supabaseAdmin
    .from('seasons')
    .select('scouting_credits_used')
    .eq('id', seasonId)
    .single();
  
  if (getError) {
    console.error('Error getting season for scouting credits update:', getError);
    throw new ApiError(404, 'Season not found');
  }
  
  // Calculate new credits used
  const newCreditsUsed = (currentSeason.scouting_credits_used || 0) + creditsUsed;
  
  // Update the season
  return await updateSeason(seasonId, { scouting_credits_used: newCreditsUsed });
}

