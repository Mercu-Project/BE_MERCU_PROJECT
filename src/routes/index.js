const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Auth = require('./authRoutes');
const TimeBreakSession = require('./timeBreakSessionRoutes');

/* Use routes */
router.use('/user', User);
router.use('/auth', Auth);
router.use('/time-break-session', TimeBreakSession);

module.exports = router;
