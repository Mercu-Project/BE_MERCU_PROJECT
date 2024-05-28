const router = require('express').Router();
const AcademicYear = require('../controllers/academicYearController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { createYearValidator } = require('../validators/academicYearValidator');

router.post(
    '/create-year',
    auth,
    checkRole('Admin'),
    createYearValidator,
    AcademicYear.createYear
);
router.get('/get-years', auth, checkRole('Admin'), AcademicYear.getYears);

module.exports = router;
