const express = require('express');
const {
  registerUser,
  loginUser,
  getUserById,
} = require('../controllers/userController');
const authenticate = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @openapi
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User registration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [customer, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', registerUser);

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login a user and get a JWT token
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User login credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post('/login', loginUser);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, getUserById);

module.exports = router;
