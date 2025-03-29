/**
 * Utility class for calculating facility upgrade costs
 */
export class FacilityUpgradeCalculator {
  // Base cost for upgrading training facility or scout level
  private static BASE_COST = 50;
  
  // Base cost for upgrading stadium size (more expensive)
  private static STADIUM_BASE_COST = 80;
  
  // Exponential cost multiplier for each level
  private static LEVEL_MULTIPLIER = 1.35;
  
  /**
   * Calculate the cost to upgrade a facility from its current level
   * 
   * @param currentLevel Current level of the facility (1-4)
   * @param facilityType Type of facility ('training', 'scout', or 'stadium')
   * @returns The cost to upgrade to the next level, or 0 if already at max level (5)
   */
  public static calculateUpgradeCost(currentLevel: number, facilityType: 'training' | 'scout' | 'stadium' = 'training'): number {
    // Maximum level is 5
    if (currentLevel >= 5) {
      return 0;
    }
    
    // Minimum level is 1
    if (currentLevel < 1) {
      currentLevel = 1;
    }
    
    // Calculate cost based on the level being upgraded to
    const targetLevel = currentLevel + 1;
    
    // Use different base costs and multipliers for stadium vs other facilities
    if (facilityType === 'stadium') {
      const cost = this.STADIUM_BASE_COST * Math.pow(this.LEVEL_MULTIPLIER, targetLevel - 1);
      return Math.round(cost);
    } else {
      const cost = this.BASE_COST * Math.pow(this.LEVEL_MULTIPLIER, targetLevel - 1);
      return Math.round(cost);
    }
  }
  
  /**
   * Check if a facility can be upgraded
   * 
   * @param currentLevel Current level of the facility
   * @param budget Available budget
   * @param facilityType Type of facility ('training', 'scout', or 'stadium')
   * @returns Object with canUpgrade status and reason or cost
   */
  public static canUpgrade(currentLevel: number, budget: number, facilityType: 'training' | 'scout' | 'stadium' = 'training'): { 
    canUpgrade: boolean;
    reason?: string;
    cost?: number;
  } {
    // Check if already at max level
    if (currentLevel >= 5) {
      return {
        canUpgrade: false,
        reason: 'Already at maximum level (5)'
      };
    }
    
    // Calculate upgrade cost
    const cost = this.calculateUpgradeCost(currentLevel, facilityType);
    
    // Check if team has enough budget
    if (budget < cost) {
      return {
        canUpgrade: false,
        reason: `Insufficient funds (required: ${cost}, available: ${budget})`,
        cost
      };
    }
    
    // Team can afford the upgrade
    return {
      canUpgrade: true,
      cost
    };
  }
}
