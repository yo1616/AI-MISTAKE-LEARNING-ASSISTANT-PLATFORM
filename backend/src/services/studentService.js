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

function getStudentMistakes(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
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
      WHERE mr.student_id = ?
      ORDER BY mr.starred DESC, mr.created_at DESC
    `).all(studentId);

    return rows.map((row) => ({
      ...row,
      starred: toBoolean(row.starred),
      alertTriggered: toBoolean(row.alertTriggered)
    }));
  }));
}

function getStudentConceptNotes(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
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
      WHERE cn.student_id = ?
      ORDER BY cn.starred DESC, cn.created_at DESC
    `).all(studentId);

    return rows.map((row) => ({
      ...row,
      starred: toBoolean(row.starred)
    }));
  }));
}

function getStudentChatSessions(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    return db.prepare(`
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
  }));
}

function getStudentGeneratedExams(studentId) {
  return withDb((db) => withStudentCheck(db, studentId, () => {
    return db.prepare(`
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
  }));
}

module.exports = {
  getStudentById,
  getStudentClasses,
  getStudentMistakes,
  getStudentConceptNotes,
  getStudentChatSessions,
  getStudentGeneratedExams
};
