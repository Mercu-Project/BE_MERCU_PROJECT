const router = require('express').Router();
const Auth = require('../controllers/authController');
const auth = require('../middlewares/auth');
const {
    loginValidator,
    registerValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, Auth.register);
router.post('/login', loginValidator, Auth.login);
router.post('/register-admin', Auth.registerAdmin);
router.patch('/change-password', auth, Auth.changePassword);

module.exports = router;
