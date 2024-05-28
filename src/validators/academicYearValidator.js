const { body } = require('express-validator');

const createYearValidator = [
    body('year').notEmpty().withMessage('Tahun ajaran harus diisi.'),
];

module.exports = {
    createYearValidator,
};
