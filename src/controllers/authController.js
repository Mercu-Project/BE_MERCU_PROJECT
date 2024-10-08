const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const jwt = require('../utils/jwt');
const bcrypt = require('../utils/bcrypt');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const roleTableConstants = require('../utils/roleTableConstants');
const { RO_TBL } = require('../utils/constants');

// ! Development Only
const register = async (req, res) => {
    try {
        const { username, password, roleId, facultyId } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'Validation error', errors.array());
        }

        const [rows] = await db.execute(
            'SELECT username FROM account WHERE username = ?',
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

//! Developemnt Only
const registerAdmin = async (req, res) => {
    let connection;
    try {
        const { username, password, full_name, roleId, facultyId } = req.body;

        const hashed = bcrypt.hashPassword(password);

        const [oldUsername] = await db.execute(
            'SELECT username FROM accounts WHERE username = ?',
            [username]
        );

        if (oldUsername.length > 0) {
            return httpResponse(
                res,
                httpStatus.CONFLICT,
                'Username already exist'
            );
        }

        const [checkRole] = await db.execute(
            'SELECT id FROM roles WHERE id = ?',
            [roleId]
        );

        if (checkRole.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Role not found');
        }

        const [checkFaculty] = await db.execute(
            'SELECT id FROM faculties WHERE id = ?',
            [facultyId]
        );

        if (checkFaculty.length < 1) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Faculty not found');
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [newAccount] = await db.execute(
            'INSERT INTO accounts (username, password, role_id, faculty_id) VALUES (?, ?, ?, ?) ',
            [username, hashed, roleId, facultyId]
        );

        const accountId = newAccount.insertId;

        const [newAdmin] = await db.execute(
            'INSERT INTO admins (full_name, account_id) VALUES (?, ?)',
            [full_name, accountId]
        );

        if (newAdmin.affectedRows === 0) {
            throw new Error('Failed creating admin');
        }

        await connection.commit();

        connection.release();

        return httpResponse(res, httpStatus.CREATED, 'Admin has been created');
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

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
            `SELECT u.id, u.username, u.password, u.role_id, u.faculty_id, f.name AS faculty_name 
            FROM accounts u LEFT JOIN faculties f ON f.id = u.faculty_id WHERE username = ?`,
            [username]
        );

        if (rows.length === 0) {
            return httpResponse(res, httpStatus.BAD_REQUEST, 'Username salah');
        }

        if (!bcrypt.comparePassword(password, rows[0].password)) {
            return httpResponse(res, httpStatus.BAD_REQUEST, 'Password Salah');
        }

        const [roleRows] = await db.execute(
            'SELECT id, name FROM roles WHERE id = ?',
            [rows[0].role_id]
        );

        const tbl = roleRows[0].name === 'User' ? 'users' : 'admins';

        const [detailAccountRows] = await db.execute(
            `SELECT full_name, unit FROM ${tbl} WHERE account_id = ? `,
            [rows[0].id]
        );

        const payload = {
            id: rows[0].id,
            name: detailAccountRows[0].full_name,
            username: rows[0].username,
            role: roleRows[0].name,
            facultyId: rows[0].faculty_id,
            facultyName: rows[0].faculty_name,
            unit: detailAccountRows[0].unit,
        };

        const token = jwt.generateToken(payload);

        return httpResponse(res, 200, 'Login success', { token });
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const changePassword = async (req, res) => {
    try {
        const { username } = req.user;
        const { oldPassword, newPassword } = req.body;

        const [accountRow] = await db.execute(
            'SELECT id, username, password FROM accounts WHERE username = ?',
            [username]
        );

        if (accountRow.length === 0) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'user not found');
        }

        if (!bcrypt.comparePassword(oldPassword, accountRow[0].password)) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'Password lama salah'
            );
        }

        const hashed = bcrypt.hashPassword(newPassword);

        const [updateAccount] = await db.execute(
            'UPDATE accounts SET password = ? WHERE username = ? AND id = ?',
            [hashed, username, accountRow[0].id]
        );

        if (updateAccount.affectedRows === 0) {
            throw new Error(ERR_MSG.FAIL_UPD);
        }

        return httpResponse(res, httpStatus.OK, 'Password has been updated');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    register,
    login,
    registerAdmin,
    changePassword,
};
