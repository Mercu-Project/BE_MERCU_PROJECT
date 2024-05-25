const router = require('express').Router();
const Form = require('../controllers/formController');

/* Middlewares */
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { openFormValidator } = require('../validators/formValidator');

router.patch(
    '/open/:id',
    auth,
    checkRole('Admin'),
    openFormValidator,
    Form.openForm
);
router.get('/get-forms', auth, checkRole('Admin'), Form.getForms);

module.exports = router;
