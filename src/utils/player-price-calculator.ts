import { Player } from '../types';

/**
 * Utility class for calculating player prices
 */
export class PlayerPriceCalculator {
  // Base price for any player
  private static BASE_PRICE = 10;
  
  // Price multipliers for each tier
  private static TIER_MULTIPLIERS = {
    5: 5.0,
    4: 3.5,
    3: 2.5,
    2: 1.5,
    1: 1.0
  };
  
  // Buy price is more expensive than scout/sell price
  private static BUY_MULTIPLIER = 1.5;
  
  /**
   * Calculate the scout/sell price for a player
   * @param player The player to calculate the price for
   * @returns The scout/sell price
   */
  public static calculateScoutPrice(player: Player): number {
    return Math.round(this.calculateBasePrice(player));
  }
  
  /**
   * Calculate the buy price for a player
   * @param player The player to calculate the price for
   * @returns The buy price
   */
  public static calculateBuyPrice(player: Player): number {
    return Math.round(this.calculateBasePrice(player) * this.BUY_MULTIPLIER);
  }
  
  /**
   * Calculate the base price for a player based on stats and potential
   * @param player The player to calculate the price for
   * @returns The base price
   */
  private static calculateBasePrice(player: Player): number {
    // Get the tier multiplier
    const tierMultiplier = this.TIER_MULTIPLIERS[player.tier as keyof typeof this.TIER_MULTIPLIERS] || 1.0;
    
    // Calculate average current stats
    const currentStats = [
      player.throwing,
      player.catching,
      player.dodging,
      player.blocking,
      player.speed,
      player.positional_sense,
      player.teamwork,
      player.clutch_factor
    ];
    const avgCurrentStats = currentStats.reduce((a, b) => a + b, 0) / currentStats.length;
    
    // Calculate average potential stats
    const potentialStats = [
      player.throwing_potential,
      player.catching_potential,
      player.dodging_potential,
      player.blocking_potential,
      player.speed_potential,
      player.positional_sense_potential,
      player.teamwork_potential,
      player.clutch_factor_potential
    ];
    const avgPotentialStats = potentialStats.reduce((a, b) => a + b, 0) / potentialStats.length;
    
    // Calculate potential growth
    const potentialGrowth = avgPotentialStats - avgCurrentStats;
    
    // Base price calculation
    let price = this.BASE_PRICE;
    
    // Add value for current stats
    price += avgCurrentStats * 2;
    
    // Add value for potential growth
    price += potentialGrowth * 3;
    
    // Apply tier multiplier
    price *= tierMultiplier;
    
    // Return the calculated price
    return price;
  }
}
