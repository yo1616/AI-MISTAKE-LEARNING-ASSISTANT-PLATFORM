const { randomUUID } = require('crypto');
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

function rowExists(db, tableName, id) {
  const row = db.prepare(`SELECT 1 FROM ${tableName} WHERE id = ?`).get(id);
  return Boolean(row);
}

function questionGroupBelongsToSession(db, questionGroupId, sessionId) {
  const row = db.prepare('SELECT 1 FROM question_groups WHERE id = ? AND session_id = ?').get(questionGroupId, sessionId);
  return Boolean(row);
}

function validationError(code, message) {
  return {
    ok: false,
    error: {
      code,
      message,
      statusCode: 400
    }
  };
}

function successResult(data) {
  return {
    ok: true,
    data
  };
}

function mapNoteRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.noteId,
    ...row,
    starred: toBoolean(row.starred)
  };
}

function mapMistakeRow(row) {
  return {
    id: row.mistakeRecordId,
    ...row,
    starred: toBoolean(row.starred),
    alertTriggered: toBoolean(row.alertTriggered)
  };
}

function getConceptNoteByIdFromDb(db, noteId) {
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
}

function validateCreatePayload(db, payload) {
  if (!rowExists(db, 'students', payload.studentId)) {
    return validationError('STUDENT_NOT_FOUND', `studentId ${payload.studentId} does not exist`);
  }

  if (!rowExists(db, 'subjects', payload.subjectId)) {
    return validationError('SUBJECT_NOT_FOUND', `subjectId ${payload.subjectId} does not exist`);
  }

  if (!rowExists(db, 'classes', payload.classId)) {
    return validationError('CLASS_NOT_FOUND', `classId ${payload.classId} does not exist`);
  }

  if (!rowExists(db, 'units', payload.unitId)) {
    return validationError('UNIT_NOT_FOUND', `unitId ${payload.unitId} does not exist`);
  }

  if (!rowExists(db, 'sub_units', payload.subUnitId)) {
    return validationError('SUB_UNIT_NOT_FOUND', `subUnitId ${payload.subUnitId} does not exist`);
  }

  if (!rowExists(db, 'concepts', payload.conceptId)) {
    return validationError('CONCEPT_NOT_FOUND', `conceptId ${payload.conceptId} does not exist`);
  }

  if (payload.sourceSessionId && !rowExists(db, 'chat_sessions', payload.sourceSessionId)) {
    return validationError('CHAT_SESSION_NOT_FOUND', `sourceSessionId ${payload.sourceSessionId} does not exist`);
  }

  if (payload.questionGroupId && !rowExists(db, 'question_groups', payload.questionGroupId)) {
    return validationError('QUESTION_GROUP_NOT_FOUND', `questionGroupId ${payload.questionGroupId} does not exist`);
  }

  if (payload.questionGroupId && !payload.sourceSessionId) {
    return validationError('QUESTION_GROUP_SESSION_MISMATCH', 'questionGroupId requires sourceSessionId');
  }

  if (
    payload.questionGroupId &&
    payload.sourceSessionId &&
    !questionGroupBelongsToSession(db, payload.questionGroupId, payload.sourceSessionId)
  ) {
    return validationError('QUESTION_GROUP_SESSION_MISMATCH', 'questionGroupId does not belong to sourceSessionId');
  }

  return null;
}

function createConceptNote(payload) {
  return withDb((db) => {
    const error = validateCreatePayload(db, payload);
    if (error) {
      return error;
    }

    const now = new Date().toISOString();
    const noteId = `note_${randomUUID()}`;

    db.prepare(`
      INSERT INTO concept_notes (
        id, student_id, source_session_id, question_group_id, subject_id, class_id, unit_id, sub_unit_id,
        concept_id, note_title, note_content, created_at, updated_at
      )
      VALUES (
        @id, @student_id, @source_session_id, @question_group_id, @subject_id, @class_id, @unit_id, @sub_unit_id,
        @concept_id, @note_title, @note_content, @created_at, @updated_at
      )
    `).run({
      id: noteId,
      student_id: payload.studentId,
      source_session_id: payload.sourceSessionId || null,
      question_group_id: payload.questionGroupId || null,
      subject_id: payload.subjectId,
      class_id: payload.classId,
      unit_id: payload.unitId,
      sub_unit_id: payload.subUnitId,
      concept_id: payload.conceptId,
      note_title: payload.noteTitle,
      note_content: payload.noteContent,
      created_at: now,
      updated_at: now
    });

    return successResult(getConceptNoteByIdFromDb(db, noteId));
  });
}

function getConceptNoteById(noteId) {
  return withDb((db) => getConceptNoteByIdFromDb(db, noteId));
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

    return getConceptNoteByIdFromDb(db, noteId);
  });
}

module.exports = {
  createConceptNote,
  getConceptNoteById,
  getRelatedMistakes,
  updateConceptNoteStar
};
