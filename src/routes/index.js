const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Auth = require('./authRoutes');
const TimeBreakSession = require('./timeBreakSessionRoutes');
const FormTA = require('./formTaRoutes');

/* Use routes */
router.use('/user', User);
router.use('/auth', Auth);
router.use('/time-break-session', TimeBreakSession);
router.use('/form-ta', FormTA);

module.exports = router;
