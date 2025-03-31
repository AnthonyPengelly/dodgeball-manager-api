import { GameState, MatchPlayer, PlayerReaction } from '../types';

/**
 * Resolves the outcome of a player's reaction
 * @param reactor The player reacting
 * @param reaction The type of reaction
 * @param thrower The player who threw the ball
 * @param gameState Current game state
 * @returns Success of the reaction
 */
export const resolveReaction = (
  reactor: MatchPlayer,
  reaction: PlayerReaction,
  thrower: MatchPlayer,
  gameState: GameState
): boolean => {
  // Get the appropriate stat for the reaction type
  let reactionStat = 0;
  switch (reaction) {
    case PlayerReaction.CATCH:
      reactionStat = reactor.catching;
      break;
    case PlayerReaction.DODGE:
      reactionStat = reactor.dodging;
      break;
    case PlayerReaction.BLOCK:
      reactionStat = reactor.blocking;
      break;
  }
  
  // Add random modifier (-3 to +3)
  const reactionEffectiveness = reactionStat + (Math.random() * 6 - 3);
  
  // Compare against thrower's throwing stat
  const throwEffectiveness = thrower.throwing + (Math.random() * 6 - 3);
  
  // If reaction is higher, the reaction succeeds
  return reactionEffectiveness > throwEffectiveness;
};
