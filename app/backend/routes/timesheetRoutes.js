const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/timesheetController');

// Employee routes
router.get('/week',                  ctrl.getWeek);          // ?employeeId=&date=
router.get('/employee/:employeeId',  ctrl.getByEmployee);
router.post('/save',                 ctrl.save);
router.post('/submit',               ctrl.submit);

// Admin routes
router.get('/all',                   ctrl.getAll);           // ?status=submitted
router.put('/:id/approve',           ctrl.approve);
router.put('/:id/reject',            ctrl.reject);

module.exports = router;
