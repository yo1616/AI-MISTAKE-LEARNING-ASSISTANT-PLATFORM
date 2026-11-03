const mistakeService = require('../services/mistakeService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'MISTAKE_NOT_FOUND', 'Mistake record not found', 404);
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

async function createMistake(req, res, next) {
  try {
    const missing = missingFields(req.body, [
      'studentId',
      'subjectId',
      'classId',
      'unitId',
      'subUnitId',
      'conceptId',
      'questionText',
      'studentQuestion',
      'correctAnswer',
      'aiSummary',
      'fullExplanation',
      'inputType'
    ]);

    if (missing.length > 0) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const result = mistakeService.createMistake(req.body);
    if (!result.ok) {
      return failureFromResult(res, result);
    }

    return success(res, result.data, 201);
  } catch (error) {
    return next(error);
  }
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
  createMistake,
  getMistakeById,
  getRelatedNotes,
  updateMistakeStar
};
