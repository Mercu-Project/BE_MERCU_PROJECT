const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const { PO_STAT } = require('../utils/constants');
const httpStatus = require('http-status');
const {
    isEqual,
    isNotEqual,
    isModified,
    isNotContains,
} = require('../utils/compareUtil');
const { replacePlaceholrders } = require('../utils/stringUtil');
const { buildPaginationData } = require('../utils/pagination');

const submitPreorder = async (req, res) => {
    let connection;
    try {
        const { eventDate, preorderTypes } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'validation error', errors.array());
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Get current month and year
        const currentMonth = new Date().getMonth() + 1; // Months are zero-indexed
        const currentYear = new Date().getFullYear();

        // Query to get the last sequential number for the current month and year
        const [rows] = await connection.execute(
            `SELECT MAX(SUBSTRING(number, -4)) AS last_number 
                FROM canteen_preorders 
                WHERE DATE_FORMAT(created_at, '%m-%Y') = DATE_FORMAT(NOW(), '%m-%Y')`
        );

        let lastNumber = rows[0].last_number
            ? parseInt(rows[0].last_number, 10)
            : 0;
        let newNumber = (lastNumber + 1).toString().padStart(4, '0');

        let nomorPengajuan = `PO.${currentMonth
            .toString()
            .padStart(2, '0')}.${currentYear}.${newNumber}`;

        const [newPreorder] = await connection.execute(
            'INSERT INTO canteen_preorders (requester_id, event_date, request_count, status, number, faculty_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                eventDate,
                1,
                PO_STAT.PENDING,
                nomorPengajuan,
                req.user.facultyId,
            ]
        );

        if (newPreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing query insert preorder');
        }

        const preorderId = newPreorder.insertId;

        for (const preOrderType of preorderTypes) {
            const [newPreorderType] = await connection.execute(
                'INSERT INTO canteen_preorder_detail (order_type, qty, preorder_id) VALUES (?, ?, ?)',
                [preOrderType.orderType, preOrderType.qty, preorderId]
            );

            if (newPreorderType.affectedRows === 0) {
                await connection.rollback();
                throw new Error('failed executin query insert preorder detail');
            }
        }

        await connection.commit();

        connection.release();

        return httpResponse(
            res,
            httpStatus.CREATED,
            'Berhasil melakukan pengajuan PO'
        );
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        return serverErrorResponse(res, error);
    }
};

const approvalPreorder = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { status, rejectReason } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, httpStatus.BAD_REQUEST, errors.array());
        }

        if (status === PO_STAT.REJECT.PAYLOAD) {
            if (rejectReason === null || rejectReason === '') {
                return httpResponse(
                    res,
                    httpStatus.BAD_REQUEST,
                    'alasan penolakan harus diisi'
                );
            }
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        const [checkPreorder] = await connection.execute(
            'SELECT faculty_id FROM canteen_preorders WHERE id = ?',
            [id]
        );

        if (checkPreorder.length < 1) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'preorder not found'
            );
        }

        if (isNotEqual(checkPreorder[0].faculty_id, req.user.facultyId)) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.FORBIDDEN,
                'action is forbidden'
            );
        }

        let newStatus = '';
        if (isEqual(status, PO_STAT.APPROVE.PAYLOAD)) {
            newStatus = replacePlaceholrders(PO_STAT.APPROVE.SYSTEM, [
                req.user.role,
            ]);
        } else if (isEqual(status, PO_STAT.REJECT.PAYLOAD)) {
            newStatus = replacePlaceholrders(PO_STAT.REJECT.SYSTEM, [
                req.user.role,
            ]);
        }

        const [updatePreorder] = await connection.execute(
            'UPDATE canteen_preorders SET status = ? WHERE id = ?',
            [newStatus, id]
        );

        if (updatePreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing update preorder');
        }

        const [insertStatusHistory] = await connection.execute(
            `INSERT INTO canteen_preorder_status_history (preorder_id, status, reject_reason, approver_id)
            VALUES (?, ?, ?, ?)`,
            [id, newStatus, rejectReason, req.user.id]
        );

        if (insertStatusHistory.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing insert status history');
        }

        await connection.commit();

        connection.release();

        return httpResponse(
            res,
            httpStatus.OK,
            'Berhasil melakukan approval PO'
        );
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        return serverErrorResponse(res, error);
    }
};

const getPreorders = async (req, res) => {
    try {
        let { limit, page, search = '' } = req.query;

        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const offset = (page - 1) * limit;

        console.log(req.user.facultyId);

        const [rows] = await db.execute(
            `SELECT 
                cpo.event_date,
                cpo.request_count,
                cpo.status,
                cpo.number,
                SUM(cpod.qty) AS total_quantity
            FROM 
                canteen_preorders cpo
            LEFT JOIN 
                canteen_preorder_detail cpod ON cpo.id = cpod.preorder_id
            WHERE
                cpo.faculty_id = ?
            GROUP BY 
                cpo.id
            ORDER BY
                cpo.created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}

 `,
            [req.user.facultyId]
        );

        const pagination = buildPaginationData(limit, page, rows.length);

        return httpResponse(
            res,
            httpStatus.OK,
            'get preorder data',
            rows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const editPreorder = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { eventDate, preorderTypes } = req.body;

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [oldPreorder] = await connection.execute(
            `SELECT * FROM canteen_preorders WHERE id = ?`,
            [id]
        );

        if (oldPreorder.length < 1) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'preorder not found'
            );
        }

        if (isNotContains(oldPreorder[0].status, PO_STAT.REJECT.PAYLOAD)) {
            await connection.rollback();
            throw new Error('invalid status');
        }

        if (isNotEqual(oldPreorder[0].faculty_id, req.user.facultyId)) {
            await connection.rollback();
            throw new Error('forbidden');
        }

        const [updatePreorder] = await connection.execute(
            `UPDATE canteen_preorders SET event_date = ?, status = ? WHERE id = ?`,
            [eventDate, PO_STAT.PENDING, id]
        );

        if (updatePreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing update preorder');
        }

        for (const preorderType of preorderTypes) {
            const [updateType] = await connection.execute(
                `UPDATE canteen_preorder_detail SET order_type = ?, qty = ? WHERE id = ?`,
                [preorderType.orderType, preorderType.qty, preorderType.id]
            );

            if (updateType.affectedRows === 0) {
                await connection.rollback();
                throw new Error('failed executing preorder detail');
            }
        }

        const [insertHistory] = await connection.execute(
            `INSERT INTO canteen_preorder_status_history (status, reject_reason, approver_id, preorder_id)
            VALUES (?, ?, ?, ?)`,
            [PO_STAT.PENDING, null, req.user.id, id]
        );

        if (insertHistory.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing insert status history');
        }

        await connection.commit();
        connection.release();

        return httpResponse(res, httpStatus.OK, 'Berhasil mengubah pengajuan');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getStatusHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT 
                cph.id,
                cph.preorder_id,
                cph.status,
                cph.changed_at,
                cph.reject_reason,
                cph.created_at,
                cph.updated_at,
                a.full_name AS approver_name
            FROM 
                canteen_preorder_status_history cph
            JOIN 
                accounts acc ON cph.approver_id = acc.id
            JOIN 
                admins a ON a.account_id = acc.id
            WHERE 
                cph.preorder_id = ?
            ORDER BY 
                cph.changed_at ASC;
 `,
            [id]
        );

        return httpResponse(res, httpStatus.OK, 'get status history', rows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getPreorderDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.execute(
            `SELECT 
                cpd.id,
                cpd.preorder_id,
                cpd.order_type,
                cpd.qty,
                cpd.created_at,
                cpd.updated_at
            FROM 
                canteen_preorder_detail cpd
            WHERE 
                cpd.preorder_id = ?
`,
            [id]
        );

        if (!rows) {
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'preorder detail not found'
            );
        }

        return httpResponse(res, httpStatus.OK, 'get preorder detail', rows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    submitPreorder,
    approvalPreorder,
    getPreorders,
    editPreorder,
    getStatusHistory,
    getPreorderDetail,
};
