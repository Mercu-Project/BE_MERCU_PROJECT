const { body, query } = require('express-validator');

const getSessionsValidator = [
    query('limit')
        .notEmpty()
        .withMessage('Limit harus diisi.')
        .isInt({ min: 0 })
        .withMessage('Limit harus berupa angka non-negative.'),
    query('page')
        .notEmpty()
        .withMessage('Page harus diisi.')
        .isInt({ min: 0 })
        .withMessage('Page harus berupa angka non-negative.'),
];

const createSessionValidator = [
    body('name').notEmpty().withMessage('Nama sesi harus diisi.'),
    body('open').notEmpty().withMessage('Session open harus diisi.'),
    body('close').notEmpty().withMessage('Session close harus diisi.'),
];

const swtichAllStatusValidator = [
    body('status')
        .notEmpty()
        .withMessage('Status harus diisi.')
        .matches(/^(0|1)$/)
        .withMessage('Status harus berupa 1 atau 0'),
];

const editSessionValidator = [
    body('name').notEmpty().withMessage('Nama sesi harus diisi.'),
    body('open').notEmpty().withMessage('Session open harus diisi.'),
    body('close').notEmpty().withMessage('Session close harus diisi.'),
    body('status')
        .notEmpty()
        .withMessage('Status sesi harus diisi.')
        .matches(/^(0|1)$/)
        .withMessage('Status harus berupa 1 atau 0'),
];

module.exports = {
    createSessionValidator,
    getSessionsValidator,
    swtichAllStatusValidator,
    editSessionValidator,
};
