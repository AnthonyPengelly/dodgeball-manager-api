import { GameState, MatchPlayer } from '../types';

/**
 * Resolves the outcome of a player's action (throwing)
 * @param actor The player performing the action
 * @param target The target player
 * @param gameState Current game state
 * @returns Result of the action
 */
export const resolveAction = (
  actor: MatchPlayer, 
  target: MatchPlayer, 
  gameState: GameState
): { result: 'hit' | 'miss' | 'caught' | 'blocked' } => {
  // For throwing actions, compare player stats with random modifiers
  // The larger of the actor's throwing vs target's reaction stat, plus a random modifier
  
  // Base stat for throw effectiveness
  const throwEffectiveness = actor.throwing + (Math.random() * 4 - 2); // Random -2 to +2
  
  // Target's reaction effectiveness (based on what they chose)
  // We'll determine this in the reaction resolver
  
  // For now, randomly determine result based on throwing effectiveness
  const randomValue = Math.random();
  
  // todo Change to use stats
  if (randomValue < 0.3) {
    return { result: 'hit' };
  } else if (randomValue < 0.5) { 
    return { result: 'caught' };
  } else if (randomValue < 0.7) {
    return { result: 'blocked' };
  } else {
    return { result: 'miss' };
  }
};
