const httpStatus = require('http-status');
const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const bcrypt = require('../utils/bcrypt');
const {
    parseOrUseDefault,
    getOffset,
    buildPaginationData,
} = require('../utils/pagination');
const { ERR_MSG } = require('../utils/constants');

const getUsers = async (req, res) => {
    try {
        let { limit, page, search = '' } = req.query;

        const { perPage, currentPage } = parseOrUseDefault(limit, page);
        const offset = getOffset(perPage, currentPage);

        let whereClause = '';
        let queryParams = [];

        if (search) {
            whereClause = `WHERE LOWER(u.full_name) LIKE ? OR LOWER(acc.username) LIKE ?`;
            queryParams.push(
                `%${search.toLowerCase()}%`,
                `%${search.toLowerCase()}%`
            );
        }

        const baseQuery = `
            SELECT
                u.full_name AS fullName,
                CASE WHEN u.status = '1'
                THEN 'Aktif'
                ELSE 'Tidak Aktif'
                END AS status,
                acc.username AS unique_id,
                u.unit
            FROM
                users u
            JOIN accounts acc ON u.account_id = acc.id
            ${whereClause}
        `;

        const orderQuery = `ORDER BY u.id DESC
                            LIMIT ${perPage} OFFSET ${offset}`;

        const totalQuery = `
                SELECT 
                    COUNT(*) AS total_data
                FROM
                    (
                    ${baseQuery}
                ) AS subquery_alias
            `;
        const paginationQuery = `
                ${baseQuery}
                ${orderQuery}
            `;

        const [userRows] = await db.execute(paginationQuery, queryParams);
        const [totalRows] = await db.execute(totalQuery, queryParams);

        const pagination = buildPaginationData(
            perPage,
            currentPage,
            totalRows[0].total_data
        );

        return httpResponse(
            res,
            httpStatus.OK,
            'get users',
            userRows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const registerUser = async (req, res) => {
    let connection;
    try {
        const { username, password, full_name, unit } = req.body;

        const [oldUsername] = await db.execute(
            'SELECT username, password FROM accounts WHERE username = ?',
            [username]
        );

        if (oldUsername.length > 0) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'Username sudah ada.'
            );
        }

        const hashed = bcrypt.hashPassword(password);

        const [roleRow] = await db.execute(
            `SELECT id, name FROM roles WHERE name = 'User'`
        );

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [newAccount] = await db.execute(
            'INSERT INTO accounts (username, password, role_id) VALUES (?, ?, ?) ',
            [username, hashed, roleRow[0].id]
        );

        const accountId = newAccount.insertId;

        const [newUser] = await db.execute(
            'INSERT INTO users (full_name, account_id, unit) VALUES (?, ?, ?)',
            [full_name, accountId, unit]
        );

        if (newUser.affectedRows === 0) {
            throw new Error('Failed creating new user');
        }

        await connection.commit();

        connection.release();

        return httpResponse(
            res,
            httpStatus.CREATED,
            'Sukses membuat user baru'
        );
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        return serverErrorResponse(res, error);
    }
};

const changeUserStatus = async (req, res) => {
    try {
        const { username } = req.params;
        const { status } = req.body;

        const [accountRow] = await db.execute(
            'SELECT id FROM accounts WHERE username = ?',
            [username]
        );

        if (accountRow.length === 0) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Account not found');
        }

        const [updateRow] = await db.execute(
            `UPDATE users SET status = ? WHERE account_id = ?`,
            [status, accountRow[0].id]
        );

        if (updateRow.affectedRows === 0) {
            throw new Error(ERR_MSG.FAIL_UPD);
        }

        return httpResponse(res, httpStatus.OK, 'Status changed');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const editUser = async (req, res) => {
    let connection;
    try {
        const { username } = req.params;
        const { newStatus, newUsername, newFullName } = req.body;

        const [accountRow] = await db.execute(
            'SELECT id FROM accounts WHERE username = ?',
            [username]
        );

        if (accountRow.length === 0) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Account not found');
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        if (username !== newUsername) {
            const [oldUsername] = await db.execute(
                'SELECT username FROM accounts WHERE username = ?',
                [newUsername]
            );

            if (oldUsername.length > 0) {
                return httpResponse(
                    res,
                    httpStatus.CONFLICT,
                    'Username sudah ada'
                );
            }
        }

        const [updateAcount] = await db.execute(
            'UPDATE accounts SET username = ? WHERE id = ?',
            [newUsername, accountRow[0].id]
        );

        if (updateAcount.affectedRows === 0) {
            throw new Error(ERR_MSG.FAIL_UPD);
        }

        const [updateUser] = await db.execute(
            'UPDATE users SET full_name = ?, status = ? WHERE account_id = ?',
            [newFullName, newStatus, accountRow[0].id]
        );

        if (updateUser.affectedRows === 0) {
            throw new Error(ERR_MSG.FAIL_UPD);
        }

        await connection.commit();

        connection.release();

        return httpResponse(res, httpStatus.OK, 'User has been updated');
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        return serverErrorResponse(res, error);
    }
};

module.exports = {
    getUsers,
    registerUser,
    changeUserStatus,
    editUser,
};
