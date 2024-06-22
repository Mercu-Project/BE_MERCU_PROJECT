const httpStatus = require('http-status');
const db = require('../config/db');
const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const bcrypt = require('../utils/bcrypt');
const {
    parseOrUseDefault,
    getOffset,
    buildPaginationData,
} = require('../utils/pagination');

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
                acc.username AS unique_id
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

const getStudent = async (req, res) => {
    try {
        const { username } = req.user;
        const [userRows] = await db.execute(
            `
            SELECT u.username, s.full_name, s.email, s.phone, s.nik 
            FROM students s LEFT JOIN users u ON s.user_id = u.id
            WHERE u.username = ? 
        `,
            [username]
        );

        return httpResponse(
            res,
            httpStatus.OK,
            'Get student success',
            userRows[0]
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const registerUser = async (req, res) => {
    let connection;
    try {
        const { username, password, full_name } = req.body;

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
            'INSERT INTO users (full_name, account_id) VALUES (?, ?)',
            [full_name, accountId]
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

module.exports = {
    getUsers,
    getStudent,
    registerUser,
};
