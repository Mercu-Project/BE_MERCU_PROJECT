const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const httpStatus = require('http-status');

const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            const { role } = req.user;
            if (Array.isArray(roles)) {
                if (roles.includes(role)) {
                    return next();
                }
            } else {
                if (role === roles) {
                    return next();
                }
            }

            return httpResponse(res, httpStatus.FORBIDDEN, 'Access Denied');
        } catch (error) {
            return serverErrorResponse(res, error);
        }
    };
};

module.exports = checkRole;
