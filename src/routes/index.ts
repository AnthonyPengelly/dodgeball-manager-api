import { Router } from 'express';
import playerRoutes from './player.routes';
import gameRoutes from './game.routes';
import seasonRoutes from './season.routes';
import transferRoutes from './transfer.routes';
import leagueRoutes from './league.routes';
import matchRoutes from './match.routes';

const router = Router();

// Mount route modules
router.use('/players', playerRoutes);
router.use('/games', gameRoutes);
router.use('/seasons', seasonRoutes);
router.use('/transfers', transferRoutes);
router.use('/leagues', leagueRoutes);
router.use('/matches', matchRoutes);

export default router;
