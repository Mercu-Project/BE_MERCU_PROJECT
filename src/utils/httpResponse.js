/* Common Response */
const httpResponse = (res, code, message, data) => {
    const json = { message };
    if (data) json.data = data;
    return res.status(code).json(json);
};

/* Internal Server Error Response */
const serverErrorResponse = (res, error) => {
    console.log(error);
    return httpResponse(res, 500, 'Internal Server Error');
};

module.exports = {
    httpResponse,
    serverErrorResponse,
};
