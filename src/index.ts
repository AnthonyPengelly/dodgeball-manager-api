// Load environment variables first, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import config from './config/config';
import { errorHandler } from './middleware/error.middleware';
import logger from './utils/logger';
import { validateEnv } from './utils/env-validator';
import { RegisterRoutes } from './openapi/routes';

// Validate environment variables
if (!validateEnv()) {
  process.exit(1);
}

// Create Express app
const app = express();

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup tsoa routes
RegisterRoutes(app);

// Swagger documentation - use the generated swagger.json file
const swaggerDocument = require('../public/swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.environment} mode`);
  logger.info(`Supabase URL: ${config.supabase.url.substring(0, 20)}...`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

export default app;
