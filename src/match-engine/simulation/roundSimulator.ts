import { GameState, Round, RoundState, Team } from '../types';
import { createInitialRoundState } from '../state/initialStateFactory';
import { determineTurnOrder } from '../utils/turnOrderCalculator';
import { simulateTurn } from './turnSimulator';
import { deepMerge } from '../utils/deepMerge';
import { isGameComplete } from '../utils/gameStateUtils';

/**
 * Simulates a single round within a game
 * @param roundNumber The round number
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @param gameState Current game state
 * @returns Complete round data
 */
export const simulateRound = (
  roundNumber: number, 
  homeTeam: Team, 
  awayTeam: Team, 
  gameState: Readonly<GameState>
): Round => {
  // Create the initial round state
  const initialRoundState = createInitialRoundState(roundNumber, homeTeam, awayTeam, gameState);
  
  // Calculate the turn order based on player speed stats
  const allPlayers = [...homeTeam.players, ...awayTeam.players]
  initialRoundState.turnOrder = determineTurnOrder(allPlayers);
  
  // Initialize round data
  const round: Round = {
    turns: [],
    initialRoundState
  };
  
  // Current round state that will be updated throughout the round
  const roundState: RoundState = { ...initialRoundState };
  
  // Execute all turns for this round
  for (const playerId of roundState.turnOrder) {
    // Find the player
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) continue; // Skip if player not found (shouldn't happen)
    
    // Get player state
    const playerState = gameState.playerState[playerId];
    if (playerState.eliminated) continue; // Skip eliminated players
    
    // Simulate the player's turn
    const turn = simulateTurn(player, playerState, gameState);
    round.turns.push(turn);
    
    // Update game state with turn results
    if (turn.endTurnGameStateUpdate) {
      deepMerge(gameState, turn.endTurnGameStateUpdate);
      const completed = isGameComplete(gameState);
      if (completed) {
        turn.endTurnGameStateUpdate.completed = true;
        deepMerge(gameState, turn.endTurnGameStateUpdate);
      }
    }
    
    // Check if game is completed
    if (gameState.completed) {
      break;
    }
  }
  
  return round;
};