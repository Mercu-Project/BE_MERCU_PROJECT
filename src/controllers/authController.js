const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const jwt = require('../utils/jwt');
const bcrypt = require('../utils/bcrypt');
const db = require('../config/db');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
    try {
        const { nomorPegawai, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'Validation error', errors.array());
        }

        const [rows] = await (
            await db
        ).execute('SELECT nomor_pegawai FROM users WHERE nomor_pegawai = ?', [
            nomorPegawai,
        ]);

        if (rows.length > 0) {
            return httpResponse(res, 400, 'User already exist.');
        }

        const hashed = bcrypt.hashPassword(password);

        await (
            await db
        ).execute('INSERT INTO users (nomor_pegawai, password) VALUE (?, ?)', [
            nomorPegawai,
            hashed,
        ]);

        return httpResponse(res, 201, 'User created.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const login = async (req, res) => {
    try {
        const { nomorPegawai, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'validation error', errors.array());
        }

        const [rows] = await (
            await db
        ).execute(
            'SELECT id, nomor_pegawai, password FROM users WHERE nomor_pegawai = ?',
            [nomorPegawai]
        );

        if (rows.length < 1) {
            return httpResponse(res, 404, 'user not found');
        }

        if (!bcrypt.comparePassword(password, rows[0].password)) {
            return httpResponse(res, 400, 'Password is incorrect');
        }

        const payload = { id: rows[0].id, nomorPegawai: rows[0].nomor_pegawai };
        const token = jwt.generateToken(payload);

        return httpResponse(res, 200, 'Login success', { token });
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    register,
    login,
};
