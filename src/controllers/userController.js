const httpStatus = require('http-status');
const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');

const getUsers = async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM users');
        return httpResponse(res, 200, 'Get data user success', results);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getStudent = async (req, res) => {
    try {
        const { username } = req.user;
        const [userRows] = await db.execute(
            `
            SELECT u.username, s.full_name, s.email, s.phone, s.nik 
            FROM students s LEFT JOIN users u ON s.user_id = u.id
            WHERE u.username = ? 
        `,
            [username]
        );

        return httpResponse(
            res,
            httpStatus.OK,
            'Get student success',
            userRows[0]
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    getUsers,
    getStudent,
};
