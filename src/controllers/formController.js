const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const httpStatus = require('http-status');
const { PAGINATION } = require('../utils/constants');
const buildPaginationData = require('../utils/pagination');

const openForm = async (req, res) => {
    try {
        const { open_date, close_date, year_id, form_id } = req.body;

        /* validasi prodi */
        const [adminRows] = await db.execute(
            'SELECT id, prodi_id FROM admins WHERE user_id = ?',
            [req.user.id]
        );

        if (adminRows.length === 0) {
            return httpResponse(res, httpStatus.FORBIDDEN, 'access denied');
        }

        await db.execute(
            'INSERT INTO form_academic_years (academic_year_id, form_id, prodi_id, eff_date, end_eff_date) VALUES (?, ?, ?, ?,?)',
            [year_id, form_id, adminRows[0].prodi_id, open_date, close_date]
        );

        return httpResponse(res, httpStatus.OK, 'Form has been open.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getForms = async (req, res) => {
    try {
        let { limit, page, year } = req.query;

        limit = parseInt(limit) || PAGINATION.DFLT_LIMIT;
        page = parseInt(page) || PAGINATION.DFLT_PAGE;

        const offset = (page - 1) * limit;

        // Base query without the year filter
        let baseQuery = `
            SELECT 
                CONCAT(ay.academic_year, ' ', ay.semester) AS 'academic_year',
                f.form_type AS 'category',
                CASE 
                    WHEN CURRENT_DATE BETWEEN fay.eff_date AND fay.end_eff_date THEN 'Aktif'
                    ELSE 'Tidak Aktif'
                END AS 'status'
            FROM 
                form_academic_years fay
            JOIN 
                academic_years ay ON fay.academic_year_id = ay.id
            JOIN 
                forms f ON fay.form_id = f.id
        `;

        // Add year condition if provided
        let whereClause = '';

        if (year) {
            whereClause = 'WHERE fay.academic_year_id = ?';
        }

        // Final query with LIMIT and OFFSET
        const queryWithPagination = `
            ${baseQuery}
            ${whereClause}
            ORDER BY 
                GREATEST(fay.eff_date, fay.end_eff_date) DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        const [formRows] = await db.execute(
            queryWithPagination,
            year ? [year] : []
        );

        // Query for total rows without pagination
        const totalQuery = `
            ${baseQuery}
            ${whereClause}
        `;

        const [totalRows] = await db.execute(totalQuery, year ? [year] : []);

        const pagination = buildPaginationData(limit, page, totalRows.length);

        return httpResponse(
            res,
            httpStatus.OK,
            'Get Forms success',
            formRows,
            pagination
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getOpenedForms = async (req, res) => {
    try {
        let { year, form } = req.query;

        const [openedFormRows] = await db.execute(
            `
            SELECT 
                fay.id,
                CONCAT(ay.academic_year, ' ', ay.semester) AS 'academic_year',
                f.form_type AS 'category'
            FROM 
                form_academic_years fay
            JOIN 
                academic_years ay ON fay.academic_year_id = ay.id
            JOIN 
                forms f ON fay.form_id = f.id
            WHERE
                CURRENT_DATE BETWEEN fay.eff_date AND fay.end_eff_date
            AND
                ay.id = ?
            AND
                fay.id = ?
            
            `,
            [year, form]
        );

        return httpResponse(
            res,
            httpStatus.OK,
            'Get opened forms',
            openedFormRows
        );
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    openForm,
    getForms,
    getOpenedForms,
};
