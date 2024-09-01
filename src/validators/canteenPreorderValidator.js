const { body } = require('express-validator');

const submissionValidator = [
    body('eventDate')
        .notEmpty()
        .withMessage('tanggal acara harus diisi')
        .isDate()
        .withMessage('harus berupa tanggal'),
    body('preorderTypes')
        .notEmpty()
        .withMessage('preorderTypes harus diisi')
        .isArray()
        .withMessage('preorderTypes harus berupa array'),
];

const approvalPreorderValidator = [
    body('status').notEmpty().withMessage('status harus diisi'),
];

module.exports = {
    submissionValidator,
    approvalPreorderValidator,
};
