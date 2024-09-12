const router = require('express').Router();
const CanteenScan = require('../controllers/canteenScanController');
const auth = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');

router.post('/input-scan', auth, checkRole('Admin'), CanteenScan.inputScan);
router.get(
    '/last-scanning-qr',
    auth,
    checkRole('Admin'),
    CanteenScan.getLastScanningQr
);
router.delete('/reset-last-scanning-qr', CanteenScan.resetLastScanningQR);
router.get('/get-stats', auth, checkRole('Admin'), CanteenScan.getStatistics);
router.get('/export', auth, checkRole('Admin'), CanteenScan.exportCanteenScan);
router.get(
    '/get-scanned',
    auth,
    checkRole('Admin'),
    CanteenScan.getScannedData
);

module.exports = router;
