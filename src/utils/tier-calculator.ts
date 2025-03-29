import { PlayerStats, PlayerPotentialStats } from '../types';

/**
 * Utility class for calculating player tiers based on their stats
 */
export class TierCalculator {
  /**
   * Calculate the tier of a player based on their stats
   * @param stats Player stats
   * @returns Player tier (1-5)
   */
  public static calculateTier(stats: PlayerStats): number {
    // Calculate the average of all stats
    const statValues = Object.values(stats);
    const sum = statValues.reduce((acc, val) => acc + val, 0);
    const average = sum / statValues.length;
    
    // Map the average to a tier (1-5)
    if (average >= 4.5) return 5; // Elite
    if (average >= 3.8) return 4; // Great
    if (average >= 3.0) return 3; // Good
    if (average >= 2.2) return 2; // Average
    return 1; // Below average
  }

  /**
   * Calculate player potential tier based on potential stats
   * @param potentialStats Player potential stats
   * @returns Player potential tier (1-5)
   */
  public static calculatePotentialTier(potentialStats: PlayerPotentialStats): number {
    // Calculate the average of all potential stats
    const statValues = Object.values(potentialStats);
    const sum = statValues.reduce((acc, val) => acc + val, 0);
    const average = sum / statValues.length;
    
    // Map the average to a tier (1-5)
    if (average >= 4.5) return 5; // Elite
    if (average >= 3.8) return 4; // Great
    if (average >= 3.0) return 3; // Good
    if (average >= 2.2) return 2; // Average
    return 1; // Below average
  }
}
