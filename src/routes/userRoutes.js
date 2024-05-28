const router = require('express').Router();
const User = require('../controllers/userController');

const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

router.get('/get-student', auth, checkRole('Mahasiswa'), User.getStudent);

module.exports = router;
