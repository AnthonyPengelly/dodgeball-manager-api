import { Router } from 'express';
import gameController from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/games/current:
 *   get:
 *     summary: Get the current game for the authenticated user
 *     description: Retrieves the current active game associated with the authenticated user's team
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the current game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     game_id:
 *                       type: string
 *                       format: uuid
 *                     game_season:
 *                       type: integer
 *                     game_match_day:
 *                       type: integer
 *                     game_status:
 *                       type: string
 *                       enum: [pending, in_progress, completed]
 *                     team_id:
 *                       type: string
 *                       format: uuid
 *                     team_name:
 *                       type: string
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       404:
 *         description: No active game found for this user
 *       500:
 *         description: Internal server error
 */
router.get('/current', authMiddleware, gameController.getCurrentGame);

export default router;
