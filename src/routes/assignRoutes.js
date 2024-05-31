const Assign = require('../controllers/assignController');
const router = require('express').Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { assignKoordValidator } = require('../validators/assignValidator');

router.get(
    '/get-student-submitted',
    auth,
    checkRole('Admin'),
    Assign.getStudentSubmittedForms
);
router.post(
    '/assign-koord',
    auth,
    checkRole('Admin'),
    assignKoordValidator,
    Assign.assignKoordSidang
);

module.exports = router;
