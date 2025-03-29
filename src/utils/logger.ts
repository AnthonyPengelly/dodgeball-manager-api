import config from '../config/config';

// Simple logging utility with environment-aware behavior
const logger = {
  info: (message: string, ...data: any[]) => {
    console.log(`[INFO] ${message}`, ...data);
  },
  
  warn: (message: string, ...data: any[]) => {
    console.warn(`[WARN] ${message}`, ...data);
  },
  
  error: (message: string, ...data: any[]) => {
    console.error(`[ERROR] ${message}`, ...data);
  },
  
  debug: (message: string, ...data: any[]) => {
    if (config.environment !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }
};

export default logger;
