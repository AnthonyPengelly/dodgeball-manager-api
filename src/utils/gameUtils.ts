import { CurrentGameResponse } from '../models/GameModels';
import { Game, TeamWithGame } from '../types';

/**
 * Format game data with team information into the standard response format
 * 
 * @param team Team with game data
 * @returns Formatted game response
 */
export function formatGameResponse(team: TeamWithGame): CurrentGameResponse {
  // Handle the joined game data - Supabase might return an array or a single object
  const gameData = team.games;
  const game: Game = Array.isArray(gameData) ? gameData[0] : gameData;
  
  return {
    game_id: game.id,
    game_season: game.season,
    game_match_day: game.match_day,
    game_status: game.status,
    game_stage: game.game_stage,
    team_id: team.id,
    team_name: team.name
  };
}

/**
 * Validate that a game is in the expected stage
 * 
 * @param game The game to validate
 * @param expectedStage The expected game stage
 * @returns True if game is in expected stage, false otherwise
 */
export function isGameInStage(game: Game, expectedStage: string): boolean {
  return game.game_stage === expectedStage;
}
