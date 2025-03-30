import { supabaseAdmin, createClientFromToken } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Game, TeamWithGame } from '../types';
import { GAME_STATUS, GAME_STAGE } from '../utils/constants';

/**
 * Get the current active game for a user
 * 
 * @param userId The user's ID
 * @param token JWT token
 * @returns The user's active game with team or null
 */
export async function getCurrentGameForUser(userId: string, token: string): Promise<TeamWithGame | null> {
  const supabaseClient = createClientFromToken(token);
  
  const { data: teams, error } = await supabaseClient
    .from('teams')
    .select(`
      id,
      name,
      games:game_id (
        id,
        season,
        match_day,
        status,
        game_stage
      )
    `)
    .eq('owner_id', userId)
    .not('games.status', 'eq', GAME_STATUS.COMPLETED)
    .order('created_at', { ascending: false })
    .limit(1);
  
  if (error) {
    console.error('Error getting teams with active games:', error);
    throw new Error('Failed to get current game');
  }
  
  // If no active game found, return null
  if (!teams || teams.length === 0 || !teams[0].games) {
    return null;
  }
  
  return teams[0] as TeamWithGame;
}

/**
 * Get a game by its ID
 * 
 * @param gameId The game ID
 * @param token JWT token
 * @returns The game or null if not found
 */
export async function getGameById(gameId: string, token: string): Promise<Game | null> {
  const { data, error } = await createClientFromToken(token)
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
  
  if (error) {
    console.error('Error getting game by ID:', error);
    return null;
  }
  
  return data as Game;
}

/**
 * Get a game by associated team ID
 * 
 * @param teamId The team ID
 * @param token JWT token
 * @returns The game or null if not found
 */
export async function getGameByTeamId(teamId: string, token: string): Promise<Game | null> {
  const { data, error } = await createClientFromToken(token)
    .from('games')
    .select('*, teams!inner(*)')
    .eq('teams.id', teamId)
    .single();
  
  if (error) {
    console.error('Error getting game by team ID:', error);
    return null;
  }
  
  return data as Game;
}

/**
 * Create a new game
 * 
 * @returns The created game
 */
export async function createGame(): Promise<Game> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .insert({
      season: 1,
      match_day: 0,
      status: GAME_STATUS.IN_PROGRESS,
      game_stage: GAME_STAGE.DRAFT
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating new game:', error);
    throw new Error('Failed to create new game');
  }
  
  return data as Game;
}

/**
 * Update a game's stage
 * 
 * @param gameId The game ID
 * @param gameStage The new game stage
 * @returns The updated game
 */
export async function updateGameStage(gameId: string, gameStage: string): Promise<Game> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .update({ game_stage: gameStage })
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating game stage:', error);
    throw new ApiError(500, 'Failed to update game stage');
  }
  
  return data as Game;
}

/**
 * Update a game's status
 * 
 * @param gameId The game ID
 * @param status The new status
 * @returns Whether the update was successful
 */
export async function updateGameStatus(gameId: string, status: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('games')
    .update({ status })
    .eq('id', gameId);
  
  if (error) {
    console.error('Error updating game status:', error);
    return false;
  }
  
  return true;
}

/**
 * Update a game with new data
 * 
 * @param gameId The game ID
 * @param gameData The updated game data
 * @returns The updated game
 */
export async function updateGame(gameId: string, gameData: Partial<Game>): Promise<Game> {
  const { data, error } = await supabaseAdmin
    .from('games')
    .update(gameData)
    .eq('id', gameId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating game:', error);
    throw new ApiError(500, 'Failed to update game');
  }
  
  return data as Game;
}

/**
 * Check if a game exists and belongs to a user
 * 
 * @param userId The user's ID
 * @param gameId The game ID
 * @param token JWT token
 * @returns The game with team or null if not found
 */
export async function getGameForUser(userId: string, gameId: string, token: string): Promise<TeamWithGame | null> {
  const supabaseClient = createClientFromToken(token);
  
  const { data: teams, error } = await supabaseClient
    .from('teams')
    .select(`
      id,
      games:game_id (
        id,
        status
      )
    `)
    .eq('owner_id', userId)
    .eq('game_id', gameId)
    .limit(1);
  
  if (error) {
    console.error('Error verifying game ownership:', error);
    throw new Error('Failed to verify game ownership');
  }
  
  if (!teams || teams.length === 0 || !teams[0].games) {
    return null;
  }
  
  return teams[0] as TeamWithGame;
}
