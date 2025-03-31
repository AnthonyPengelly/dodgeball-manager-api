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
  
  // All reaction options are always available
  const availableReactions = [
    PlayerReaction.CATCH,
    PlayerReaction.DODGE,
    PlayerReaction.BLOCK
  ];
  
  // For now, make a random choice
  // Future implementation would consider player stats, game situation, etc.
  // For example, players with high catching would prefer to catch, etc.
  return availableReactions[Math.floor(Math.random() * availableReactions.length)];
};
