const teacherDashboardService = require('../../services/dashboard/teacherDashboardService');
const { success, failure } = require('../../utils/response');

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
    return handleServiceResult(res, teacherDashboardService.getOverview(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getSummary(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getSummary(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getClassCharts(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getClassCharts(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudents(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getStudents(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentDetail(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getStudentDetail(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

async function getConceptsRisk(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getConceptsRisk(req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentConcepts(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getStudentConcepts(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

async function getStudentCharts(req, res, next) {
  try {
    return handleServiceResult(res, teacherDashboardService.getStudentCharts(req.params.studentId, req.query));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getOverview,
  getSummary,
  getClassCharts,
  getStudents,
  getStudentDetail,
  getConceptsRisk,
  getStudentConcepts,
  getStudentCharts
};
