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

router.get('/get-event-member', auth, CanteenPreorder.getEventMember);
router.get(
    '/get-additional-event-member',
    auth,
    CanteenPreorder.getAdditionalEventMember
);
router.get(
    '/get-preorder-edit-data/:id',
    auth,
    CanteenPreorder.getPreorderEditData
);
router.patch(
    '/finish-preorder/:id',
    auth,
    checkRole(ROLES.ADMIN),
    CanteenPreorder.finishPreorder
);
router.get(
    '/print-invoice/:id',
    auth,
    checkRole(ROLES.BAK, ROLES.ADMIN),
    CanteenPreorder.printInvoice
);

module.exports = router;
