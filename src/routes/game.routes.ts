import { Router } from 'express';
import gameController from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createTeamSchema = Joi.object({
  name: Joi.string().required().min(3).max(50)
});

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

/**
 * @swagger
 * /api/games/team:
 *   post:
 *     summary: Create a new team and game
 *     description: Creates a new team and associated game for the authenticated user. A user can only have one active game at a time. All facility levels start at 1.
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the team
 *                 example: "Dodgeball Destroyers"
 *     responses:
 *       201:
 *         description: Successfully created a new team and game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     team_id:
 *                       type: string
 *                       format: uuid
 *                     team_name:
 *                       type: string
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
 *       400:
 *         description: Bad request, validation error or user already has an active game
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       500:
 *         description: Internal server error
 */
router.post('/team', authMiddleware, validationMiddleware(createTeamSchema), gameController.createTeam);

/**
 * @swagger
 * /api/games/{gameId}/cancel:
 *   post:
 *     summary: Cancel an active game
 *     description: Cancels an active game by marking it as completed. Only games that belong to the authenticated user can be cancelled.
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the game to cancel
 *     responses:
 *       200:
 *         description: Successfully cancelled the game
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request, game already completed
 *       401:
 *         description: Unauthorized, invalid or missing JWT token
 *       404:
 *         description: Game not found or does not belong to the authenticated user
 *       500:
 *         description: Internal server error
 */
router.post('/:gameId/cancel', authMiddleware, gameController.cancelGame);

export default router;
