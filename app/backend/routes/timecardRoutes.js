const express = require('express');
const router = express.Router();
const timecardController = require('../controllers/timecardController');

router.post('/clock-in', timecardController.clockIn);
router.put('/:id/clock-out', timecardController.clockOut);
router.get('/employee/:employeeId', timecardController.getByEmployee);
router.get('/stats', timecardController.getStats);

module.exports = router;
