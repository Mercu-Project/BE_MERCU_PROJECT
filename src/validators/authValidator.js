const { body } = require('express-validator');

const registerValidator = [
    body('username', 'username harus diisi').not().isEmpty(),
    body('password', 'paassword harus diisi').not().isEmpty(),
    body('roleId')
        .notEmpty()
        .withMessage('role id harus diisi')
        .isNumeric()
        .withMessage('role id harus berupa numeric'),
];

const loginValidator = [
    body('username', 'username harus diisi').not().isEmpty(),
    body('password', 'paassword harus diisi').not().isEmpty(),
];

module.exports = {
    registerValidator,
    loginValidator,
};
