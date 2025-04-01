import { BallStatus, GameState, MatchPlayer, Round, Team, Turn, PlayerAction, ActionResult } from '../types';
import { MATCH_CONSTANTS } from '../../utils/constants';
import { deepMerge } from '../utils/deepMerge';

/**
 * Simulates the special initial round where balls are distributed
 * This is a special round that happens at the beginning of each game
 * @param homeTeam The home team
 * @param awayTeam The away team
 * @param gameState Current game state
 * @returns Complete round data
 */
export const simulateInitialRound = (
  homeTeam: Team, 
  awayTeam: Team, 
  gameState: Readonly<GameState>
): Round => {
  // Create a new round with initial state
  const round: Round = {
    turns: [],
    initialRoundState: {
      turnOrder: []
    }
  };

  const allPlayers = [...homeTeam.players, ...awayTeam.players];
  
  // There are 6 balls, one in each position pair (0-6, 1-7, etc.)
  for (let i = 0; i < MATCH_CONSTANTS.NUMBER_OF_BALLS; i++) {
    const homePosition = i;
    const awayPosition = i + MATCH_CONSTANTS.PLAYERS_PER_TEAM;
    
    // Find players in these positions
    const homePlayer = allPlayers.find(p => p.isHome && gameState.playerState[p.id].position === homePosition);
    const awayPlayer = allPlayers.find(p => !p.isHome && gameState.playerState[p.id].position === awayPosition);
    
    if (!homePlayer || !awayPlayer) continue;
    
    // Create a turn for the player who gets the ball
    const winningPlayer = homePlayer.speed > awayPlayer.speed ? homePlayer : awayPlayer;
    const ballPosition = winningPlayer.isHome ? homePosition : awayPosition;
    
    // Create a turn for the ball pickup
    const turn = createBallPickupTurn(winningPlayer, i, ballPosition, gameState);
    round.turns.push(turn);
    
    // Apply the turn's state update to the game state
    deepMerge(gameState, turn.endTurnGameStateUpdate);
  }
  
  return round;
};

/**
 * Creates a turn for a player picking up a ball during the initial distribution
 */
const createBallPickupTurn = (
  player: MatchPlayer,
  ballId: number,
  position: number,
  gameState: Readonly<GameState>
): Turn => {
  // Create a turn for the player picking up the ball
  const turn: Turn = {
    playerId: player.id,
    action: PlayerAction.PICK_UP,
    ballId,
    actionResult: ActionResult.PICKED_UP,
    endTurnGameStateUpdate: {
      playerState: {
        [player.id]: {
          ballId
        }
      },
      ballState: {
        [ballId]: {
          status: BallStatus.HELD,
          position
        }
      }
    }
  };
  
  return turn;
};
