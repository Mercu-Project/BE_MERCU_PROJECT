const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const httpStatus = require('http-status');
const { decodeToken } = require('../utils/jwt');

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return httpResponse(res, httpStatus.UNAUTHORIZED, 'Unauthorized');
    }

    const [bearer, token] = authHeader.split(' ');
    try {
        if (!token || bearer !== 'Bearer') {
            return httpResponse(res, httpStatus.UNAUTHORIZED, 'Invalid token');
        }

        const decoded = decodeToken(token);

        req.user = { ...decoded };

        return next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return httpResponse(res, httpStatus.UNAUTHORIZED, 'Token expired');
        }
        return serverErrorResponse(res, error);
    }
};

module.exports = auth;
