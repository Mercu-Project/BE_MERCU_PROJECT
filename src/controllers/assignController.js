const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const { validationResult } = require('express-validator');
const httpStatus = require('http-status');
const { ERR_MSG, PAGINATION } = require('../utils/constants');
const buildPaginationData = require('../utils/pagination');
const checkValidation = require('../utils/checkValidationResult');

const getStudentSubmittedForms = async (req, res) => {
    try {
        let { limit, page, year, form, assign_type, search = '' } = req.query;

        limit = parseInt(limit) || PAGINATION.DFLT_LIMIT;
        page = parseInt(page) || PAGINATION.DFLT_PAGE;

        const offset = (page - 1) * limit;

        year = parseInt(year);
        form = parseInt(form);

        let params = [];

        let baseQuery = `
            SELECT
                ft.id,
                u.username AS student_nim,
                s.full_name AS student_name
            FROM
                form_ta ft
            JOIN
                students s ON ft.student_id = s.id
            JOIN
                users u ON s.user_id = u.id
            JOIN
                form_academic_years fay ON ft.form_academic_year_id = fay.id
            JOIN
                academic_years ay ON fay.academic_year_id = ay.id
            JOIN
                forms f ON fay.form_id = f.id
            WHERE
                fay.academic_year_id = ?
            AND
                fay.form_id = ?
        `;

        params.push(year);
        params.push(form);

        if (assign_type === 'koord_sidang') {
            baseQuery += `
                AND
                    ft.koord_sidang IS NULL
            `;
        }

        if (search !== '') {
            search = search.toLowerCase();
            baseQuery += `
                AND
                    (LOWER(u.username) LIKE ? OR LOWER(s.full_name) LIKE ?)
            `;
            params.push(`%${search}%`);
            params.push(`%${search}%`);
        }

        const queryWithPagination = `
            ORDER BY
                ft.created_at DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [rows] = await db.execute(
            `
                ${baseQuery}
                ${queryWithPagination}
            `,
            params
        );

        const [totalRows] = await db.execute(baseQuery, params);

        const pagination = buildPaginationData(limit, page, totalRows.length);

        return httpResponse(
            res,
            httpStatus.OK,
            'Get student submtited',
            rows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const assignKoordSidang = async (req, res) => {
    try {
        const { koord_sidang_id, ids } = req.body;

        checkValidation(req, 'validation errors', validationResult(req));

        for (const id of ids) {
            const assignKoord = await db.execute(
                'UPDATE form_ta SET koord_sidang = ? WHERE id = ?',
                [koord_sidang_id, id]
            );

            if (assignKoord[0].affectedRows === 0) {
                throw new Error(ERR_MSG.ID_NOTFOUND_UPD);
            }
        }

        return httpResponse(res, httpStatus.OK, 'Assign koord success');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const assignRoom = async (req, res) => {
    try {
        checkValidation(req, 'validation error', validationResult(req));

        const { room_id, ids } = req.body;

        for (const id of ids) {
            const [updForm] = await db.execute(
                'UPDATE form_ta SET room_id = ? WHERE id = ?',
                [room_id, id]
            );

            if (updForm.affectedRows === 0) {
                throw new Error(ERR_MSG.ID_NOTFOUND_UPD);
            }
        }

        return httpResponse(res, httpStatus.OK, 'room has been assigned');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const assignPenguji = async (req, res) => {
    try {
        const { penguji_id, ids, penguji_type } = req.body;

        let pengujiSQL = '';
        if (penguji_type === 'penguji_1') {
            pengujiSQL = 'penguji_1 = ?';
        } else if (penguji_type === 'penguji_2') {
            pengujiSQL = 'penguji_2 = ?';
        } else if (penguji_type === 'ketua_penguji') {
            pengujiSQL = 'ketua_penguji = ? ';
        } else {
            throw new Error('invalid penguji type');
        }

        for (const id of ids) {
            const [updPenguji] = await db.execute(
                `UPDATE form_ta SET ${pengujiSQL} WHERE id = ?`,
                [penguji_id, id]
            );

            if (updPenguji.affectedRows === 0) {
                throw new Error(ERR_MSG.ID_NOTFOUND_UPD);
            }
        }

        return httpResponse(res, httpStatus.OK, 'penguji has been assigned');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    getStudentSubmittedForms,
    assignKoordSidang,
    assignRoom,
    assignPenguji,
};
