const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const { ERR_MSG } = require('../utils/constants');
const checkValidation = require('../utils/checkValidationResult');

const createRoom = async (req, res) => {
    try {
        const { name } = req.body;

        checkValidation(req, 'validation error', validationResult(req));

        await db.execute('INSERT INTO rooms (name) VALUES (?)', [name]);

        return httpResponse(res, httpStatus.CREATED, 'Room has been created');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const [deleteRoom] = await db.execute(
            'DELETE FROM rooms WHERE id = ?',
            [id]
        );

        if (deleteRoom.affectedRows === 0) {
            throw new Error(ERR_MSG.ID_NOTFOUND_REM);
        }

        return httpResponse(res, httpStatus.OK, 'Room has been removed.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    createRoom,
    deleteRoom,
};
