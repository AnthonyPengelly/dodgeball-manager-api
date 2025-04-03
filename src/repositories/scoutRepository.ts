import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ScoutedPlayer } from '../types';
import { ApiError } from '../middleware/error.middleware';

/**
 * Get scouted players for a specific season
 * 
 * @param seasonId The season ID
 * @param token JWT token
 * @returns Array of scouted players for the season
 */
export async function getScoutedPlayersForSeason(seasonId: string, token: string): Promise<ScoutedPlayer[]> {
  const { data, error } = await createClientFromToken(token)
    .from('scouted_players')
    .select(`
      *,
      player:player_id (*),
      season:season_id (team_id)
    `)
    .eq('season_id', seasonId);
  
  if (error) {
    console.error('Error fetching scouted players:', error);
    return [];
  }
  
  return data as ScoutedPlayer[];
}

/**
 * Get and validate a scouted player
 * 
 * @param scoutedPlayerId The scouted player ID
 * @param teamId The team ID
 * @param token JWT token
 * @returns The validated scouted player or throws an ApiError
 */
export async function getAndValidateScoutedPlayer(
  scoutedPlayerId: string, 
  teamId: string, 
  token: string
): Promise<ScoutedPlayer & { player_id: string }> {
  const { data: scoutedPlayer, error: scoutedError } = await createClientFromToken(token)
    .from('scouted_players')
    .select(`
      *,
      player:player_id (*),
      season:season_id (team_id)
    `)
    .eq('id', scoutedPlayerId)
    .single();
  
  if (scoutedError || !scoutedPlayer) {
    console.error('Error getting scouted player:', scoutedError);
    throw new ApiError(404, 'Scouted player not found');
  }
  
  // Verify the season belongs to this team
  if (scoutedPlayer.season.team_id !== teamId) {
    throw new ApiError(403, 'This scouted player does not belong to your team');
  }
  
  // Check if player is already purchased
  if (scoutedPlayer.is_purchased) {
    throw new ApiError(400, 'This player has already been purchased');
  }
  
  return scoutedPlayer as ScoutedPlayer & { player_id: string };
}

/**
 * Update a scouted player
 * 
 * @param scoutedPlayerId The scouted player ID
 * @param updates The updates to apply
 * @returns Success status
 */
export async function updateScoutedPlayer(
  scoutedPlayerId: string, 
  updates: Partial<ScoutedPlayer>
): Promise<{ success: boolean }> {
  const { error } = await supabaseAdmin
    .from('scouted_players')
    .update(updates)
    .eq('id', scoutedPlayerId);
    
  if (error) {
    console.error('Error updating scouted player:', error);
    return { success: false };
  }
  
  return { success: true };
}
