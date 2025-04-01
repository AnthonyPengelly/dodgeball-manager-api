import { 
  ActionResult,
  BallState, BallStatus, GameState, MatchPlayer, PlayerAction, 
  PlayerState, Turn 
} from '../types';
import { makeActionDecision } from '../decisions/actionDecision';
import { makeReactionDecision } from '../decisions/reactionDecision';
import { resolveAction } from '../actions/actionResolver';
import { processMovement } from '../utils/movementHandler';
import { findNearestFreeBall, findPlayerById } from '../utils/gameStateUtils';
import { DeepPartial } from '../utils/deepMerge';

/**
 * Simulates a single player's turn
 * @param player The player taking their turn
 * @param playerState Current state of the player
 * @param gameState Current game state
 * @returns Complete turn data
 */
export const simulateTurn = (
  player: MatchPlayer,
  playerState: Readonly<PlayerState>,
  gameState: Readonly<GameState>
): Turn => {
  // Initialize turn data with guaranteed endTurnGameStateUpdate
  const turn: Turn = {
    playerId: player.id,
    action: PlayerAction.PREPARE, // Default action
    endTurnGameStateUpdate: {},
  };
  
  // Find the last turn this player took (if any)
  const previousTurn = findPlayerPreviousTurn(player.id, gameState);
  
  // Make decision about what action to take
  const decisionContext = {
    playerState,
    gameState,
    previousTurn
  };
  
  // Decide which action to take
  const decision = makeActionDecision(decisionContext);
  turn.action = decision.action;
  
  // Process the action based on the decision
  let targetBallId: number | null = null;
  
  // Handle different action types
  switch (turn.action) {
    case PlayerAction.THROW:
      // Only proceed if player has a ball
      if (playerState.ballId !== null) {
        targetBallId = playerState.ballId;
        turn.ballId = targetBallId;
        
        if (decision.targetPlayerId) {
          // Target player makes a reaction decision
          const targetPlayer = findPlayerById(decision.targetPlayerId, gameState);
          
          if (targetPlayer && !targetPlayer.eliminated) {
            const reactionContext = {
              playerState: targetPlayer,
              gameState,
              previousTurn: findPlayerPreviousTurn(decision.targetPlayerId, gameState)
            };
            
            // Target decides how to react
            turn.reaction = makeReactionDecision(reactionContext);
            
            // Resolve the throw and reaction
            const throwResult = resolveAction(turn.reaction, player, targetPlayer, gameState);
            turn.actionResult = throwResult.result;
            
            // If the throw hit or was caught, handle eliminations
            if (throwResult.result === 'hit') {
              turn.eliminatedPlayerId = decision.targetPlayerId;
              handlePlayerEliminated(decision.targetPlayerId, gameState, turn);
            } else if (throwResult.result === 'caught') {
              turn.eliminatedPlayerId = player.id;
              handlePlayerEliminated(player.id, gameState, turn);
              
              // Allow a player to re-enter
              const reEnteredPlayerId = handlePlayerReEnter(targetPlayer.isHome, gameState, turn);
              if (reEnteredPlayerId) {
                turn.reEnteredPlayerId = reEnteredPlayerId;
              }
            }
            
            // Update ball state
            handleThrowResult(targetBallId, throwResult.result, decision.targetPlayerId, gameState, turn);
          }
        }
        
        // Player no longer has the ball
        updatePlayerState(player.id, { ballId: null }, turn);
      }
      break;
      
    case PlayerAction.PICK_UP:
      // Find nearby free ball
      targetBallId = findNearestFreeBall(playerState.position, gameState);
      
      if (targetBallId !== null) {
        // Pick up the ball
        turn.ballId = targetBallId;
        turn.actionResult = ActionResult.PICKED_UP;
        
        // Update player state
        updatePlayerState(player.id, { ballId: targetBallId }, turn);
        
        // Update ball state
        const updatedBallState = { 
          ...gameState.ballState[targetBallId],
          status: BallStatus.HELD,
          position: playerState.position
        };
        if (!turn.endTurnGameStateUpdate.ballState) {
          turn.endTurnGameStateUpdate.ballState = {};
        }
        turn.endTurnGameStateUpdate.ballState[targetBallId] = updatedBallState;
      }
      break;
      
    case PlayerAction.PREPARE:
      // Player prepares for next turn (dodge/catch bonus)
      turn.actionResult = ActionResult.PREPARED;
      break;
  }
  
  // Handle player movement
  const newPosition = processMovement(player, playerState, gameState);
  if (newPosition !== playerState.position && newPosition !== null) {
    turn.newPosition = newPosition;
    updatePlayerState(player.id, { position: newPosition }, turn);
    
    // If player has a ball, update its position too
    if (playerState.ballId !== null) {
      const ballId = playerState.ballId;
      const updatedBallState = { 
        ...turn.endTurnGameStateUpdate.ballState?.[ballId],
        position: newPosition
      };
      if (!turn.endTurnGameStateUpdate.ballState) {
        turn.endTurnGameStateUpdate.ballState = {};
      }
      turn.endTurnGameStateUpdate.ballState[ballId] = updatedBallState;
    }
  }
  
  return turn;
};

/**
 * Find a player's previous turn from the game state
 */
const findPlayerPreviousTurn = (playerId: string, gameState: GameState): Turn | null => {
  // This would need to traverse previous rounds stored in the game state
  // For now we'll return null as we don't have access to previous rounds directly
  return null;
};

/**
 * Handle a player re-entering the game after a catch
 */
const handlePlayerReEnter = (isHomeCatcher: boolean, gameState: Readonly<GameState>, turn: Turn): string | null => {
  // Get list of eliminated players for the catcher's team
  const eliminatedPlayerIds = Object.entries(gameState.playerState)
    .filter(([_, state]) => 
      state.eliminated && 
      (isHomeCatcher === state.isHome)
    )
    .map(([id]) => id);
  
  if (eliminatedPlayerIds.length === 0) return null;
  
  // For now, select the first eliminated player
  const reEnteredPlayerId = eliminatedPlayerIds[0];
  
  // Find an empty position for the player to re-enter
  const teamPositions = isHomeCatcher ? [0, 1, 2, 3, 4, 5] : [6, 7, 8, 9, 10, 11];
  const occupiedPositions = Object.values(gameState.playerState)
    .filter(state => !state.eliminated)
    .map(state => state.position);
  
  const availablePositions = teamPositions.filter(pos => !occupiedPositions.includes(pos));
  
  // Update player state in turn update
  const newPosition = availablePositions.length > 0 ? availablePositions[0] : teamPositions[0];
  
  if (!turn.endTurnGameStateUpdate.playerState) {
    turn.endTurnGameStateUpdate.playerState = {};
  }
  turn.endTurnGameStateUpdate.playerState[reEnteredPlayerId] = {
    ...turn.endTurnGameStateUpdate.playerState[reEnteredPlayerId],
    eliminated: false,
    position: newPosition
  };
  
  return reEnteredPlayerId;
};

/**
 * Handle a player being eliminated
 */
const handlePlayerEliminated = (playerId: string, gameState: Readonly<GameState>, turn: Turn): void => {
  // Create updated player state
  const updatedPlayerState: DeepPartial<PlayerState> = {
    ...turn.endTurnGameStateUpdate?.playerState?.[playerId],
    eliminated: true,
    position: null,
    ballId: null,
  };
  
  // Add to turn update
  if (!turn.endTurnGameStateUpdate.playerState) {
    turn.endTurnGameStateUpdate.playerState = {};
    }
  turn.endTurnGameStateUpdate.playerState[playerId] = updatedPlayerState;
  
  // If player had a ball, drop it
  const playerState = gameState.playerState[playerId];
  if (playerState.ballId !== null) {
    const ballId = playerState.ballId;
    
    // Update ball state in turn update
    if (!turn.endTurnGameStateUpdate.ballState) {
      turn.endTurnGameStateUpdate.ballState = {};
    }
    turn.endTurnGameStateUpdate.ballState[ballId] = {
      ...turn.endTurnGameStateUpdate.ballState[ballId],
      status: BallStatus.FREE
    };
  }
};

/**
 * Handle the result of a throw
 */
const handleThrowResult = (
  ballId: number, 
  result: string, 
  targetPlayerId: string,
  gameState: Readonly<GameState>,
  turn: Turn
): void => {
  let updatedBallState: DeepPartial<BallState> = {};
  
  switch (result) {
    case 'hit':
      updatedBallState = {
        ...turn.endTurnGameStateUpdate?.ballState?.[ballId],
        status: BallStatus.FREE,
        position: gameState.playerState[targetPlayerId].position
      };
      break;
      
    case 'caught':
      // Catcher gets the ball
      updatedBallState = {
        ...turn.endTurnGameStateUpdate?.ballState?.[ballId],
        status: BallStatus.HELD,
        position: gameState.playerState[targetPlayerId].position
      };
      
      // Update target player state to have the ball
      if (!turn.endTurnGameStateUpdate.playerState) {
        turn.endTurnGameStateUpdate.playerState = {};
      }
      turn.endTurnGameStateUpdate.playerState[targetPlayerId] = {
        ...turn.endTurnGameStateUpdate.playerState[targetPlayerId],
        ballId: ballId
      };
      break;
      
    case 'blocked':
    case 'miss':
      // Ball falls to the ground near the target
      updatedBallState = {
        ...turn.endTurnGameStateUpdate?.ballState?.[ballId],
        status: BallStatus.FREE,
        position: gameState.playerState[targetPlayerId].position
      };
      break;
      
    default:
      // No change
      return;
  }
  
  // Add updated ball state to turn update
  if (!turn.endTurnGameStateUpdate.ballState) {
    turn.endTurnGameStateUpdate.ballState = {};
  }
  turn.endTurnGameStateUpdate.ballState[ballId] = updatedBallState;
};

const updatePlayerState = (playerId: string, playerState: DeepPartial<PlayerState>, turn: Turn): void => {
  if (!turn.endTurnGameStateUpdate.playerState) {
    turn.endTurnGameStateUpdate.playerState = {};
  }
  turn.endTurnGameStateUpdate.playerState[playerId] = {
    ...turn.endTurnGameStateUpdate.playerState[playerId],
    ...playerState
  }
};