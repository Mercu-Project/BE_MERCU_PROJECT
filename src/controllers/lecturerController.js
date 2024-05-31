const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const { ERR_MSG } = require('../utils/constants');

const getLecturers = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, full_name FROM lecturers ORDER BY id DESC'
        );

        return httpResponse(res, httpStatus.OK, 'get lecturers', rows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    getLecturers,
};
