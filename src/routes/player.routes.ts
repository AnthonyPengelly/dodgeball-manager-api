import { Router } from 'express';
import { getDraftPlayers } from '../controllers/player.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/players/draft:
 *   get:
 *     summary: Get draft players for the current game
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of draft players for the current game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 players:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       game_id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [draft, team, opponent, scout, transfer, sold, rejected]
 *                       throwing:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       catching:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       dodging:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       blocking:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       speed:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       positional_sense:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       teamwork:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       clutch_factor:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       throwing_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       catching_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       dodging_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       blocking_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       speed_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       positional_sense_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       teamwork_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       clutch_factor_potential:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       tier:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       potential_tier:
 *                         type: integer
 *                         minimum: 1
 *                         maximum: 5
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.get('/draft', authMiddleware, getDraftPlayers);

export default router;
