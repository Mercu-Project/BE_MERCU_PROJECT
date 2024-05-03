const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Auth = require('./authRoutes');

/* Use routes */
router.use('/user', User);
router.use('/auth', Auth);

module.exports = router;
