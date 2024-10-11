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
const { replacePlaceholders, replaceString } = require('../utils/stringUtil');
const {
    buildPaginationData,
    parseOrUseDefault,
    getOffset,
    resetCurrentPageIfSearch,
} = require('../utils/pagination');
const {
    convertToJakartaTime,
    getCurrentTime,
    getDayDifference,
    formatIndonesianDate,
} = require('../utils/dateUtil');
const { default: puppeteer } = require('puppeteer');
const {
    invoiceTemplate,
    generateTableRow,
    generatePPNRow,
    generateTotalAmountRow,
} = require('../utils/pdfTemplate');
const { getPPN, toWords, formatRupiah } = require('../utils/priceUtil');
const ExcelJS = require('exceljs');
const moment = require('moment-timezone');

const submitPreorder = async (req, res) => {
    let connection;
    try {
        let {
            eventDate,
            preorderTypes,
            eventName,
            eventMembers,
            additionalEventMember,
            unit,
        } = req.body;

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
            'INSERT INTO canteen_preorders (requester_id, event_date, request_count, status, number, faculty_id, event_name, unit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                req.user.id,
                eventDate,
                1,
                pendingStatus,
                nomorPengajuan,
                req.user.facultyId,
                eventName,
                unit,
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
                'INSERT INTO canteen_preorder_detail (order_type, qty, preorder_id, price) VALUES (?, ?, ?, ?)',
                [
                    preOrderType.orderType,
                    preOrderType.qty,
                    preorderId,
                    preOrderType.price,
                ]
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
            'SELECT unit FROM canteen_preorders WHERE id = ?',
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

        /* Pastikan data yang akan dilakukan approval merupakan data unit yang sama dengan 
        approver (user yang melakaukan approval) jika role user tersebut adalah DEKAN */
        if (isEqual(req.user.role, ROLES.DEKAN)) {
            if (isNotEqual(checkPreorder[0].unit, req.user.unit)) {
                await connection.rollback();
                return httpResponse(
                    res,
                    httpStatus.FORBIDDEN,
                    'action is forbidden'
                );
            }
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
                /* Jika status === 'Disetujui' dan role == 'Dekan' maka status = 'Menunggu Persetujuan SDM' */
                preorderStatus = replacePlaceholders(PO_STAT.PENDING, [
                    ROLES.BAK,
                ]);

                /* Audit status 'Menunggu Persetujuan SDM' */
                const [auditPendSDM] = await connection.execute(
                    sqlStatusHistory,
                    [id, preorderStatus, changedAt, null, req.user.id]
                );

                if (auditPendSDM.affectedRows === 0) {
                    await connection.rollback();
                    throw new Error('failed executing audit pending SDM');
                }
            } else if (isEqual(role, ROLES.SDM)) {
                /* Jika status === 'Disetujui' dan role == 'BAK' maka status = 'Menunggu Proses Kantin' */
                preorderStatus = PO_STAT.CANTEEN_PROCESS;

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
        let { limit, page, isHistory = false, from = '', to = '' } = req.query;
        const { role } = req.user;

        limit = parseInt(limit) || 10;
        page = parseInt(page) || 1;

        const offset = (page - 1) * limit;

        const [checkExpPO] = await db.execute(
            `SELECT CONVERT_TZ(event_date, '+00:00', 'Asia/Jakarta') AS eventDate, status, id
            FROM canteen_preorders WHERE unit = ?`,
            [req.user.unit]
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

        /* Construct Query */
        let queryParams = [];
        let countQuery = `
            SELECT COUNT(*) as total
            FROM canteen_preorders cpo
            -- LEFT JOIN canteen_preorder_detail cpod ON cpo.id = cpod.preorder_id
            WHERE 1 = 1
        `;
        let dataQuery = `
            SELECT 
                cpo.id,
                CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta') AS event_date,
                cpo.event_name AS eventName,
                cpo.request_count,
                cpo.status,
                cpo.number,
                cpo.reject_reason,
                cpo.unit,
                SUM(cpod.qty) AS total_quantity
            FROM 
                canteen_preorders cpo
            LEFT JOIN 
                canteen_preorder_detail cpod ON cpo.id = cpod.preorder_id
            WHERE
                1 = 1
        `;

        if (
            isEqual(req.user.role, ROLES.DEKAN) ||
            isEqual(req.user.role, ROLES.TU)
        ) {
            countQuery += `
                AND cpo.unit = ?
            `;
            dataQuery += `
                AND cpo.unit = ?
            `;
            queryParams.push(req.user.unit);
        }

        let filterStatusQuery = '';

        if (isHistory) {
            filterStatusQuery = `
                AND cpo.status IN ('${PO_STAT.DONE}', '${PO_STAT.REJECT_BY_SYSTEM}')    
            `;
        } else {
            if (isEqual(role, ROLES.SDM)) {
                // Filter for BAK role: Preorders with status 'Menunggu Persetujuan SDM' in status history
                /*  AND EXISTS (
                        SELECT 1
                        FROM canteen_preorder_status_history cposh
                        WHERE cposh.preorder_id = cpo.id
                        AND cposh.status = '${replacePlaceholders(
                            PO_STAT.PENDING,
                            [ROLES.SDM]
                        )}'
                    ) */
                filterStatusQuery = `
                    AND (
                        cpo.status IN ('${replacePlaceholders(PO_STAT.PENDING, [
                            ROLES.SDM,
                        ])}', '${PO_STAT.CANTEEN_PROCESS}')
                        OR
                        (
                            cpo.status IN ('${replacePlaceholders(
                                PO_STAT.REJECT,
                                [ROLES.DEKAN]
                            )}', '${replacePlaceholders(PO_STAT.REJECT, [
                    ROLES.SDM,
                ])}', '${replacePlaceholders(PO_STAT.PENDING, [ROLES.DEKAN])}')
                            AND
                            EXISTS (
                                SELECT 1
                                FROM canteen_preorder_status_history cposh
                                WHERE cposh.preorder_id = cpo.id
                                AND cposh.status = '${replacePlaceholders(
                                    PO_STAT.PENDING,
                                    [ROLES.SDM]
                                )}'
                            )
                        )
                    )
                `;
            } else if (isEqual(role, ROLES.ADMIN)) {
                // Filter for Admin role: Only show preorders with status 'Menunggu Proses Kantin'
                filterStatusQuery = `AND cpo.status = '${PO_STAT.CANTEEN_PROCESS}'`;
            } else if (isEqual(role, ROLES.DEKAN)) {
                filterStatusQuery = `
                    AND cpo.status IN ('${replacePlaceholders(PO_STAT.PENDING, [
                        ROLES.DEKAN,
                    ])}', '${replacePlaceholders(PO_STAT.PENDING, [
                    ROLES.SDM,
                ])}',
                '${PO_STAT.CANTEEN_PROCESS}',
                '${replacePlaceholders(PO_STAT.REJECT, [ROLES.DEKAN])}',
                '${replacePlaceholders(PO_STAT.REJECT, [ROLES.SDM])}'
                )
                `;
            } else {
                filterStatusQuery = ` AND cpo.status NOT IN ('${PO_STAT.DONE}', '${PO_STAT.REJECT_BY_SYSTEM}') `;
            }
        }

        countQuery += `
            ${filterStatusQuery}
        `;
        dataQuery += `
            ${filterStatusQuery}
        `;

        const filterDate = `
            AND DATE(CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
        `;

        if (from && to) {
            countQuery += `
                ${filterDate}
            `;
            dataQuery += `
                ${filterDate}
            `;
            queryParams.push(from, to);
        }

        dataQuery += `
            GROUP BY 
                cpo.id
            ORDER BY
                cpo.id DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `;

        // console.log('dataQuery => ', dataQuery);
        // console.log('countQuery => ', countQuery);
        // console.log('queryParams => ', queryParams);
        // console.log('req.query => ', req.query);

        const [countResult] = await db.execute(countQuery, queryParams);
        const [rows] = await db.execute(dataQuery, queryParams);

        const totalRecords = countResult[0].total;

        const pagination = buildPaginationData(limit, page, totalRecords);

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
        let {
            eventDate,
            preorderTypes,
            eventName,
            eventMembers,
            additionalEventMember,
            unit,
        } = req.body;

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
            `UPDATE canteen_preorders SET event_date = ?, status = ?, request_count = request_count + 1, event_name = ?, reject_reason = NULL, unit = ? WHERE id = ?`,
            [eventDate, pendingStatus, eventName, unit, id]
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
                `INSERT INTO canteen_preorder_detail (preorder_id, order_type, qty, price) VALUES (?, ?, ?, ?)`,
                [
                    id,
                    preorderType.orderType,
                    preorderType.qty,
                    preorderType.price,
                ]
            );

            if (insertNewPreorderType.affectedRows === 0) {
                await connection.rollback();
                throw new Error('failed executing insert new preorder type');
            }
        }

        /* Deleting Event Members */
        const [deleteEventMembers] = await connection.execute(
            `DELETE FROM event_members WHERE preorder_id = ?`,
            [id]
        );

        if (deleteEventMembers.affectedRows === 0) {
            await connection.rollback();
            throw new Error('failed deleting event members');
        }

        /* Looping Event members non additional */
        for (const eventMember of eventMembers) {
            const [insertEventMember] = await connection.execute(
                `INSERT INTO event_members (member_name, is_additional, preorder_id)
                VALUES (?, ?, ?)`,
                [eventMember.username, false, id]
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
                [additional.fullName, true, id]
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

        const [getPreorder] = await db.execute(
            `SELECT is_finished FROM canteen_preorders WHERE id = ?`,
            [id]
        );

        if (!getPreorder.length) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'data not found');
        }

        const [rows] = await db.execute(
            `SELECT 
                cpd.id,
                cpd.preorder_id,
                cpd.order_type,
                cpd.qty,
                cpd.created_at,
                cpd.updated_at,
                cpd.price,
                (cpd.qty * cpd.price) AS total
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

        const response = {
            orders: rows,
            isFinished: getPreorder[0].is_finished === 1,
        };

        return httpResponse(
            res,
            httpStatus.OK,
            'get preorder detail',
            response
        );
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

const getPreorderEditData = async (req, res) => {
    try {
        const { id } = req.params;

        const [preorderRows] = await db.execute(
            `SELECT 
                cpd.id AS detail_id,
                cpd.preorder_id,
                cpd.order_type,
                cpd.qty,
                cpd.created_at AS detail_created_at,
                cpd.updated_at AS detail_updated_at,
                cp.requester_id,
                cp.event_date AS eventDate,
                cp.request_count,
                cp.status,
                cp.created_at AS preorder_created_at,
                cp.updated_at AS preorder_updated_at,
                cp.number,
                cp.faculty_id,
                cp.reject_reason,
                cp.attachment_path,
                cp.event_name AS eventName,
                cpd.price
            FROM 
                canteen_preorder_detail cpd
            JOIN 
                canteen_preorders cp ON cpd.preorder_id = cp.id
            WHERE 
                cpd.preorder_id = ?`,
            [id]
        );

        if (!preorderRows || preorderRows.length === 0) {
            return httpResponse(
                res,
                httpStatus.NOT_FOUND,
                'Preorder not found'
            );
        }

        // Map the preorder data
        const preorder = {
            id: preorderRows[0].preorder_id,
            requester_id: preorderRows[0].requester_id,
            event_date: preorderRows[0].event_date,
            request_count: preorderRows[0].request_count,
            status: preorderRows[0].status,
            created_at: preorderRows[0].preorder_created_at,
            updated_at: preorderRows[0].preorder_updated_at,
            number: preorderRows[0].number,
            faculty_id: preorderRows[0].faculty_id,
            reject_reason: preorderRows[0].reject_reason,
            attachment_path: preorderRows[0].attachment_path,
            event_name: preorderRows[0].event_name,
            preorderTypes: preorderRows.map((row) => ({
                id: row.detail_id,
                orderType: row.order_type,
                qty: row.qty,
                price: row.price,
                created_at: row.detail_created_at,
                updated_at: row.detail_updated_at,
            })),
        };

        const [eventMembers] = await db.execute(
            `SELECT 
                u.full_name AS fullName,
                a.username,
                COALESCE(u.unit, '') AS unit,
                COALESCE(u.jobPosition, '') AS jobPosition,
                COALESCE(u.category, '') AS category
             FROM event_members em
                LEFT JOIN accounts a ON em.member_name = a.username
                LEFT JOIN users u ON a.id = u.account_id
                WHERE em.preorder_id = ?
                AND em.is_additional = 0
                ORDER BY em.id ASC
            `,
            [id]
        );

        const [additionalMember] = await db.execute(
            `
                SELECT member_name AS fullName
                FROM event_members WHERE is_additional = 1
                AND preorder_id = ? ORDER BY id ASC
            `,
            [id]
        );

        const response = {
            preorder,
            eventMembers,
            additionalMember,
        };

        return httpResponse(
            res,
            httpStatus.OK,
            'get preorder edit data',
            response
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const finishPreorder = async (req, res) => {
    let connection;
    try {
        const { preorderTypes } = req.body;
        const { id } = req.params;

        connection = await db.getConnection();

        const [getPreorder] = await connection.execute(
            `SELECT is_finished FROM canteen_preorders WHERE id = ?`,
            [id]
        );

        if (!getPreorder.length) {
            await connection.rollback();
            return httpResponse(res, httpStatus.NOT_FOUND, 'Data not found');
        }

        if (getPreorder[0].is_finished) {
            await connection.rollback();
            return httpResponse(
                res,
                httpStatus.FORBIDDEN,
                'Preorder already finished'
            );
        }

        const [updatePreorder] = await connection.execute(
            `UPDATE canteen_preorders SET is_finished = 1, status = ? WHERE id = ?`,
            [PO_STAT.DONE, id]
        );

        if (updatePreorder.affectedRows === 0) {
            await connection.rollback();
            throw new Error('Failed executing update preorder');
        }

        for (const preorderType of preorderTypes) {
            const [updatePt] = await connection.execute(
                `UPDATE canteen_preorder_detail SET price = ? WHERE id = ?`,
                [preorderType.price, preorderType.id]
            );

            if (updatePt.affectedRows === 0) {
                await connection.rollback();
                throw new Error('Failed executing update preorder detail');
            }
        }

        await connection.commit();
        connection.release();

        return httpResponse(res, httpStatus.OK, 'Success Finishing Preorder');
    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }

        return serverErrorResponse(res, error);
    }
};

const printInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        let htmlTemplate = invoiceTemplate;

        const [cpoRows] = await db.execute(
            `SELECT
                CONVERT_TZ(event_date, '+00:00', 'Asia/Jakarta') AS eventDate,
                event_name AS eventName,
                number,
                unit
            FROM
                canteen_preorders
            WHERE
                id = ?
            `,
            [id]
        );

        if (!cpoRows.length) {
            return httpResponse(res, httpStatus.NOT_FOUND, 'Data not found');
        }

        const [cpdRows] = await db.execute(
            `SELECT
                order_type,
                qty,
                price,
                (price * qty) AS total 
            FROM 
                canteen_preorder_detail 
            WHERE
                preorder_id = ?`,
            [id]
        );

        let tableRows = ``;
        let no = 1;

        for (const cpd of cpdRows) {
            tableRows += generateTableRow(
                no++,
                cpd.order_type,
                cpd.qty,
                cpd.price,
                cpd.total
            );
            tableRows += `\n`;
        }

        const total = cpdRows.reduce((acc, cpd) => acc + cpd.total, 0);
        const ppn = getPPN(total);
        const totalAmount = total + ppn;

        tableRows += generatePPNRow(ppn);
        tableRows += generateTotalAmountRow(totalAmount);

        htmlTemplate = replaceString(htmlTemplate, '[TABLE_ROWS]', tableRows);
        htmlTemplate = replaceString(
            htmlTemplate,
            '[TERBILANG]',
            toWords(totalAmount)
        );
        htmlTemplate = replaceString(
            htmlTemplate,
            '[NOW]',
            formatIndonesianDate(new Date())
        );
        htmlTemplate = replaceString(
            htmlTemplate,
            '[EVENT_NAME]',
            cpoRows[0].eventName
        );
        htmlTemplate = replaceString(
            htmlTemplate,
            '[EVENT_DATE]',
            formatIndonesianDate(cpoRows[0].eventDate)
        );
        htmlTemplate = replaceString(htmlTemplate, '[UNIT]', cpoRows[0].unit);
        htmlTemplate = replaceString(
            htmlTemplate,
            '[NUMBER]',
            cpoRows[0].number
        );

        await page.setContent(htmlTemplate);

        const pdfPath = 'invoice.pdf';

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        res.download(pdfPath, 'invoice.pdf', (err) => {
            if (err) {
                throw new Error('Error generating PDF');
            }
        });
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getSummary = async (req, res) => {
    try {
        const { from, to, limit, page } = req.query;

        const { currentPage, perPage } = parseOrUseDefault(limit, page);
        const offset = getOffset(perPage, currentPage);

        // Data query for fetching results
        const dataQuery = `
                SELECT 
                    cpo.id,
                    CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta') AS eventDate,
                    cpo.event_name AS eventName,
                    COALESCE(cpo.unit, '') AS unit,
                    (SELECT COALESCE(SUM(cpod.qty), 0)
                    FROM canteen_preorder_detail cpod
                    WHERE cpod.preorder_id = cpo.id) AS totalQty,
                    (SELECT COALESCE(SUM(cpod.qty * cpod.price), 0)
                    FROM canteen_preorder_detail cpod
                    WHERE cpod.preorder_id = cpo.id) AS totalPrice
                FROM 
                    canteen_preorders cpo
                WHERE 
                    DATE(CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
                AND
                    cpo.status = ?
                ORDER BY 
                    CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')
                LIMIT ${perPage} OFFSET ${offset};
            `;

        // Count query for pagination
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM 
                canteen_preorders cpo
            WHERE 
                DATE(CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
            AND
                cpo.status = ?
        `;

        const queryParams = [from, to, PO_STAT.DONE];

        // Execute the data query
        const [rows] = await db.execute(dataQuery, queryParams);

        // Execute the count query (without pagination)
        const [totalRows] = await db.execute(countQuery, queryParams);

        // Calculate grand total of prices from the data query
        const grandTotal = rows.reduce(
            (acc, cpo) => acc + (Number(cpo.totalPrice) || 0),
            0
        );

        const response = {
            grandTotal: `Rp ${formatRupiah(grandTotal)}`,
            preorders: rows.map((row) => ({
                id: row.id,
                eventName: row.eventName,
                eventDate: row.eventDate,
                unit: row.unit,
                totalQty: Number(row.totalQty) || 0,
                totalPrice: `Rp ${formatRupiah(Number(row.totalPrice) || 0)}`,
            })),
        };

        const pagination = buildPaginationData(
            perPage,
            currentPage,
            totalRows[0].total
        );

        return httpResponse(
            res,
            httpStatus.OK,
            'get summary',
            response,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const exportSummary = async (req, res) => {
    try {
        let { from, to } = req.query;

        const [rows] = await db.execute(
            `
                SELECT 
                    cpo.id,
                    DATE_FORMAT(CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta'), '%e %b %Y') AS eventDate,
                    cpo.event_name AS eventName,
                    COALESCE(cpo.unit, '-') AS unit,
                    (SELECT COALESCE(SUM(cpod.qty), 0)
                    FROM canteen_preorder_detail cpod
                    WHERE cpod.preorder_id = cpo.id) AS totalQty,
                    (SELECT COALESCE(SUM(cpod.qty * cpod.price), 0)
                    FROM canteen_preorder_detail cpod
                    WHERE cpod.preorder_id = cpo.id) AS totalPrice
                FROM 
                    canteen_preorders cpo
                WHERE 
                    DATE(CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')) BETWEEN ? AND ?
                AND
                    cpo.status = ?
                ORDER BY 
                    CONVERT_TZ(cpo.event_date, '+00:00', 'Asia/Jakarta')
            `,
            [from, to, PO_STAT.DONE]
        );

        const grandTotal = rows.reduce(
            (acc, cpo) => acc + (Number(cpo.totalPrice) || 0),
            0
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Summary');

        const formattedFrom = moment(from)
            .tz('Asia/Jakarta')
            .format('D MMM YYYY');
        const formattedTo = moment(to).tz('Asia/Jakarta').format('D MMM YYYY');
        const mergedHeader = `Data ini diambil dari Rentang Waktu: ${formattedFrom} - ${formattedTo}`;

        worksheet.addRow([mergedHeader]);
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'left',
        };

        worksheet.mergeCells('A1:F1');

        worksheet.addRow([]);

        const grandTotalRow = worksheet.addRow([
            '',
            '',
            '',
            '',
            'Grand Total',
            `Rp ${formatRupiah(grandTotal)}`,
        ]);

        worksheet.getRow(3).getCell(5).font = { bold: true };

        worksheet.addRow([]);

        worksheet.addRow([
            'No',
            'Nama Acara',
            'Tanggal Acara',
            'Unit',
            'Jumlah Pesanan',
            'Total',
        ]);

        worksheet.getRow(5).eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        rows.forEach((row, index) => {
            const newRow = worksheet.addRow([
                index + 1,
                row.eventName,
                row.eventDate,
                row.unit,
                row.totalQty + ' Box',
                `Rp ${formatRupiah(Number(row.totalPrice) || 0)}`,
            ]);

            newRow.eachCell((cell, colNumber) => {
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: colNumber === 2 ? 'left' : 'center', // 'Nama' and 'NIK' left, others center
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        grandTotalRow.getCell(7).font = { bold: true };
        grandTotalRow.alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };

        let maxLength = 30;
        rows.forEach((row) => {
            const cellLength = row.eventName.length;
            if (cellLength > maxLength) {
                maxLength = cellLength + 5;
            }
        });

        worksheet.getColumn(1).width = 10;
        worksheet.getColumn(2).width = maxLength;
        worksheet.getColumn(3).width = 20;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 15;
        worksheet.getColumn(6).width = 30;
        worksheet.getColumn(7).width = 15;

        const filename =
            'preorder_summary_' +
            moment().tz('Asia/Jakarta').format('YYYYMMDDHHmmss');

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${filename}.xlsx"`
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.send(buffer);
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
    getPreorderEditData,
    finishPreorder,
    printInvoice,
    getSummary,
    exportSummary,
};
