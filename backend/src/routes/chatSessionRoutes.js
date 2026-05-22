const express = require('express');
const chatSessionController = require('../controllers/chatSessionController');

const router = express.Router();

router.post('/', chatSessionController.createChatSession);
router.get('/:sessionId', chatSessionController.getChatSessionById);
router.get('/:sessionId/messages', chatSessionController.getChatSessionMessages);
router.post('/:sessionId/messages', chatSessionController.createChatMessage);
router.delete('/:sessionId', chatSessionController.deleteChatSession);

module.exports = router;
