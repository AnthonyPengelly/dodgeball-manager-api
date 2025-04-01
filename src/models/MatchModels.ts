import { MatchSimulation } from "../match-engine/types";
import { EnhancedFixture } from "../types";

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
  simulated_match?: MatchSimulation;
}
