import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { Player, PlayerStatus, ScoutedPlayer } from '../types';
import { ApiError } from '../middleware/error.middleware';
import { PLAYER_STATUS } from '../utils/constants';

/**
 * Insert multiple players into the database
 * 
 * @param players Array of player data to insert
 * @returns Array of created players
 */
export async function createPlayers(players: Partial<Player>[]): Promise<Player[]> {
  const { data, error } = await supabaseAdmin
    .from('players')
    .insert(players)
    .select('*');
  
  if (error) {
    console.error('Error creating players:', error);
    throw new Error('Failed to create players');
  }
  
  return data as Player[];
}

/**
 * Get all draft players for a game
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns Array of players
 */
export async function getDraftPlayersByGameId(gameId: string, token: string): Promise<Player[]> {
  const { data, error } = await createClientFromToken(token)
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('status', 'draft')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error getting draft players:', error);
    throw new Error('Failed to get draft players');
  }
  
  return data as Player[];
}

/**
 * Get a player by ID
 * 
 * @param playerId The player ID
 * @param token JWT token
 * @returns The player or null if not found
 */
export async function getPlayerById(playerId: string, token: string): Promise<Player | null> {
  const { data, error } = await createClientFromToken(token)
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();
  
  if (error) {
    console.error('Error getting player by ID:', error);
    return null;
  }
  
  return data as Player;
}

/**
 * Get all players for a team
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns Array of players
 */
export async function getTeamPlayers(gameId: string, token: string): Promise<Player[]> {
  const { data, error } = await createClientFromToken(token)
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .eq('status', PLAYER_STATUS.TEAM)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error getting team players:', error);
    throw new Error('Failed to get team players');
  }
  
  return data as Player[];
}

/**
 * Update multiple players
 * 
 * @param players Array of player updates with IDs
 * @returns Whether the update was successful
 */
export async function updatePlayers(players: Partial<Player>[]): Promise<boolean> {
  // Create a transaction to update all players
  const updates = players.map(player => {
    if (!player.id) {
      throw new Error('Player ID is required for updates');
    }
    
    const { id, ...updates } = player;
    
    return supabaseAdmin
      .from('players')
      .update(updates)
      .eq('id', id);
  });
  
  try {
    await Promise.all(updates);
    return true;
  } catch (error) {
    console.error('Error updating players:', error);
    return false;
  }
}

/**
 * Update a single player
 * 
 * @param playerId The player ID
 * @param updates The updates to apply
 * @returns Whether the update was successful
 */
export async function updatePlayer(playerId: string, updates: Partial<Player>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('players')
    .update(updates)
    .eq('id', playerId);
  
  if (error) {
    console.error('Error updating player:', error);
    return false;
  }
  
  return true;
}

/**
 * Get scouted players for a game
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns Array of scouted players
 */
export async function getScoutedPlayersByGameId(gameId: string, token: string): Promise<ScoutedPlayer[]> {
  const { data, error } = await createClientFromToken(token)
    .from('scouted_players')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error getting scouted players:', error);
    throw new Error('Failed to get scouted players');
  }
  
  return data as ScoutedPlayer[];
}

/**
 * Create a scouted player
 * 
 * @param scoutedPlayer The scouted player data
 * @returns The created scouted player ID
 */
export async function createScoutedPlayer(scoutedPlayer: Partial<ScoutedPlayer>): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('scouted_players')
    .insert(scoutedPlayer)
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating scouted player:', error);
    throw new Error('Failed to create scouted player');
  }
  
  return data.id;
}

/**
 * Get a scouted player by ID
 * 
 * @param scoutedPlayerId The scouted player ID
 * @param token JWT token
 * @returns The scouted player or null if not found
 */
export async function getScoutedPlayerById(scoutedPlayerId: string, token: string): Promise<ScoutedPlayer | null> {
  const { data, error } = await createClientFromToken(token)
    .from('scouted_players')
    .select('*')
    .eq('id', scoutedPlayerId)
    .single();
  
  if (error) {
    console.error('Error getting scouted player by ID:', error);
    return null;
  }
  
  return data as ScoutedPlayer;
}

/**
 * Delete a scouted player
 * 
 * @param scoutedPlayerId The scouted player ID
 * @returns Whether the deletion was successful
 */
export async function deleteScoutedPlayer(scoutedPlayerId: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('scouted_players')
    .delete()
    .eq('id', scoutedPlayerId);
  
  if (error) {
    console.error('Error deleting scouted player:', error);
    return false;
  }
  
  return true;
}
