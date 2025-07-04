const logger = require("../utils/logger");
const User = require("../models/User");
const bcrypt = require('bcrypt');

const registerUserService = async (userData) => {
    logger.debug("Checking for existing user", { email: userData.email });

    const existing = await User.findOne({ email: userData.email });
    if (existing) {
        logger.warn("User already exists", { email: userData.email });
        throw new Error('User with same email already exists');
    }

    logger.debug("Hashing password");
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({ ...userData, password: hashedPassword });

    const savedUser = await user.save();
    logger.info("User saved to DB", { userId: savedUser._id });

    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;

    return userWithoutPassword;
};

const getUserByIdService = async (id) => {
    logger.debug("Looking up user by ID", { id });
    const user = await User.findById(id).select('-password');

    if (!user) {
        logger.warn("User not found", { id });
        throw new Error('User not found');
    }

    return user;
};

const loginUserService = async (userData) => {
    logger.debug("Finding user for login", { email: userData.email });

    const user = await User.findOne({ email: userData.email });
    if (!user) {
        logger.warn("Login failed - user not found", { email: userData.email });
        throw new Error('User does not exist');
    }

    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordValid) {
        logger.warn("Login failed - invalid password", { email: userData.email });
        throw new Error('Invalid credentials');
    }

    logger.info("User authenticated", { userId: user._id });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return userWithoutPassword;
};

module.exports = {
    registerUserService,
    getUserByIdService,
    loginUserService
};
