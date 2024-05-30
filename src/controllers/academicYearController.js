const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const { ERR_MSG } = require('../utils/constants');

const createYear = async (req, res) => {
    try {
        const { year, semester } = req.body;
        await db.execute(
            'INSERT INTO academic_years (academic_year, semester) VALUES(?, ?)',
            [year, semester]
        );
        return httpResponse(res, httpStatus.CREATED, 'Data has been saved.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getYears = async (req, res) => {
    try {
        const [yearRows] = await db.execute(
            `SELECT id, CONCAT(academic_year, ' ', semester) AS 'academic_year' FROM academic_years ORDER BY academic_year DESC`
        );
        return httpResponse(res, httpStatus.OK, 'Get years data', yearRows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const deleteYear = async (req, res) => {
    try {
        const { id } = req.params;
        const [deleteData] = await db.execute(
            'DELETE FROM academic_years WHERE id = ?',
            [id]
        );
        if (deleteData.affectedRows === 0) {
            throw new Error(ERR_MSG.ID_NOTFOUND_REM);
        }

        return httpResponse(res, httpStatus.OK, 'data has been removed');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    createYear,
    getYears,
    deleteYear,
};
