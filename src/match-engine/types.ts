import { DeepPartial } from "./utils/deepMerge";

export interface MatchSimulation {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  winner: string | null; // Team ID of winner
  games: Game[];
  initialMatchState: MatchState;
}

export interface Team {
  id: string;
  name: string;
  players: MatchPlayer[];
  isHome: boolean;
}

export interface Game {
  gameNumber: number;
  rounds: Round[];
  homeTeamPlayersRemaining: number;
  awayTeamPlayersRemaining: number;
  winner: string | 'tie' | null;
  initialGameState: GameState;
  endGameMatchStateUpdate: DeepPartial<MatchState>;
}

export interface Round {
  turns: Turn[];
  initialRoundState: RoundState;
}

export interface Turn {
  playerId: string;
  action: PlayerAction;
  reaction?: PlayerReaction;
  newPosition?: number;
  eliminatedPlayerId?: string;
  reEnteredPlayerId?: string;
  ballId?: number;
  actionResult?: 'hit' | 'miss' | 'caught' | 'blocked' | 'picked_up' | 'prepared';
  endTurnGameStateUpdate: DeepPartial<GameState>;
}

export interface MatchState {
  currentGame: number;
  completed: boolean;
  homeScore: number;
  awayScore: number;
}

export enum CourtSide {
  HOME = 'home',
  AWAY = 'away'
}

export interface GameState {
  gameNumber: number;
  playerState: Record<string, PlayerState>;
  ballState: Record<number, BallState>;
  roundState: RoundState;
  completed: boolean;
}

export interface RoundState {
  turnOrder: string[]; // IDs of players in order for the current turn
}

export interface PlayerState extends MatchPlayer {
  // Current state
  position: number | null; // 0-11 (null if eliminated)
  eliminated: boolean;
  ballId: number | null;
}

export interface BallState {
  status: BallStatus;
  position: number | null; // 0-11 (null if out of play)
}

export enum PlayerAction {
  THROW = 'throw',
  PICK_UP = 'pick_up',
  PREPARE = 'prepare',
}

export enum PlayerReaction {
  CATCH = 'catch',
  DODGE = 'dodge',
  BLOCK = 'block'
}

export enum BallStatus {
  INITIAL = 'initial', // Ball is in its initial position
  FREE = 'free',       // Ball is free to be picked up (on the ground)
  HELD = 'held',       // Ball is being held by a player
}

export interface MatchPlayer {
  id: string;
  name: string;
  isHome: boolean;
      
  // Stats affecting gameplay
  throwing: number;
  catching: number;
  dodging: number;
  blocking: number;
  speed: number;
  positionalSense: number;
  teamwork: number;
  clutchFactor: number;
}

export interface DecisionContext {
  playerState: Readonly<PlayerState>;
  gameState: GameState;
  previousTurn: Turn | null;
}
