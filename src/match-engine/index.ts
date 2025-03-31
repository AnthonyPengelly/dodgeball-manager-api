import { simulateMatch } from './simulation/matchSimulator';
import { MatchSimulation, Team } from './types';
import { convertToMatchTeams } from './matchAdapter';

/**
 * Entry point for the match engine
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @returns A complete match simulation with all events and results
 */
export const runMatchSimulation = (homeTeam: Team, awayTeam: Team): MatchSimulation => {
  return simulateMatch(homeTeam, awayTeam);
};

// Export all types
export * from './types';

// Export adapter for converting team data
export { convertToMatchTeams };
