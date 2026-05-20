import {
  mockTeachers,
  mockClasses,
  mockStudents,
  ALL_STUDENTS_CLASS_ID
} from "./data.js";

import { appState } from "./state.js";

import {
  apiOk,
  apiFail,
  isMistakeInRange,
  countBy,
  getClassNameById
} from "./utils.js";

export function getStudentProfile(studentId) {
  return mockStudents.find((student) => student.id === studentId);
}

function getAllowedClassIds() {
  return appState.allowedClassIds || [];
}

function isStudentVisibleToCurrentTeacher(student, classId) {
  const allowedClassIds = getAllowedClassIds();

  if (classId === ALL_STUDENTS_CLASS_ID) {
    return student.subjects.some((subject) =>
      allowedClassIds.includes(subject.classId)
    );
  }

  return (
    allowedClassIds.includes(classId) &&
    student.subjects.some((subject) => subject.classId === classId)
  );
}

function getStudentDisplayClassName(student, classId) {
  if (classId !== ALL_STUDENTS_CLASS_ID) {
    return getClassNameById(classId);
  }

  const allowedClassIds = getAllowedClassIds();

  const matchedSubject = student.subjects.find((subject) =>
    allowedClassIds.includes(subject.classId)
  );

  return matchedSubject?.className || "未分班";
}

export function getStudentMistakes(student, classId, range = "30d", from, to) {
  const allowedClassIds = getAllowedClassIds();

  return student.mistakes.filter((mistake) => {
    const matchClass =
      classId === ALL_STUDENTS_CLASS_ID
        ? allowedClassIds.includes(mistake.classId)
        : mistake.classId === classId && allowedClassIds.includes(classId);

    return matchClass && isMistakeInRange(mistake, range, from, to);
  });
}

function getStudentQuizStats(student) {
  const correctCount = student.quizCorrectCount ?? null;
  const totalCount = student.quizTotalCount ?? null;

  if (correctCount !== null && totalCount !== null) {
    return {
      quizCorrectCount: correctCount,
      quizTotalCount: totalCount,
      quizAccuracy:
        totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100)
    };
  }

  return {
    quizCorrectCount: null,
    quizTotalCount: null,
    quizAccuracy: student.quizAccuracy ?? 0
  };
}

function getClassQuizAccuracy(students) {
  const totalCorrect = students.reduce((sum, student) => {
    return sum + (student.quizCorrectCount ?? 0);
  }, 0);

  const totalQuestions = students.reduce((sum, student) => {
    return sum + (student.quizTotalCount ?? 0);
  }, 0);

  if (totalQuestions === 0) {
    if (students.length === 0) return 0;

    return Math.round(
      students.reduce((sum, student) => {
        return sum + (student.quizAccuracy ?? 0);
      }, 0) / students.length
    );
  }

  return Math.round((totalCorrect / totalQuestions) * 100);
}

export function buildConceptRanking(mistakes, limit = 5) {
  const grouped = countBy(mistakes, (mistake) => mistake.conceptId);

  return Object.values(grouped)
    .map(({ count, sample }) => ({
      conceptId: sample.conceptId,
      conceptName: sample.conceptName,
      mistakeCount: count
    }))
    .sort((a, b) => b.mistakeCount - a.mistakeCount)
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}

export function buildConceptDistribution(mistakes) {
  return buildConceptRanking(mistakes, 999).map((item) => ({
    conceptId: item.conceptId,
    conceptName: item.conceptName,
    count: item.mistakeCount
  }));
}

export function buildUnitDistribution(mistakes) {
  return Object.values(countBy(mistakes, (mistake) => mistake.unitName))
    .map(({ count, sample }) => ({
      unitName: sample.unitName,
      count
    }))
    .sort((a, b) => b.count - a.count);
}

export function buildMistakeTrend(mistakes) {
  return Object.values(countBy(mistakes, (mistake) => mistake.date))
    .map(({ count, sample }) => ({
      date: sample.date,
      count
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function apiLoginTeacher(email, password) {
  const teacher = mockTeachers.find(
    (item) => item.email === email && item.password === password
  );

  if (!teacher) {
    return apiFail("INVALID_LOGIN", "帳號或密碼錯誤");
  }

  return apiOk({
    teacherId: teacher.id,
    name: teacher.name,
    email: teacher.email,
    classIds: teacher.classIds || []
  });
}

export async function apiGetStudents() {
  return apiOk(
    mockStudents.map((student) => ({
      id: student.id,
      name: student.name,
      gradeYear: student.gradeYear,
      subjects: student.subjects
    }))
  );
}

export async function apiGetTeacherClasses() {
  const allowedClassIds = getAllowedClassIds();

  const teacherClasses = mockClasses.filter((classItem) => {
    if (classItem.id === ALL_STUDENTS_CLASS_ID) return true;
    return allowedClassIds.includes(classItem.id);
  });

  return apiOk(teacherClasses);
}

export async function apiGetDashboardStudents({
  classId,
  range = "30d",
  sortBy = "mistakeCount",
  from,
  to
}) {
  if (!classId) return apiFail("MISSING_CLASS_ID", "缺少 classId");

  const rows = mockStudents
    .filter((student) => isStudentVisibleToCurrentTeacher(student, classId))
    .map((student) => {
      const mistakes = getStudentMistakes(student, classId, range, from, to);
      const quizStats = getStudentQuizStats(student);

      return {
        studentId: student.id,
        name: student.name,
        gradeYear: student.gradeYear,
        className: getStudentDisplayClassName(student, classId),
        mistakeCount: mistakes.length,
        weakConceptCount: new Set(
          mistakes.map((mistake) => mistake.conceptId)
        ).size,
        activeDays: student.activeDays,
        quizCorrectCount: quizStats.quizCorrectCount,
        quizTotalCount: quizStats.quizTotalCount,
        quizAccuracy: quizStats.quizAccuracy
      };
    });

  rows.sort((a, b) => {
    if (sortBy === "weakConceptCount") {
      return b.weakConceptCount - a.weakConceptCount;
    }

    if (sortBy === "activeDays") {
      return b.activeDays - a.activeDays;
    }

    if (sortBy === "quizAccuracy") {
      return b.quizAccuracy - a.quizAccuracy;
    }

    return b.mistakeCount - a.mistakeCount;
  });

  return apiOk(rows);
}

export async function apiGetDashboardSummary({
  classId,
  range = "30d",
  limit = 5,
  from,
  to
}) {
  if (!classId) return apiFail("MISSING_CLASS_ID", "缺少 classId");

  const classStudents = mockStudents.filter((student) =>
    isStudentVisibleToCurrentTeacher(student, classId)
  );

  const mistakes = classStudents.flatMap((student) =>
    getStudentMistakes(student, classId, range, from, to)
  );

  const classQuizAccuracy = getClassQuizAccuracy(classStudents);

  const averageWeakConceptCount =
    classStudents.length === 0
      ? 0
      : (
          classStudents.reduce((sum, student) => {
            const studentMistakes = getStudentMistakes(
              student,
              classId,
              range,
              from,
              to
            );

            const weakConceptCount = new Set(
              studentMistakes.map((mistake) => mistake.conceptId)
            ).size;

            return sum + weakConceptCount;
          }, 0) / classStudents.length
        ).toFixed(1);

  return apiOk({
    range,
    weeklyMistakeCount: mistakes.length,
    studentCount: classStudents.length,
    classQuizAccuracy,
    averageWeakConceptCount,
    topWeakConcepts: buildConceptRanking(mistakes, limit)
  });
}

export async function apiGetClassCharts({
  classId,
  range = "30d",
  from,
  to
}) {
  if (!classId) return apiFail("MISSING_CLASS_ID", "缺少 classId");

  const classStudents = mockStudents.filter((student) =>
    isStudentVisibleToCurrentTeacher(student, classId)
  );

  const mistakes = classStudents.flatMap((student) =>
    getStudentMistakes(student, classId, range, from, to)
  );

  return apiOk({
    range,
    mistakeTrend: buildMistakeTrend(mistakes),
    conceptDistribution: buildConceptDistribution(mistakes),
    unitDistribution: buildUnitDistribution(mistakes),
    classQuizAccuracy: getClassQuizAccuracy(classStudents)
  });
}

export async function apiGetKnowledgeOverview({
  classId,
  range = "30d",
  from,
  to,
  limit = 5
}) {
  if (!classId) return apiFail("MISSING_CLASS_ID", "缺少 classId");

  const classStudents = mockStudents.filter((student) =>
    isStudentVisibleToCurrentTeacher(student, classId)
  );

  const mistakesWithStudent = classStudents.flatMap((student) =>
    getStudentMistakes(student, classId, range, from, to).map((mistake) => ({
      ...mistake,
      studentId: student.id,
      studentName: student.name,
      studentClassName: getStudentDisplayClassName(student, classId)
    }))
  );

  const grouped = countBy(mistakesWithStudent, (mistake) => mistake.conceptId);

  const conceptStats = Object.values(grouped)
    .map(({ count, sample }) => {
      const relatedMistakes = mistakesWithStudent.filter(
        (mistake) => mistake.conceptId === sample.conceptId
      );

      const affectedStudents = [
        ...new Map(
          relatedMistakes.map((mistake) => [
            mistake.studentId,
            {
              studentId: mistake.studentId,
              studentName: mistake.studentName,
              className: mistake.studentClassName
            }
          ])
        ).values()
      ];

      let riskLevel = "低";

      if (count >= 5 || affectedStudents.length >= 3) {
        riskLevel = "高";
      } else if (count >= 3 || affectedStudents.length >= 2) {
        riskLevel = "中";
      }

      return {
        conceptId: sample.conceptId,
        conceptName: sample.conceptName,
        unitName: sample.unitName,
        mistakeCount: count,
        affectedStudentCount: affectedStudents.length,
        affectedStudents,
        riskLevel
      };
    })
    .sort((a, b) => b.mistakeCount - a.mistakeCount);

  const highRiskConceptCount = conceptStats.filter(
    (concept) => concept.riskLevel === "高"
  ).length;

  const mostImpactedConcept =
    [...conceptStats].sort(
      (a, b) => b.affectedStudentCount - a.affectedStudentCount
    )[0] || null;

  const topWeakConcepts = conceptStats
    .slice(0, limit)
    .map((concept, index) => ({
      conceptId: concept.conceptId,
      conceptName: concept.conceptName,
      mistakeCount: concept.mistakeCount,
      rank: index + 1
    }));

  return apiOk({
    range,
    totalMistakeCount: mistakesWithStudent.length,
    highRiskConceptCount,
    mostImpactedConcept,
    topWeakConcepts,
    conceptRiskList: conceptStats
  });
}

export async function apiGetStudentConcepts({
  studentId,
  classId,
  range = "30d",
  limit = 5,
  from,
  to
}) {
  const student = getStudentProfile(studentId);

  if (!student) {
    return apiFail("STUDENT_NOT_FOUND", "找不到學生資料");
  }

  if (!isStudentVisibleToCurrentTeacher(student, classId)) {
    return apiFail(
      "STUDENT_NOT_IN_CLASS",
      "這位學生不在目前老師可查看的班級中"
    );
  }

  const mistakes = getStudentMistakes(student, classId, range, from, to);

  return apiOk({
    range,
    topWeakConcepts: buildConceptRanking(mistakes, limit),
    conceptDistribution: buildConceptDistribution(mistakes),
    unitDistribution: buildUnitDistribution(mistakes)
  });
}

export async function apiGetStudentCharts({
  studentId,
  classId,
  range = "30d",
  from,
  to
}) {
  const student = getStudentProfile(studentId);

  if (!student) {
    return apiFail("STUDENT_NOT_FOUND", "找不到學生資料");
  }

  if (!isStudentVisibleToCurrentTeacher(student, classId)) {
    return apiFail(
      "STUDENT_NOT_IN_CLASS",
      "這位學生不在目前老師可查看的班級中"
    );
  }

  const mistakes = getStudentMistakes(student, classId, range, from, to);

  return apiOk({
    range,
    mistakeTrend: buildMistakeTrend(mistakes),
    conceptDistribution: buildConceptDistribution(mistakes),
    unitDistribution: buildUnitDistribution(mistakes)
  });
}