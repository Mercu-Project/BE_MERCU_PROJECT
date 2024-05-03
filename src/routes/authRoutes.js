const router = require('express').Router();
const Auth = require('../controllers/authController');
const {
    loginValidator,
    registerValidator,
} = require('../validators/authValidator');

router.post('/register', registerValidator, Auth.register);
router.post('/login', loginValidator, Auth.login);

module.exports = router;
