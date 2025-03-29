import express from 'express';
import leagueController from '../controllers/league.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: Get league data
 *     description: Retrieves league table and fixtures for the current or specified season
 *     tags: [Leagues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *         description: Season number (defaults to current season if not provided)
 *     responses:
 *       200:
 *         description: League data retrieved successfully
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
 *                   example: League data retrieved successfully
 *                 season:
 *                   type: integer
 *                   example: 1
 *                 fixtures:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       match_day:
 *                         type: integer
 *                       home_team_name:
 *                         type: string
 *                       away_team_name:
 *                         type: string
 *                       home_score:
 *                         type: integer
 *                       away_score:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [scheduled, completed]
 *                 table:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_id:
 *                         type: string
 *                       team_name:
 *                         type: string
 *                       team_type:
 *                         type: string
 *                         enum: [user, opponent]
 *                       played:
 *                         type: integer
 *                       won:
 *                         type: integer
 *                       lost:
 *                         type: integer
 *                       points:
 *                         type: integer
 *                       goals_for:
 *                         type: integer
 *                       goals_against:
 *                         type: integer
 *                       goal_difference:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, leagueController.getLeague);

export default router;
