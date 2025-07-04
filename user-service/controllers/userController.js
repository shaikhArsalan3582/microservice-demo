const logger = require("../utils/logger");
const { registerUserService, getUserByIdService, loginUserService } = require("../services/userService");
const generateToken = require("../utils/generateToken");

const registerUser = async (req, res) => {
    logger.info("Register request received", { email: req.body.email });

    try {
        const user = await registerUserService(req.body);
        logger.info("User registered successfully", { userId: user._id });
        res.status(201).json(user);
    } catch (err) {
        logger.error("User registration failed", { error: err.message });
        res.status(400).json({ error: err.message });
    }
};

const getUserById = async (req, res) => {
    logger.info("Fetching user by ID", { userId: req.params.id });

    try {
        const user = await getUserByIdService(req.params.id);
        logger.info("User fetched successfully", { userId: user._id });
        res.status(200).json(user);
    } catch (err) {
        logger.error("Error fetching user", { error: err.message });
        res.status(400).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    logger.info("Login attempt", { email: req.body.email });

    try {
        const user = await loginUserService(req.body);
        const tokenData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };
        const token = await generateToken(tokenData);
        logger.info("Login successful", { userId: user._id });
        res.status(200).json(token);
    } catch (err) {
        logger.warn("Login failed", { email: req.body.email, error: err.message });
        res.status(401).json({ error: err.message });
    }
};

module.exports = {
    registerUser,
    getUserById,
    loginUser
};
