import { Game, MatchSimulation, MatchState, Team } from '../types';
import { simulateGame } from './gameSimulator';
import { createInitialMatchState } from '../state/initialStateFactory';
import { MATCH_CONSTANTS } from '../../utils/constants';
import { deepMerge } from '../utils/deepMerge';

/**
 * Simulates a complete dodgeball match between two teams
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @returns Complete match simulation data
 */
export const simulateMatch = (homeTeam: Team, awayTeam: Team): MatchSimulation => {
  // Create initial match state
  const initialMatchState = createInitialMatchState(homeTeam, awayTeam);
  
  // Initialize match data
  const match: MatchSimulation = {
    homeTeam,
    awayTeam,
    homeScore: 0,
    awayScore: 0,
    winner: null,
    games: [],
    initialMatchState,
  };

  // Current state that will be updated throughout the match
  const matchState: MatchState = JSON.parse(JSON.stringify(initialMatchState));
  
  // Play all three games (best of 3, but always play all 3)
  for (let gameNumber = 1; gameNumber <= MATCH_CONSTANTS.GAMES_PER_MATCH; gameNumber++) {
    // Simulate the game
    const game = simulateGame(gameNumber, homeTeam, awayTeam, matchState);
    match.games.push(game);
    
    // Update match state with end game state
    if (game.endGameMatchStateUpdate) {
      deepMerge(matchState, game.endGameMatchStateUpdate);
    }
    
    // Update match score based on game results
    match.homeScore = matchState.homeScore;
    match.awayScore = matchState.awayScore;
  }
  
  // Determine overall match winner
  if (match.homeScore > match.awayScore) {
    match.winner = homeTeam.id;
  } else if (match.awayScore > match.homeScore) {
    match.winner = awayTeam.id;
  } else {
    match.winner = null; // Tie
  }
  
  return match;
};
