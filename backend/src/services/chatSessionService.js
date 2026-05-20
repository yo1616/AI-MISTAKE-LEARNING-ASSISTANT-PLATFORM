const { randomUUID } = require('crypto');
const { openDatabase } = require('../db/connection');

const INPUT_TYPES = new Set(['text', 'photo', 'photo_text']);
const MESSAGE_ROLES = new Set(['student', 'assistant']);
const MESSAGE_TYPES = new Set([
  'new_question',
  'follow_up',
  'request_practice',
  'answer',
  'classification_explanation'
]);

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

function rowExists(db, tableName, id) {
  if (!id) {
    return true;
  }

  const row = db.prepare(`SELECT 1 FROM ${tableName} WHERE id = ?`).get(id);
  return Boolean(row);
}

function questionGroupBelongsToSession(db, questionGroupId, sessionId) {
  if (!questionGroupId) {
    return true;
  }

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

function notFoundError(code, message) {
  return {
    ok: false,
    error: {
      code,
      message,
      statusCode: 404
    }
  };
}

function successResult(data) {
  return {
    ok: true,
    data
  };
}

function mapSessionRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.sessionId,
    ...row
  };
}

function mapMessageRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.messageId,
    ...row
  };
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

    return mapSessionRow(row);
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
      data: rows.map(mapMessageRow)
    };
  });
}

function createChatSession(payload) {
  return withDb((db) => {
    if (!INPUT_TYPES.has(payload.inputType)) {
      return validationError('INVALID_INPUT_TYPE', 'inputType must be one of: text, photo, photo_text');
    }

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

    const now = new Date().toISOString();
    const sessionId = `chat_${randomUUID()}`;

    db.prepare(`
      INSERT INTO chat_sessions (
        id, student_id, subject_id, class_id, unit_id, sub_unit_id, title, input_type,
        question_group_count, started_at, updated_at
      )
      VALUES (
        @id, @student_id, @subject_id, @class_id, @unit_id, @sub_unit_id, @title, @input_type,
        0, @started_at, @updated_at
      )
    `).run({
      id: sessionId,
      student_id: payload.studentId,
      subject_id: payload.subjectId,
      class_id: payload.classId || null,
      unit_id: payload.unitId || null,
      sub_unit_id: payload.subUnitId || null,
      title: payload.title || null,
      input_type: payload.inputType,
      started_at: now,
      updated_at: now
    });

    return successResult(getChatSessionById(sessionId));
  });
}

function createChatMessage(sessionId, payload) {
  return withDb((db) => {
    if (!chatSessionExists(db, sessionId)) {
      return notFoundError('CHAT_SESSION_NOT_FOUND', 'Chat session not found');
    }

    if (!MESSAGE_ROLES.has(payload.role)) {
      return validationError('INVALID_MESSAGE_ROLE', 'role must be one of: student, assistant');
    }

    if (!MESSAGE_TYPES.has(payload.messageType)) {
      return validationError(
        'INVALID_MESSAGE_TYPE',
        'messageType must be one of: new_question, follow_up, request_practice, answer, classification_explanation'
      );
    }

    if (payload.inputType && !INPUT_TYPES.has(payload.inputType)) {
      return validationError('INVALID_INPUT_TYPE', 'inputType must be one of: text, photo, photo_text');
    }

    if (!rowExists(db, 'question_groups', payload.questionGroupId)) {
      return validationError('QUESTION_GROUP_NOT_FOUND', `questionGroupId ${payload.questionGroupId} does not exist`);
    }

    if (!questionGroupBelongsToSession(db, payload.questionGroupId, sessionId)) {
      return validationError('QUESTION_GROUP_SESSION_MISMATCH', 'questionGroupId does not belong to this chat session');
    }

    const now = new Date().toISOString();
    const messageId = `msg_${randomUUID()}`;

    const transaction = db.transaction(() => {
      db.prepare(`
        INSERT INTO chat_messages (
          id, session_id, question_group_id, role, message_type, input_type, content,
          question_text, question_image_url, created_at
        )
        VALUES (
          @id, @session_id, @question_group_id, @role, @message_type, @input_type, @content,
          @question_text, @question_image_url, @created_at
        )
      `).run({
        id: messageId,
        session_id: sessionId,
        question_group_id: payload.questionGroupId || null,
        role: payload.role,
        message_type: payload.messageType,
        input_type: payload.inputType || null,
        content: payload.content,
        question_text: payload.questionText || null,
        question_image_url: payload.questionImageUrl || null,
        created_at: now
      });

      db.prepare('UPDATE chat_sessions SET updated_at = ? WHERE id = ?').run(now, sessionId);
    });

    transaction();

    const row = db.prepare(`
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
      WHERE id = ?
    `).get(messageId);

    return successResult(mapMessageRow(row));
  });
}

function deleteChatSession(sessionId) {
  return withDb((db) => {
    if (!chatSessionExists(db, sessionId)) {
      return notFoundError('CHAT_SESSION_NOT_FOUND', 'Chat session not found');
    }

    db.prepare('DELETE FROM chat_sessions WHERE id = ?').run(sessionId);

    return successResult({
      success: true,
      deletedId: sessionId
    });
  });
}

module.exports = {
  createChatSession,
  createChatMessage,
  deleteChatSession,
  getChatSessionById,
  getChatSessionMessages
};
