import { PlayerStats, PlayerPotentialStats } from '../types';
import { NameGenerator } from './name-generator';
import { TierCalculator } from './tier-calculator';

/**
 * Utility class for generating players with random stats and calculating player tiers
 */
export class PlayerGenerator {
  /**
   * Generate a random integer between min and max (inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns Random integer
   */
  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random player name
   * @returns Random player name
   */
  private static generatePlayerName(): string {
    return NameGenerator.generateName();
  }

  /**
   * Generate random player stats
   * @returns PlayerStats object with random values
   */
  private static generatePlayerStats(): PlayerStats {
    // Generate stats with normal distribution (bell curve)
    // Most players will have average stats (3), with fewer having very low (1) or very high (5) stats
    return {
      throwing: this.getRandomInt(1, 5),
      catching: this.getRandomInt(1, 5),
      dodging: this.getRandomInt(1, 5),
      blocking: this.getRandomInt(1, 5),
      speed: this.getRandomInt(1, 5),
      positional_sense: this.getRandomInt(1, 5),
      teamwork: this.getRandomInt(1, 5),
      clutch_factor: this.getRandomInt(1, 5)
    };
  }

  /**
   * Generate potential stats based on current stats
   * @param stats Current player stats
   * @returns PlayerPotentialStats object with potential values
   */
  public static generatePlayerPotentialStats(currentStats: PlayerStats): PlayerPotentialStats {
    return {
      throwing_potential: this.getRandomInt(currentStats.throwing, 5),
      catching_potential: this.getRandomInt(currentStats.catching, 5),
      dodging_potential: this.getRandomInt(currentStats.dodging, 5),
      blocking_potential: this.getRandomInt(currentStats.blocking, 5),
      speed_potential: this.getRandomInt(currentStats.speed, 5),
      positional_sense_potential: this.getRandomInt(currentStats.positional_sense, 5),
      teamwork_potential: this.getRandomInt(currentStats.teamwork, 5),
      clutch_factor_potential: this.getRandomInt(currentStats.clutch_factor, 5)
    };
  }

  /**
   * Generate a player with random stats and a name
   * @param exactTier The exact tier to generate (if specified)
   * @param minTier Minimum tier for the player (1-5)
   * @param maxTier Maximum tier for the player (1-5)
   * @returns Object with player name, stats, potential stats, tier, and potential tier
   */
  public static generatePlayer(exactTier?: number, minTier: number = 1, maxTier: number = 5): { 
    name: string, 
    stats: PlayerStats, 
    potentialStats: PlayerPotentialStats,
    tier: number,
    potentialTier: number
  } {
    // Keep generating players until we find one that meets the tier requirements
    let stats: PlayerStats;
    let potentialStats: PlayerPotentialStats;
    let tier: number;
    let potentialTier: number;
    
    do {
      stats = this.generatePlayerStats();
      tier = TierCalculator.calculateTier(stats);
      
      // If exactTier is specified, only accept players of that exact tier
      if (exactTier !== undefined) {
        if (tier === exactTier) {
          break;
        }
        continue;
      }
      
      // Otherwise, check if the tier is within the specified range
      if (tier >= minTier && tier <= maxTier) {
        break;
      }
    } while (true);
    
    potentialStats = this.generatePlayerPotentialStats(stats);
    potentialTier = TierCalculator.calculatePotentialTier(potentialStats);
    const name = this.generatePlayerName();
    
    return { 
      name, 
      stats, 
      potentialStats,
      tier,
      potentialTier
    };
  }

  /**
   * Generate multiple players with random stats
   * @param count Number of players to generate
   * @param tierDistribution Object specifying how many players to generate for each tier
   * @returns Array of player objects
   */
  public static generatePlayers(count: number, tierDistribution?: Record<number, number>): Array<{ 
    name: string, 
    stats: PlayerStats, 
    potentialStats: PlayerPotentialStats,
    tier: number,
    potentialTier: number
  }> {
    const players = [];
    
    // If tier distribution is specified, generate players according to that distribution
    if (tierDistribution) {
      for (const [tier, tierCount] of Object.entries(tierDistribution)) {
        const tierNumber = parseInt(tier);
        for (let i = 0; i < tierCount; i++) {
          if (players.length < count) {
            players.push(this.generatePlayer(tierNumber));
          }
        }
      }
      
      // If we haven't reached the desired count, fill the rest with random players
      const remainingCount = count - players.length;
      for (let i = 0; i < remainingCount; i++) {
        players.push(this.generatePlayer(undefined, 1, 5));
      }
    } else {
      // No distribution specified, just generate random players
      for (let i = 0; i < count; i++) {
        players.push(this.generatePlayer(undefined, 1, 5));
      }
    }
    
    return players;
  }
  
  /**
   * Generate multiple players within a tier range
   * @param count Number of players to generate
   * @param minTier Minimum tier for the players
   * @param maxTier Maximum tier for the players
   * @returns Array of player objects with tiers between minTier and maxTier
   */
  public static generatePlayersInTierRange(count: number, minTier: number, maxTier: number): Array<{ 
    name: string, 
    stats: PlayerStats, 
    potentialStats: PlayerPotentialStats,
    tier: number,
    potentialTier: number
  }> {
    const players = [];
    
    for (let i = 0; i < count; i++) {
      players.push(this.generatePlayer(undefined, minTier, maxTier));
    }
    
    return players;
  }
}
