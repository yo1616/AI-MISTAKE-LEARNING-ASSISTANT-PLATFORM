const fs = require('fs');
const path = require('path');
const { initDb } = require('./initDb');
const { openDatabase, defaultDbPath } = require('./connection');

const demoDataPath = path.join(__dirname, '..', '..', '..', 'demoData', 'demoData1');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;
const fallbackTimestamp = new Date().toISOString();

function readDemoData() {
  return JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
}

function toBool(value, defaultValue = false) {
  if (value === undefined || value === null) {
    return defaultValue ? 1 : 0;
  }
  return value ? 1 : 0;
}

function toJson(value) {
  if (value === undefined || value === null) {
    return null;
  }
  return JSON.stringify(value);
}

function timestamp(value) {
  return value || fallbackTimestamp;
}

function cleanTable(db, tableName) {
  db.prepare(`DELETE FROM ${tableName}`).run();
}

function seedUsersAndStudents(db, data) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, account, password_hash, name, email, role, created_at, updated_at, last_login_at)
    VALUES (@id, @account, @password_hash, @name, @email, @role, @created_at, @updated_at, @last_login_at)
  `);
  const insertStudent = db.prepare(`
    INSERT INTO students (id, name, grade_year, email, phone, created_at, updated_at)
    VALUES (@id, @name, @grade_year, @email, @phone, @created_at, @updated_at)
  `);

  for (const student of data.students || []) {
    const createdAt = timestamp(student.createdAt);
    const updatedAt = timestamp(student.updatedAt || student.createdAt);

    insertUser.run({
      id: student.id,
      account: student.email || student.id,
      password_hash: null,
      name: student.name,
      email: student.email || null,
      role: 'student',
      created_at: createdAt,
      updated_at: updatedAt,
      last_login_at: null
    });

    insertStudent.run({
      id: student.id,
      name: student.name,
      grade_year: student.gradeYear || null,
      email: student.email || null,
      phone: student.phone || null,
      created_at: createdAt,
      updated_at: updatedAt
    });
  }
}

function seedSubjects(db, data) {
  const insert = db.prepare(`
    INSERT INTO subjects (id, name, created_at, updated_at)
    VALUES (@id, @name, @created_at, @updated_at)
  `);

  for (const subject of data.subjects || []) {
    const createdAt = timestamp(subject.createdAt);
    insert.run({
      id: subject.id,
      name: subject.name,
      created_at: createdAt,
      updated_at: timestamp(subject.updatedAt || subject.createdAt)
    });
  }
}

function seedClasses(db, data) {
  const insertClass = db.prepare(`
    INSERT INTO classes (id, name, grade_year, subject_id, teacher_id, created_at, updated_at)
    VALUES (@id, @name, @grade_year, @subject_id, @teacher_id, @created_at, @updated_at)
  `);
  const insertStudentClass = db.prepare(`
    INSERT INTO student_classes (student_id, class_id, subject_id, joined_at, status)
    VALUES (@student_id, @class_id, @subject_id, @joined_at, @status)
  `);

  for (const courseClass of data.classes || []) {
    const createdAt = timestamp(courseClass.createdAt);
    insertClass.run({
      id: courseClass.id,
      name: courseClass.name,
      grade_year: courseClass.gradeYear || null,
      subject_id: courseClass.subjectId,
      teacher_id: courseClass.teacherId || null,
      created_at: createdAt,
      updated_at: timestamp(courseClass.updatedAt || courseClass.createdAt)
    });
  }

  for (const student of data.students || []) {
    for (const subject of student.subjects || []) {
      insertStudentClass.run({
        student_id: student.id,
        class_id: subject.classId,
        subject_id: subject.subjectId,
        joined_at: timestamp(subject.joinedAt || student.createdAt),
        status: 'active'
      });
    }
  }
}

function seedUnitsAndSubUnits(db, data) {
  const insertUnit = db.prepare(`
    INSERT INTO units (id, subject_id, name, unit_order, is_fixed, created_at, updated_at)
    VALUES (@id, @subject_id, @name, @unit_order, @is_fixed, @created_at, @updated_at)
  `);
  const insertSubUnit = db.prepare(`
    INSERT INTO sub_units (id, unit_id, code, name, sub_unit_order, is_fixed, created_at, updated_at)
    VALUES (@id, @unit_id, @code, @name, @sub_unit_order, @is_fixed, @created_at, @updated_at)
  `);

  for (const unit of data.units || []) {
    const createdAt = timestamp(unit.createdAt);
    insertUnit.run({
      id: unit.id,
      subject_id: unit.subjectId,
      name: unit.name,
      unit_order: unit.order || null,
      is_fixed: toBool(unit.isFixed, true),
      created_at: createdAt,
      updated_at: timestamp(unit.updatedAt || unit.createdAt)
    });
  }

  for (const subUnit of data.subUnits || []) {
    const createdAt = timestamp(subUnit.createdAt);
    insertSubUnit.run({
      id: subUnit.id,
      unit_id: subUnit.unitId,
      code: subUnit.code || null,
      name: subUnit.name,
      sub_unit_order: subUnit.order || null,
      is_fixed: toBool(subUnit.isFixed, true),
      created_at: createdAt,
      updated_at: timestamp(subUnit.updatedAt || subUnit.createdAt)
    });
  }
}

function seedConcepts(db, data) {
  const insert = db.prepare(`
    INSERT INTO concepts (
      id, subject_id, unit_id, sub_unit_id, name, keywords, status, created_by,
      source_session_id, creation_reason, created_at, updated_at
    )
    VALUES (
      @id, @subject_id, @unit_id, @sub_unit_id, @name, @keywords, @status, @created_by,
      @source_session_id, @creation_reason, @created_at, @updated_at
    )
  `);

  for (const concept of data.concepts || []) {
    const createdAt = timestamp(concept.createdAt);
    insert.run({
      id: concept.id,
      subject_id: concept.subjectId,
      unit_id: concept.unitId,
      sub_unit_id: concept.subUnitId || null,
      name: concept.name,
      keywords: toJson(concept.keywords || []),
      status: concept.status || 'active',
      created_by: concept.createdBy || 'seed',
      source_session_id: concept.sourceSessionId || null,
      creation_reason: concept.creationReason || null,
      created_at: createdAt,
      updated_at: timestamp(concept.updatedAt || concept.createdAt)
    });
  }
}

function seedChatSessions(db, data) {
  const insert = db.prepare(`
    INSERT INTO chat_sessions (
      id, student_id, subject_id, class_id, unit_id, sub_unit_id, title, input_type,
      question_group_count, started_at, updated_at
    )
    VALUES (
      @id, @student_id, @subject_id, @class_id, @unit_id, @sub_unit_id, @title, @input_type,
      @question_group_count, @started_at, @updated_at
    )
  `);

  for (const session of data.chatSessions || []) {
    insert.run({
      id: session.id,
      student_id: session.studentId,
      subject_id: session.subjectId,
      class_id: session.classId || null,
      unit_id: session.unitId || null,
      sub_unit_id: session.subUnitId || null,
      title: session.title || null,
      input_type: session.inputType || 'text',
      question_group_count: session.questionGroupCount || 0,
      started_at: timestamp(session.startedAt),
      updated_at: timestamp(session.updatedAt || session.startedAt)
    });
  }
}

function deriveQuestionGroups(data) {
  const sessionsById = new Map((data.chatSessions || []).map((session) => [session.id, session]));
  const groups = new Map();

  for (const message of data.chatMessages || []) {
    if (!message.questionGroupId || groups.has(message.questionGroupId)) {
      continue;
    }

    const session = sessionsById.get(message.sessionId);
    if (!session) {
      continue;
    }

    const classification = session.conceptClassification || {};
    groups.set(message.questionGroupId, {
      id: message.questionGroupId,
      sessionId: message.sessionId,
      subjectId: session.subjectId,
      unitId: message.unitId || session.unitId || null,
      subUnitId: message.subUnitId || session.subUnitId || null,
      conceptId: message.conceptId || classification.matchedConceptId || null,
      inputType: message.inputType || session.inputType || 'text',
      questionText: message.questionText || session.questionText || (message.messageType === 'new_question' ? message.content : null),
      questionImageUrl: message.questionImageUrl || session.questionImageUrl || null,
      classificationConfidence: classification.confidence ?? null,
      isNewConcept: classification.isNewConcept || false,
      createdAt: message.createdAt,
      updatedAt: message.createdAt
    });
  }

  return [...groups.values()];
}

function seedQuestionGroups(db, data) {
  const insert = db.prepare(`
    INSERT INTO question_groups (
      id, session_id, subject_id, unit_id, sub_unit_id, concept_id, input_type,
      question_text, question_image_url, classification_confidence, is_new_concept,
      created_at, updated_at
    )
    VALUES (
      @id, @session_id, @subject_id, @unit_id, @sub_unit_id, @concept_id, @input_type,
      @question_text, @question_image_url, @classification_confidence, @is_new_concept,
      @created_at, @updated_at
    )
  `);

  for (const group of deriveQuestionGroups(data)) {
    insert.run({
      id: group.id,
      session_id: group.sessionId,
      subject_id: group.subjectId,
      unit_id: group.unitId,
      sub_unit_id: group.subUnitId,
      concept_id: group.conceptId,
      input_type: group.inputType,
      question_text: group.questionText,
      question_image_url: group.questionImageUrl,
      classification_confidence: group.classificationConfidence,
      is_new_concept: toBool(group.isNewConcept),
      created_at: timestamp(group.createdAt),
      updated_at: timestamp(group.updatedAt || group.createdAt)
    });
  }
}

function seedChatMessages(db, data) {
  const insert = db.prepare(`
    INSERT INTO chat_messages (
      id, session_id, question_group_id, role, message_type, input_type, content,
      question_text, question_image_url, created_at
    )
    VALUES (
      @id, @session_id, @question_group_id, @role, @message_type, @input_type, @content,
      @question_text, @question_image_url, @created_at
    )
  `);

  for (const message of data.chatMessages || []) {
    insert.run({
      id: message.id,
      session_id: message.sessionId,
      question_group_id: message.questionGroupId || null,
      role: message.role,
      message_type: message.messageType,
      input_type: message.inputType || null,
      content: message.content || message.questionText || '',
      question_text: message.questionText || null,
      question_image_url: message.questionImageUrl || null,
      created_at: timestamp(message.createdAt)
    });
  }
}

function seedGeneratedPracticeQuestions(db, data) {
  const insertExam = db.prepare(`
    INSERT INTO generated_exams (
      id, student_id, subject_id, unit_id, sub_unit_id, concept_id, class_id,
      question_count, difficulty, question_type, created_at, updated_at
    )
    VALUES (
      @id, @student_id, @subject_id, @unit_id, @sub_unit_id, @concept_id, @class_id,
      @question_count, @difficulty, @question_type, @created_at, @updated_at
    )
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO generated_exam_questions (
      id, exam_id, concept_id, question_type, question_text, options, correct_answer, explanation, created_at
    )
    VALUES (
      @id, @exam_id, @concept_id, @question_type, @question_text, @options, @correct_answer, @explanation, @created_at
    )
  `);

  for (const question of data.generatedPracticeQuestions || []) {
    const examId = `exam_for_${question.id}`;
    const createdAt = timestamp(question.createdAt);

    insertExam.run({
      id: examId,
      student_id: question.studentId,
      subject_id: question.subjectId,
      unit_id: question.unitId || null,
      sub_unit_id: question.subUnitId || null,
      concept_id: question.conceptId || null,
      class_id: question.classId || null,
      question_count: 1,
      difficulty: 'medium',
      question_type: 'multiple_choice',
      created_at: createdAt,
      updated_at: createdAt
    });

    insertQuestion.run({
      id: question.id,
      exam_id: examId,
      concept_id: question.conceptId || null,
      question_type: 'multiple_choice',
      question_text: question.questionText,
      options: toJson(question.options || []),
      correct_answer: question.answer,
      explanation: question.explanation || null,
      created_at: createdAt
    });
  }
}

function seedMistakeRecords(db, data) {
  const insert = db.prepare(`
    INSERT INTO mistake_records (
      id, student_id, source_session_id, source_exam_id, source_question_id, question_group_id,
      subject_id, class_id, unit_id, sub_unit_id, concept_id, input_type, question_image_url,
      question_text, student_question, student_answer, correct_answer, ai_summary, full_explanation,
      classification_confidence, is_new_concept, starred, starred_at, alert_triggered,
      error_count, review_status, created_at, updated_at
    )
    VALUES (
      @id, @student_id, @source_session_id, @source_exam_id, @source_question_id, @question_group_id,
      @subject_id, @class_id, @unit_id, @sub_unit_id, @concept_id, @input_type, @question_image_url,
      @question_text, @student_question, @student_answer, @correct_answer, @ai_summary, @full_explanation,
      @classification_confidence, @is_new_concept, @starred, @starred_at, @alert_triggered,
      @error_count, @review_status, @created_at, @updated_at
    )
  `);

  for (const record of data.mistakeRecords || []) {
    const classification = record.conceptClassification || {};
    const createdAt = timestamp(record.createdAt);
    insert.run({
      id: record.id,
      student_id: record.studentId,
      source_session_id: record.sourceSessionId || null,
      source_exam_id: record.sourceExamId || null,
      source_question_id: record.sourceQuestionId || null,
      question_group_id: record.questionGroupId || null,
      subject_id: record.subjectId,
      class_id: record.classId || null,
      unit_id: record.unitId || null,
      sub_unit_id: record.subUnitId || null,
      concept_id: record.conceptId || null,
      input_type: record.inputType || null,
      question_image_url: record.questionImageUrl || null,
      question_text: record.questionText || null,
      student_question: record.studentQuestion || null,
      student_answer: record.studentAnswer || null,
      correct_answer: record.correctAnswer || null,
      ai_summary: record.aiSummary || null,
      full_explanation: record.fullExplanation || null,
      classification_confidence: classification.confidence ?? null,
      is_new_concept: toBool(classification.isNewConcept),
      starred: toBool(record.starred),
      starred_at: record.starredAt || null,
      alert_triggered: toBool(record.alertTriggered),
      error_count: record.errorCount || 1,
      review_status: record.reviewStatus || 'not_reviewed',
      created_at: createdAt,
      updated_at: timestamp(record.updatedAt || record.createdAt)
    });
  }
}

function seedConceptNotes(db, data) {
  const insertNote = db.prepare(`
    INSERT INTO concept_notes (
      id, student_id, source_session_id, question_group_id, subject_id, class_id, unit_id, sub_unit_id,
      concept_id, note_title, note_content, starred, starred_at, created_at, updated_at
    )
    VALUES (
      @id, @student_id, @source_session_id, @question_group_id, @subject_id, @class_id, @unit_id, @sub_unit_id,
      @concept_id, @note_title, @note_content, @starred, @starred_at, @created_at, @updated_at
    )
  `);
  const insertLinkedMistake = db.prepare(`
    INSERT INTO concept_note_mistakes (note_id, mistake_record_id)
    VALUES (@note_id, @mistake_record_id)
  `);

  for (const note of data.conceptNotes || []) {
    const createdAt = timestamp(note.createdAt);
    insertNote.run({
      id: note.id,
      student_id: note.studentId,
      source_session_id: note.sourceSessionId || null,
      question_group_id: note.questionGroupId || null,
      subject_id: note.subjectId,
      class_id: note.classId || null,
      unit_id: note.unitId || null,
      sub_unit_id: note.subUnitId || null,
      concept_id: note.conceptId || null,
      note_title: note.noteTitle,
      note_content: note.noteContent,
      starred: toBool(note.starred),
      starred_at: note.starredAt || null,
      created_at: createdAt,
      updated_at: timestamp(note.updatedAt || note.createdAt)
    });

    for (const mistakeRecordId of note.linkedMistakes || []) {
      insertLinkedMistake.run({
        note_id: note.id,
        mistake_record_id: mistakeRecordId
      });
    }
  }
}

function seedGeneratedExamSelectedMistakes(db, data) {
  const insert = db.prepare(`
    INSERT INTO generated_exam_selected_mistakes (exam_id, mistake_record_id)
    VALUES (@exam_id, @mistake_record_id)
  `);

  for (const question of data.generatedPracticeQuestions || []) {
    if (!question.sourceMistakeId) {
      continue;
    }

    insert.run({
      exam_id: `exam_for_${question.id}`,
      mistake_record_id: question.sourceMistakeId
    });
  }
}

function clearTables(db) {
  const tables = [
    'exam_answers',
    'exam_submissions',
    'generated_exam_selected_mistakes',
    'concept_note_mistakes',
    'concept_notes',
    'mistake_records',
    'generated_exam_questions',
    'generated_exams',
    'message_images',
    'chat_messages',
    'question_groups',
    'chat_sessions',
    'concepts',
    'sub_units',
    'units',
    'student_classes',
    'classes',
    'teachers',
    'students',
    'subjects',
    'users'
  ];

  for (const table of tables) {
    cleanTable(db, table);
  }
}

function tableCount(db, tableName) {
  return db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;
}

function seedDb() {
  initDb();

  const data = readDemoData();
  const db = openDatabase(dbPath);

  try {
    const runSeed = db.transaction(() => {
      clearTables(db);
      seedUsersAndStudents(db, data);
      seedSubjects(db, data);
      seedClasses(db, data);
      seedUnitsAndSubUnits(db, data);
      seedConcepts(db, data);
      seedChatSessions(db, data);
      seedQuestionGroups(db, data);
      seedChatMessages(db, data);
      seedGeneratedPracticeQuestions(db, data);
      seedMistakeRecords(db, data);
      seedConceptNotes(db, data);
      seedGeneratedExamSelectedMistakes(db, data);
    });

    runSeed();

    const seededTables = [
      'users',
      'students',
      'teachers',
      'subjects',
      'classes',
      'student_classes',
      'units',
      'sub_units',
      'concepts',
      'chat_sessions',
      'question_groups',
      'chat_messages',
      'generated_exams',
      'generated_exam_questions',
      'mistake_records',
      'concept_notes',
      'concept_note_mistakes',
      'generated_exam_selected_mistakes'
    ];

    console.log(`Seeded database at ${dbPath}`);
    for (const table of seededTables) {
      console.log(`${table}: ${tableCount(db, table)}`);
    }
    console.log('Skipped analytics seed tables; analytics will be calculated by future API code.');
    console.log('No teacher records were inserted because demoData/demoData1 does not include teachers.');
  } finally {
    db.close();
  }
}

if (require.main === module) {
  seedDb();
}

module.exports = { seedDb };
