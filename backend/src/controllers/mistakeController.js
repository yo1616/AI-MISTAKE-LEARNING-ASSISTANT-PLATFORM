const mistakeService = require('../services/mistakeService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'MISTAKE_NOT_FOUND', 'Mistake record not found', 404);
}

async function getMistakeById(req, res, next) {
  try {
    const mistake = mistakeService.getMistakeById(req.params.mistakeRecordId);
    if (!mistake) {
      return notFound(res);
    }
    return success(res, mistake);
  } catch (error) {
    return next(error);
  }
}

async function getRelatedNotes(req, res, next) {
  try {
    const result = mistakeService.getRelatedNotes(req.params.mistakeRecordId);
    if (!result.mistakeExists) {
      return notFound(res);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function updateMistakeStar(req, res, next) {
  try {
    if (typeof req.body.starred !== 'boolean') {
      return failure(res, 'INVALID_STARRED_VALUE', 'starred must be a boolean', 400);
    }

    const mistake = mistakeService.updateMistakeStar(req.params.mistakeRecordId, req.body.starred);
    if (!mistake) {
      return notFound(res);
    }

    return success(res, mistake);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMistakeById,
  getRelatedNotes,
  updateMistakeStar
};
