const router = require('express').Router();
const User = require('../controllers/userController');

router.get('/get-users', User.getUsers);

module.exports = router;
