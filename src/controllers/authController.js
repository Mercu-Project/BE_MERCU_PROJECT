const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const jwt = require('../utils/jwt');
const bcrypt = require('../utils/bcrypt');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');

const register = async (req, res) => {
    try {
        const { username, password, roleId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'Validation error', errors.array());
        }

        const [rows] = await db.execute(
            'SELECT username FROM users WHERE username = ?',
            [username]
        );

        if (rows.length > 0) {
            return httpResponse(res, 400, 'username already exist.');
        }

        const [roleRow] = await db.execute(
            'SELECT name FROM roles WHERE id = ?',
            [parseInt(roleId)]
        );

        if (roleRow.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'role not found.');
        }

        const hashed = bcrypt.hashPassword(password);

        await db.execute(
            'INSERT INTO users (username, password, role_id) VALUE (?, ?, ?)',
            [username, hashed, roleId]
        );

        const response = {
            username,
            password,
            role: roleRow[0].name,
        };

        return httpResponse(res, 201, 'User created.', response);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'validation error', errors.array());
        }

        const [rows] = await db.execute(
            `SELECT u.id, u.username, u.password, r.name AS roleName 
            FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = ?`,
            [username]
        );

        if (rows.length < 1) {
            return httpResponse(res, 404, 'user not found');
        }

        if (!bcrypt.comparePassword(password, rows[0].password)) {
            return httpResponse(res, 400, 'Password is incorrect');
        }

        const payload = {
            id: rows[0].id,
            username: rows[0].username,
            role: rows[0].roleName,
        };

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
