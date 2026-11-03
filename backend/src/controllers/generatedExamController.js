const generatedExamService = require('../services/generatedExamService');
const { success, failure } = require('../utils/response');

function notFound(res) {
  return failure(res, 'GENERATED_EXAM_NOT_FOUND', 'Generated exam not found', 404);
}

async function getGeneratedExamById(req, res, next) {
  try {
    const exam = generatedExamService.getGeneratedExamById(req.params.examId);
    if (!exam) {
      return notFound(res);
    }
    return success(res, exam);
  } catch (error) {
    return next(error);
  }
}

async function getGeneratedExamQuestions(req, res, next) {
  try {
    const result = generatedExamService.getGeneratedExamQuestions(req.params.examId);
    if (!result.examExists) {
      return notFound(res);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getGeneratedExamSourceMistakes(req, res, next) {
  try {
    const result = generatedExamService.getGeneratedExamSourceMistakes(req.params.examId);
    if (!result.examExists) {
      return notFound(res);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getGeneratedExamById,
  getGeneratedExamQuestions,
  getGeneratedExamSourceMistakes
};
