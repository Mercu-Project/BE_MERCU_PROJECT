const { httpResponse, serverErrorResponse } = require('../utils/httpResponse');
const db = require('../config/db');
const httpStatus = require('http-status');
const { ERR_MSG } = require('../utils/constants');

const openForm = async (req, res) => {
    try {
        const { id } = req.params;
        const { open_date, close_date } = req.body;

        /* validasi prodi */
        const [adminRows] = await db.execute(
            'SELECT id, prodi_id FROM admins WHERE user_id = ?',
            [req.user.id]
        );

        if (adminRows.length === 0) {
            return httpResponse(res, httpStatus.FORBIDDEN, 'access denied');
        }

        const [updateForm] = await db.execute(
            'UPDATE forms SET eff_date = ?, end_eff_date = ? WHERE id = ? AND prodi_id = ?',
            [open_date, close_date, id, adminRows[0].prodi_id]
        );

        if (updateForm.affectedRows === 0) {
            throw new Error(ERR_MSG.ID_NOTFOUND_UPD);
        }

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
