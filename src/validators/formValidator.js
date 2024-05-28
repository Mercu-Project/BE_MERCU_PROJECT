const { body } = require('express-validator');

const openFormValidator = [
    body('open_date').notEmpty().withMessage('open date harus diisi'),
    body('close_date').notEmpty().withMessage('close date harus diisi'),
    body('form_id')
        .notEmpty()
        .withMessage('form id harus diisi')
        .isNumeric()
        .withMessage('form id harus berupa angka'),
    body('year_id')
        .notEmpty()
        .withMessage('year id harus diisi')
        .isNumeric()
        .withMessage('year id hars berupa angka'),
];

module.exports = {
    openFormValidator,
};
