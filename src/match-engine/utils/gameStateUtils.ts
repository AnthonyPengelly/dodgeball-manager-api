import { BallStatus, GameState, PlayerState } from '../types';
import { onSameSideOfCourt, calculatePositionDistance } from './positionUtils';

/**
 * Count the number of active (non-eliminated) players for a team
 */
export const countActivePlayers = (isHome: boolean, gameState: Readonly<GameState>): number => {
  return Object.entries(gameState.playerState)
    .filter(([_, state]) => 
      !state.eliminated && 
      (isHome === state.isHome)
    )
    .length;
};

/**
 * Check if the game is complete (one team has no active players)
 */
export const isGameComplete = (gameState: Readonly<GameState>): boolean => {
  const homePlayersRemaining = countActivePlayers(true, gameState);
  const awayPlayersRemaining = countActivePlayers(false, gameState);
  
  return homePlayersRemaining === 0 || awayPlayersRemaining === 0;
};

/**
 * Find a player by ID
 */
export const findPlayerById = (playerId: string, gameState: Readonly<GameState>): PlayerState | null => {
  const player = gameState.playerState[playerId];
  if (!player) return null;
  return player;
};

/**
 * Find the nearest free ball to a player's position
 */
export const findNearestFreeBall = (playerPosition: number | null, gameState: Readonly<GameState>): number | null => {
  if (playerPosition === null) return null;
  
  // Find all free balls on court side, or balls still in the initial state (on either side as this means the middle)
  const freeBalls = Object.entries(gameState.ballState)
    .filter(([_, state]) => 
      state.position !== null && 
      ((state.status === BallStatus.FREE && 
      onSameSideOfCourt(playerPosition, state.position)) || 
      (state.status === BallStatus.INITIAL))
    )
    .map(([id, state]) => ({
      id: parseInt(id),
      position: state.position as number
    }));
  
  if (freeBalls.length === 0) return null;
  
  // Calculate distance to each ball
  const ballWithDistances = freeBalls.map(ball => ({
    id: ball.id,
    position: ball.position,
    distance: calculatePositionDistance(playerPosition, ball.position)
  }));
  
  // Sort by distance (ascending)
  const sortedBalls = ballWithDistances
    .filter(b => b.distance !== null)
    .sort((a, b) => a.distance! - b.distance!);
  
  return sortedBalls.length > 0 ? sortedBalls[0].id : null;
};
