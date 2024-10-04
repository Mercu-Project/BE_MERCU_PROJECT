const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const { PO_STAT, ROLES, DATE_FMT_TYPE } = require('../utils/constants');
const httpStatus = require('http-status');
const {
    isEqual,
    isNotEqual,
    isNotContains,
    isBlank,
    isContains,
} = require('../utils/compareUtil');
const { replacePlaceholders } = require('../utils/stringUtil');
const { buildPaginationData } = require('../utils/pagination');
const {
    convertToJakartaTime,
    getCurrentTime,
    getDayDifference,
} = require('../utils/dateUtil');

const submitPreorder = async (req, res) => {
    let connection;
    try {
        let {
            eventDate,
            preorderTypes,
            eventName,
            eventMembers,
            additionalEventMember,
        } = req.body;
        // const attachmentPath = req.file ? req.file.path : null; // Save the file path if a file is uploaded
        const attachmentPath = null;
        // Save the file path if a file is uploaded
        // Parse preorderTypes from JSON string if necessary
        // if (typeof preorderTypes === 'string') {
        //     preorderTypes = JSON.parse(preorderTypes);
        // }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, 400, 'validation error', errors.array());
        }

        eventDate = convertToJakartaTime(eventDate, DATE_FMT_TYPE.DATE);

        const dayDifference = getDayDifference(eventDate);
        if (dayDifference < 7) {
            return httpResponse(
                res,
                httpStatus.BAD_REQUEST,
                'Jarak waktu acara minimal 7 hari'
            );
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

        const pendingStatus = replacePlaceholders(PO_STAT.PENDING, [
            ROLES.DEKAN,
        ]);

        const [newPreorder] = await connection.execute(
            'INSERT INTO canteen_preorders (requester_id, event_date, request_count, status, number, faculty_id, event_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                eventDate,
                1,
                pendingStatus,
                nomorPengajuan,
                req.user.facultyId,
                eventName,
            ]
        );

        if (newPreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing query insert preorder');
        }

        const preorderId = newPreorder.insertId;

        /* Insert preorder types */
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

        /* Insert event members */
        for (const eventMember of eventMembers) {
            const [insertEventMember] = await connection.execute(
                `INSERT INTO event_members (member_name, is_additional, preorder_id)
                VALUES (?, ?, ?)`,
                [eventMember.username, false, preorderId]
            );

            if (insertEventMember.affectedRows === 0) {
                await connection.rollback();
                throw new Error('Failed executing insert new event member');
            }
        }

        /*  Insert Additional Event Member if exist */
        for (const additional of additionalEventMember) {
            const [insertEventMember] = await connection.execute(
                `INSERT INTO event_members (member_name, is_additional, preorder_id)
                VALUES (?, ?, ?)`,
                [additional.fullName, true, preorderId]
            );

            if (insertEventMember.affectedRows === 0) {
                await connection.rollback();
                throw new Error(
                    'Failed executing insert new additional event member'
                );
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
        /* id preorder */
        const { id } = req.params;

        /* payload */
        let { status, rejectReason } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return httpResponse(res, httpStatus.BAD_REQUEST, errors.array());
        }

        /* Jika status "Ditolak", maka pastikan rejectReason (Alasan Penolakan) diisi */
        if (status === PO_STAT.REJECT_PAYLOAD) {
            if (isBlank(rejectReason)) {
                return httpResponse(
                    res,
                    httpStatus.BAD_REQUEST,
                    'alasan penolakan harus diisi'
                );
            }
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        /* Query untuk pengecekan preorder lama ada atau tidak di database */
        const [checkPreorder] = await connection.execute(
            'SELECT faculty_id FROM canteen_preorders WHERE id = ?',
            [id]
        );

        /* Pastikan data preorder lama ada di database, jika tidak maka status not found */
        if (checkPreorder.length < 1) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'preorder not found'
            );
        }

        /* Pastikan data yang akan dilakukan approval merupakan data fakultas yang sama dengan approver (user yang melakaukan approval) */
        if (isNotEqual(checkPreorder[0].faculty_id, req.user.facultyId)) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.FORBIDDEN,
                'action is forbidden'
            );
        }

        let preorderStatus = '';
        const changedAt = getCurrentTime();
        const sqlStatusHistory = `INSERT INTO canteen_preorder_status_history 
                                    (preorder_id, status, changed_at, reject_reason, approver_id)
                                    VALUES (?, ?, ?, ?, ?)`;
        const { role } = req.user;

        /* Pengecekan status */
        if (isEqual(status, PO_STAT.REJECT_PAYLOAD)) {
            /* Jika status == 'Ditolak' maka ubah preorderStatus menjadi "Ditolak oleh [Dekan/BAK]" */
            preorderStatus = replacePlaceholders(PO_STAT.REJECT, [role]);

            /* Audit status 'Ditolak' */
            const [insertStatusHistory] = await connection.execute(
                sqlStatusHistory,
                [id, preorderStatus, changedAt, rejectReason, req.user.id]
            );

            if (insertStatusHistory.affectedRows === 0) {
                await connection.rollback();
                throw new Error('failed executing insert status history');
            }
        } else if (isEqual(status, PO_STAT.APPROVE_PAYLOAD)) {
            rejectReason = null;
            if (isEqual(role, ROLES.DEKAN)) {
                /* Jika status === 'Disetujui' dan role == 'Dekan' maka status = 'Menunggu Persetujuan BAK' */
                preorderStatus = replacePlaceholders(PO_STAT.PENDING, [
                    ROLES.BAK,
                ]);

                /* Audit status 'Disetujui oleh Dekan' */
                const auditStatus = replacePlaceholders(PO_STAT.APPROVE, [
                    ROLES.DEKAN,
                ]);
                const [auditApprByDekan] = await connection.execute(
                    sqlStatusHistory,
                    [id, auditStatus, changedAt, null, req.user.id]
                );
                if (auditApprByDekan.affectedRows === 0) {
                    await connection.rollback();
                    throw new Error('failed executing audit approve by dekan');
                }

                /* Audit status 'Menunggu Persetujuan BAK' */
                const [auditPendBAK] = await connection.execute(
                    sqlStatusHistory,
                    [id, preorderStatus, changedAt, null, req.user.id]
                );

                if (auditPendBAK.affectedRows === 0) {
                    await connection.rollback();
                    throw new Error('failed executing audit pending BAK');
                }
            } else if (isEqual(role, ROLES.BAK)) {
                /* Jika status === 'Disetujui' dan role == 'BAK' maka status = 'Menunggu Proses Kantin' */
                preorderStatus = PO_STAT.CANTEEN_PROCESS;

                /* Audit status 'Disetujui oleh BAK' */
                const auditStatus = replacePlaceholders(PO_STAT.APPROVE, [
                    ROLES.BAK,
                ]);
                const [auditApprByBAK] = await connection.execute(
                    sqlStatusHistory,
                    [id, auditStatus, changedAt, null, req.user.id]
                );
                if (auditApprByBAK.affectedRows === 0) {
                    await connection.rollback();
                    throw new Error('failed executing audit approve by BAK');
                }

                /* Audit status 'Menunggu Prose Kantin' */
                const [auditCanteenProc] = await connection.execute(
                    sqlStatusHistory,
                    [id, preorderStatus, changedAt, null, req.user.id]
                );

                if (auditCanteenProc.affectedRows === 0) {
                    await connection.rollback();
                    throw new Error('failed executing audit canteen process');
                }
            } else {
                /* Jika role bukan Dekan atau BAK, throw error */
                return httpResponse(
                    res,
                    httpStatus.FORBIDDEN,
                    'cannot do this action'
                );
            }
        } else {
            /* Jika status bukan Ditolak / Disetujui maka throw error */
            return httpResponse(res, httpStatus.BAD_REQUEST, 'invalid status');
        }

        const [updatePreorder] = await connection.execute(
            'UPDATE canteen_preorders SET status = ?, reject_reason = ? WHERE id = ?',
            [preorderStatus, rejectReason, id]
        );

        if (updatePreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing update preorder');
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
        const { role } = req.user;

        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const offset = (page - 1) * limit;

        const [checkExpPO] = await db.execute(
            `SELECT CONVERT_TZ(event_date, '+00:00', 'Asia/Jakarta') AS eventDate, status, id
            FROM canteen_preorders WHERE faculty_id = ?`,
            [req.user.facultyId]
        );

        for (const po of checkExpPO) {
            const dayDifference = getDayDifference(po.eventDate);
            if (
                dayDifference < 7 &&
                isContains(po.status, PO_STAT.REJECT_PAYLOAD)
            ) {
                const [setRejectBySystem] = await db.execute(
                    `UPDATE canteen_preorders SET status = ? WHERE id = ?`,
                    [PO_STAT.REJECT_BY_SYSTEM, po.id]
                );
                if (setRejectBySystem.affectedRows === 0) {
                    throw new Error('failed updating to reject by system');
                }
            }
        }

        let filterStatusQuery = '';
        if (isEqual(role, ROLES.BAK)) {
            // Filter for BAK role: Preorders with status 'Menunggu Persetujuan BAK' in status history
            filterStatusQuery = `
                AND EXISTS (
                    SELECT 1
                    FROM canteen_preorder_status_history cposh
                    WHERE cposh.preorder_id = cpo.id
                    AND cposh.status = '${replacePlaceholders(PO_STAT.PENDING, [
                        ROLES.BAK,
                    ])}'
                )
            `;
        } else if (isEqual(role, ROLES.ADMIN)) {
            // Filter for Admin role: Only show preorders with status 'Menunggu Proses Kantin'
            filterStatusQuery = `AND cpo.status = '${PO_STAT.CANTEEN_PROCESS}'`;
        }

        // Add condition to exclude records with status 'Ditolak oleh Sistem'
        const excludeRejectedBySystemQuery = `
         AND cpo.status != '${PO_STAT.REJECT_BY_SYSTEM}'
     `;

        const [rows] = await db.execute(
            `SELECT 
                cpo.id,
                CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta') AS event_date,
                cpo.event_name AS eventName,
                cpo.request_count,
                cpo.status,
                cpo.number,
                cpo.reject_reason,
                SUM(cpod.qty) AS total_quantity
            FROM 
                canteen_preorders cpo
            LEFT JOIN 
                canteen_preorder_detail cpod ON cpo.id = cpod.preorder_id
            WHERE
                cpo.faculty_id = ?
                ${filterStatusQuery}
                ${excludeRejectedBySystemQuery}
            GROUP BY 
                cpo.id
            ORDER BY
                cpo.id DESC
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
        let { eventDate, preorderTypes } = req.body;

        eventDate = convertToJakartaTime(eventDate);

        connection = await db.getConnection();
        await connection.beginTransaction();

        /* Ambil data preorder lama */
        const [oldPreorder] = await connection.execute(
            `SELECT * FROM canteen_preorders WHERE id = ?`,
            [id]
        );

        /* Check apakah data preorder yang lama ada atau tidak */
        if (oldPreorder.length < 1) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'preorder not found'
            );
        }

        /* Pastikan data preorder lama status nya "Ditolak". Karena hanya data preorder yang ditolak saja yang bisa diedit (Diajukan ulang) */
        if (isNotContains(oldPreorder[0].status, PO_STAT.REJECT_PAYLOAD)) {
            await connection.rollback();
            throw new Error('invalid status');
        }

        /* Pastikan bahwa data preorder lama, memiliki faculty id yang sama dengan user yag login sekarang */
        if (isNotEqual(oldPreorder[0].faculty_id, req.user.facultyId)) {
            await connection.rollback();
            throw new Error('forbidden');
        }

        /* Update data preorder, ubah status menjadi Menunggu Persetujuan Dekan, dan request_count + 1 */
        const pendingStatus = replacePlaceholders(PO_STAT.PENDING, [
            ROLES.DEKAN,
        ]);
        const [updatePreorder] = await connection.execute(
            `UPDATE canteen_preorders SET event_date = ?, status = ?, request_count = request_count + 1, reject_reason = NULL WHERE id = ?`,
            [eventDate, pendingStatus, id]
        );

        const changedAt = getCurrentTime();
        const [auditStatusHistory] = await connection.execute(
            `INSERT INTO canteen_preorder_status_history (preorder_id, status, changed_at, reject_reason, approver_id)
            VALUES (?, ?, ?, ?, ?)`,
            [id, pendingStatus, changedAt, null, req.user.id]
        );

        if (auditStatusHistory.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing audit status history');
        }

        if (updatePreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed executing update preorder');
        }

        /* Hapus semua preorder detail dan timpa dengan data yang baru */
        const [deletePreorderDetail] = await connection.execute(
            `DELETE FROM canteen_preorder_detail WHERE preorder_id = ?`,
            [id]
        );

        if (deletePreorderDetail.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed deleting preorder detail');
        }

        /* Looping data preorder types dan insert baru */
        for (const preorderType of preorderTypes) {
            const [insertNewPreorderType] = await connection.execute(
                `INSERT INTO canteen_preorder_detail (preorder_id, order_type, qty) VALUES (?, ?, ?)`,
                [id, preorderType.orderType, preorderType.qty]
            );

            if (insertNewPreorderType.affectedRows === 0) {
                await connection.rollback();
                throw new Error('failed executing insert new preorder type');
            }
        }

        await connection.commit();
        connection.release();

        return httpResponse(res, httpStatus.OK, 'Berhasil mengubah pengajuan');
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
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
                CONVERT_TZ(cph.changed_at, '+00:00', 'Asia/Jakarta') AS changed_at,
                cph.reject_reason,
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
                cph.id DESC;
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

const getEventMember = async (req, res) => {
    try {
        let { number, limit, page, search, unit } = req.query;

        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const offset = (page - 1) * limit;

        // Get preorder by number
        const [preorder] = await db.execute(
            `SELECT id FROM canteen_preorders WHERE number = ?`,
            [number]
        );

        if (!preorder.length) {
            return httpResponse(res, 404, 'Data not found');
        }

        let baseQuery = `
            FROM event_members em
            LEFT JOIN accounts a ON em.member_name = a.username
            LEFT JOIN users u ON a.id = u.account_id
            WHERE em.preorder_id = ?
            AND em.is_additional = 0
        `;

        const params = [preorder[0].id];

        // Add filters for search and unit if provided
        if (search) {
            baseQuery += ` AND LOWER(u.full_name) LIKE ?`;
            params.push(`%${search.toLowerCase()}%`);
        }

        if (unit) {
            baseQuery += ` AND UPPER(u.unit) = ?`;
            params.push(unit.toUpperCase());
        }

        let countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
        let dataQuery = `
            SELECT 
                u.full_name AS fullName,
                a.username,
                COALESCE(u.unit, '') AS unit,
                COALESCE(u.jobPosition, '') AS jobPosition,
                COALESCE(u.category, '') AS category
            ${baseQuery}
            ORDER BY em.id ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Execute the count query to get total records
        const [countRows] = await db.execute(countQuery, params);
        const totalData = countRows[0].total;

        // Execute the data query with pagination
        const [rows] = await db.execute(dataQuery, params);

        // Build pagination data
        const pagination = buildPaginationData(limit, page, totalData);

        return httpResponse(
            res,
            httpStatus.OK,
            'get member name',
            rows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getAdditionalEventMember = async (req, res) => {
    try {
        let { number, limit, page, search } = req.query;

        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const offset = (page - 1) * limit;

        // Get preorder by number
        const [preorder] = await db.execute(
            `SELECT id FROM canteen_preorders WHERE number = ?`,
            [number]
        );

        if (!preorder.length) {
            return httpResponse(res, 404, 'Data not found');
        }

        let baseQuery = `
            FROM event_members 
            WHERE is_additional = 1 
            AND preorder_id = ?
        `;

        const params = [preorder[0].id];

        // Add search filter if provided
        if (search) {
            baseQuery += ` AND LOWER(member_name) LIKE ?`;
            params.push(`%${search.toLowerCase()}%`);
        }

        let countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
        let dataQuery = `
            SELECT member_name AS memberName
            ${baseQuery}
            ORDER BY id ASC
            LIMIT ${limit} OFFSET ${offset}
        `;

        // Execute the count query to get total records
        const [countRows] = await db.execute(countQuery, params);
        const totalData = countRows[0].total;

        console.log(dataQuery);

        // Execute the data query with pagination
        const [rows] = await db.execute(dataQuery, params);

        // Build pagination data
        const pagination = buildPaginationData(limit, page, totalData);

        return httpResponse(
            res,
            httpStatus.OK,
            'get additional member name',
            rows,
            pagination
        );
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
    getEventMember,
    getAdditionalEventMember,
};
