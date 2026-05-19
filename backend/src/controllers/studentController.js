const studentService = require('../services/studentService');
const { success, failure } = require('../utils/response');

async function getStudentById(req, res, next) {
  try {
    const student = studentService.getStudentById(req.params.studentId);
    if (!student) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, student);
  } catch (error) {
    return next(error);
  }
}

async function getStudentClasses(req, res, next) {
  try {
    const result = studentService.getStudentClasses(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentMistakes(req, res, next) {
  try {
    const result = studentService.getStudentMistakes(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentConceptNotes(req, res, next) {
  try {
    const result = studentService.getStudentConceptNotes(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentChatSessions(req, res, next) {
  try {
    const result = studentService.getStudentChatSessions(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStudentById,
  getStudentClasses,
  getStudentMistakes,
  getStudentConceptNotes,
  getStudentChatSessions
};
