const dashboardService = require('../dashboardService');

function withMainFrontendFields(result) {
  if (!result.ok) {
    return result;
  }

  const { data } = result;
  const totalConcepts = data.summary?.totalConcepts || 0;
  const quizAccuracy = data.summary?.quizAccuracy || {
    correctCount: 0,
    totalAnswered: 0,
    accuracyRate: null
  };

  return {
    ...result,
    data: {
      ...data,
      totalMistakes: data.summary?.totalMistakes || 0,
      totalConcepts,
      starredNotes: totalConcepts,
      generatedExamAccuracy: quizAccuracy,
      conceptDistribution: (data.topWeakConcepts || []).map((concept) => ({
        conceptId: concept.conceptId,
        conceptName: concept.conceptName,
        count: concept.mistakeCount
      })),
      unitDistribution: (data.unitDistribution || []).map((unit) => ({
        ...unit,
        count: unit.mistakeCount
      }))
    }
  };
}

module.exports = {
  getDashboard(studentId, query) {
    return withMainFrontendFields(dashboardService.getStudentDashboard(studentId, query));
  }
};
