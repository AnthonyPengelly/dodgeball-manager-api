import { MatchPlayer } from '../types';

/**
 * Determines the order of player turns based on speed stats
 * Includes random modifiers to vary the order slightly each round
 * 
 * @param players Array of active players
 * @returns Array of player IDs in turn order
 */
export const determineTurnOrder = (players: MatchPlayer[]): string[] => {
  // Calculate effective speed for each player (base speed + random modifier)
  const playersWithSpeed = players.map(player => ({
    id: player.id,
    // Add random modifier between -2.5 and +2.5
    effectiveSpeed: player.speed + (Math.random() * 5 - 1.5)
  }));
  
  // Sort players by effective speed (descending)
  playersWithSpeed.sort((a, b) => b.effectiveSpeed - a.effectiveSpeed);
  
  // Return just the player IDs in order
  return playersWithSpeed.map(player => player.id);
};
