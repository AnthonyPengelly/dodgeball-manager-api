import { Router } from 'express';
import { getDraftPlayers, completeDraft, getSquad, trainPlayer } from '../controllers/player.controller';
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

/**
 * @swagger
 * /api/players/draft/complete:
 *   post:
 *     summary: Complete the draft by selecting players for the team
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_ids
 *             properties:
 *               player_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of player IDs to select for the team (must be exactly 8 players)
 *     responses:
 *       200:
 *         description: Draft completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 team_id:
 *                   type: string
 *                   format: uuid
 *                 selected_players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *       400:
 *         description: Invalid request or game not in draft stage
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.post('/draft/complete', authMiddleware, completeDraft);

/**
 * @swagger
 * /api/players/squad:
 *   get:
 *     summary: Get the squad (team players) for the current team
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of players in the team's squad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 players:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Player'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 *       500:
 *         description: Server error
 */
router.get('/squad', authMiddleware, getSquad);

/**
 * @swagger
 * /api/players/train:
 *   post:
 *     summary: Train a player by improving one of their stats
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_id
 *               - stat_name
 *             properties:
 *               player_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the player to train
 *               stat_name:
 *                 type: string
 *                 enum: [throwing, catching, dodging, blocking, speed, positional_sense, teamwork, clutch_factor]
 *                 description: Name of the stat to improve
 *     responses:
 *       200:
 *         description: Player trained successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 player:
 *                   $ref: '#/components/schemas/Player'
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
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
 *       400:
 *         description: Invalid request, game not in pre-season, or no training credits remaining
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found or player not found
 *       500:
 *         description: Server error
 */
router.post('/train', authMiddleware, trainPlayer);

export default router;
