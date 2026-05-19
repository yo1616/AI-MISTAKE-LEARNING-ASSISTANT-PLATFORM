const { openDatabase } = require('../db/connection');

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function examExists(db, examId) {
  const row = db.prepare('SELECT 1 FROM generated_exams WHERE id = ?').get(examId);
  return Boolean(row);
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function getGeneratedExamById(examId) {
  return withDb((db) => {
    const row = db.prepare(`
      SELECT
        ge.id AS examId,
        st.id AS studentId,
        st.name AS studentName,
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
      JOIN students st ON st.id = ge.student_id
      LEFT JOIN subjects subj ON subj.id = ge.subject_id
      LEFT JOIN classes cls ON cls.id = ge.class_id
      LEFT JOIN units u ON u.id = ge.unit_id
      LEFT JOIN sub_units su ON su.id = ge.sub_unit_id
      LEFT JOIN concepts c ON c.id = ge.concept_id
      WHERE ge.id = ?
    `).get(examId);

    return row || null;
  });
}

function getGeneratedExamQuestions(examId) {
  return withDb((db) => {
    if (!examExists(db, examId)) {
      return {
        examExists: false,
        data: null
      };
    }

    const rows = db.prepare(`
      SELECT
        id AS questionId,
        exam_id AS examId,
        ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS questionOrder,
        NULL AS questionStyle,
        NULL AS title,
        NULL AS passage,
        question_text AS questionText,
        options,
        correct_answer AS answer,
        explanation,
        0 AS starred,
        NULL AS starredAt,
        created_at AS createdAt
      FROM generated_exam_questions
      WHERE exam_id = ?
      ORDER BY created_at ASC, id ASC
    `).all(examId);

    return {
      examExists: true,
      data: rows.map((row) => ({
        ...row,
        options: parseJsonArray(row.options),
        starred: Boolean(row.starred)
      }))
    };
  });
}

function getGeneratedExamSourceMistakes(examId) {
  return withDb((db) => {
    if (!examExists(db, examId)) {
      return {
        examExists: false,
        data: null
      };
    }

    const rows = db.prepare(`
      SELECT
        mr.id AS mistakeRecordId,
        mr.question_text AS questionText,
        mr.student_question AS studentQuestion,
        mr.correct_answer AS correctAnswer,
        mr.ai_summary AS aiSummary,
        mr.full_explanation AS fullExplanation,
        subj.name AS subjectName,
        cls.name AS className,
        u.name AS unitName,
        su.name AS subUnitName,
        c.name AS conceptName,
        mr.created_at AS createdAt
      FROM generated_exam_selected_mistakes gesm
      JOIN mistake_records mr ON mr.id = gesm.mistake_record_id
      LEFT JOIN subjects subj ON subj.id = mr.subject_id
      LEFT JOIN classes cls ON cls.id = mr.class_id
      LEFT JOIN units u ON u.id = mr.unit_id
      LEFT JOIN sub_units su ON su.id = mr.sub_unit_id
      LEFT JOIN concepts c ON c.id = mr.concept_id
      WHERE gesm.exam_id = ?
      ORDER BY mr.created_at DESC
    `).all(examId);

    return {
      examExists: true,
      data: rows
    };
  });
}

module.exports = {
  getGeneratedExamById,
  getGeneratedExamQuestions,
  getGeneratedExamSourceMistakes
};
