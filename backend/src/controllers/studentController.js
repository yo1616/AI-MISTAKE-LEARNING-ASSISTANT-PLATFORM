const studentService = require('../services/studentService');
const studentDashboardService = require('../services/dashboard/studentDashboardService');
const { success, failure } = require('../utils/response');

async function getStudents(req, res, next) {
  try {
    return success(res, studentService.getStudents());
  } catch (error) {
    return next(error);
  }
}

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
    const result = studentService.getStudentMistakes(req.params.studentId, {
      starredOnly: req.query.starredOnly === 'true',
      unitId: req.query.unitId,
      subUnitId: req.query.subUnitId,
      conceptId: req.query.conceptId,
      excludeInvalid: req.query.excludeInvalid !== 'false'
    });
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
    const result = studentService.getStudentConceptNotes(req.params.studentId, {
      starredOnly: req.query.starredOnly === 'true',
      unitId: req.query.unitId,
      subUnitId: req.query.subUnitId,
      conceptId: req.query.conceptId,
      excludeInvalid: req.query.excludeInvalid !== 'false'
    });
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentFavoriteMistakes(req, res, next) {
  try {
    const result = studentService.getStudentMistakes(req.params.studentId, {
      starredOnly: true,
      unitId: req.query.unitId,
      subUnitId: req.query.subUnitId,
      conceptId: req.query.conceptId,
      excludeInvalid: req.query.excludeInvalid !== 'false'
    });
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentFavoriteConceptNotes(req, res, next) {
  try {
    const result = studentService.getStudentConceptNotes(req.params.studentId, {
      starredOnly: true,
      unitId: req.query.unitId,
      subUnitId: req.query.subUnitId,
      conceptId: req.query.conceptId,
      excludeInvalid: req.query.excludeInvalid !== 'false'
    });
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

async function getStudentGeneratedExams(req, res, next) {
  try {
    const result = studentService.getStudentGeneratedExams(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentFavoritesSummary(req, res, next) {
  try {
    const result = studentService.getStudentFavoritesSummary(req.params.studentId);
    if (!result.studentExists) {
      return failure(res, 'STUDENT_NOT_FOUND', 'Student not found', 404);
    }
    return success(res, result.data);
  } catch (error) {
    return next(error);
  }
}

async function getStudentDashboardSummary(req, res, next) {
  try {
    const result = studentDashboardService.getDashboard(req.params.studentId, req.query);
    if (!result.ok) {
      const statusCode = result.error.code === 'STUDENT_NOT_FOUND' || result.error.code === 'CLASS_NOT_FOUND'
        ? 404
        : 400;
      return failure(res, result.error.code, result.error.message, statusCode);
    }

    return success(res, {
      totalMistakes: result.data.totalMistakes,
      starredNotes: result.data.starredNotes,
      generatedExamAccuracy: result.data.generatedExamAccuracy
    });
  } catch (error) {
    return next(error);
  }
}

async function getStudentDashboardCharts(req, res, next) {
  try {
    const result = studentDashboardService.getDashboard(req.params.studentId, req.query);
    if (!result.ok) {
      const statusCode = result.error.code === 'STUDENT_NOT_FOUND' || result.error.code === 'CLASS_NOT_FOUND'
        ? 404
        : 400;
      return failure(res, result.error.code, result.error.message, statusCode);
    }

    return success(res, {
      conceptDistribution: result.data.conceptDistribution,
      unitDistribution: result.data.unitDistribution,
      topWeakConcepts: result.data.topWeakConcepts
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  getStudentClasses,
  getStudentMistakes,
  getStudentConceptNotes,
  getStudentFavoriteMistakes,
  getStudentFavoriteConceptNotes,
  getStudentChatSessions,
  getStudentGeneratedExams,
  getStudentFavoritesSummary,
  getStudentDashboardSummary,
  getStudentDashboardCharts
};
