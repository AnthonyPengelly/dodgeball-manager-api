import { Router } from 'express';
import gameRoutes from './game.routes';
import playerRoutes from './player.routes';
import seasonRoutes from './season.routes';

const router = Router();

// Mount route modules
router.use('/games', gameRoutes);
router.use('/players', playerRoutes);
router.use('/seasons', seasonRoutes);

export default router;
