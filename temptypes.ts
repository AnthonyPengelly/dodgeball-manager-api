/**
 * Main types for the dodgeball match engine
 */

// Player attributes
export interface PlayerStats {
  id: string;
  name: string;
  throwing: number;   // Ability to accurately throw balls
  catching: number;   // Ability to catch incoming balls
  dodging: number;    // Ability to avoid being hit
  blocking: number;   // Ability to block with a ball
  speed: number;      // Determines turn order
  positional_sense: number; // General game awareness
  teamwork: number;   // Ability to perform with more or equal numbers
  clutch_factor: number; // Ability to perform outnumbered or solo
}

// Player state during a match
export interface MatchPlayer extends PlayerStats {
  isActive: boolean;  // Whether the player is in the game or eliminated
  hasBall: boolean;   // Whether the player has a ball
  sector: number;     // Player's sector on their side of the court (0-5)
  teamId: string;     // Team identifier
  lastAction?: PlayerAction; // Last action taken by this player
  lastReaction?: PlayerReaction; // Last reaction made by this player
  actionHistory: PlayerAction[]; // History of actions for this player
  reactionHistory: PlayerReaction[]; // History of reactions for this player
  turnsSinceLastAction: number; // Number of turns since last meaningful action
}

// Team in a match
export interface MatchTeam {
  id: string;
  name: string;
  players: MatchPlayer[];
  roundsWon: number;
  side: number; // 1 for team 1, 2 for team 2
  currentActivePlayers: number;
}

// Possible player actions (on their turn)
export enum ActionType {
  COLLECT_BALL = 'COLLECT_BALL',
  THROW_BALL = 'THROW_BALL',
  PREPARE = 'PREPARE',  // Preparing for next turn (better reactions)
  IDLE = 'IDLE',         // No action available
  MOVE_SECTOR = 'MOVE_SECTOR',
}

// Possible player reactions (on opponent's turn)
export enum ReactionType {
  DODGE = 'DODGE',
  CATCH = 'CATCH',
  BLOCK = 'BLOCK'
}

// Result of an action or reaction
export enum ActionResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  NO_EFFECT = 'NO_EFFECT'
}

// Player action details
export interface PlayerAction {
  type: ActionType;
  playerId: string;
  targetPlayerId?: string;
  ballId?: number;
  result: ActionResult;
  timestamp: number;
}

// Interface for reaction result information
export interface ReactionResult {
  reaction: ReactionType;
  confidence: number;
  reasoning: string;
}

// Player reaction details
export interface PlayerReaction {
  type: ReactionType;
  playerId: string;
  toActionId: string;
  ballId?: string;
  result: ActionResult;
  timestamp: number;
}

// Ball state in the game
export interface Ball {
  id: number;
  status: BallStatus;
  possessionPlayerId?: string;
  sector: number;      // Court sector where the ball is (0-5)
  side: number;        // Which side of the court (0 = neutral/middle, 1 = team1, 2 = team2)
}

// Ball status
export enum BallStatus {
  AVAILABLE = 'AVAILABLE',  // On the ground, can be picked up
  POSSESSED = 'POSSESSED',  // Held by a player
  OUT_OF_BOUNDS = 'OUT_OF_BOUNDS', // Temporarily out of play
}

// Match round state
export interface Round {
  roundNumber: number;
  events: MatchEvent[];
  winnerId?: string;  // Team that won the round
  initialBallPositions: Ball[];
}

// Overall match state
export interface MatchState {
  matchId: string;
  team1: MatchTeam;
  team2: MatchTeam;
  balls: Ball[];
  currentRound: number;
  rounds: Round[];
  currentTurnIndex: number;
  turnOrder: string[];  // Player IDs in order of action
  events: MatchEvent[];
  isComplete: boolean;
  winnerId?: string;
}

// Match event types
export enum EventType {
  MATCH_START = 'MATCH_START',
  ROUND_START = 'ROUND_START',
  TURN_START = 'TURN_START',
  PLAYER_ACTION = 'PLAYER_ACTION',
  PLAYER_REACTION = 'PLAYER_REACTION',
  PLAYER_ELIMINATED = 'PLAYER_ELIMINATED',
  PLAYER_REACTIVATED = 'PLAYER_REACTIVATED',
  ROUND_END = 'ROUND_END',
  MATCH_END = 'MATCH_END'
}

// Match event details
export interface MatchEvent {
  type: EventType;
  timestamp: number;
  roundNumber?: number;
  turnNumber?: number;
  playerId?: string;
  targetPlayerId?: string;
  action?: PlayerAction;
  reaction?: PlayerReaction;
  teamId?: string;
  description: string;
  
  // New fields for enhanced tracking
  movedToSector?: number;                 // If player moved, the sector they moved to
  reactionResult?: ActionResult;          // Result of the reaction (catch, block, dodge)
  reintegratedPlayerId?: string;          // ID of a player reintegrated into the game
  reintegratedSector?: number;            // Sector where the player was reintegrated
  
  // State snapshots after this event
  ballsSnapshot?: Ball[];                 // State of all balls after this event
  playersSnapshot?: {                     // State of all players after this event
    team1: MatchPlayer[];
    team2: MatchPlayer[];
  };
  
  // Additional context for visualization
  sectorMap?: {                           // Map of sectors with their occupants and balls
    [sectorId: number]: {
      players: string[];                  // Player IDs in this sector
      balls: number[];                    // Ball IDs in this sector
    }
  };
}

// Decision context passed to decision-making modules
export interface DecisionContext {
  player: MatchPlayer;
  allPlayers: MatchPlayer[];
  balls: Ball[];
  opposingTeamPlayers: MatchPlayer[];
  teammates: MatchPlayer[];
  previousActions: PlayerAction[];
  round: Round;
}

// Reaction context passed to reaction decision-making modules
export interface ReactionContext {
  player: MatchPlayer;          // Player reacting
  actionPlayer: MatchPlayer;    // Player who took the action being reacted to
  action: PlayerAction;         // The action being reacted to
  ball: Ball;                   // The ball being thrown/used
  teammates: MatchPlayer[];     // Other players on the same team
  hasOwnBall: boolean;          // Whether the reacting player has a ball (for blocking)
}

// Decision result returned from decision modules
export interface DecisionResult {
  action: ActionType;
  targetPlayerId?: string;
  ballId?: number;
  moveSectorDecision?: MoveSectorDecision; // Decision about movement after the main action
}

// Reaction result returned from reaction modules
export interface ReactionResult {
  reaction: ReactionType;
  confidence: number;
  reasoning: string;
}

// Decision result for moving to a different sector
export interface MoveSectorDecision {
  destinationSector: number;
  reason: string; // e.g. "Moving toward available ball", "Avoiding threat", etc.
}

// Game configuration options
export interface MatchConfig {
  roundsToWin: number;
  playersPerTeam: number;
  totalBalls: number;
  randomModifierRange: number;
  initialBallCollection: boolean;
  speedVariationFactor: number;
}
