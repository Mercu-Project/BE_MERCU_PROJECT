const router = require('express').Router();
const AcademicYear = require('../controllers/academicYearController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

router.post('/create-year', auth, checkRole('Admin'), AcademicYear.createYear);
router.get('/get-years', auth, checkRole('Admin'), AcademicYear.getYears);

module.exports = router;
