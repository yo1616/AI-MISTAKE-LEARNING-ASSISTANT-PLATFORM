const conceptNoteService = require('../services/conceptNoteService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'CONCEPT_NOTE_NOT_FOUND', 'Concept note not found', 404);
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
  getConceptNoteById,
  getRelatedMistakes,
  updateConceptNoteStar
};
