const router = require('express').Router();
const CanteenScan = require('../controllers/canteenScanController');

router.post('/input-scan', CanteenScan.inputScan);
router.get('/last-scanning-qr', CanteenScan.getLastScanningQr);
router.delete('/reset-last-scanning-qr', CanteenScan.resetLastScanningQR);
router.get('/get-stats', CanteenScan.getStatistics);

module.exports = router;
