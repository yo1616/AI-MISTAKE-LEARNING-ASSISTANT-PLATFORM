const { getAiMode, getAiService } = require('../../../ai');
const { failure, success } = require('../utils/response');

async function getStatus(req, res, next) {
  try {
    const aiService = getAiService();
    const runtimeConfig = typeof aiService.getRuntimeConfig === 'function'
      ? aiService.getRuntimeConfig()
      : {
        provider: 'mock',
        hasApiKey: false,
        model: null
      };

    return success(res, {
      mode: getAiMode(),
      provider: runtimeConfig.provider,
      hasApiKey: runtimeConfig.hasApiKey,
      model: runtimeConfig.model
    });
  } catch (error) {
    return next(error);
  }
}

async function askQuestion(req, res, next) {
  try {
    const {
      questionText,
      studentAnswer = '',
      correctAnswer = '',
      questionImageUrl = ''
    } = req.body || {};

    if (!questionText && !questionImageUrl) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', 'questionText or questionImageUrl is required', 400);
    }

    const aiService = getAiService();
    const recommendation = await aiService.recommendTags({
      questionText: questionText || '請根據圖片內容分析題目',
      ocrText: req.body?.ocrText || questionText,
      subjectId: req.body?.subjectId || 'subject_bio',
      unitId: req.body?.unitId || '',
      questionImageUrl
    });
    const answer = await aiService.solveQuestion({
      questionText: questionText || '請根據圖片內容分析題目',
      studentAnswer,
      correctAnswer,
      tagIds: recommendation.candidateConceptIds || recommendation.recommendedTags?.map((tag) => tag.tagId),
      questionImageUrl
    });

    return success(res, {
      mode: getAiMode(),
      recommendation,
      answer
    });
  } catch (error) {
    return next(error);
  }
}

async function generatePracticeQuestion(req, res, next) {
  try {
    const conceptId = req.body?.conceptId || req.body?.tagId;
    if (!conceptId) {
      return failure(res, 'MISSING_REQUIRED_FIELDS', 'conceptId is required', 400);
    }

    const aiService = getAiService();
    const question = await aiService.generatePracticeQuestion({
      conceptId,
      tagId: conceptId,
      studentGrade: req.body?.studentGrade || '8',
      difficulty: req.body?.difficulty || 'medium',
      questionStyle: req.body?.questionStyle || 'literacy',
      variantIndex: Number(req.body?.variantIndex || 0)
    });

    return success(res, {
      mode: getAiMode(),
      question
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStatus,
  askQuestion,
  generatePracticeQuestion
};
