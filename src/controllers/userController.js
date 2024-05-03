const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');

const getUsers = async (req, res) => {
    try {
        const [results] = await (await db).execute('SELECT * FROM users');
        return httpResponse(res, 200, 'Get data user success', results);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    getUsers,
};
