// API related constants
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

// Game constants
export const GAME_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Game stages - represents the progression of a game
export const GAME_STAGE = {
  DRAFT: 'draft',              // Initial player draft
  PRE_SEASON: 'pre_season',    // Training and preparation
  REGULAR_SEASON: 'regular_season', // Regular season matches
  POST_SEASON: 'post_season',  // Playoffs/tournaments
  OFF_SEASON: 'off_season',    // End of season activities
};

// Player constants
export const PLAYER_STATUS = {
  DRAFT: 'draft',
  TEAM: 'team',
  OPPONENT: 'opponent',
  SCOUT: 'scout',
  TRANSFER: 'transfer',
  SOLD: 'sold',
  REJECTED: 'rejected',
};

// Draft constants
export const DRAFT_CONSTANTS = {
  REQUIRED_PLAYERS: 8,  // Number of players required to complete the draft
};

// Authentication related
export const AUTH_ERRORS = {
  UNAUTHORIZED: 'Unauthorized: No token provided',
  INVALID_TOKEN: 'Unauthorized: Invalid token',
};

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
