import { createClientFromToken, supabaseAdmin } from '../utils/supabase';
import { ApiError } from '../middleware/error.middleware';
import { Fixture } from '../types';

/**
 * Get a fixture by ID
 * 
 * @param fixtureId The fixture ID
 * @param token JWT token
 * @returns The fixture
 */
export async function getFixtureById(fixtureId: string, token: string): Promise<Fixture> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('id', fixtureId)
    .single();
    
  if (error) {
    console.error('Error getting fixture by ID:', error);
    throw new ApiError(404, 'Fixture not found');
  }
  
  return data;
}

/**
 * Get fixtures for a specific team
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param teamId The team ID
 * @param token JWT token
 * @returns The fixtures for the team
 */
export async function getTeamFixtures(
  gameId: string,
  season: number,
  teamId: string,
  token: string
): Promise<Fixture[]> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
    
  if (error) {
    console.error('Error getting team fixtures:', error);
    throw new ApiError(500, 'Failed to get team fixtures');
  }
  
  return data || [];
}

/**
 * Get all incomplete fixtures for a season
 * 
 * @param gameId The game ID
 * @param season The season number
 * @param token JWT token
 * @returns All incomplete fixtures
 */
export async function getIncompleteFixtures(
  gameId: string,
  season: number,
  token: string
): Promise<Fixture[]> {
  const { data, error } = await createClientFromToken(token)
    .from('fixtures')
    .select('*')
    .eq('game_id', gameId)
    .eq('season', season)
    .neq('status', 'completed');
    
  if (error) {
    console.error('Error getting incomplete fixtures:', error);
    throw new ApiError(500, 'Failed to get incomplete fixtures');
  }
  
  return data || [];
}

/**
 * Update multiple fixtures with a batch update
 * 
 * @param fixtures Array of fixtures to update
 * @returns Whether the operation was successful
 */
export async function updateFixtures(fixtures: Partial<Fixture>[]): Promise<boolean> {
  if (fixtures.length === 0) {
    return true;
  }

  // Ensure all fixtures have IDs
  if (fixtures.some(fixture => !fixture.id)) {
    throw new ApiError(400, 'All fixtures must have an ID');
  }
  
  const { error } = await supabaseAdmin
    .from('fixtures')
    .upsert(fixtures);
    
  if (error) {
    console.error('Error updating fixtures:', error);
    return false;
  }
  
  return true;
}

/**
 * Create a new fixture
 * 
 * @param fixture The fixture to create
 * @returns The created fixture
 */
export async function createFixture(fixture: Omit<Fixture, 'id' | 'created_at'>): Promise<Fixture> {
  const { data, error } = await supabaseAdmin
    .from('fixtures')
    .insert(fixture)
    .select()
    .single();
    
  if (error) {
    console.error('Error creating fixture:', error);
    throw new ApiError(500, 'Failed to create fixture');
  }
  
  return data;
}
