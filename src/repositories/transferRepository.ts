import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Player, TransferListedPlayer } from '../types';

/**
 * Get transfer list for a game and season
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param token JWT token
 * @returns Array of transfer listed players with their player details
 */
export async function getTransferList(gameId: string, season: number, token: string): Promise<any[]> {
  const { data, error } = await createClientFromToken(token)
    .from('transfer_list')
    .select('*, players(*)')
    .eq('game_id', gameId)
    .eq('season', season);
  
  if (error) {
    console.error('Error fetching transfer list:', error);
    throw new ApiError(500, 'Failed to fetch transfer list');
  }
  
  return data || [];
}

/**
 * Delete transfer list entries for a game and season
 * 
 * @param gameId The game ID
 * @param season The season number
 * @returns Success status
 */
export async function clearTransferList(gameId: string, season: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('transfer_list')
    .delete()
    .eq('game_id', gameId)
    .eq('season', season);
  
  if (error) {
    console.error('Error clearing transfer list:', error);
    throw new ApiError(500, 'Failed to clear transfer list');
  }
  
  return true;
}

/**
 * Update transfer list entry season
 * 
 * @param playerId The player ID
 * @param gameId The game ID
 * @param season The new season number
 * @returns Success status
 */
export async function updateTransferListSeason(playerId: string, gameId: string, season: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('transfer_list')
    .update({ season })
    .eq('player_id', playerId)
    .eq('game_id', gameId);
  
  if (error) {
    console.error('Error updating transfer listed player season:', error);
    throw new ApiError(500, 'Failed to update transfer listed player season');
  }
  
  return true;
}

/**
 * Add players to transfer list
 * 
 * @param transferEntries Array of transfer list entries
 * @returns Success status
 */
export async function addPlayersToTransferList(transferEntries: { game_id: string; player_id: string; season: number }[]): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('transfer_list')
    .insert(transferEntries);
  
  if (error) {
    console.error('Error adding players to transfer list:', error);
    throw new ApiError(500, 'Failed to add players to transfer list');
  }
  
  return true;
}

/**
 * Get a player from the transfer list
 * 
 * @param playerId The player ID
 * @param gameId The game ID
 * @param token JWT token
 * @returns The transfer item with player details or null if not found
 */
export async function getTransferListPlayer(playerId: string, gameId: string, token: string): Promise<any | null> {
  const { data, error } = await createClientFromToken(token)
    .from('transfer_list')
    .select('*, players(*)')
    .eq('player_id', playerId)
    .eq('game_id', gameId)
    .single();
  
  if (error) {
    console.error('Error fetching transfer player:', error);
    return null;
  }
  
  return data;
}

/**
 * Remove a player from transfer list
 * 
 * @param playerId The player ID
 * @returns Success status
 */
export async function removePlayerFromTransferList(playerId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('transfer_list')
    .delete()
    .eq('player_id', playerId);
  
  if (error) {
    console.error('Error removing player from transfer list:', error);
    throw new ApiError(500, 'Failed to update transfer list');
  }
  
  return true;
}

/**
 * Get previous transfer list
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param token JWT token
 * @returns Array of transfer listed players with their player details
 */
export async function getPreviousTransferList(gameId: string, season: number, token: string): Promise<any[]> {
  const { data, error } = await createClientFromToken(token)
    .from('transfer_list')
    .select('*, players(*)')
    .eq('game_id', gameId)
    .eq('season', season - 1);
  
  if (error) {
    console.error('Error fetching previous transfer list:', error);
    throw new ApiError(500, 'Failed to fetch previous transfer list');
  }
  
  return data || [];
}
