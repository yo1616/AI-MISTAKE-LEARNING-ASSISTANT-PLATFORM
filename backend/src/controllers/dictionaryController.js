const dictionaryService = require('../services/dictionaryService');
const { success } = require('../utils/response');

async function getSubjects(req, res, next) {
  try {
    return success(res, dictionaryService.getSubjects());
  } catch (error) {
    return next(error);
  }
}

async function getUnitsBySubjectId(req, res, next) {
  try {
    return success(res, dictionaryService.getUnitsBySubjectId(req.params.subjectId));
  } catch (error) {
    return next(error);
  }
}

async function getSubUnitsByUnitId(req, res, next) {
  try {
    return success(res, dictionaryService.getSubUnitsByUnitId(req.params.unitId));
  } catch (error) {
    return next(error);
  }
}

async function getConcepts(req, res, next) {
  try {
    return success(res, dictionaryService.getConcepts({
      subjectId: req.query.subjectId,
      unitId: req.query.unitId,
      subUnitId: req.query.subUnitId
    }));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSubjects,
  getUnitsBySubjectId,
  getSubUnitsByUnitId,
  getConcepts
};
