import { PlayerInstructionsForMatch, TargetPriority } from "../types";
import { DeepPartial } from "./utils/deepMerge";

/**
 * Represents the entire match simulation result
 * @tsoaModel
 */
export interface MatchSimulation {
  /** Home team participating in the match */
  homeTeam: Team;
  /** Away team participating in the match */
  awayTeam: Team;
  /** Final score for the home team */
  homeScore: number;
  /** Final score for the away team */
  awayScore: number;
  /** Team ID of the winner, or null if it's a draw */
  winner: string | null;
  /** Individual games played in the match */
  games: Game[];
  /** Initial state of the match before simulation. Use this to set up your match state object */
  initialMatchState: MatchState;
}

/**
 * Represents a team in the dodgeball match
 * @tsoaModel
 */
export interface Team {
  /** Unique identifier for the team */
  id: string;
  /** Name of the team */
  name: string;
  /** Players in the team */
  players: MatchPlayer[];
  /** Whether this team is the home team */
  isHome: boolean;
}

/**
 * Represents a single game within a match
 * @tsoaModel
 */
export interface Game {
  /** Sequential number of the game in the match */
  gameNumber: number;
  /** Rounds played in this game. Each round is a set of turns, one for each player */
  rounds: Round[];
  /** Number of home team players remaining at the end of the game */
  homeTeamPlayersRemaining: number;
  /** Number of away team players remaining at the end of the game */
  awayTeamPlayersRemaining: number;
  /** Winner of the game (team ID or 'tie') */
  winner: string | 'tie' | null;
  /** Initial state of the game before simulation. Use this to set up your game state object */
  initialGameState: GameState;
  /** Partial updates to match state at game end. This must be a deep merge */
  endGameMatchStateUpdate: DeepPartial<MatchState>;
}

/**
 * Represents a round within a game
 * @tsoaModel
 */
export interface Round {
  /** Turns taken in this round */
  turns: Turn[];
  /** Initial state of the round. Use this to create your roundState object */
  initialRoundState: RoundState;
}

/**
 * Represents a single turn in a round
 * @tsoaModel
 */
export interface Turn {
  /** ID of the player taking the turn */
  playerId: string;
  /** Primary action taken by the player */
  action: PlayerAction;
  /** Reaction to an action (optional) */
  reaction?: PlayerReaction;
  /** New position on the court after the turn */
  newPosition?: number;
  /** ID of a player eliminated during this turn */
  eliminatedPlayerId?: string;
  /** ID of a player re-entering the game for catches */
  reEnteredPlayerId?: string;
  /** ID of the ball involved in the turn */
  ballId?: number;
  /** Result of the player's action */
  actionResult?: ActionResult;
  /** Partial updates to game state at turn end. This should be applied with a deep merge */
  endTurnGameStateUpdate: DeepPartial<GameState>;
}

/**
 * Represents the overall state of a match
 * @tsoaModel
 */
export interface MatchState {
  /** Current game number in the match */
  currentGame: number;
  /** Whether the match is completed */
  completed: boolean;
  /** Score for the home team */
  homeScore: number;
  /** Score for the away team */
  awayScore: number;
}

/**
 * Enum representing which side of the court a team is on
 * @tsoaEnum
 */
export enum CourtSide {
  HOME = 'home',
  AWAY = 'away'
}

/**
 * Represents the state of a game at a specific point
 * @tsoaModel
 */
export interface GameState {
  /** Number of the current game */
  gameNumber: number;
  /** State of each player in the game */
  playerState: Record<string, PlayerState>;
  /** State of balls in the game */
  ballState: Record<number, BallState>;
  /** Current round state */
  roundState: RoundState;
  /** Whether the game is completed */
  completed: boolean;
}

/**
 * Represents the state of a round
 * @tsoaModel
 */
export interface RoundState {
  /** Order of player turns */
  turnOrder: string[];
}

/**
 * Represents the state of a player during a game
 * @tsoaModel
 */
export interface PlayerState extends MatchPlayer {
  /** Current position on the court (0-11, null if eliminated) */
  position: number | null;
  /** Whether the player has been eliminated */
  eliminated: boolean;
  /** ID of the ball held by the player (if any) */
  ballId: number | null;
}

/**
 * Represents the state of a ball during a game
 * @tsoaModel
 */
export interface BallState {
  /** Current status of the ball */
  status: BallStatus;
  /** Position of the ball on the court (0-11, null if out of play) */
  position: number | null;
}

/**
 * Enum of possible player actions
 * @tsoaEnum
 */
export enum PlayerAction {
  THROW = 'throw',
  PICK_UP = 'pick_up',
  PREPARE = 'prepare',
}

/**
 * Enum of possible player reactions
 * @tsoaEnum
 */
export enum PlayerReaction {
  CATCH = 'catch',
  DODGE = 'dodge',
  BLOCK = 'block'
}

/**
 * Enum of action results
 * @tsoaEnum
 */
export enum ActionResult {
  HIT = 'hit',
  MISS = 'miss',
  CAUGHT = 'caught',
  BLOCKED = 'blocked',
  PICKED_UP = 'picked_up',
  PREPARED = 'prepared'
}

/**
 * Enum of possible ball statuses
 * @tsoaEnum
 */
export enum BallStatus {
  INITIAL = 'initial', // Ball is in its initial position
  FREE = 'free',       // Ball is free to be picked up (on the ground)
  HELD = 'held',       // Ball is being held by a player
}

/**
 * Represents a player in a match with their attributes
 * @tsoaModel
 */
export interface MatchPlayer extends PlayerInstructionsForMatch {
  /** Unique identifier for the player */
  id: string;
  /** Name of the player */
  name: string;
  /** Whether the player is on the home team */
  isHome: boolean;
      
  /** Player's throwing skill level */
  throwing: number;
  /** Player's catching skill level */
  catching: number;
  /** Player's dodging skill level */
  dodging: number;
  /** Player's blocking skill level */
  blocking: number;
  /** Player's movement speed */
  speed: number;
  /** Player's ability to read the court */
  positionalSense: number;
  /** Player's ability when there are many players still available on their team */
  teamwork: number;
  /** Player's performance when there are few players still on their team */
  clutchFactor: number;
}

/**
 * Context for making decisions during a turn
 * @tsoaModel
 */
export interface DecisionContext {
  /** Current state of the player */
  playerState: Readonly<PlayerState>;
  /** Current state of the game */
  gameState: GameState;
  /** Previous turn in the game */
  previousTurn: Turn | null;
}


export interface PlayerDecision {
  action: PlayerAction;
  targetPlayerId?: string;
}