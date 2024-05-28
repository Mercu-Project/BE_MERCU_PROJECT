const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const httpStatus = require('http-status');

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
            'INSERT INTO form_academic_years (academic_year_id, form_id, prodi_id, eff_date, end_eff_date) VALUES (?. ?, ?, ?,?)',
            [year_id, form_id, adminRows[0].prodi_id, open_date, close_date]
        );

        return httpResponse(res, httpStatus.OK, 'Form has been open.');
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

const getForms = async (req, res) => {
    try {
        const [formRows] = await db.execute(
            'SELECT id, form_type FROM forms WHERE (eff_date IS NULL AND end_eff_date IS NULL) OR end_eff_date < NOW()'
        );

        return httpResponse(res, httpStatus.OK, 'Get Forms success', formRows);
    } catch (error) {
        return serverErrorResponse(res, error);
    }
};

module.exports = {
    openForm,
    getForms,
};
