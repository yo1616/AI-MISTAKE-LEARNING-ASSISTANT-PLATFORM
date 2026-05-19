const { openDatabase } = require('../db/connection');

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function chatSessionExists(db, sessionId) {
  const row = db.prepare('SELECT 1 FROM chat_sessions WHERE id = ?').get(sessionId);
  return Boolean(row);
}

function getChatSessionById(sessionId) {
  return withDb((db) => {
    const row = db.prepare(`
      SELECT
        cs.id AS sessionId,
        cs.student_id AS studentId,
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
      WHERE cs.id = ?
    `).get(sessionId);

    return row || null;
  });
}

function getChatSessionMessages(sessionId) {
  return withDb((db) => {
    if (!chatSessionExists(db, sessionId)) {
      return {
        sessionExists: false,
        data: null
      };
    }

    const rows = db.prepare(`
      SELECT
        id AS messageId,
        session_id AS sessionId,
        role,
        message_type AS messageType,
        question_group_id AS questionGroupId,
        input_type AS inputType,
        content,
        question_text AS questionText,
        question_image_url AS questionImageUrl,
        created_at AS createdAt
      FROM chat_messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId);

    return {
      sessionExists: true,
      data: rows
    };
  });
}

module.exports = {
  getChatSessionById,
  getChatSessionMessages
};
