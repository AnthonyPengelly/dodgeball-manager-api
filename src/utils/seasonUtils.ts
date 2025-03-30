/**
 * Calculate the stadium income for a team based on facility level
 * 
 * @param facilityLevel The training facility level
 * @returns The stadium income amount
 */
export function calculateStadiumIncome(facilityLevel: number): number {
    return 50 + (facilityLevel * 50);
  }
  
  /**
   * Calculate wages for a team's players based on their tiers
   * 
   * @param playerTiers Array of player tier values
   * @returns The total wages to be paid
   */
  export function calculatePlayerWages(playerTiers: number[]): number {
    return playerTiers.reduce((total, tier) => total + (tier * 2), 0);
  }