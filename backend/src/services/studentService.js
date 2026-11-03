const { openDatabase } = require('../db/connection');

function toBoolean(value) {
  return Boolean(value);
}

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function studentExists(db, studentId) {
  const row = db.prepare('SELECT 1 FROM students WHERE id = ?').get(studentId);
  return Boolean(row);
}

function withStudentCheck(db, studentId, queryCallback) {
  if (!studentExists(db, studentId)) {
    return {
      studentExists: false,
      data: null
    };
  }

  return {
    studentExists: true,
    data: queryCallback()
  };
}

const INVALID_SUMMARY_PATTERNS = [
  '無法判斷題目內容',
  '並非一個生物學問題'
];

const INVALID_QUESTION_PATTERNS = [
  /^你好$/i,
  /^嗨$/i,
  /^hi$/i,
  /^hello$/i,
  /^test$/i,
  /^[a-z]\d+$/i
];

function normalizeLooseText(value = '') {
  return String(value).trim().replace(/\s+/g, '').toLowerCase();
}

function isDisplayableMistakeRow(row) {
  const summaryText = `${row.aiSummary || ''} ${row.fullExplanation || ''}`;
  if (INVALID_SUMMARY_PATTERNS.some((pattern) => summaryText.includes(pattern))) {
    return false;
  }

  const rawQuestion = String(row.questionText || row.studentQuestion || '').trim();
  const normalizedQuestion = normalizeLooseText(rawQuestion);
  if (INVALID_QUESTION_PATTERNS.some((pattern) => pattern.test(normalizedQuestion))) {
    return false;
  }

  if (row.inputType === 'text' && normalizedQuestion.length > 0 && normalizedQuestion.length <= 4) {
    return false;
  }

  if (row.inputType === 'photo' && !normalizedQuestion && !summaryText.trim()) {
    return false;
  }

  return true;
}

function isDisplayableConceptNoteRow(row) {
  const noteText = `${row.noteTitle || ''} ${row.noteContent || ''}`;
  if (INVALID_SUMMARY_PATTERNS.some((pattern) => noteText.includes(pattern))) {
    return false;
  }

  return true;
}

function getStudentById(studentId) {
  return withDb((db) => {
    const row = db.prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        grade_year AS gradeYear
      FROM students
      WHERE id = ?
    `).get(studentId);

    return row || null;
  });
}

function getStudents() {
  return withDb((db) => {
    const studentRows = db.prepare(`
      SELECT
        id,
        name,
        email,
        phone,
        grade_year AS gradeYear
      FROM students
      ORDER BY id ASC
    `).all();

    return studentRows.map((student) => ({
      ...student,
      subjects: db.prepare(`
        SELECT
          s.id AS subjectId,
          s.name AS subjectName,
          c.id AS classId,
          c.name AS className,
          c.grade_year AS gradeYear
        FROM student_classes sc
        JOIN subjects s ON s.id = sc.subject_id
        JOIN classes c ON c.id = sc.class_id
        WHERE sc.student_id = ?
        ORDER BY c.grade_year ASC, s.name ASC, c.name ASC
      `).all(student.id)
    }));
  });
}

function getStudentClasses(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    return db.prepare(`
      SELECT
        c.id AS classId,
        c.name AS className,
        c.grade_year AS gradeYear,
        s.id AS subjectId,
        s.name AS subjectName
      FROM student_classes sc
      JOIN classes c ON c.id = sc.class_id
      JOIN subjects s ON s.id = sc.subject_id
      WHERE sc.student_id = ?
      ORDER BY c.grade_year ASC, s.name ASC, c.name ASC
    `).all(studentId);
  }));
}

function getStudentMistakes(studentId, filters = {}) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    const conditions = ['mr.student_id = ?'];
    const params = [studentId];

    if (filters.starredOnly) {
      conditions.push('mr.starred = 1');
    }

    if (filters.unitId) {
      conditions.push('mr.unit_id = ?');
      params.push(filters.unitId);
    }

    if (filters.subUnitId) {
      conditions.push('mr.sub_unit_id = ?');
      params.push(filters.subUnitId);
    }

    if (filters.conceptId) {
      conditions.push('mr.concept_id = ?');
      params.push(filters.conceptId);
    }

    const rows = db.prepare(`
      SELECT
        mr.id AS mistakeRecordId,
        mr.question_text AS questionText,
        mr.student_question AS studentQuestion,
        mr.correct_answer AS correctAnswer,
        mr.ai_summary AS aiSummary,
        mr.full_explanation AS fullExplanation,
        mr.input_type AS inputType,
        mr.question_image_url AS questionImageUrl,
        mr.starred AS starred,
        mr.starred_at AS starredAt,
        mr.alert_triggered AS alertTriggered,
        mr.created_at AS createdAt,
        subj.id AS subjectId,
        subj.name AS subjectName,
        cls.id AS classId,
        cls.name AS className,
        u.id AS unitId,
        u.name AS unitName,
        su.id AS subUnitId,
        su.name AS subUnitName,
        c.id AS conceptId,
        c.name AS conceptName
      FROM mistake_records mr
      LEFT JOIN subjects subj ON subj.id = mr.subject_id
      LEFT JOIN classes cls ON cls.id = mr.class_id
      LEFT JOIN units u ON u.id = mr.unit_id
      LEFT JOIN sub_units su ON su.id = mr.sub_unit_id
      LEFT JOIN concepts c ON c.id = mr.concept_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY mr.starred DESC, mr.created_at DESC
    `).all(...params);

    return rows
      .map((row) => ({
        id: row.mistakeRecordId,
        ...row,
        starred: toBoolean(row.starred),
        alertTriggered: toBoolean(row.alertTriggered)
      }))
      .filter((row) => filters.excludeInvalid === false || isDisplayableMistakeRow(row));
  }));
}

function getStudentConceptNotes(studentId, filters = {}) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    const conditions = ['cn.student_id = ?'];
    const params = [studentId];

    if (filters.starredOnly) {
      conditions.push('cn.starred = 1');
    }

    if (filters.unitId) {
      conditions.push('cn.unit_id = ?');
      params.push(filters.unitId);
    }

    if (filters.subUnitId) {
      conditions.push('cn.sub_unit_id = ?');
      params.push(filters.subUnitId);
    }

    if (filters.conceptId) {
      conditions.push('cn.concept_id = ?');
      params.push(filters.conceptId);
    }

    const rows = db.prepare(`
      SELECT
        cn.id AS noteId,
        cn.note_title AS noteTitle,
        cn.note_content AS noteContent,
        cn.starred AS starred,
        cn.starred_at AS starredAt,
        cn.created_at AS createdAt,
        subj.id AS subjectId,
        subj.name AS subjectName,
        cls.id AS classId,
        cls.name AS className,
        u.id AS unitId,
        u.name AS unitName,
        su.id AS subUnitId,
        su.name AS subUnitName,
        c.id AS conceptId,
        c.name AS conceptName
      FROM concept_notes cn
      LEFT JOIN subjects subj ON subj.id = cn.subject_id
      LEFT JOIN classes cls ON cls.id = cn.class_id
      LEFT JOIN units u ON u.id = cn.unit_id
      LEFT JOIN sub_units su ON su.id = cn.sub_unit_id
      LEFT JOIN concepts c ON c.id = cn.concept_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY cn.starred DESC, cn.created_at DESC
    `).all(...params);

    return rows
      .map((row) => ({
        id: row.noteId,
        ...row,
        starred: toBoolean(row.starred)
      }))
      .filter((row) => filters.excludeInvalid === false || isDisplayableConceptNoteRow(row));
  }));
}

function getStudentChatSessions(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    const rows = db.prepare(`
      SELECT
        cs.id AS sessionId,
        cs.title AS title,
        cs.input_type AS inputType,
        cs.started_at AS startedAt,
        cs.updated_at AS updatedAt,
        cs.question_group_count AS questionGroupCount,
        subj.id AS subjectId,
        subj.name AS subjectName,
        cls.id AS classId,
        cls.name AS className,
        u.id AS unitId,
        u.name AS unitName,
        su.id AS subUnitId,
        su.name AS subUnitName,
        c.id AS conceptId,
        c.name AS conceptName
      FROM chat_sessions cs
      LEFT JOIN subjects subj ON subj.id = cs.subject_id
      LEFT JOIN classes cls ON cls.id = cs.class_id
      LEFT JOIN units u ON u.id = cs.unit_id
      LEFT JOIN sub_units su ON su.id = cs.sub_unit_id
      LEFT JOIN question_groups qg ON qg.id = (
        SELECT qg_first.id
        FROM question_groups qg_first
        WHERE qg_first.session_id = cs.id
        ORDER BY qg_first.created_at ASC
        LIMIT 1
      )
      LEFT JOIN concepts c ON c.id = qg.concept_id
      WHERE cs.student_id = ?
      ORDER BY cs.updated_at DESC, cs.started_at DESC
    `).all(studentId);

    return rows.map((row) => ({
      id: row.sessionId,
      ...row
    }));
  }));
}

function getStudentGeneratedExams(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    const rows = db.prepare(`
      SELECT
        ge.id AS examId,
        ge.student_id AS studentId,
        'Generated Exam ' || ge.id AS title,
        ge.question_type AS examType,
        'mistakes' AS sourceType,
        ge.created_at AS createdAt,
        ge.question_count AS questionCount,
        subj.id AS subjectId,
        subj.name AS subjectName,
        cls.id AS classId,
        cls.name AS className,
        u.id AS unitId,
        u.name AS unitName,
        su.id AS subUnitId,
        su.name AS subUnitName,
        c.id AS conceptId,
        c.name AS conceptName
      FROM generated_exams ge
      LEFT JOIN subjects subj ON subj.id = ge.subject_id
      LEFT JOIN classes cls ON cls.id = ge.class_id
      LEFT JOIN units u ON u.id = ge.unit_id
      LEFT JOIN sub_units su ON su.id = ge.sub_unit_id
      LEFT JOIN concepts c ON c.id = ge.concept_id
      WHERE ge.student_id = ?
      ORDER BY ge.created_at DESC
    `).all(studentId);

    return rows.map((row) => ({
      id: row.examId,
      ...row
    }));
  }));
}

function getStudentFavoritesSummary(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    const favoriteMistakeCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM mistake_records
      WHERE student_id = ? AND starred = 1
    `).get(studentId).count;

    const favoriteConceptNoteCount = db.prepare(`
      SELECT COUNT(*) AS count
      FROM concept_notes
      WHERE student_id = ? AND starred = 1
    `).get(studentId).count;

    return {
      favoriteMistakeCount,
      favoriteConceptNoteCount,
      totalFavorites: favoriteMistakeCount + favoriteConceptNoteCount
    };
  }));
}

module.exports = {
  getStudents,
  getStudentById,
  getStudentClasses,
  getStudentMistakes,
  getStudentConceptNotes,
  getStudentChatSessions,
  getStudentGeneratedExams,
  getStudentFavoritesSummary
};
