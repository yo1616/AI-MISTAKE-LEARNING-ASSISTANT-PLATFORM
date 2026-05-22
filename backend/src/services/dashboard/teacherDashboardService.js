const dashboardService = require('../dashboardService');
const { toPrototypeClass } = require('../../utils/frontendPrototypeClassMap');

function toPercent(rate) {
  if (rate === null || rate === undefined) {
    return 0;
  }
  return Math.round(rate * 100);
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
  return {
    ...toPrototypeClass(payload),
    weeklyMistakeCount: payload.newMistakeCount,
    studentCount: payload.enrolledStudentCount,
    topWeakConcepts: payload.topConceptsByMistakeCount || []
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
    return mapResult(dashboardService.getDashboardSummary(query), toPrototypeClass);
  },
  getClassCharts(query) {
    return mapResult(dashboardService.getClassCharts(query), toPrototypeClass);
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
