import { DecisionContext, PlayerReaction } from '../types';

/**
 * Determines how a player should react when being thrown at
 * Currently randomized, but structured for future enhancement
 * 
 * @param context All information needed to make a decision
 * @returns The reaction the player will take
 */
export const makeReactionDecision = (context: DecisionContext): PlayerReaction => {
  const { playerState, gameState: match, previousTurn } = context;
  
  if (playerState.ballId !== null) {
    return PlayerReaction.BLOCK;
  }
  
  return Math.random() * 100 < playerState.catch_aggression ? PlayerReaction.CATCH : PlayerReaction.DODGE;
};
