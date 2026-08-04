const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');

router.post('/', interviewController.create);
router.get('/', interviewController.getAll);
router.get('/:id', interviewController.getById);
router.put('/:id', interviewController.update);
router.put('/:id/feedback', interviewController.addFeedback);
router.delete('/:id', interviewController.delete);

module.exports = router;
