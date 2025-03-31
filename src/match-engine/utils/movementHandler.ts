import { BallStatus, GameState, MatchPlayer, PlayerState } from '../types';
import { onSameSideOfCourt } from './positionUtils';

/**
 * Handles player movement during a turn
 * Players move towards free balls, but cannot occupy the same position
 * Movement is limited to 2 positions per turn
 * 
 * @param player The player moving
 * @param playerState Current player state
 * @param gameState Current game state
 * @returns The new position or null if no movement
 */
export const processMovement = (
  player: MatchPlayer,
  playerState: PlayerState,
  gameState: GameState
): number | null => {
  // Cannot move if eliminated
  if (playerState.eliminated || playerState.position === null) {
    return null;
  }
  
  // Determine which positions are on the player's side
  const isHome = player.isHome;
  const teamPositions = isHome ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  
  // Find occupied positions
  const occupiedPositions = Object.values(gameState.playerState)
    .filter(state => !state.eliminated && state.position !== null)
    .map(state => state.position as number);
  
  // Find available positions (unoccupied and on player's side)
  const availablePositions = teamPositions.filter(
    pos => !occupiedPositions.includes(pos) || pos === playerState.position
  );
  
  // If player already has a ball, they might want to move to a better position
  if (playerState.ballId !== null) {
    // For simplicity, stay in place when you have a ball
    return playerState.position;
  }
  
  // Find free balls on the player's side
  const freeBalls = Object.entries(gameState.ballState)
    .filter(([_, state]) => 
      state.status === BallStatus.FREE && 
      state.position !== null && 
      teamPositions.includes(state.position) &&
      onSameSideOfCourt(playerState.position!, state.position)
    )
    .map(([_, state]) => state.position as number);
  
  if (freeBalls.length === 0) {
    // No free balls on this side, stay in place
    return playerState.position;
  }
  
  // Calculate distance to each free ball
  // At this point we know playerState.position is not null because of the check at the beginning
  const currentPosition = playerState.position as number; // Safe assertion
  const ballDistances = freeBalls.map(ballPos => ({
    position: ballPos,
    distance: Math.abs(ballPos - currentPosition)
  }));
  
  // Sort by distance (ascending)
  ballDistances.sort((a, b) => a.distance - b.distance);
  
  // Target the closest ball
  const targetBallPosition = ballDistances[0].position;
  
  // Calculate possible positions to move toward the ball (limited by 2 steps)
  const currentPosIndex = teamPositions.indexOf(currentPosition);
  const targetPosIndex = teamPositions.indexOf(targetBallPosition);
  
  // Direction of movement
  const moveDirection = currentPosIndex < targetPosIndex ? 1 : -1;
  
  // Maximum 2 steps in the correct direction
  const maxSteps = Math.min(2, Math.abs(currentPosIndex - targetPosIndex));
  
  // Try each step size starting from largest
  for (let steps = maxSteps; steps > 0; steps--) {
    const newPosIndex = currentPosIndex + (steps * moveDirection);
    
    // Make sure it's within bounds
    if (newPosIndex >= 0 && newPosIndex < teamPositions.length) {
      const newPosition = teamPositions[newPosIndex];
      
      // Check if position is available
      if (availablePositions.includes(newPosition)) {
        return newPosition;
      }
    }
  }
  
  // Cannot move closer to the ball, stay in place
  return currentPosition;
};
