import { ActionResult, GameState, MatchPlayer, PlayerReaction } from '../types';

/**
 * Resolves the outcome of a player's action (throwing)
 * @param actor The player performing the action
 * @param target The target player
 * @param gameState Current game state
 * @returns Result of the action
 */
export const resolveAction = (
  reaction: PlayerReaction,
  actor: MatchPlayer, 
  target: MatchPlayer, 
  gameState: GameState
): { result: ActionResult } => {
  // For throwing actions, compare player stats with random modifiers
  // The larger of the actor's throwing vs target's reaction stat, plus a random modifier
  
  // Base stat for throw effectiveness
  const throwEffectiveness = actor.throwing + (Math.random() * 2 - 1); // Random -1 to +1
  const reactionEffectiveness = getBaseReactionEffectiveness(reaction, target) + (Math.random() * 2 - 1); // Random -1 to +1
  
  if (throwEffectiveness > reactionEffectiveness) {
    return { result: ActionResult.HIT };
  }
  
  switch (reaction) {
    case PlayerReaction.CATCH:
      return { result: ActionResult.CAUGHT };
    case PlayerReaction.DODGE:
      return { result: ActionResult.MISS };
    case PlayerReaction.BLOCK:
      return { result: ActionResult.BLOCKED };
  }
  return { result: ActionResult.MISS };
};

const getBaseReactionEffectiveness = (reaction: PlayerReaction, target: MatchPlayer): number => {
  switch (reaction) {
    case PlayerReaction.CATCH:
      return target.catching;
    case PlayerReaction.DODGE:
      return target.dodging;
    case PlayerReaction.BLOCK:
      return target.blocking;
  }
  return 0;
};