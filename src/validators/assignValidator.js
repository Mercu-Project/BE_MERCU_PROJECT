const { body } = require('express-validator');

const assignKoordValidator = [
    body('ids')
        .notEmpty()
        .withMessage('Id should not empty')
        .isArray()
        .withMessage('Ids harus berupa array'),
    body('koord_sidang_id')
        .notEmpty()
        .withMessage('koord sidang id is required')
        .isNumeric()
        .withMessage('Koord sidang id harus berupa angka'),
];

module.exports = {
    assignKoordValidator,
};
