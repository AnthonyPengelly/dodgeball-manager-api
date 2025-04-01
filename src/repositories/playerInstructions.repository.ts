import { createClientFromToken } from '../utils/supabase';
import { PlayerInstructions } from '../types';
import { ApiError } from '../middleware/error.middleware';

/**
 * Upsert multiple player instructions for a specific fixture
 * @param fixtureId The ID of the fixture
 * @param instructions Array of player instructions to upsert
 * @param token JWT token
 * @returns Upserted player instructions or error
 */
export const upsertPlayerInstructions = async (
  fixtureId: string, 
  instructions: Omit<PlayerInstructions, 'id' | 'created_at' | 'updated_at' | 'fixture_id'>[],
  token: string,
): Promise<boolean> => {
  // Prepare instructions with the shared fixture_id
  const preparedInstructions = instructions.map(instruction => ({
    ...instruction,
    fixture_id: fixtureId
  }));

  const { error } = await createClientFromToken(token)
    .from('player_instructions')
    .upsert(preparedInstructions, { 
      onConflict: 'fixture_id,player_id',
      defaultToNull: false
    });

  if (error) {
    console.error('Error saving player instructions:', error);
    throw new ApiError(500, 'Failed to save player instructions');
  }

  return true;
}

/**
 * Retrieve player instructions for a specific fixture
 * @param fixtureId The ID of the fixture
 * @param token JWT token
 * @returns Player instructions or error
 */
export const getPlayerInstructionsByFixtureId = async(
  gameId: string,
  fixtureId: string,
  token: string,
): Promise<PlayerInstructions[]> => {
  const { data, error } = await createClientFromToken(token)
    .from('player_instructions')
    .select(`
      *,
      fixtures:fixture_id (
        game_id
      )
    `)
    .eq('fixture_id', fixtureId)
    .eq('fixtures.game_id', gameId);

  if (error) {
    console.error('Error getting player instructions by fixture id:', error);
    throw new ApiError(500, 'Failed to get player instructions');
  }

  return data;
}
