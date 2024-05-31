const router = require('express').Router();
const Form = require('../controllers/formController');

/* Middlewares */
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { openFormValidator } = require('../validators/formValidator');

router.post(
    '/open',
    auth,
    checkRole('Admin'),
    openFormValidator,
    Form.openForm
);
router.get('/get-forms', auth, checkRole('Admin'), Form.getForms);
router.get(
    '/get-opened-forms',
    auth,
    checkRole('Mahasiswa'),
    Form.getOpenedForms
);

module.exports = router;
