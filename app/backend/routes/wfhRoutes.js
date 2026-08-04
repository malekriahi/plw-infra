const express = require('express');
const router = express.Router();
const wfhController = require('../controllers/wfhController');

router.post('/', wfhController.request);
router.put('/:id/approve', wfhController.approve);
router.put('/:id/reject', wfhController.reject);
router.get('/', wfhController.getAll);
router.get('/today', wfhController.getToday);

module.exports = router;
