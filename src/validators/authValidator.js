const { body } = require('express-validator');

const registerValidator = [
    body('nomorPegawai', 'nomor pegawai harus diisi').not().isEmpty(),
    body('password', 'paassword harus diisi').not().isEmpty(),
];

const loginValidator = [
    body('nomorPegawai', 'nomor pegawai harus diisi').not().isEmpty(),
    body('password', 'paassword harus diisi').not().isEmpty(),
];

module.exports = {
    registerValidator,
    loginValidator,
};
