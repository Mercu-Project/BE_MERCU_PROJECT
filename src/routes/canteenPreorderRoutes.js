const router = require('express').Router();
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const CanteenPreorder = require('../controllers/canteenPreorderController');
const {
    submissionValidator,
    approvalPreorderValidator,
} = require('../validators/canteenPreorderValidator');
const { ROLES } = require('../utils/constants');
const upload = require('../middlewares/upload');

router.post(
    '/submit-preorder',
    auth,
    checkRole(ROLES.TU),
    submissionValidator,
    CanteenPreorder.submitPreorder
);

router.patch(
    '/approval-preorder/:id',
    auth,
    checkRole([ROLES.DEKAN, ROLES.BAK]),
    approvalPreorderValidator,
    CanteenPreorder.approvalPreorder
);

router.get('/get-preorders', auth, CanteenPreorder.getPreorders);

router.patch(
    '/edit-preorder/:id',
    auth,
    checkRole(ROLES.TU),
    CanteenPreorder.editPreorder
);

router.get('/get-status-history/:id', auth, CanteenPreorder.getStatusHistory);
router.get('/get-preorder-detail/:id', auth, CanteenPreorder.getPreorderDetail);

module.exports = router;
