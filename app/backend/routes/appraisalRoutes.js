const express = require('express');
const router = express.Router();
const appraisalController = require('../controllers/appraisalController');

router.post('/', appraisalController.create);
router.get('/', appraisalController.getAll);
router.get('/employee/:employeeId', appraisalController.getByEmployee);
router.get('/:id', appraisalController.getById);
router.put('/:id/self', appraisalController.submitSelfEval);
router.put('/:id/manager', appraisalController.submitManagerEval);
router.put('/:id/complete', appraisalController.complete);
router.delete('/:id', appraisalController.delete);

module.exports = router;
