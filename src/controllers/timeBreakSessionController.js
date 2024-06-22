const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const { validationResult } = require('express-validator');
const { buildPaginationData } = require('../utils/pagination');
const httpStatus = require('http-status');
const checkValidation = require('../utils/checkValidationResult');
const { ERR_MSG } = require('../utils/constants');

const addSession = async (req, res) => {
    try {
        const { name, open, close } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'Validation error', errors.array());
        }

        await db.execute(
            'INSERT INTO time_break_sessions (session_name, session_open, session_close) VALUES (?, ?, ?)',
            [name, open, close]
        );

        const response = {
            request: {
                name,
                open,
                close,
            },
        };

        return httpResponse(res, 201, 'Session Created.', response);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getSessions = async (req, res) => {
    try {
        checkValidation(res, 'Query params invalid.', validationResult(req));

        let { limit, page } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        const offset = (page - 1) * limit;

        const connection = await db.getConnection();

        try {
            const [rows] = await connection.execute(
                `SELECT id, session_name AS name, session_open AS open, session_close AS close, status FROM time_break_sessions ORDER BY session_open ASC LIMIT ${offset}, ${limit}`
            );

            // Release the connection back to the pool
            connection.release();

            const [totalDataRows] = await db.execute(
                'SELECT COUNT(*) AS totalData FROM time_break_sessions'
            );

            const totalData = totalDataRows[0].totalData;

            const pagination = buildPaginationData(
                limit,
                page,
                parseInt(totalData)
            );

            return httpResponse(
                res,
                200,
                'Get data time break sessions',
                rows,
                pagination
            );
        } catch (error) {
            // Ensure connection is released in case of error
            connection.release();
            throw error;
        }
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const editSession = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'Edit session validation error',
                errors.array()
            );
        }

        const { id } = req.params;

        const { name, open, close, status } = req.body;

        const [rows] = await db.execute(
            'SELECT id FROM time_break_sessions WHERE id = ?',
            [id]
        );

        if (rows.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Data not found.');
        }

        const [updateData] = await db.execute(
            'UPDATE time_break_sessions SET session_name = ?, session_open = ?, session_close = ?, status = ? WHERE id = ?',
            [name, open, close, status, id]
        );

        if (updateData.affectedRows === 0) {
            throw new Error(ERR_MSG.ID_NOTFOUND_UPD);
        }

        const response = {
            param: {
                id,
            },
            request: {
                name,
                open,
                close,
                status,
            },
        };

        return httpResponse(
            res,
            httpStatus.OK,
            'Time break session updated successfully.',
            response
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const removeSession = async (req, res) => {
    try {
        const { id } = req.params;

        const [removeData] = await db.execute(
            'DELETE FROM time_break_sessions WHERE id = ?',
            [id]
        );

        if (removeData.affectedRows === 0) {
            throw new Error(ERR_MSG.ID_NOTFOUND_REM);
        }

        const response = {
            params: {
                id,
            },
        };

        return httpResponse(
            res,
            httpStatus.OK,
            'Data has been removed successfully',
            response
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const switchStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            'SELECT id, status FROM time_break_sessions WHERE id = ?',
            [id]
        );

        if (rows.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Data not found.');
        }

        const newStatus = rows[0].status === '0' ? '1' : '0';

        await db.execute(
            'UPDATE time_break_sessions SET status = ? WHERE id = ?',
            [newStatus, id]
        );

        return httpResponse(res, httpStatus.OK, 'Status switched.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const swithAllStatuses = async (req, res) => {
    try {
        checkValidation(
            res,
            'Switch all status validation failed.',
            validationResult(req)
        );

        const { status } = req.body;

        await db.execute('UPDATE time_break_sessions SET status = ?', [status]);

        return httpResponse(res, httpStatus.OK, 'All status switched.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    addSession,
    getSessions,
    editSession,
    removeSession,
    switchStatus,
    swithAllStatuses,
};
