const dashboardService = require('../services/dashboardService');
const { success, failure } = require('../utils/response');

function handleServiceResult(res, result) {
  if (!result.ok) {
    const statusCode = result.error.code === 'STUDENT_NOT_FOUND' || result.error.code === 'CLASS_NOT_FOUND'
      ? 404
      : 400;
    return failure(res, result.error.code, result.error.message, statusCode);
  }
  return success(res, result.data);
}

async function getOverview(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getDashboardOverview(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getSummary(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getDashboardSummary(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudents(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getDashboardStudents(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentDetail(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getStudentDetail(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

async function getConceptsRisk(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getConceptsRisk(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentConcepts(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getStudentConcepts(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentCharts(req, res, next) {
  try {
    return handleServiceResult(res, dashboardService.getStudentCharts(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOverview,
  getSummary,
  getStudents,
  getStudentDetail,
  getConceptsRisk,
  getStudentConcepts,
  getStudentCharts
};
