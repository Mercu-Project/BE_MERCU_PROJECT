const httpStatus = require('http-status');

/* Common Response */
const httpResponse = (res, code, message, data, pagination) => {
    const json = { message };
    if (data) json.data = data;
    if (pagination) json.pagination = pagination;
    return res.status(code).json(json);
};

/* Internal Server Error Response */
const serverErrorResponse = (res, error) => {
    console.log(error);
    return httpResponse(
        res,
        httpStatus.INTERNAL_SERVER_ERROR,
        'Server processing error'
    );
};

module.exports = {
    httpResponse,
    serverErrorResponse,
};
