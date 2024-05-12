const router = require('express').Router();
const TimeBreakSession = require('../controllers/timeBreakSessionController');
const auth = require('../middlewares/auth');
const {
    createSessionValidator,
    getSessionsValidator,
    swtichAllStatusValidator,
    editSessionValidator,
} = require('../validators/timeBreakSessionValidator');

router.post(
    '/create-session',
    auth,
    createSessionValidator,
    TimeBreakSession.addSession
);
router.get(
    '/get-sessions',
    auth,
    getSessionsValidator,
    TimeBreakSession.getSessions
);
router.patch(
    '/edit-session/:id',
    auth,
    editSessionValidator,
    TimeBreakSession.editSession
);
router.delete('/remove-session/:id', auth, TimeBreakSession.removeSession);
router.patch('/switch-status/:id', auth, TimeBreakSession.switchStatus);
router.patch(
    '/switch-all-statuses',
    auth,
    swtichAllStatusValidator,
    TimeBreakSession.swithAllStatuses
);

module.exports = router;
