const router = require('express').Router();
const CanteenScan = require('../controllers/canteenScanController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const { ROLES } = require('../utils/constants');

router.post(
    '/input-scan',
    auth,
    checkRole([ROLES.BAK, ROLES.ADMIN]),
    CanteenScan.inputScan
);
router.get(
    '/last-scanning-qr',
    auth,
    checkRole([ROLES.ADMIN, ROLES.BAK]),
    CanteenScan.getLastScanningQr
);
router.delete('/reset-last-scanning-qr', CanteenScan.resetLastScanningQR);
router.get(
    '/get-stats',
    auth,
    checkRole([ROLES.BAK, ROLES.ADMIN]),
    CanteenScan.getStatistics
);
router.get(
    '/export',
    auth,
    checkRole([ROLES.BAK, ROLES.ADMIN]),
    CanteenScan.exportCanteenScan
);
router.get(
    '/get-scanned',
    auth,
    checkRole([ROLES.ADMIN, ROLES.BAK]),
    CanteenScan.getScannedData
);

module.exports = router;
