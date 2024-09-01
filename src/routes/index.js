const router = require('express').Router();

/* Import routes */
const User = require('./userRoutes');
const Auth = require('./authRoutes');
const TimeBreakSession = require('./timeBreakSessionRoutes');
const FormTA = require('./formTaRoutes');
const Form = require('./formRoutes');
const AcademicYear = require('./academicYearRoutes');
const Assign = require('./assignRoutes');
const Lecturer = require('./lecturerRoutes');
const CanteenScan = require('./canteenScaneRoutes');
const CanteenPreorder = require('./canteenPreorderRoutes');

/* Use routes */
router.use('/user', User);
router.use('/auth', Auth);
router.use('/time-break-session', TimeBreakSession);
router.use('/form-ta', FormTA);
router.use('/form', Form);
router.use('/academic-year', AcademicYear);
router.use('/assign', Assign);
router.use('/lecturer', Lecturer);
router.use('/canteen-scan', CanteenScan);
router.use('/canteen-preorder', CanteenPreorder);

module.exports = router;
