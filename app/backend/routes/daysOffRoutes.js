const express = require('express');
const router = express.Router();
const daysOffController = require('../controllers/daysOffController');

router.post('/', daysOffController.request);
router.put('/:id/approve', daysOffController.approve);
router.put('/:id/reject', daysOffController.reject);
router.get('/', daysOffController.getAll);
router.get('/pending', daysOffController.getPending);

module.exports = router;
