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

function noteExists(db, noteId) {
  const row = db.prepare('SELECT 1 FROM concept_notes WHERE id = ?').get(noteId);
  return Boolean(row);
}

function mapNoteRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    starred: toBoolean(row.starred)
  };
}

function mapMistakeRow(row) {
  return {
    ...row,
    starred: toBoolean(row.starred),
    alertTriggered: toBoolean(row.alertTriggered)
  };
}

function getConceptNoteById(noteId) {
  return withDb((db) => {
    const row = db.prepare(`
      SELECT
        cn.id AS noteId,
        st.id AS studentId,
        st.name AS studentName,
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
        c.name AS conceptName,
        cn.source_session_id AS sourceSessionId,
        cn.question_group_id AS questionGroupId
      FROM concept_notes cn
      JOIN students st ON st.id = cn.student_id
      LEFT JOIN subjects subj ON subj.id = cn.subject_id
      LEFT JOIN classes cls ON cls.id = cn.class_id
      LEFT JOIN units u ON u.id = cn.unit_id
      LEFT JOIN sub_units su ON su.id = cn.sub_unit_id
      LEFT JOIN concepts c ON c.id = cn.concept_id
      WHERE cn.id = ?
    `).get(noteId);

    return mapNoteRow(row);
  });
}

function getRelatedMistakes(noteId) {
  return withDb((db) => {
    if (!noteExists(db, noteId)) {
      return {
        noteExists: false,
        data: null
      };
    }

    const rows = db.prepare(`
      SELECT
        mr.id AS mistakeRecordId,
        st.id AS studentId,
        st.name AS studentName,
        mr.question_text AS questionText,
        mr.student_question AS studentQuestion,
        mr.student_answer AS studentAnswer,
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
        c.name AS conceptName,
        mr.source_session_id AS sourceSessionId,
        mr.question_group_id AS questionGroupId
      FROM concept_note_mistakes cnm
      JOIN mistake_records mr ON mr.id = cnm.mistake_record_id
      JOIN students st ON st.id = mr.student_id
      LEFT JOIN subjects subj ON subj.id = mr.subject_id
      LEFT JOIN classes cls ON cls.id = mr.class_id
      LEFT JOIN units u ON u.id = mr.unit_id
      LEFT JOIN sub_units su ON su.id = mr.sub_unit_id
      LEFT JOIN concepts c ON c.id = mr.concept_id
      WHERE cnm.note_id = ?
      ORDER BY mr.starred DESC, mr.created_at DESC
    `).all(noteId);

    return {
      noteExists: true,
      data: rows.map(mapMistakeRow)
    };
  });
}

function updateConceptNoteStar(noteId, starred) {
  return withDb((db) => {
    if (!noteExists(db, noteId)) {
      return null;
    }

    const starredAt = starred ? new Date().toISOString() : null;
    db.prepare(`
      UPDATE concept_notes
      SET
        starred = ?,
        starred_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(starred ? 1 : 0, starredAt, new Date().toISOString(), noteId);

    const row = db.prepare(`
      SELECT
        cn.id AS noteId,
        st.id AS studentId,
        st.name AS studentName,
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
        c.name AS conceptName,
        cn.source_session_id AS sourceSessionId,
        cn.question_group_id AS questionGroupId
      FROM concept_notes cn
      JOIN students st ON st.id = cn.student_id
      LEFT JOIN subjects subj ON subj.id = cn.subject_id
      LEFT JOIN classes cls ON cls.id = cn.class_id
      LEFT JOIN units u ON u.id = cn.unit_id
      LEFT JOIN sub_units su ON su.id = cn.sub_unit_id
      LEFT JOIN concepts c ON c.id = cn.concept_id
      WHERE cn.id = ?
    `).get(noteId);

    return mapNoteRow(row);
  });
}

module.exports = {
  getConceptNoteById,
  getRelatedMistakes,
  updateConceptNoteStar
};
