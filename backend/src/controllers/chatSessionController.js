const chatSessionService = require('../services/chatSessionService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'CHAT_SESSION_NOT_FOUND', 'Chat session not found', 404);
}

async function getChatSessionById(req, res, next) {
  try {
    const session = chatSessionService.getChatSessionById(req.params.sessionId);
    if (!session) {
      return notFound(res);
    }
    return success(res, session);
  } catch (error) {
    return next(error);
  }
}

async function getChatSessionMessages(req, res, next) {
  try {
    const result = chatSessionService.getChatSessionMessages(req.params.sessionId);
    if (!result.sessionExists) {
      return notFound(res);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getChatSessionById,
  getChatSessionMessages
};
