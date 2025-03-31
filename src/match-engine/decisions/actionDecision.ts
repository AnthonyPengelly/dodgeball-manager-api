import { MATCH_CONSTANTS } from '../../utils/constants';
import { BallStatus, DecisionContext, PlayerAction } from '../types';
import { onSameSideOfCourt, calculatePositionDistance } from '../utils/positionUtils';

/**
 * Makes a decision about what action a player should take on their turn
 * @param context Decision context including player, state, and game state
 * @returns The action to take
 */
export const makeActionDecision = (context: DecisionContext): PlayerAction => {
  const { playerState, gameState, previousTurn } = context;
  
  // Available actions based on current state
  const availableActions: PlayerAction[] = [];
  
  // Always throw if possible
  if (playerState.ballId !== null) {
    return PlayerAction.THROW;
  }
  
  // Player can always prepare (dodge/catch bonus)
  availableActions.push(PlayerAction.PREPARE);
  
  // Check if there are any free balls nearby
  const nearbyFreeBall = canPickUpBall(playerState.position, gameState.ballState);
  if (nearbyFreeBall) {
    availableActions.push(PlayerAction.PICK_UP);
  }
  
  // For now, make a random choice
  // Future implementation would consider player stats, game situation, etc.
  return availableActions[Math.floor(Math.random() * availableActions.length)];
};

/**
 * Checks if a player can pick up a ball based on their position
 */
const canPickUpBall = (position: number | null, ballState: Record<number, { status: string, position: number | null }>): boolean => {
  if (position === null) return false;
  
  // Check if there's a free ball within pickup distance
  return Object.values(ballState).some(ball => {
    if (ball.status === BallStatus.HELD || ball.position === null) return false;
    
    if (ball.status === BallStatus.FREE && !onSameSideOfCourt(position, ball.position)) return false;
    
    const distance = calculatePositionDistance(position, ball.position);
    return distance !== null && distance <= MATCH_CONSTANTS.MAX_PICK_UP_DISTANCE;
  });
};
