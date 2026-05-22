const chatSessionService = require('../services/chatSessionService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'CHAT_SESSION_NOT_FOUND', 'Chat session not found', 404);
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function missingFields(body, fields) {
  return fields.filter((field) => !hasValue(body[field]));
}

function failureFromResult(res, result) {
  return failure(res, result.error.code, result.error.message, result.error.statusCode);
}

async function createChatSession(req, res, next) {
  try {
    const missing = missingFields(req.body, ['studentId', 'subjectId', 'inputType']);
    if (missing.length > 0) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const result = chatSessionService.createChatSession(req.body);
    if (!result.ok) {
      return failureFromResult(res, result);
    }

    return success(res, result.data, 201);
  } catch (error) {
    return next(error);
  }
}

async function createChatMessage(req, res, next) {
  try {
    const missing = missingFields(req.body, ['role', 'messageType', 'content']);
    if (missing.length > 0) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const result = chatSessionService.createChatMessage(req.params.sessionId, req.body);
    if (!result.ok) {
      return failureFromResult(res, result);
    }

    return success(res, result.data, 201);
  } catch (error) {
    return next(error);
  }
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

async function deleteChatSession(req, res, next) {
  try {
    const result = chatSessionService.deleteChatSession(req.params.sessionId);
    if (!result.ok) {
      return failureFromResult(res, result);
    }

    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createChatSession,
  createChatMessage,
  getChatSessionById,
  getChatSessionMessages,
  deleteChatSession
};
