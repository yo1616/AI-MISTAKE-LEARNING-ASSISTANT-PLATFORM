const dashboardService = require('../dashboardService');
const { toPrototypeClass } = require('../../utils/frontendPrototypeClassMap');

function toPercent(rate) {
  if (rate === null || rate === undefined) {
    return 0;
  }
  return Math.round(rate * 100);
}

function classQuizAccuracyFromAccuracy(accuracy) {
  return toPercent(accuracy?.accuracyRate);
}

function averageWeakConceptCount(students) {
  if (!students || students.length === 0) {
    return '0.0';
  }

  const average = students.reduce((sum, student) => sum + student.weakConceptCount, 0) / students.length;
  return average.toFixed(1);
}

function withPrototypeStudentFields(payload) {
  return {
    ...toPrototypeClass(payload),
    students: (payload.students || []).map((student) => ({
      ...toPrototypeClass(student),
      quizAccuracy: toPercent(student.generatedExamAccuracyRate)
    }))
  };
}

function asPrototypeStudentArray(result) {
  if (!result.ok) {
    return result;
  }
  return {
    ...result,
    data: withPrototypeStudentFields(result.data).students
  };
}

function withPrototypeSummaryFields(payload) {
  const students = payload.students || [];

  return {
    ...toPrototypeClass(payload),
    studentsWithNoMistakes: payload.studentsWithNoMistakes
      ? {
        ...payload.studentsWithNoMistakes,
        students
      }
      : payload.studentsWithNoMistakes,
    weeklyMistakeCount: payload.newMistakeCount,
    studentCount: payload.enrolledStudentCount,
    classQuizAccuracy: classQuizAccuracyFromAccuracy(payload.generatedExamAccuracy),
    averageWeakConceptCount: averageWeakConceptCount(students),
    topWeakConcepts: payload.topConceptsByMistakeCount || []
  };
}

function withPrototypeSummarySubsetFields(payload) {
  return {
    ...toPrototypeClass(payload),
    classQuizAccuracy: classQuizAccuracyFromAccuracy(payload.generatedExamAccuracy),
    averageWeakConceptCount: payload.averageWeakConceptCount ?? null
  };
}

function withPrototypeConceptRiskFields(payload) {
  const conceptRiskList = (payload.conceptRiskRows || []).map((concept) => ({
    ...concept,
    riskLevel: concept.riskLevel === 'high'
      ? '高'
      : concept.riskLevel === 'medium'
        ? '中'
        : '低'
  }));

  return {
    ...toPrototypeClass(payload),
    totalMistakeCount: payload.totalMistakesInPeriod,
    mostImpactedConcept: payload.mostAffectedConcept,
    topWeakConcepts: payload.topConceptsByMistakeCount || [],
    conceptRiskList
  };
}

function mapResult(result, mapper) {
  if (!result.ok) {
    return result;
  }
  return {
    ...result,
    data: mapper(result.data)
  };
}

module.exports = {
  getOverview(query) {
    return mapResult(dashboardService.getDashboardOverview(query), withPrototypeSummaryFields);
  },
  getSummary(query) {
    const summaryResult = dashboardService.getDashboardSummary(query);
    if (!summaryResult.ok) {
      return summaryResult;
    }

    const studentsResult = dashboardService.getDashboardStudents(query);
    if (!studentsResult.ok) {
      return studentsResult;
    }

    return {
      ...summaryResult,
      data: withPrototypeSummarySubsetFields({
        ...summaryResult.data,
        averageWeakConceptCount: averageWeakConceptCount(studentsResult.data.students || [])
      })
    };
  },
  getClassCharts(query) {
    return mapResult(dashboardService.getClassCharts(query), (payload) => ({
      ...toPrototypeClass(payload),
      classQuizAccuracy: classQuizAccuracyFromAccuracy(payload.generatedExamAccuracy)
    }));
  },
  getStudents(query) {
    return asPrototypeStudentArray(dashboardService.getDashboardStudents(query));
  },
  getStudentDetail(studentId, query) {
    return mapResult(dashboardService.getStudentDetail(studentId, query), toPrototypeClass);
  },
  getConceptsRisk(query) {
    return mapResult(dashboardService.getConceptsRisk(query), withPrototypeConceptRiskFields);
  },
  getStudentConcepts: dashboardService.getStudentConcepts,
  getStudentCharts: dashboardService.getStudentCharts
};
