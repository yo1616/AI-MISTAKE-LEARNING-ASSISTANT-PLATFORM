const { openDatabase } = require('../db/connection');
const { resolveDateRange, dateKeyFromIso } = require('../utils/dateRange');

/** 知識點管理：依期間錯題數與影響學生數（非比例制） */
const CONCEPT_RISK_RULES = {
  high: { minMistakeCount: 5, minAffectedStudents: 3 },
  medium: { minMistakeCount: 3, minAffectedStudents: 2 }
};
const VALID_SORT_FIELDS = new Set([
  'mistakeCount',
  'weakConceptCount',
  'activeDays',
  'generatedExamAccuracyRate',
  'name'
]);

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function parseScope(query) {
  const scope = query.scope === 'allClasses' ? 'allClasses' : 'class';
  const classId = query.classId || null;

  if (scope === 'class' && !classId) {
    return {
      ok: false,
      code: 'MISSING_CLASS_ID',
      message: 'Query parameter classId is required unless scope=allClasses'
    };
  }

  return { ok: true, scope, classId };
}

function getClassRow(db, classId) {
  return db.prepare(`
    SELECT
      c.id AS classId,
      c.name AS className,
      c.grade_year AS gradeYear,
      c.subject_id AS subjectId,
      s.name AS subjectName
    FROM classes c
    JOIN subjects s ON s.id = c.subject_id
    WHERE c.id = ?
  `).get(classId);
}

function getEnrolledStudents(db, classId) {
  return db.prepare(`
    SELECT
      sc.student_id AS studentId,
      st.name,
      st.grade_year AS gradeYear,
      c.id AS classId,
      c.name AS className,
      sc.joined_at AS joinedAt
    FROM student_classes sc
    JOIN students st ON st.id = sc.student_id
    JOIN classes c ON c.id = sc.class_id
    WHERE sc.class_id = ? AND sc.status = 'active'
    ORDER BY st.name ASC
  `).all(classId);
}

function getAllEnrolledStudents(db) {
  const rows = db.prepare(`
    SELECT
      sc.student_id AS studentId,
      st.name,
      st.grade_year AS gradeYear,
      c.id AS classId,
      c.name AS className,
      sc.joined_at AS joinedAt
    FROM student_classes sc
    JOIN students st ON st.id = sc.student_id
    JOIN classes c ON c.id = sc.class_id
    WHERE sc.status = 'active'
    ORDER BY st.name ASC, c.name ASC
  `).all();

  const byStudent = new Map();
  for (const row of rows) {
    if (!byStudent.has(row.studentId)) {
      byStudent.set(row.studentId, row);
    }
  }
  return [...byStudent.values()];
}

function fetchMistakesInPeriodAllStudents(db, studentIds, from, to) {
  if (studentIds.length === 0) {
    return [];
  }

  const placeholders = studentIds.map(() => '?').join(', ');
  return db.prepare(`
    SELECT
      mr.id,
      mr.student_id AS studentId,
      mr.concept_id AS conceptId,
      mr.class_id AS classId,
      mr.unit_id AS unitId,
      mr.question_text AS questionText,
      mr.ai_summary AS aiSummary,
      mr.created_at AS createdAt
    FROM mistake_records mr
    WHERE mr.student_id IN (${placeholders})
      AND mr.created_at >= ?
      AND mr.created_at <= ?
  `).all(...studentIds, from, to);
}

function studentInClass(db, studentId, classId) {
  const row = db.prepare(`
    SELECT 1 FROM student_classes
    WHERE student_id = ? AND class_id = ? AND status = 'active'
  `).get(studentId, classId);
  return Boolean(row);
}

function fetchMistakesInPeriod(db, studentIds, classId, from, to) {
  if (studentIds.length === 0) {
    return [];
  }

  const placeholders = studentIds.map(() => '?').join(', ');
  const params = [...studentIds, classId, from, to];

  return db.prepare(`
    SELECT
      mr.id,
      mr.student_id AS studentId,
      mr.concept_id AS conceptId,
      mr.class_id AS classId,
      mr.unit_id AS unitId,
      mr.question_text AS questionText,
      mr.ai_summary AS aiSummary,
      mr.created_at AS createdAt
    FROM mistake_records mr
    WHERE mr.student_id IN (${placeholders})
      AND mr.class_id = ?
      AND mr.created_at >= ?
      AND mr.created_at <= ?
  `).all(...params);
}

function aggregateExamAccuracy(db, studentIds, classId, from, to) {
  if (studentIds.length === 0) {
    return { byStudent: new Map(), classTotal: { correctCount: 0, totalAnswered: 0, accuracyRate: null } };
  }

  const placeholders = studentIds.map(() => '?').join(', ');
  const rows = db.prepare(`
    SELECT
      es.student_id AS studentId,
      SUM(ea.is_correct) AS correctCount,
      COUNT(ea.id) AS totalAnswered
    FROM exam_submissions es
    JOIN exam_answers ea ON ea.submission_id = es.id
    JOIN generated_exams ge ON ge.id = es.exam_id
    WHERE es.student_id IN (${placeholders})
      AND es.submitted_at >= ?
      AND es.submitted_at <= ?
      AND (ge.class_id = ? OR ge.class_id IS NULL)
    GROUP BY es.student_id
  `).all(...studentIds, from, to, classId);

  const byStudent = new Map();
  let classCorrect = 0;
  let classTotal = 0;

  for (const row of rows) {
    const correctCount = Number(row.correctCount) || 0;
    const totalAnswered = Number(row.totalAnswered) || 0;
    const accuracyRate = totalAnswered > 0 ? correctCount / totalAnswered : null;
    byStudent.set(row.studentId, { correctCount, totalAnswered, accuracyRate });
    classCorrect += correctCount;
    classTotal += totalAnswered;
  }

  return {
    byStudent,
    classTotal: {
      correctCount: classCorrect,
      totalAnswered: classTotal,
      accuracyRate: classTotal > 0 ? classCorrect / classTotal : null
    }
  };
}

function aggregateExamAccuracyAllClasses(db, studentIds, from, to) {
  if (studentIds.length === 0) {
    return { byStudent: new Map(), classTotal: { correctCount: 0, totalAnswered: 0, accuracyRate: null } };
  }

  const placeholders = studentIds.map(() => '?').join(', ');
  const rows = db.prepare(`
    SELECT
      es.student_id AS studentId,
      SUM(ea.is_correct) AS correctCount,
      COUNT(ea.id) AS totalAnswered
    FROM exam_submissions es
    JOIN exam_answers ea ON ea.submission_id = es.id
    WHERE es.student_id IN (${placeholders})
      AND es.submitted_at >= ?
      AND es.submitted_at <= ?
    GROUP BY es.student_id
  `).all(...studentIds, from, to);

  const byStudent = new Map();
  let classCorrect = 0;
  let classTotal = 0;

  for (const row of rows) {
    const correctCount = Number(row.correctCount) || 0;
    const totalAnswered = Number(row.totalAnswered) || 0;
    const accuracyRate = totalAnswered > 0 ? correctCount / totalAnswered : null;
    byStudent.set(row.studentId, { correctCount, totalAnswered, accuracyRate });
    classCorrect += correctCount;
    classTotal += totalAnswered;
  }

  return {
    byStudent,
    classTotal: {
      correctCount: classCorrect,
      totalAnswered: classTotal,
      accuracyRate: classTotal > 0 ? classCorrect / classTotal : null
    }
  };
}

function buildStudentStats(enrolled, mistakes, examByStudent) {
  const mistakesByStudent = new Map();
  for (const m of mistakes) {
    if (!mistakesByStudent.has(m.studentId)) {
      mistakesByStudent.set(m.studentId, []);
    }
    mistakesByStudent.get(m.studentId).push(m);
  }

  return enrolled.map((student) => {
    const studentMistakes = mistakesByStudent.get(student.studentId) || [];
    const conceptIds = new Set(studentMistakes.map((m) => m.conceptId).filter(Boolean));
    const activeDaySet = new Set(studentMistakes.map((m) => dateKeyFromIso(m.createdAt)).filter(Boolean));
    const exam = examByStudent.get(student.studentId);
    const generatedExamAccuracyRate = exam
      ? exam.accuracyRate
      : null;

    return {
      studentId: student.studentId,
      name: student.name,
      gradeYear: student.gradeYear,
      classId: student.classId,
      className: student.className,
      joinedAt: student.joinedAt,
      mistakeCount: studentMistakes.length,
      weakConceptCount: conceptIds.size,
      activeDays: activeDaySet.size,
      generatedExamAccuracyRate
    };
  });
}

function sortStudents(students, sortBy, sortOrder) {
  const order = sortOrder === 'asc' ? 1 : -1;
  const field = VALID_SORT_FIELDS.has(sortBy) ? sortBy : 'mistakeCount';

  return [...students].sort((a, b) => {
    const av = a[field];
    const bv = b[field];

    if (field === 'name') {
      return order * String(av).localeCompare(String(bv), 'zh-Hant');
    }

    const aNull = av === null || av === undefined;
    const bNull = bv === null || bv === undefined;
    if (aNull && bNull) {
      return 0;
    }
    if (aNull) {
      return 1;
    }
    if (bNull) {
      return -1;
    }
    if (av === bv) {
      return String(a.name).localeCompare(String(b.name), 'zh-Hant');
    }
    return order * (av - bv);
  });
}

function paginate(items, page, limit) {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || items.length);
  const start = (p - 1) * l;
  return {
    total: items.length,
    students: items.slice(start, start + l)
  };
}

function rankTopConcepts(mistakes, limit) {
  const counts = new Map();
  for (const m of mistakes) {
    if (!m.conceptId) {
      continue;
    }
    counts.set(m.conceptId, (counts.get(m.conceptId) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([conceptId, mistakeCount], index) => ({ conceptId, mistakeCount, rank: index + 1 }));
}

function attachConceptNames(db, ranked) {
  if (ranked.length === 0) {
    return [];
  }

  const placeholders = ranked.map(() => '?').join(', ');
  const names = db.prepare(`
    SELECT id AS conceptId, name AS conceptName, unit_id AS unitId
    FROM concepts
    WHERE id IN (${placeholders})
  `).all(...ranked.map((r) => r.conceptId));

  const nameMap = new Map(names.map((n) => [n.conceptId, n]));

  return ranked.map((row) => {
    const meta = nameMap.get(row.conceptId) || {};
    return {
      conceptId: row.conceptId,
      conceptName: meta.conceptName || row.conceptId,
      unitId: meta.unitId || null,
      mistakeCount: row.mistakeCount,
      rank: row.rank
    };
  });
}

function buildExamAccuracyTrend(db, studentId, classId, from, to) {
  const rows = db.prepare(`
    SELECT
      substr(es.submitted_at, 1, 10) AS date,
      SUM(ea.is_correct) AS correctCount,
      COUNT(ea.id) AS totalAnswered
    FROM exam_submissions es
    JOIN exam_answers ea ON ea.submission_id = es.id
    JOIN generated_exams ge ON ge.id = es.exam_id
    WHERE es.student_id = ?
      AND es.submitted_at >= ?
      AND es.submitted_at <= ?
      AND (ge.class_id = ? OR ge.class_id IS NULL)
    GROUP BY substr(es.submitted_at, 1, 10)
    ORDER BY date ASC
  `).all(studentId, from, to, classId);

  return rows.map((row) => {
    const total = Number(row.totalAnswered) || 0;
    const correct = Number(row.correctCount) || 0;
    return {
      date: row.date,
      accuracyRate: total > 0 ? Math.round((correct / total) * 1000) / 1000 : null
    };
  });
}

function buildMistakeTrend(mistakes) {
  const byDate = new Map();
  for (const m of mistakes) {
    const key = dateKeyFromIso(m.createdAt);
    if (!key) {
      continue;
    }
    byDate.set(key, (byDate.get(key) || 0) + 1);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));
}

function riskLevelFromCounts(mistakeCount, affectedStudentCount) {
  const { high, medium } = CONCEPT_RISK_RULES;
  if (mistakeCount >= high.minMistakeCount || affectedStudentCount >= high.minAffectedStudents) {
    return 'high';
  }
  if (mistakeCount >= medium.minMistakeCount || affectedStudentCount >= medium.minAffectedStudents) {
    return 'medium';
  }
  return 'low';
}

function isHighRiskConcept(mistakeCount, affectedStudentCount) {
  return riskLevelFromCounts(mistakeCount, affectedStudentCount) === 'high';
}

function suggestedActionForRisk(level) {
  if (level === 'high') {
    return '建議全班複習';
  }
  if (level === 'medium') {
    return '建議分組補救';
  }
  return '建議個別追蹤';
}

function buildInsightBanner(mistakeCount, weakConceptCount, accuracyRate) {
  let level = 'low';
  if (mistakeCount >= 8 || weakConceptCount >= 5 || (accuracyRate !== null && accuracyRate < 0.5)) {
    level = 'high';
  } else if (mistakeCount >= 4 || weakConceptCount >= 3 || (accuracyRate !== null && accuracyRate < 0.7)) {
    level = 'medium';
  }

  const messages = {
    low: '矯正狀態良好，可維持目前學習節奏',
    medium: '矯正狀態中等，建議持續追蹤高頻錯題',
    high: '矯正狀態需加強，建議優先處理常錯知識點'
  };

  return { level, message: messages[level] };
}

function mistakeRecordTitle(record) {
  if (record.questionText && record.questionText.trim()) {
    const text = record.questionText.trim();
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  }
  if (record.aiSummary && record.aiSummary.trim()) {
    const text = record.aiSummary.trim();
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
  }
  return '未命名錯題';
}

function resolveContext(db, query) {
  const dateRange = resolveDateRange(query);
  if (!dateRange.ok) {
    return { ok: false, error: dateRange };
  }

  const scopeResult = parseScope(query);
  if (!scopeResult.ok) {
    return { ok: false, error: scopeResult };
  }

  const { scope, classId } = scopeResult;
  const { range, from, to } = dateRange;

  if (scope === 'class') {
    const classRow = getClassRow(db, classId);
    if (!classRow) {
      return { ok: false, error: { code: 'CLASS_NOT_FOUND', message: 'Class not found' } };
    }
    const enrolled = getEnrolledStudents(db, classId);
    return {
      ok: true,
      range,
      from,
      to,
      scope,
      classId,
      classRow,
      enrolled,
      studentIds: enrolled.map((s) => s.studentId)
    };
  }

  const enrolled = getAllEnrolledStudents(db);
  return {
    ok: true,
    range,
    from,
    to,
    scope,
    classId: null,
    classRow: null,
    enrolled,
    studentIds: [...new Set(enrolled.map((s) => s.studentId))]
  };
}

function getDashboardStudents(query) {
  return withDb((db) => {
    const ctx = resolveContext(db, query);
    if (!ctx.ok) {
      return ctx;
    }

    const { range, from, to, classId, classRow, enrolled, studentIds } = ctx;
    const mistakes = ctx.scope === 'class'
      ? fetchMistakesInPeriod(db, studentIds, classId, from, to)
      : fetchMistakesInPeriodAllStudents(db, studentIds, from, to);

    const examStats = ctx.scope === 'class'
      ? aggregateExamAccuracy(db, studentIds, classId, from, to)
      : aggregateExamAccuracyAllClasses(db, studentIds, from, to);

    let students = buildStudentStats(enrolled, mistakes, examStats.byStudent);

    const q = (query.q || '').trim();
    if (q) {
      students = students.filter((s) => s.name.includes(q));
    }

    students = sortStudents(students, query.sortBy, query.sortOrder);

    const { total, students: pageStudents } = query.page || query.limit
      ? paginate(students, query.page, query.limit)
      : { total: students.length, students };

    const payload = {
      range,
      from,
      to,
      total,
      students: pageStudents.map(({ joinedAt, ...rest }) => rest)
    };

    if (ctx.scope === 'class') {
      payload.classId = classRow.classId;
      payload.className = classRow.className;
    } else {
      payload.scope = 'allClasses';
    }

    return { ok: true, data: payload };
  });
}

function getDashboardOverview(query) {
  return withDb((db) => {
    const ctx = resolveContext(db, query);
    if (!ctx.ok) {
      return ctx;
    }

    const limit = Math.max(1, Number(query.limit) || 5);
    const { range, from, to, classId, classRow, enrolled, studentIds } = ctx;

    const mistakes = ctx.scope === 'class'
      ? fetchMistakesInPeriod(db, studentIds, classId, from, to)
      : fetchMistakesInPeriodAllStudents(db, studentIds, from, to);

    const examStats = ctx.scope === 'class'
      ? aggregateExamAccuracy(db, studentIds, classId, from, to)
      : aggregateExamAccuracyAllClasses(db, studentIds, from, to);

    const studentStats = buildStudentStats(enrolled, mistakes, examStats.byStudent);
    const activeStudentIds = new Set(
      mistakes.map((m) => m.studentId)
    );

    const topRaw = rankTopConcepts(mistakes, limit);
    const topConceptsByMistakeCount = attachConceptNames(db, topRaw);

    const studentsWithNoMistakes = studentStats
      .filter((s) => s.mistakeCount === 0)
      .map((s) => ({
        studentId: s.studentId,
        name: s.name,
        gradeYear: s.gradeYear,
        classId: s.classId,
        className: s.className,
        mistakeCount: 0,
        weakConceptCount: 0
      }));

    const noMistakeCount = studentsWithNoMistakes.length;

    const data = {
      range,
      from,
      to,
      enrolledStudentCount: enrolled.length,
      newMistakeCount: mistakes.length,
      activeStudentCount: activeStudentIds.size,
      generatedExamAccuracy: examStats.classTotal,
      mistakeTrend: buildMistakeTrend(mistakes),
      topConceptsByMistakeCount,
      studentsWithNoMistakes: {
        count: noMistakeCount,
        students: studentsWithNoMistakes
      },
      alertBanner: {
        type: 'info',
        message: `本期間有 ${noMistakeCount} 位學生無錯題紀錄`
      }
    };

    if (ctx.scope === 'class' && classRow) {
      data.classId = classRow.classId;
      data.className = classRow.className;
      data.subjectName = classRow.subjectName;
    } else {
      data.scope = 'allClasses';
    }

    return { ok: true, data };
  });
}

function getDashboardSummary(query) {
  const result = getDashboardOverview({ ...query, limit: query.limit || 5 });
  if (!result.ok) {
    return result;
  }

  const { data } = result;
  return {
    ok: true,
    data: {
      range: data.range,
      classId: data.classId,
      className: data.className,
      weeklyMistakeCount: data.newMistakeCount,
      studentCount: data.enrolledStudentCount,
      generatedExamAccuracy: data.generatedExamAccuracy,
      topWeakConcepts: (data.topConceptsByMistakeCount || []).map((c) => ({
        conceptId: c.conceptId,
        conceptName: c.conceptName,
        mistakeCount: c.mistakeCount,
        rank: c.rank
      }))
    }
  };
}

function getStudentDetail(studentId, query) {
  return withDb((db) => {
    const dateRange = resolveDateRange(query);
    if (!dateRange.ok) {
      return { ok: false, error: dateRange };
    }

    const classId = query.classId;
    if (!classId) {
      return {
        ok: false,
        error: { code: 'MISSING_CLASS_ID', message: 'Query parameter classId is required' }
      };
    }

    const classRow = getClassRow(db, classId);
    if (!classRow) {
      return { ok: false, error: { code: 'CLASS_NOT_FOUND', message: 'Class not found' } };
    }

    const student = db.prepare(`
      SELECT id AS studentId, name, grade_year AS gradeYear
      FROM students WHERE id = ?
    `).get(studentId);

    if (!student) {
      return { ok: false, error: { code: 'STUDENT_NOT_FOUND', message: 'Student not found' } };
    }

    if (!studentInClass(db, studentId, classId)) {
      return {
        ok: false,
        error: { code: 'STUDENT_NOT_IN_CLASS', message: 'Student is not enrolled in this class' }
      };
    }

    const enrollment = db.prepare(`
      SELECT joined_at AS joinedAt FROM student_classes
      WHERE student_id = ? AND class_id = ?
    `).get(studentId, classId);

    const { range, from, to } = dateRange;
    const mistakeLimit = Math.max(1, Number(query.mistakeLimit) || 20);
    const weakConceptLimit = Math.max(1, Number(query.weakConceptLimit) || 4);

    const mistakes = fetchMistakesInPeriod(db, [studentId], classId, from, to);
    const examStats = aggregateExamAccuracy(db, [studentId], classId, from, to);
    const exam = examStats.byStudent.get(studentId) || {
      correctCount: 0,
      totalAnswered: 0,
      accuracyRate: null
    };

    const conceptCounts = new Map();
    for (const m of mistakes) {
      if (!m.conceptId) {
        continue;
      }
      conceptCounts.set(m.conceptId, (conceptCounts.get(m.conceptId) || 0) + 1);
    }

    const conceptIds = [...conceptCounts.keys()];
    const conceptMeta = conceptIds.length
      ? db.prepare(`
        SELECT id AS conceptId, name AS conceptName
        FROM concepts WHERE id IN (${conceptIds.map(() => '?').join(', ')})
      `).all(...conceptIds)
      : [];
    const metaMap = new Map(conceptMeta.map((c) => [c.conceptId, c.conceptName]));

    const conceptDistribution = [...conceptCounts.entries()]
      .map(([conceptId, count]) => ({
        conceptId,
        conceptName: metaMap.get(conceptId) || conceptId,
        count
      }))
      .sort((a, b) => b.count - a.count);

    const topWeakConcepts = attachConceptNames(
      db,
      rankTopConcepts(mistakes, weakConceptLimit)
    );

    const frequentMistakeTags = topWeakConcepts.map((c) => c.conceptName);

    const conceptNames = db.prepare(`
      SELECT mr.id, mr.concept_id AS conceptId, c.name AS conceptName,
        mr.question_text AS questionText, mr.ai_summary AS aiSummary, mr.created_at AS createdAt
      FROM mistake_records mr
      LEFT JOIN concepts c ON c.id = mr.concept_id
      WHERE mr.student_id = ? AND mr.class_id = ? AND mr.created_at >= ? AND mr.created_at <= ?
      ORDER BY mr.created_at DESC
      LIMIT ?
    `).all(studentId, classId, from, to, mistakeLimit);

    const mistakeRecords = conceptNames.map((row) => ({
      mistakeRecordId: row.id,
      title: mistakeRecordTitle(row),
      conceptId: row.conceptId,
      conceptName: row.conceptName || row.conceptId,
      createdAt: row.createdAt
    }));

    const activeDaySet = new Set(mistakes.map((m) => dateKeyFromIso(m.createdAt)).filter(Boolean));

    return {
      ok: true,
      data: {
        studentId: student.studentId,
        name: student.name,
        gradeYear: student.gradeYear,
        classId: classRow.classId,
        className: classRow.className,
        joinedAt: enrollment?.joinedAt || null,
        range,
        from,
        to,
        mistakeCount: mistakes.length,
        weakConceptCount: conceptCounts.size,
        activeDays: activeDaySet.size,
        generatedExamAccuracy: exam,
        insightBanner: buildInsightBanner(
          mistakes.length,
          conceptCounts.size,
          exam.accuracyRate
        ),
        conceptDistribution,
        mistakeTrend: buildMistakeTrend(mistakes),
        topWeakConcepts,
        frequentMistakeTags,
        mistakeRecords
      }
    };
  });
}

function getConceptsRisk(query) {
  return withDb((db) => {
    const ctx = resolveContext(db, query);
    if (!ctx.ok) {
      return ctx;
    }

    if (ctx.scope === 'allClasses') {
      return {
        ok: false,
        error: {
          code: 'SCOPE_NOT_SUPPORTED',
          message: 'concepts-risk requires a specific classId'
        }
      };
    }

    const limit = Math.max(1, Number(query.limit) || 5);
    const { range, from, to, classId, classRow, enrolled, studentIds } = ctx;
    const enrolledCount = enrolled.length;
    const mistakes = fetchMistakesInPeriod(db, studentIds, classId, from, to);

    const byConcept = new Map();
    for (const m of mistakes) {
      if (!m.conceptId) {
        continue;
      }
      if (!byConcept.has(m.conceptId)) {
        byConcept.set(m.conceptId, { mistakeCount: 0, students: new Set() });
      }
      const entry = byConcept.get(m.conceptId);
      entry.mistakeCount += 1;
      entry.students.add(m.studentId);
    }

    const conceptIds = [...byConcept.keys()];
    const metaRows = conceptIds.length
      ? db.prepare(`
        SELECT c.id AS conceptId, c.name AS conceptName, c.unit_id AS unitId, u.name AS unitName
        FROM concepts c
        LEFT JOIN units u ON u.id = c.unit_id
        WHERE c.id IN (${conceptIds.map(() => '?').join(', ')})
      `).all(...conceptIds)
      : [];
    const metaMap = new Map(metaRows.map((r) => [r.conceptId, r]));

    const conceptRiskRows = conceptIds.map((conceptId) => {
      const entry = byConcept.get(conceptId);
      const meta = metaMap.get(conceptId) || {};
      const affectedStudentCount = entry.students.size;
      const mistakeCount = entry.mistakeCount;
      const affectedRatio = enrolledCount > 0 ? affectedStudentCount / enrolledCount : 0;
      const riskLevel = riskLevelFromCounts(mistakeCount, affectedStudentCount);
      return {
        conceptId,
        conceptName: meta.conceptName || conceptId,
        unitId: meta.unitId || null,
        unitName: meta.unitName || null,
        mistakeCount,
        affectedStudentCount,
        affectedRatio: Math.round(affectedRatio * 1000) / 1000,
        riskLevel,
        suggestedAction: suggestedActionForRisk(riskLevel)
      };
    }).sort((a, b) => b.mistakeCount - a.mistakeCount);

    const highRiskConceptCount = conceptRiskRows.filter((row) => isHighRiskConcept(
      row.mistakeCount,
      row.affectedStudentCount
    )).length;
    const topConceptsByMistakeCount = attachConceptNames(db, rankTopConcepts(mistakes, limit));

    const mostMistaken = topConceptsByMistakeCount[0] || null;
    const mostAffected = [...conceptRiskRows].sort((a, b) => {
      if (b.affectedStudentCount !== a.affectedStudentCount) {
        return b.affectedStudentCount - a.affectedStudentCount;
      }
      return b.mistakeCount - a.mistakeCount;
    })[0] || null;

    const teachingSuggestion = mostAffected
      ? `建議優先處理高風險知識點，其中「${mostAffected.conceptName}」影響學生數最多。`
      : '本期間班級錯題資料較少，可持續觀察學習狀況。';

    return {
      ok: true,
      data: {
        range,
        from,
        to,
        classId: classRow.classId,
        className: classRow.className,
        enrolledStudentCount: enrolledCount,
        totalMistakesInPeriod: mistakes.length,
        highRiskConceptCount,
        mostAffectedConcept: mostAffected
          ? {
            conceptId: mostAffected.conceptId,
            conceptName: mostAffected.conceptName,
            affectedStudentCount: mostAffected.affectedStudentCount
          }
          : null,
        mostMistakenConcept: mostMistaken
          ? {
            conceptId: mostMistaken.conceptId,
            conceptName: mostMistaken.conceptName,
            mistakeCount: mostMistaken.mistakeCount
          }
          : null,
        topConceptsByMistakeCount,
        teachingSuggestion,
        conceptRiskRows
      }
    };
  });
}

function getStudentConcepts(studentId, query) {
  const detail = getStudentDetail(studentId, query);
  if (!detail.ok) {
    return detail;
  }

  const limit = Math.max(1, Number(query.limit) || 5);
  const { data } = detail;

  const unitRows = withDb((db) => {
    const classId = query.classId;
    const dateRange = resolveDateRange(query);
    if (!dateRange.ok) {
      return [];
    }
    return db.prepare(`
      SELECT u.name AS unitName, COUNT(*) AS count
      FROM mistake_records mr
      LEFT JOIN units u ON u.id = mr.unit_id
      WHERE mr.student_id = ? AND mr.class_id = ?
        AND mr.created_at >= ? AND mr.created_at <= ?
      GROUP BY mr.unit_id
      ORDER BY count DESC
    `).all(studentId, classId, dateRange.from, dateRange.to);
  });

  return {
    ok: true,
    data: {
      range: data.range,
      generatedExamAccuracy: data.generatedExamAccuracy,
      topWeakConcepts: data.topWeakConcepts.slice(0, limit),
      conceptDistribution: data.conceptDistribution.slice(0, limit),
      unitDistribution: unitRows
    }
  };
}

function getStudentCharts(studentId, query) {
  const detail = getStudentDetail(studentId, query);
  if (!detail.ok) {
    return detail;
  }

  const { data } = detail;

  const classId = query.classId;
  const dateRange = resolveDateRange(query);
  const unitRows = dateRange.ok
    ? withDb((db) => db.prepare(`
      SELECT u.name AS unitName, COUNT(*) AS count
      FROM mistake_records mr
      LEFT JOIN units u ON u.id = mr.unit_id
      WHERE mr.student_id = ? AND mr.class_id = ?
        AND mr.created_at >= ? AND mr.created_at <= ?
      GROUP BY mr.unit_id
      ORDER BY count DESC
    `).all(studentId, classId, dateRange.from, dateRange.to))
    : [];

  const generatedExamAccuracyTrend = dateRange.ok
    ? withDb((db) => buildExamAccuracyTrend(db, studentId, classId, dateRange.from, dateRange.to))
    : [];

  return {
    ok: true,
    data: {
      range: data.range,
      mistakeTrend: data.mistakeTrend,
      generatedExamAccuracyTrend,
      conceptDistribution: data.conceptDistribution,
      unitDistribution: unitRows
    }
  };
}

module.exports = {
  getDashboardStudents,
  getDashboardOverview,
  getDashboardSummary,
  getStudentDetail,
  getConceptsRisk,
  getStudentConcepts,
  getStudentCharts
};
