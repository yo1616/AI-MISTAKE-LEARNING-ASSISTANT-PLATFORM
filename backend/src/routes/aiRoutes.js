const express = require('express');
const aiController = require('../controllers/aiController');

const router = express.Router();

router.get('/status', aiController.getStatus);
router.post('/ask', aiController.askQuestion);
router.post('/practice-question', aiController.generatePracticeQuestion);

module.exports = router;
