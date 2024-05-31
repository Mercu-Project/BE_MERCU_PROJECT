const router = require('express').Router();
const Lecturer = require('../controllers/lecturerController');
const auth = require('../middlewares/auth');

router.get('/get-lecturers', auth, Lecturer.getLecturers);

module.exports = router;
