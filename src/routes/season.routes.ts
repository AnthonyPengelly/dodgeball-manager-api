import { Router } from 'express';
import seasonController from '../controllers/season.controller';
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
 */
router.get('/training-info', authMiddleware, seasonController.getSeasonTrainingInfo);

/**
 * @swagger
 * /api/seasons/train-player:
 *   post:
 *     summary: Train a player by improving one of their stats
 *     tags: [Seasons]
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
 *                 description: The stat to improve
 *                 enum: [throwing, catching, dodging, blocking, speed, positional_sense, teamwork, clutch_factor]
 *     responses:
 *       200:
 *         description: Player trained successfully
 *       400:
 *         description: Invalid request or no training credits remaining
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player or game not found
 */
router.post('/train-player', authMiddleware, seasonController.trainPlayer);

/**
 * @swagger
 * /api/seasons/scouting-info:
 *   get:
 *     summary: Get scouting information for the current season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scouting information for the current season
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
 *                     scout_level:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 5
 *                     scouting_credits_used:
 *                       type: integer
 *                       minimum: 0
 *                     scouting_credits_available:
 *                       type: integer
 *                       minimum: 0
 *                     scouting_credits_remaining:
 *                       type: integer
 *                       minimum: 0
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 */
router.get('/scouting-info', authMiddleware, seasonController.getSeasonScoutingInfo);

/**
 * @swagger
 * /api/seasons/scouted-players:
 *   get:
 *     summary: Get all scouted players for the current season
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of scouted players
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 scouted_players:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       player_id:
 *                         type: string
 *                         format: uuid
 *                       season_id:
 *                         type: string
 *                         format: uuid
 *                       is_purchased:
 *                         type: boolean
 *                       scout_price:
 *                         type: integer
 *                       buy_price:
 *                         type: integer
 *                       player:
 *                         type: object
 *                         description: Player information
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active game found
 */
router.get('/scouted-players', authMiddleware, seasonController.getScoutedPlayers);

/**
 * @swagger
 * /api/seasons/scout:
 *   post:
 *     summary: Scout new players
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               count:
 *                 type: integer
 *                 description: Number of scouting credits to use (defaults to 1)
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Players scouted successfully
 *       400:
 *         description: Invalid request or no scouting credits remaining
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 */
router.post('/scout', authMiddleware, seasonController.scoutPlayers);

/**
 * @swagger
 * /api/seasons/purchase:
 *   post:
 *     summary: Purchase a scouted player
 *     tags: [Seasons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scouted_player_id
 *             properties:
 *               scouted_player_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the scouted player to purchase
 *     responses:
 *       200:
 *         description: Player purchased successfully
 *       400:
 *         description: Invalid request or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scouted player or game not found
 */
router.post('/purchase', authMiddleware, seasonController.purchaseScoutedPlayer);

/**
 * @swagger
 * /api/seasons/facility-info:
 *   get:
 *     summary: Get information about team facilities
 *     tags: [Seasons]
 *     description: Retrieves information about the team's facilities including current levels and upgrade costs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Facility information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 facility:
 *                   type: object
 *                   properties:
 *                     training_facility_level:
 *                       type: integer
 *                       description: Current level of the training facility (1-5)
 *                     scout_level:
 *                       type: integer
 *                       description: Current level of the scouting department (1-5)
 *                     stadium_size:
 *                       type: integer
 *                       description: Current size/level of the stadium (1-5)
 *                     training_facility_upgrade_cost:
 *                       type: integer
 *                       description: Cost to upgrade the training facility to the next level
 *                     scout_upgrade_cost:
 *                       type: integer
 *                       description: Cost to upgrade the scouting department to the next level
 *                     stadium_upgrade_cost:
 *                       type: integer
 *                       description: Cost to upgrade the stadium to the next level
 *                     can_afford_training_upgrade:
 *                       type: boolean
 *                       description: Whether the team can afford to upgrade the training facility
 *                     can_afford_scout_upgrade:
 *                       type: boolean
 *                       description: Whether the team can afford to upgrade the scouting department
 *                     can_afford_stadium_upgrade:
 *                       type: boolean
 *                       description: Whether the team can afford to upgrade the stadium
 *                     budget:
 *                       type: integer
 *                       description: Current team budget
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team or game not found
 */
router.get('/facility-info', authMiddleware, seasonController.getFacilityInfo);

/**
 * @swagger
 * /api/seasons/upgrade-facility:
 *   post:
 *     summary: Upgrade a team facility
 *     tags: [Seasons]
 *     description: Upgrades a team facility (training, scouting, or stadium) to the next level
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facility_type
 *             properties:
 *               facility_type:
 *                 type: string
 *                 enum: [training, scout, stadium]
 *                 description: Type of facility to upgrade
 *     responses:
 *       200:
 *         description: Facility upgraded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the upgrade was successful
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 team:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: Team ID
 *                     name:
 *                       type: string
 *                       description: Team name
 *                     budget:
 *                       type: integer
 *                       description: Updated team budget after upgrade
 *                 cost:
 *                   type: integer
 *                   description: Cost of the upgrade
 *       400:
 *         description: Invalid request, insufficient funds, or not in pre-season
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Team or game not found
 */
router.post('/upgrade-facility', authMiddleware, seasonController.upgradeFacility);

export default router;
