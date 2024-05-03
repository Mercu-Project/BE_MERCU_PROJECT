const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiry = process.env.JWT_EXPIRY;
const jwtAlgorithm = process.env.JWT_ALGORITHM;

const generateToken = (payload) => {
    return jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiry,
        algorithm: jwtAlgorithm,
    });
};

const decodeToken = (token) => {
    return jwt.verify(token, jwtSecret);
};

module.exports = {
    generateToken,
    decodeToken,
};
