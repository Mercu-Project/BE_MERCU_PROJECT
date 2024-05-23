const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');

const inputScan = async (req, res) => {
    try {
        const { nomorPegawai, scanned_at } = req.body;

        const [rows] = await db.execute(
            'SELECT id FROM users WHERE nomor_pegawai = ?',
            [nomorPegawai]
        );

        if (rows.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'User not found');
        }

        await db.execute(
            'INSERT INTO canteen_scans (user_id, time_break_session_id) VALUE (?, ?)'
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};
