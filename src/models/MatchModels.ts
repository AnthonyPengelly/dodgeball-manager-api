import { Game, GameState, MatchSimulation, MatchState, Round, Turn } from "../match-engine/types";
import { EnhancedFixture, PlayerInstructions, TargetPriority } from "../types";

/** Response model for playing a match */
export interface PlayMatchResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the operation result */
  message: string;

  /** The match that was played */
  match: EnhancedFixture;

  /** The match day of the played match */
  match_day: number;

  /** Optional other match played in the same match day */
  other_match?: EnhancedFixture;

  /** Optional detailed simulation data from the match engine */
  simulated_match?: MatchSimulationResponse;
}

/** Request model for player instructions */
export interface SavePlayerinstructionsRequest {
  /** ID of the fixture */
  fixture_id?: string;
  /** Player instructions for each player, the set of 6 players represent the line up chosen */
  players: {
    player_id: string;
    throw_aggression: number;
    catch_aggression: number;
    target_priority: TargetPriority;
  }[];
}

/** Response model for player instructions */
export interface SavePlayerinstructionsResponse {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Descriptive message about the operation result */
  message: string;
}

/** Response model for player instructions */
export interface GetPlayerinstructionsResponse {
  /** Indicates if the operation was successful */
  success: boolean;
  /** Descriptive message about the operation result */
  message: string;
  /** Player instructions for each player */
  player_instructions: PlayerInstructions[];
}

// Tsoa doesn't like our complex DeepPartial mode, so replace it with Partial model for the API response
export interface MatchSimulationResponse extends MatchSimulation {
  games: TsoaGame[];
}

export interface TsoaGame extends Game {
  rounds: TsoaRound[];
  endGameMatchStateUpdate: Partial<MatchState>;
}

export interface TsoaRound extends Round {
  turns: TsoaTurn[];
}

export interface TsoaTurn extends Turn {
  endTurnGameStateUpdate: Partial<GameState>;
}