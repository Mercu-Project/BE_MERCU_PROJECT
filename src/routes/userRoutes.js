const router = require('express').Router();
const User = require('../controllers/userController');

const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { ROLES } = require('../utils/constants');

router.post('/register-user', auth, checkRole(ROLES.BAK), User.registerUser);
router.get(
    '/get-users',
    auth,
    checkRole([ROLES.ADMIN, ROLES.BAK]),
    User.getUsers
);
router.patch(
    '/change-status/:username',
    auth,
    checkRole('Admin'),
    User.changeUserStatus
);
router.patch(
    '/edit-user/:username',
    auth,
    checkRole([ROLES.BAK]),
    User.editUser
);

module.exports = router;
