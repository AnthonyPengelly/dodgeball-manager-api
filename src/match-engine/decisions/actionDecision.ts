import { TargetPriority } from '../../types';
import { MATCH_CONSTANTS } from '../../utils/constants';
import { BallStatus, DecisionContext, PlayerAction, PlayerDecision, PlayerState } from '../types';
import { onSameSideOfCourt, calculatePositionDistance } from '../utils/positionUtils';

/**
 * Makes a decision about what action a player should take on their turn
 * @param context Decision context including player, state, and game state
 * @returns The action to take
 */
export const makeActionDecision = (context: DecisionContext): PlayerDecision => {
  const { playerState, gameState, previousTurn } = context;
  
  // Always throw if possible
  if (playerState.ballId !== null) {
    const shouldThrow = Math.random() * 105 < playerState.throwing;
    if (shouldThrow) {
      return {
        action: PlayerAction.THROW,
        targetPlayerId: chooseThrowTarget(context)
      };
    }
    return { action: PlayerAction.PREPARE }
  }
  
  // Check if there are any free balls nearby
  const nearbyFreeBall = canPickUpBall(playerState.position, gameState.ballState);
  if (nearbyFreeBall) {
    return { action: PlayerAction.PICK_UP };
  }
  
  return { action: PlayerAction.PREPARE };
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

const chooseThrowTarget = (decisionContext: DecisionContext): string | undefined => {
  // Find all active players on the opposing team
  const potentialTargets = Object.entries(decisionContext.gameState.playerState)
    .filter(([_, state]) => 
      !state.eliminated && 
      state.isHome !== decisionContext.playerState.isHome
    )
    .map(([_, state]) => state);
  
  if (potentialTargets.length === 0) return;
  
  switch (decisionContext.playerState.target_priority) {
    case TargetPriority.HighestThreat:
      return bestThrower(potentialTargets).id;
    case TargetPriority.Nearest:
      return nearestTarget(potentialTargets, decisionContext.playerState.position).id;
    case TargetPriority.WeakestDefence:
      return weakestDefence(potentialTargets).id;
    case TargetPriority.Random:
    default:
      // For now, just pick a random target
      const randomIndex = Math.floor(Math.random() * potentialTargets.length);
      return potentialTargets[randomIndex].id;
  }
};

const bestThrower = (players: PlayerState[]): PlayerState => {
  return players.reduce((prev, current) => {
    return prev.throwing > current.throwing ? prev : current;
  });
};

const nearestTarget = (players: PlayerState[], position: number | null): PlayerState => {
  return players.reduce((prev, current) => {
    const prevDistance = calculatePositionDistance(prev.position, position);
    const currentDistance = calculatePositionDistance(current.position, position);
    return prevDistance !== null && currentDistance !== null ? prevDistance < currentDistance ? prev : current : prev;
  });
};

const weakestDefence = (players: PlayerState[]): PlayerState => {
  return players.reduce((prev, current) => {
    return calculateDefence(prev) < calculateDefence(current) ? prev : current;
  });
};

const calculateDefence = (player: PlayerState): number => {
  return player.catching > player.dodging ? player.catching : player.dodging;
};
  