import { Router } from 'express';
import gameRoutes from './game.routes';
import playerRoutes from './player.routes';

const router = Router();

// Mount route modules
router.use('/games', gameRoutes);
router.use('/players', playerRoutes);

export default router;
