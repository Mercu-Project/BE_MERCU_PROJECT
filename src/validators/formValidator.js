const { body, param } = require('express-validator');

const openFormValidator = [
    body('open_date').notEmpty().withMessage('open date harus diisi'),
    body('close_date').notEmpty().withMessage('close date harus diisi'),
    param('id').notEmpty().withMessage('id tidak boleh kosong'),
];

module.exports = {
    openFormValidator,
};
