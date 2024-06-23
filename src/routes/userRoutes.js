const router = require('express').Router();
const User = require('../controllers/userController');

const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

router.post('/register-user', auth, checkRole('Admin'), User.registerUser);
router.get('/get-users', auth, checkRole('Admin'), User.getUsers);
router.patch(
    '/change-status/:username',
    auth,
    checkRole('Admin'),
    User.changeUserStatus
);

module.exports = router;
