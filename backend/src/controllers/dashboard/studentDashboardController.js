const studentDashboardService = require('../../services/dashboard/studentDashboardService');
const { success, failure } = require('../../utils/response');

async function getDashboard(req, res, next) {
  try {
    const result = studentDashboardService.getDashboard(req.params.studentId, req.query);
    if (!result.ok) {
      const statusCode = result.error.code === 'STUDENT_NOT_FOUND' || result.error.code === 'CLASS_NOT_FOUND'
        ? 404
        : 400;
      return failure(res, result.error.code, result.error.message, statusCode);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboard
};
