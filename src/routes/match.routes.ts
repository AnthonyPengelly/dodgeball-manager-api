import express from 'express';
import matchController from '../controllers/match.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/matches/play-next:
 *   post:
 *     summary: Play the next scheduled match
 *     description: Plays the next scheduled match for the current season and updates the game match day
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Match played successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Match played successfully
 *                 match:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     match_day:
 *                       type: integer
 *                     home_team_name:
 *                       type: string
 *                     away_team_name:
 *                       type: string
 *                     home_score:
 *                       type: integer
 *                     away_score:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [completed]
 *                     played_at:
 *                       type: string
 *                       format: date-time
 *                 match_day:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Cannot play match, game is not in regular season
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found or no more fixtures scheduled
 *       500:
 *         description: Server error
 */
router.post('/play-next', authMiddleware, matchController.playNextMatch);

export default router;
