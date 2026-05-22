const conceptNoteService = require('../services/conceptNoteService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'CONCEPT_NOTE_NOT_FOUND', 'Concept note not found', 404);
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

async function createConceptNote(req, res, next) {
  try {
    const missing = missingFields(req.body, [
      'studentId',
      'subjectId',
      'classId',
      'unitId',
      'subUnitId',
      'conceptId',
      'noteTitle',
      'noteContent'
    ]);

    if (missing.length > 0) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', `Missing required fields: ${missing.join(', ')}`, 400);
    }

    const result = conceptNoteService.createConceptNote(req.body);
    if (!result.ok) {
      return failureFromResult(res, result);
    }

    return success(res, result.data, 201);
  } catch (error) {
    return next(error);
  }
}

async function getConceptNoteById(req, res, next) {
  try {
    const note = conceptNoteService.getConceptNoteById(req.params.noteId);
    if (!note) {
      return notFound(res);
    }
    return success(res, note);
  } catch (error) {
    return next(error);
  }
}

async function getRelatedMistakes(req, res, next) {
  try {
    const result = conceptNoteService.getRelatedMistakes(req.params.noteId);
    if (!result.noteExists) {
      return notFound(res);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function updateConceptNoteStar(req, res, next) {
  try {
    if (typeof req.body.starred !== 'boolean') {
      return failure(res, 'INVALID_STARRED_VALUE', 'starred must be a boolean', 400);
    }

    const note = conceptNoteService.updateConceptNoteStar(req.params.noteId, req.body.starred);
    if (!note) {
      return notFound(res);
    }

    return success(res, note);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createConceptNote,
  getConceptNoteById,
  getRelatedMistakes,
  updateConceptNoteStar
};
