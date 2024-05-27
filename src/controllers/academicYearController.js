const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');

const createYear = async (req, res) => {
    try {
        const { year } = req.body;
        await db.execute(
            'INSERT INTO academic_years (academic_year) VALUES(?)',
            [year]
        );
        return httpResponse(res, httpStatus.CREATED, 'Data has been saved.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getYears = async (req, res) => {
    try {
        const [yearRows] = await db.execute(
            'SELECT academic_year FROM academic_years ORDER BY academic_year DESC'
        );
        return httpResponse(res, httpStatus.OK, 'Get years data', yearRows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    createYear,
    getYears,
};
