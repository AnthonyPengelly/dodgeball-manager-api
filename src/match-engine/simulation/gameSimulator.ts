import { Game, GameState, MatchState, Round, Team } from '../types';
import { simulateRound } from './roundSimulator';
import { simulateInitialRound } from './initialRoundSimulator';
import { createInitialGameState } from '../state/initialStateFactory';
import { MATCH_CONSTANTS } from '../../utils/constants';

/**
 * Simulates a single game within a match
 * @param gameNumber The game number (1-3)
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @param matchState Current match state
 * @returns Complete game data
 */
export const simulateGame = (
  gameNumber: number, 
  homeTeam: Team, 
  awayTeam: Team, 
  matchState: Readonly<MatchState>
): Game => {
  // Create initial game state
  const initialGameState = createInitialGameState(gameNumber, homeTeam, awayTeam);
  
  // Initialize game data
  const game: Game = {
    gameNumber,
    rounds: [],
    homeTeamPlayersRemaining: homeTeam.players.length,
    awayTeamPlayersRemaining: awayTeam.players.length,
    winner: null,
    initialGameState,
    endGameMatchStateUpdate: {},
  };
  
  // Current game state that will be updated throughout the game
  const gameState: GameState = { ...initialGameState };
  
  // First, simulate the initial round for ball distribution
  const initialRound = simulateInitialRound(homeTeam, awayTeam, gameState);
  game.rounds.push(initialRound);
  
  // Simulate regular rounds until we have a winner or max rounds reached
  let roundNumber = 2; // Start from 2 since we've already simulated the initial round
  const MAX_ROUNDS = MATCH_CONSTANTS.MAX_ROUNDS_PER_GAME; // Safety limit to prevent infinite loops
  
  while (!gameState.completed && roundNumber <= MAX_ROUNDS) {
    // Simulate a round
    const round = simulateRound(roundNumber, homeTeam, awayTeam, gameState);
    game.rounds.push(round);    
    roundNumber++;
  }
  
  // Prepare state update for the match
  game.endGameMatchStateUpdate = {
    currentGame: matchState.currentGame + 1,
  };

  // Update player counts
  game.homeTeamPlayersRemaining = Object.values(gameState.playerState).filter(p => p.isHome).length;
  game.awayTeamPlayersRemaining = Object.values(gameState.playerState).filter(p => !p.isHome).length;
  
  // Check win condition
  if (game.homeTeamPlayersRemaining === 0 && game.awayTeamPlayersRemaining === 0) {
    game.winner = 'tie';
  } else if (game.homeTeamPlayersRemaining === 0) {
    game.winner = awayTeam.id;
  } else if (game.awayTeamPlayersRemaining === 0) {
    game.winner = homeTeam.id;
  }

  return game;
};
