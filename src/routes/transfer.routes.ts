import express from 'express';
import transferController from '../controllers/transfer.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/transfers:
 *   get:
 *     summary: Get the transfer list
 *     tags: [Transfers]
 *     description: Retrieves the list of players available for transfer in the current season
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transfer list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Success or error message
 *                 transfer_list:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       buy_price:
 *                         type: number
 *                       sell_price:
 *                         type: number
 *                       tier:
 *                         type: number
 *                       potential_tier:
 *                         type: number
 *                   description: List of players available for transfer
 *                 season:
 *                   type: number
 *                   description: Current season number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Game not found
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, transferController.getTransferList);

/**
 * @swagger
 * /api/transfers/buy:
 *   post:
 *     summary: Buy a player from the transfer list
 *     tags: [Transfers]
 *     description: Purchase a player from the transfer list and add them to your team
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
 *             properties:
 *               player_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the player to purchase
 *     responses:
 *       200:
 *         description: Player purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Success or error message
 *                 player:
 *                   type: object
 *                   description: Purchased player details
 *                 budget_remaining:
 *                   type: number
 *                   description: Remaining team budget after purchase
 *       400:
 *         description: Invalid request or insufficient funds
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player or team not found
 *       500:
 *         description: Server error
 */
router.post('/buy', authMiddleware, transferController.buyPlayer);

/**
 * @swagger
 * /api/transfers/sell:
 *   post:
 *     summary: Sell a player from your team
 *     tags: [Transfers]
 *     description: Sell a player from your team to free up budget. A minimum of 8 players must remain on the team.
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
 *             properties:
 *               player_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the player to sell
 *     responses:
 *       200:
 *         description: Player sold successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Operation success status
 *                 message:
 *                   type: string
 *                   description: Success or error message
 *                 sold_player:
 *                   type: object
 *                   description: Sold player details
 *                 budget:
 *                   type: number
 *                   description: Updated team budget after sale
 *       400:
 *         description: Invalid request or insufficient remaining players
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Player or team not found
 *       500:
 *         description: Server error
 */
router.post('/sell', authMiddleware, transferController.sellPlayer);

export default router;
