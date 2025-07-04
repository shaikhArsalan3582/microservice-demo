const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');

const { createOrder } = require('../controllers/orderController');

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Creates a new order for an authenticated user.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *               - shippingAddress
 *             properties:
 *               productId:
 *                 type: string
 *                 example: prod123
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: integer
 *                 example: 20
 *               shippingAddress:
 *                 type: string
 *                 example: Mumbai, India
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request. Missing required fields.
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       404:
 *         description: Product not found.
 */
router.post('/', authenticate, createOrder);

module.exports = router;
