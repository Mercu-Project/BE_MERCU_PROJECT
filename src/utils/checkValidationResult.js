const { httpResponse } = require('./httpResponse');
const httpStatus = require('http-status');

const checkValidation = (res, message, errors) => {
    if (!errors.isEmpty()) {
        return httpResponse(
            res,
            httpStatus.BAD_REQUEST,
            message,
            errors.array()
        );
    }
};

module.exports = checkValidation;
