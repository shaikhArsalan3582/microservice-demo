const jwt = require('jsonwebtoken');

const generateToken = async (data) => {
    return await jwt.sign(data, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' })
}

module.exports = generateToken;