import { MATCH_CONSTANTS } from '../../utils/constants';
import { BallState, BallStatus, GameState, MatchState, PlayerState, RoundState, Team } from '../types';

/**
 * Creates the initial match state for a new match
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @returns Initial match state
 */
export const createInitialMatchState = (homeTeam: Team, awayTeam: Team): MatchState => {  
  return {
    currentGame: 1,
    completed: false
  };
};

/**
 * Creates the initial game state for a new game
 * @param gameNumber The game number (1-3)
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @returns Initial game state
 */
export const createInitialGameState = (gameNumber: number, homeTeam: Team, awayTeam: Team): GameState => {
  // Initialize player positions - 6 positions per side
  const playerState: Record<string, PlayerState> = {};
  
  // Set up home team players
  homeTeam.players.forEach((player, index) => {
    // Use modulo to ensure we only use positions 0-5
    const position = index % MATCH_CONSTANTS.PLAYERS_PER_TEAM;
    playerState[player.id] = {
      position,
      eliminated: false,
      ballId: null,
      ...player
    };
  });
  
  // Set up away team players
  awayTeam.players.forEach((player, index) => {
    // Use modulo to ensure we only use positions 6-11
    const position = MATCH_CONSTANTS.PLAYERS_PER_TEAM + (index % MATCH_CONSTANTS.PLAYERS_PER_TEAM);
    playerState[player.id] = {
      position,
      eliminated: false,
      ballId: null,
      ...player,
    };
  });
  
  // Initialize ball state - 6 balls total
  const ballState: Record<number, BallState> = {};
  
  // At the beginning, balls are all placed in the center
  for (let i = 0; i < MATCH_CONSTANTS.NUMBER_OF_BALLS; i++) {
    ballState[i] = {
      status: BallStatus.INITIAL,
      position: i  // Each ball is initially at position i (on the home side)
    };
  }
  
  // Create empty round state
  const roundState: RoundState = {
    turnOrder: [],
  };
  
  return {
    gameNumber,
    playerState,
    ballState,
    roundState,
    completed: false
  };
};

/**
 * Creates the initial round state for a new round
 * @param roundNumber The round number
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @param gameState Current game state
 * @returns Initial round state
 */
export const createInitialRoundState = (
  roundNumber: number,
  homeTeam: Team,
  awayTeam: Team,
  gameState: GameState
): RoundState => {
  // For the first round of the first game, special ball distribution rules apply
  // For other rounds, the ball positions continue from previous rounds
  
  return {
    turnOrder: [], // Will be filled by turn order calculator
  };
};
