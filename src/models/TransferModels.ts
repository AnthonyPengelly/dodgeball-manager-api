import { Player, TransferListedPlayer } from '../types';

/** Response model for retrieving transfer list */
export interface GetTransferListResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the operation result */
  message: string;

  /** List of players available for transfer */
  transfer_list: TransferListedPlayer[];

  /** Current season number */
  season: number;
}

/** Request model for buying a transfer-listed player */
export interface BuyTransferListedPlayerRequest {
  /** ID of the player to buy */
  player_id: string;
}

/** Response model for buying a transfer-listed player */
export interface BuyTransferListedPlayerResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the operation result */
  message: string;

  /** Details of the purchased player */
  player: Player;

  /** Remaining budget after the purchase */
  budget_remaining: number;
}

/** Request model for selling a player */
export interface SellPlayerRequest {
  /** ID of the player to sell */
  player_id: string;
}

/** Response model for selling a player */
export interface SellPlayerResponse {
  /** Indicates if the operation was successful */
  success: boolean;

  /** Descriptive message about the operation result */
  message: string;

  /** Details of the sold player */
  sold_player: Player;

  /** Updated team budget after selling the player */
  budget: number;
}
