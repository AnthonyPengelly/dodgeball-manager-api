import { MATCH_CONSTANTS } from '../../utils/constants';

/**
 * Check if two positions are on the same side of the court
 */
export const onSameSideOfCourt = (position1: number, position2: number): boolean => {
  return (position1 < MATCH_CONSTANTS.PLAYERS_PER_TEAM && position2 < MATCH_CONSTANTS.PLAYERS_PER_TEAM) || 
         (position1 >= MATCH_CONSTANTS.PLAYERS_PER_TEAM && position2 >= MATCH_CONSTANTS.PLAYERS_PER_TEAM);
};

/**
 * Calculate the distance between two positions on the court
 * Returns null if positions are on opposite sides of the court
 */
export const calculatePositionDistance = (position1: number | null, position2: number | null): number | null => {
  if (position1 === null || position2 === null) return null;
  // Use modulo as when balls are in initial state, they are set to the home team
  return Math.abs(position1 % MATCH_CONSTANTS.PLAYERS_PER_TEAM - position2 % MATCH_CONSTANTS.PLAYERS_PER_TEAM);
};
