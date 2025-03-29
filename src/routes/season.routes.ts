import { Router } from 'express';
import { getSeasonTrainingInfo } from '../controllers/season.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/seasons/training-info:
 *   get:
 *     summary: Get training information for the current season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Training information for the current season
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 season:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     season_number:
 *                       type: integer
 *                       minimum: 1
 *                     team_id:
 *                       type: string
 *                       format: uuid
 *                     training_facility_level:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                     training_credits_used:
 *                       type: integer
 *                       minimum: 0
 *                     training_credits_available:
 *                       type: integer
 *                       minimum: 0
 *                     training_credits_remaining:
 *                       type: integer
 *                       minimum: 0
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.get('/training-info', authMiddleware, getSeasonTrainingInfo);

export default router;
