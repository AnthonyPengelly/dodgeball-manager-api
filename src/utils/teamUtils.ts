import { Team } from '../types';

/**
 * Check if a team has enough budget for a purchase
 * 
 * @param team The team
 * @param cost The cost to check against
 * @returns Whether the team has enough budget
 */
export function hasEnoughBudget(team: Team, cost: number): boolean {
  return team.budget >= cost;
}

/**
 * Calculate the new budget after a purchase
 * 
 * @param currentBudget The current budget
 * @param cost The cost of the purchase
 * @returns The new budget
 */
export function calculateNewBudget(currentBudget: number, cost: number): number {
  return Math.max(0, currentBudget - cost);
}

/**
 * Format team data for API responses
 * 
 * @param team The team data
 * @returns Formatted team data
 */
export function formatTeamResponse(team: Team): Team {
  return {
    ...team,
    // Add any additional formatting if needed
  };
}
