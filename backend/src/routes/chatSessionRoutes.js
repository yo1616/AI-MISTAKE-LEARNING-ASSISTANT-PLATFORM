const express = require('express');
const chatSessionController = require('../controllers/chatSessionController');

const router = express.Router();

router.get('/:sessionId', chatSessionController.getChatSessionById);
router.get('/:sessionId/messages', chatSessionController.getChatSessionMessages);

module.exports = router;
