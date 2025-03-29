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

/**
 * @swagger
 * /api/matches/end-season:
 *   post:
 *     summary: End the current season
 *     description: Ends the current season, handles promotions, and prepares for the next season if applicable
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Season ended successfully
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
 *                   example: Season 1 completed! Your team won the championship and advances to season 2.
 *                 game_ended:
 *                   type: boolean
 *                   description: Whether the game has ended (due to elimination or completion)
 *                 season_completed:
 *                   type: integer
 *                   example: 1
 *                 next_season:
 *                   type: integer
 *                   example: 2
 *                 promoted:
 *                   type: boolean
 *                   description: Whether the user's team was promoted (top 2)
 *                 champion:
 *                   type: boolean
 *                   description: Whether the user's team won the championship
 *                 budget_update:
 *                   type: object
 *                   properties:
 *                     previous:
 *                       type: integer
 *                       description: Previous budget
 *                     stadium_income:
 *                       type: integer
 *                       description: Income from stadium
 *                     wages_paid:
 *                       type: integer
 *                       description: Wages paid to players
 *                     new_budget:
 *                       type: integer
 *                       description: New budget after income and expenses
 *                 promoted_team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: ID of the other promoted team
 *                     name:
 *                       type: string
 *                       description: Name of the other promoted team
 *       400:
 *         description: Cannot end season, not all fixtures are completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.post('/end-season', authMiddleware, matchController.endSeason);

export default router;
