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
router.delete(
    '/delete-year/:id',
    auth,
    checkRole('Admin'),
    AcademicYear.deleteYear
);

module.exports = router;
