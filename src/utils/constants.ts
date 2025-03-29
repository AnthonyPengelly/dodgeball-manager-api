// API related constants
export const API_PREFIX = '/api';
export const API_VERSION = 'v1';

// Game constants
export const GAME_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
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
  INTERNAL_SERVER_ERROR: 500,
};
