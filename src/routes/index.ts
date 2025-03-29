import { Router } from 'express';
import gameRoutes from './game.routes';

const router = Router();

// Mount route modules
router.use('/games', gameRoutes);

export default router;
