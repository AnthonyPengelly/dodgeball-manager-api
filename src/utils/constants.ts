// API related constants
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

export const MATCH_CONSTANTS = {
  PLAYERS_PER_TEAM: 6,
  NUMBER_OF_BALLS: 6,
  GAMES_PER_MATCH: 3,
  MAX_ROUNDS_PER_GAME: 60,
  MAX_PICK_UP_DISTANCE: 3
}

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
  GENERATED_PLAYERS_COUNT: 24
};

// Team constants
export const TEAM_CONSTANTS = {
  MIN_PLAYERS: 8
};

// Training constants
export const TRAINING_CONSTANTS = {
  // Training credits available based on training facility level
  CREDITS_BY_LEVEL: {
    1: 3,  // Level 1: 3 training credits
    2: 5,  // Level 2: 5 training credits
    3: 8,  // Level 3: 8 training credits
    4: 12, // Level 4: 12 training credits
    5: 16  // Level 5: 16 training credits
  },
  // Maximum stat value
  MAX_STAT_VALUE: 5,
  // Minimum stat value
  MIN_STAT_VALUE: 1
};

// Scouting constants
export const SCOUTING_CONSTANTS = {
  // Scouting credits available based on scout level
  CREDITS_BY_LEVEL: {
    1: 1,  // Level 1: 2 scouting credits
    2: 2,  // Level 2: 3 scouting credits
    3: 3,  // Level 3: 5 scouting credits
    4: 5,  // Level 4: 8 scouting credits
    5: 8  // Level 5: 12 scouting credits
  },
  // Number of players generated per scout
  PLAYERS_PER_CREDIT: 1,
  // Maximum tier difference from current season
  MAX_TIER_DIFF: 1
};

// Player stat names
export const PLAYER_STATS = [
  'throwing',
  'catching',
  'dodging',
  'blocking',
  'speed',
  'positional_sense',
  'teamwork',
  'clutch_factor'
];

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
