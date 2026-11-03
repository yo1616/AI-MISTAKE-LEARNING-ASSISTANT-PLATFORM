const fs = require('fs');
const path = require('path');
const { initDb } = require('./initDb');
const { openDatabase, defaultDbPath } = require('./connection');

const demoDataPath = path.join(__dirname, '..', '..', '..', 'seeds', 'feature-demo-data.json');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;
const fallbackTimestamp = new Date().toISOString();
const TAIPEI_TZ = '+08:00';

function readDemoData() {
  return augmentDemoData(JSON.parse(fs.readFileSync(demoDataPath, 'utf8')));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDateKey(parts) {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`;
}

function nowInTaipeiParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day)
  };
}

function addDaysTaipei(parts, deltaDays) {
  const noonUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 4, 0, 0));
  noonUtc.setUTCDate(noonUtc.getUTCDate() + deltaDays);
  return {
    year: noonUtc.getUTCFullYear(),
    month: noonUtc.getUTCMonth() + 1,
    day: noonUtc.getUTCDate()
  };
}

function buildTaipeiIso(dateKey, time) {
  return `${dateKey}T${time}${TAIPEI_TZ}`;
}

const scenarioTemplates = [
  {
    conceptId: 'concept_bio_001',
    unitId: 'unit_bio_01',
    subUnitId: 'subunit_bio_01_02',
    title: '運動時的血液流向',
    questionText: '跑步後心跳加快時，含氧血主要是透過哪一種循環被送到全身肌肉？',
    wrongAnswer: '肺循環',
    correctAnswer: '體循環',
    aiSummary: '這題在判斷體循環與肺循環的功能差異。',
    fullExplanation: '左心室把含氧血送到全身各部位，這段路徑屬於體循環；肺循環則是把血液送到肺部進行氣體交換。'
  },
  {
    conceptId: 'concept_bio_002',
    unitId: 'unit_bio_02',
    subUnitId: 'subunit_bio_02_01',
    title: '空氣通過的器官',
    questionText: '空氣進入肺部前，會經過下列哪一個屬於呼吸系統的構造？',
    wrongAnswer: '小腸',
    correctAnswer: '支氣管',
    aiSummary: '這題在確認呼吸系統器官名稱與位置。',
    fullExplanation: '支氣管是把空氣送入肺部的重要通道；小腸屬於消化系統，不參與呼吸。'
  },
  {
    conceptId: 'concept_bio_003',
    unitId: 'unit_bio_02',
    subUnitId: 'subunit_bio_02_02',
    title: '氣體交換位置',
    questionText: '氧氣從肺部進入血液、二氧化碳排出血液，主要是在什麼構造完成？',
    wrongAnswer: '氣管',
    correctAnswer: '肺泡',
    aiSummary: '這題在判斷真正進行氣體交換的位置。',
    fullExplanation: '肺泡表面薄且周圍布滿微血管，是氧氣與二氧化碳交換的主要場所；氣管只負責輸送空氣。'
  },
  {
    conceptId: 'concept_bio_004',
    unitId: 'unit_bio_02',
    subUnitId: 'subunit_bio_02_03',
    title: '細胞如何取得能量',
    questionText: '細胞把養分分解並釋放能量供生命活動使用，這個過程稱為什麼？',
    wrongAnswer: '光合作用',
    correctAnswer: '呼吸作用',
    aiSummary: '這題在判斷呼吸作用與光合作用的差別。',
    fullExplanation: '呼吸作用是細胞把養分分解並釋放能量的過程；光合作用則是植物利用光能製造養分。'
  },
  {
    conceptId: 'concept_bio_005',
    unitId: 'unit_bio_03',
    subUnitId: 'subunit_bio_03_01',
    title: '植物如何製造養分',
    questionText: '植物在白天利用光能、二氧化碳與水製造養分，這個作用稱為什麼？',
    wrongAnswer: '呼吸作用',
    correctAnswer: '光合作用',
    aiSummary: '這題在判斷光合作用的定義。',
    fullExplanation: '光合作用會利用光能把二氧化碳和水轉成養分；呼吸作用則是分解養分釋放能量。'
  },
  {
    conceptId: 'concept_bio_006',
    unitId: 'unit_bio_03',
    subUnitId: 'subunit_bio_03_02',
    title: '葉片中的重要構造',
    questionText: '植物細胞中哪個構造含有葉綠素，並且是進行光合作用的重要場所？',
    wrongAnswer: '液泡',
    correctAnswer: '葉綠體',
    aiSummary: '這題在確認葉綠體的功能。',
    fullExplanation: '葉綠體含有葉綠素，能吸收光能並參與光合作用；液泡則主要儲存物質。'
  },
  {
    conceptId: 'concept_bio_007',
    unitId: 'unit_bio_03',
    subUnitId: 'subunit_bio_03_02',
    title: '光能變成化學能',
    questionText: '植物把光能轉成可儲存在葡萄糖中的能量，最符合哪一個核心概念？',
    wrongAnswer: '氣體交換',
    correctAnswer: '能量轉換',
    aiSummary: '這題在理解光能與化學能之間的轉換。',
    fullExplanation: '植物會把光能轉換成化學能並儲存在葡萄糖中，這正是能量轉換的表現。'
  }
];

const scenarioStudents = [
  { studentId: 'student_001', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '王哈哈' },
  { studentId: 'student_002', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '林沃沃' },
  { studentId: 'student_003', classId: 'class_hs3_bio_01', gradeYear: '高三', name: '張開' },
  { studentId: 'student_004', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '陳語晴' },
  { studentId: 'student_005', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '李承翰' },
  { studentId: 'student_006', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '黃思妤' },
  { studentId: 'student_007', classId: 'class_hs2_bio_01', gradeYear: '高二', name: '許庭安' },
  { studentId: 'student_008', classId: 'class_hs3_bio_01', gradeYear: '高三', name: '吳宥廷' },
  { studentId: 'student_009', classId: 'class_hs3_bio_review_01', gradeYear: '高三', name: '蔡沛蓉' },
  { studentId: 'student_010', classId: 'class_hs3_bio_review_01', gradeYear: '高三', name: '簡子恩' }
];

const scenarioClassMeta = {
  class_hs2_bio_01: { className: '高二生物班', subjectId: 'subject_bio', subjectName: '生物' },
  class_hs3_bio_01: { className: '高三生物班', subjectId: 'subject_bio', subjectName: '生物' },
  class_hs3_bio_review_01: { className: '高三生物複習班', subjectId: 'subject_bio', subjectName: '生物' }
};

function buildScenarioClasses(existingClasses = []) {
  const existingIds = new Set(existingClasses.map((courseClass) => courseClass.id));

  return Object.entries(scenarioClassMeta)
    .filter(([classId]) => !existingIds.has(classId))
    .map(([classId, meta]) => ({
      id: classId,
      name: meta.className,
      gradeYear: classId === 'class_hs2_bio_01' ? '高二' : '高三',
      subjectId: meta.subjectId,
      subjectName: meta.subjectName
    }));
}

function buildScenarioStudentRecords(existingStudents = []) {
  const existingIds = new Set(existingStudents.map((student) => student.id));

  return scenarioStudents
    .filter((student) => !existingIds.has(student.studentId))
    .map((student, index) => ({
      id: student.studentId,
      name: student.name,
      gradeYear: student.gradeYear,
      email: `${student.studentId}@example.com`,
      phone: `09${String(11000000 + index * 13791).slice(0, 8)}`,
      subjects: [
        {
          subjectId: scenarioClassMeta[student.classId].subjectId,
          subjectName: scenarioClassMeta[student.classId].subjectName,
          classId: student.classId,
          className: scenarioClassMeta[student.classId].className
        }
      ]
    }));
}

function buildScenarioQuestionTime(studentIndex) {
  const hour = 8 + Math.floor(studentIndex / 2) * 2;
  const minute = studentIndex % 2 === 0 ? 15 : 45;
  return `${pad2(hour)}:${pad2(minute)}:00`;
}

function buildScenarioAnswerTime(studentIndex) {
  const hour = 8 + Math.floor(studentIndex / 2) * 2;
  const minute = studentIndex % 2 === 0 ? 19 : 49;
  return `${pad2(hour)}:${pad2(minute)}:00`;
}

function buildScenarioExamTime(studentIndex) {
  const hour = 18 + Math.floor(studentIndex / 3);
  const minute = (studentIndex % 3) * 15 + 10;
  return `${pad2(hour)}:${pad2(minute)}:00`;
}

function shouldCreateScenarioEntry(student, studentIndex, dayIndex) {
  if (student.classId === 'class_hs3_bio_01') {
    return (dayIndex + studentIndex) % 3 === 0;
  }
  return (dayIndex + studentIndex) % 7 !== 5;
}

function buildScenarioStarred(sequence, studentIndex, dayIndex) {
  return (sequence + studentIndex + dayIndex) % 5 === 0 || (studentIndex % 4 === 0 && dayIndex % 3 === 0);
}

function buildScenarioErrorCount(studentIndex, dayIndex) {
  return 1 + ((studentIndex * 3 + dayIndex * 2) % 5);
}

function buildScenarioQuestionCount(student, studentIndex, dayIndex) {
  const base = student.classId === 'class_hs3_bio_01' ? 4 : 5;
  return Math.max(3, Math.min(7, base + ((studentIndex + dayIndex) % 3) - 1));
}

function buildExamPlan({ student, studentIndex, dayIndex, dateKey, conceptIds }) {
  const questionCount = buildScenarioQuestionCount(student, studentIndex, dayIndex);
  const baseScore = student.classId === 'class_hs3_bio_01' ? 1 + (studentIndex % 2) : 2 + (studentIndex % 3);
  const progression = dayIndex % 3;
  const variability = (studentIndex + dayIndex) % 2;
  const correctCount = Math.max(1, Math.min(questionCount, baseScore + progression + variability));

  return {
    id: `scenario_exam_${student.studentId}_${dayIndex + 1}`,
    studentId: student.studentId,
    classId: student.classId,
    subjectId: 'subject_bio',
    createdAt: buildTaipeiIso(dateKey, buildScenarioExamTime(studentIndex)),
    difficulty: dayIndex % 4 === 0 ? 'hard' : dayIndex % 2 === 0 ? 'medium' : 'easy',
    questionCount,
    correctCount,
    conceptIds
  };
}

function buildBiDailyScenario() {
  const today = nowInTaipeiParts();
  const dateKeys = [];
  for (let offset = 28; offset >= 0; offset -= 2) {
    dateKeys.push(formatDateKey(addDaysTaipei(today, -offset)));
  }

  const data = {
    chatSessions: [],
    chatMessages: [],
    mistakeRecords: [],
    conceptNotes: []
  };
  const examPlans = [];

  let sequence = 1;
  dateKeys.forEach((dateKey, dayIndex) => {
    scenarioStudents.forEach((student, studentIndex) => {
      if (!shouldCreateScenarioEntry(student, studentIndex, dayIndex)) {
        return;
      }

      const template = scenarioTemplates[(dayIndex * scenarioStudents.length + studentIndex) % scenarioTemplates.length];
      const sessionId = `scenario_chat_${String(sequence).padStart(3, '0')}`;
      const questionGroupId = `scenario_qg_${String(sequence).padStart(3, '0')}`;
      const mistakeId = `scenario_mistake_${String(sequence).padStart(3, '0')}`;
      const noteId = `scenario_note_${String(sequence).padStart(3, '0')}`;
      const questionTime = buildScenarioQuestionTime(studentIndex);
      const answerTime = buildScenarioAnswerTime(studentIndex);
      const createdAt = buildTaipeiIso(dateKey, questionTime);
      const answeredAt = buildTaipeiIso(dateKey, answerTime);
      const starred = buildScenarioStarred(sequence, studentIndex, dayIndex);

      data.chatSessions.push({
        id: sessionId,
        studentId: student.studentId,
        subjectId: 'subject_bio',
        classId: student.classId,
        unitId: template.unitId,
        subUnitId: template.subUnitId,
        title: template.title,
        inputType: sequence % 5 === 0 ? 'photo_text' : 'text',
        questionGroupCount: 1,
        startedAt: createdAt,
        updatedAt: answeredAt
      });

      data.chatMessages.push(
        {
          id: `scenario_msg_student_${String(sequence).padStart(3, '0')}`,
          sessionId,
          questionGroupId,
          role: 'student',
          messageType: 'new_question',
          inputType: sequence % 5 === 0 ? 'photo_text' : 'text',
          content: template.questionText,
          questionText: template.questionText,
          createdAt
        },
        {
          id: `scenario_msg_ai_${String(sequence).padStart(3, '0')}`,
          sessionId,
          questionGroupId,
          role: 'assistant',
          messageType: 'answer',
          content: `${template.aiSummary}\n${template.fullExplanation}`,
          createdAt: answeredAt
        }
      );

      data.mistakeRecords.push({
        id: mistakeId,
        studentId: student.studentId,
        sourceSessionId: sessionId,
        questionGroupId,
        subjectId: 'subject_bio',
        classId: student.classId,
        unitId: template.unitId,
        subUnitId: template.subUnitId,
        conceptId: template.conceptId,
        inputType: sequence % 5 === 0 ? 'photo_text' : 'text',
        questionText: template.questionText,
        studentQuestion: template.questionText,
        studentAnswer: template.wrongAnswer,
        correctAnswer: template.correctAnswer,
        aiSummary: template.aiSummary,
        fullExplanation: template.fullExplanation,
        starred,
        starredAt: starred ? answeredAt : null,
        createdAt: answeredAt,
        updatedAt: answeredAt,
        errorCount: buildScenarioErrorCount(studentIndex, dayIndex)
      });

      data.conceptNotes.push({
        id: noteId,
        studentId: student.studentId,
        sourceSessionId: sessionId,
        questionGroupId,
        subjectId: 'subject_bio',
        classId: student.classId,
        unitId: template.unitId,
        subUnitId: template.subUnitId,
        conceptId: template.conceptId,
        noteTitle: `${template.title}觀念整理`,
        noteContent: `${template.aiSummary}\n${template.fullExplanation}`,
        starred,
        starredAt: starred ? answeredAt : null,
        linkedMistakes: [mistakeId],
        createdAt: answeredAt,
        updatedAt: answeredAt
      });

      const conceptIds = Array.from(
        { length: 5 },
        (_, index) => scenarioTemplates[(dayIndex + studentIndex + index) % scenarioTemplates.length].conceptId
      );
      examPlans.push(buildExamPlan({ student, studentIndex, dayIndex, dateKey, conceptIds }));

      sequence += 1;
    });
  });

  return {
    window: {
      from: dateKeys[0],
      to: dateKeys[dateKeys.length - 1]
    },
    data,
    examPlans
  };
}

function augmentDemoData(baseData) {
  const data = deepClone(baseData);
  const scenario = buildBiDailyScenario();
  const generatedClasses = buildScenarioClasses(data.classes || []);
  const generatedStudents = buildScenarioStudentRecords(data.students || []);

  data.classes = [...(data.classes || []), ...generatedClasses];
  data.students = [...(data.students || []), ...generatedStudents];

  data.chatSessions = [...(data.chatSessions || []), ...scenario.data.chatSessions];
  data.chatMessages = [...(data.chatMessages || []), ...scenario.data.chatMessages];
  data.mistakeRecords = [...(data.mistakeRecords || []), ...scenario.data.mistakeRecords];
  data.conceptNotes = [...(data.conceptNotes || []), ...scenario.data.conceptNotes];

  return {
    data,
    scenarioWindow: scenario.window,
    weeklyExamPlans: scenario.examPlans
  };
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

function seedTeachers(db, data) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, account, password_hash, name, email, role, created_at, updated_at, last_login_at)
    VALUES (@id, @account, @password_hash, @name, @email, @role, @created_at, @updated_at, @last_login_at)
  `);
  const insertTeacher = db.prepare(`
    INSERT INTO teachers (id, name, email, phone, created_at, updated_at)
    VALUES (@id, @name, @email, @phone, @created_at, @updated_at)
  `);

  for (const teacher of data.teachers || []) {
    const createdAt = timestamp(teacher.createdAt);
    const updatedAt = timestamp(teacher.updatedAt || teacher.createdAt);

    insertUser.run({
      id: teacher.id,
      account: teacher.email || teacher.id,
      password_hash: null,
      name: teacher.name,
      email: teacher.email || null,
      role: 'teacher',
      created_at: createdAt,
      updated_at: updatedAt,
      last_login_at: null
    });

    insertTeacher.run({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email || null,
      phone: teacher.phone || null,
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

  for (const [index, question] of (data.generatedPracticeQuestions || []).entries()) {
    const examId = `generated_exam_${String(index + 1).padStart(3, '0')}`;
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

function seedExamSubmissionsFromAnalytics(db, data) {
  const insertSubmission = db.prepare(`
    INSERT INTO exam_submissions (id, exam_id, student_id, submitted_at)
    VALUES (@id, @exam_id, @student_id, @submitted_at)
  `);
  const insertAnswer = db.prepare(`
    INSERT INTO exam_answers (
      id, submission_id, exam_question_id, student_answer, is_correct,
      correct_answer, explanation, can_save_to_mistakes, created_at
    )
    VALUES (
      @id, @submission_id, @exam_question_id, @student_answer, @is_correct,
      @correct_answer, @explanation, @can_save_to_mistakes, @created_at
    )
  `);
  const insertQuestion = db.prepare(`
    INSERT INTO generated_exam_questions (
      id, exam_id, concept_id, question_type, question_text, options,
      correct_answer, explanation, created_at
    )
    VALUES (
      @id, @exam_id, @concept_id, @question_type, @question_text, @options,
      @correct_answer, @explanation, @created_at
    )
  `);
  const updateExamQuestionCount = db.prepare(`
    UPDATE generated_exams
    SET question_count = ?, updated_at = ?
    WHERE id = ?
  `);

  const chartsByStudentClass = new Map();
  for (const chart of data.studentAnalyticsCharts || []) {
    chartsByStudentClass.set(`${chart.studentId}:${chart.classId}`, chart);
  }

  for (const summary of data.studentAnalyticsSummary || []) {
    const accuracy = summary.generatedExamAccuracy;
    if (!accuracy || !accuracy.totalAnswered) {
      continue;
    }

    const { studentId, classId } = summary;
    const correctCount = accuracy.correctCount || 0;
    const totalAnswered = accuracy.totalAnswered;

    const exams = db.prepare(`
      SELECT id FROM generated_exams
      WHERE student_id = ? AND class_id = ?
      ORDER BY created_at ASC, id ASC
    `).all(studentId, classId);

    if (exams.length === 0) {
      continue;
    }

    const primaryExamId = exams[0].id;
    const examMeta = db.prepare(`
      SELECT subject_id, unit_id, sub_unit_id, concept_id, created_at
      FROM generated_exams WHERE id = ?
    `).get(primaryExamId);

    const existingQuestions = db.prepare(`
      SELECT id, correct_answer, explanation
      FROM generated_exam_questions
      WHERE exam_id = ?
      ORDER BY created_at ASC, id ASC
    `).all(primaryExamId);

    const template = existingQuestions[0] || db.prepare(`
      SELECT id, correct_answer, explanation
      FROM generated_exam_questions
      WHERE exam_id IN (SELECT id FROM generated_exams WHERE student_id = ?)
      ORDER BY created_at ASC
      LIMIT 1
    `).get(studentId);

    if (!template) {
      continue;
    }

    while (existingQuestions.length < totalAnswered) {
      const index = existingQuestions.length;
      const questionId = `seed_quiz_${studentId}_${index + 1}`;
      const createdAt = timestamp('2026-05-03T18:00:00+08:00');
      insertQuestion.run({
        id: questionId,
        exam_id: primaryExamId,
        concept_id: examMeta.concept_id,
        question_type: 'multiple_choice',
        question_text: `補充練習題 ${index + 1}`,
        options: toJson(['A', 'B', 'C', 'D']),
        correct_answer: template.correct_answer,
        explanation: template.explanation,
        created_at: createdAt
      });
      existingQuestions.push({
        id: questionId,
        correct_answer: template.correct_answer,
        explanation: template.explanation
      });
    }

    updateExamQuestionCount.run(
      totalAnswered,
      timestamp('2026-05-03T18:00:00+08:00'),
      primaryExamId
    );

    const chart = chartsByStudentClass.get(`${studentId}:${classId}`);
    const trendDate = chart?.generatedExamAccuracyTrend?.[0]?.date || '2026-05-03';
    const submittedAt = timestamp(`${trendDate}T18:00:00+08:00`);

    const submissionId = `submission_${studentId}_${classId}`;
    insertSubmission.run({
      id: submissionId,
      exam_id: primaryExamId,
      student_id: studentId,
      submitted_at: submittedAt
    });

    const usedQuestions = existingQuestions.slice(0, totalAnswered);
    usedQuestions.forEach((question, index) => {
      const isCorrect = index < correctCount ? 1 : 0;
      insertAnswer.run({
        id: `answer_${submissionId}_${index + 1}`,
        submission_id: submissionId,
        exam_question_id: question.id,
        student_answer: isCorrect ? question.correct_answer : '錯誤選項',
        is_correct: isCorrect,
        correct_answer: question.correct_answer,
        explanation: question.explanation,
        can_save_to_mistakes: isCorrect ? 0 : 1,
        created_at: submittedAt
      });
    });
  }
}

function seedGeneratedExamSelectedMistakes(db, data) {
  const insert = db.prepare(`
    INSERT INTO generated_exam_selected_mistakes (exam_id, mistake_record_id)
    VALUES (@exam_id, @mistake_record_id)
  `);

  for (const [index, question] of (data.generatedPracticeQuestions || []).entries()) {
    if (!question.sourceMistakeId) {
      continue;
    }

    insert.run({
      exam_id: `generated_exam_${String(index + 1).padStart(3, '0')}`,
      mistake_record_id: question.sourceMistakeId
    });
  }
}

function seedScenarioGeneratedExams(db, examPlans = []) {
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
      id, exam_id, concept_id, question_type, question_text, options,
      correct_answer, explanation, created_at
    )
    VALUES (
      @id, @exam_id, @concept_id, @question_type, @question_text, @options,
      @correct_answer, @explanation, @created_at
    )
  `);
  const insertSubmission = db.prepare(`
    INSERT INTO exam_submissions (id, exam_id, student_id, submitted_at)
    VALUES (@id, @exam_id, @student_id, @submitted_at)
  `);
  const insertAnswer = db.prepare(`
    INSERT INTO exam_answers (
      id, submission_id, exam_question_id, student_answer, is_correct,
      correct_answer, explanation, can_save_to_mistakes, created_at
    )
    VALUES (
      @id, @submission_id, @exam_question_id, @student_answer, @is_correct,
      @correct_answer, @explanation, @can_save_to_mistakes, @created_at
    )
  `);

  examPlans.forEach((plan, planIndex) => {
    insertExam.run({
      id: plan.id,
      student_id: plan.studentId,
      subject_id: plan.subjectId,
      unit_id: null,
      sub_unit_id: null,
      concept_id: plan.conceptIds[0] || null,
      class_id: plan.classId,
      question_count: plan.questionCount,
      difficulty: plan.difficulty,
      question_type: 'multiple_choice',
      created_at: plan.createdAt,
      updated_at: plan.createdAt
    });

    const submissionId = `scenario_submission_${planIndex + 1}`;
    insertSubmission.run({
      id: submissionId,
      exam_id: plan.id,
      student_id: plan.studentId,
      submitted_at: plan.createdAt
    });

    plan.conceptIds.forEach((conceptId, questionIndex) => {
      const template = scenarioTemplates.find((item) => item.conceptId === conceptId) || scenarioTemplates[0];
      const questionId = `${plan.id}_q${questionIndex + 1}`;
      insertQuestion.run({
        id: questionId,
        exam_id: plan.id,
        concept_id: conceptId,
        question_type: 'multiple_choice',
        question_text: `${template.questionText}（測驗題 ${questionIndex + 1}）`,
        options: toJson([
          template.correctAnswer,
          template.wrongAnswer,
          '以上皆非',
          '資料不足'
        ]),
        correct_answer: template.correctAnswer,
        explanation: template.fullExplanation,
        created_at: plan.createdAt
      });

      const isCorrect = questionIndex < plan.correctCount;
      insertAnswer.run({
        id: `${submissionId}_a${questionIndex + 1}`,
        submission_id: submissionId,
        exam_question_id: questionId,
        student_answer: isCorrect ? template.correctAnswer : template.wrongAnswer,
        is_correct: isCorrect ? 1 : 0,
        correct_answer: template.correctAnswer,
        explanation: template.fullExplanation,
        can_save_to_mistakes: isCorrect ? 0 : 1,
        created_at: plan.createdAt
      });
    });
  });
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

  const { data, scenarioWindow, weeklyExamPlans } = readDemoData();
  const db = openDatabase(dbPath);

  try {
    const runSeed = db.transaction(() => {
      clearTables(db);
      seedUsersAndStudents(db, data);
      seedTeachers(db, data);
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
      seedExamSubmissionsFromAnalytics(db, data);
      seedScenarioGeneratedExams(db, weeklyExamPlans);
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
      'generated_exam_selected_mistakes',
      'exam_submissions',
      'exam_answers'
    ];

    console.log(`Seeded database at ${dbPath}`);
    for (const table of seededTables) {
      console.log(`${table}: ${tableCount(db, table)}`);
    }
    console.log('Quiz submissions seeded from feature-demo-data studentAnalyticsSummary (generatedExamAccuracy).');
    console.log(`Bi-daily multi-student scenario window: ${scenarioWindow.from} to ${scenarioWindow.to} (Asia/Taipei).`);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  seedDb();
}

module.exports = { seedDb };
