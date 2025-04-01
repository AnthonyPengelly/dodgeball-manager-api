/**
 * End season response model
 */
export interface EndSeasonResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the season ending result */
  message: string;

  /** Indicates if the entire game has ended */
  game_ended: boolean;

  /** The season number that was just completed */
  season_completed: number;

  /** The upcoming season number, if applicable */
  next_season?: number;

  /** Indicates if the team was promoted to a higher league */
  promoted?: boolean;

  /** Indicates if the team won the championship */
  champion?: boolean;

  /** Details of budget changes at the end of the season */
  budget_update?: {
    /** Previous budget amount */
    previous: number;

    /** Income generated from stadium during the season */
    stadium_income: number;

    /** Total wages paid to players */
    wages_paid: number;

    /** Updated budget after all financial transactions */
    new_budget: number;
  };

  /** Details of the team promoted to a higher league */
  promoted_team?: {
    /** Unique identifier of the promoted team */
    id: string;

    /** Name of the promoted team */
    name: string;
  };
}
