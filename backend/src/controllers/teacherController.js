const teacherService = require('../services/teacherService');
const { success } = require('../utils/response');

async function getClasses(req, res, next) {
  try {
    const data = teacherService.getTeacherClasses();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getClasses
};
