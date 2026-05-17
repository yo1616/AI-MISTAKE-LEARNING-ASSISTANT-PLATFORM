const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "..", "seeds", "feature-demo-data.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

function findById(items, id) {
  return items.find((item) => item.id === id) || null;
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function formatPath(subjectId, unitId, subUnitId, conceptId) {
  const subject = findById(data.subjects, subjectId);
  const unit = findById(data.units, unitId);
  const subUnit = findById(data.subUnits || [], subUnitId);
  const concept = findById(data.concepts, conceptId);
  return [subject && subject.name, unit && unit.name, subUnit && `${subUnit.code} ${subUnit.name}`, concept && concept.name].filter(Boolean).join(" >> ");
}

function formatClassification(classification) {
  if (!classification) {
    return "無分類資料";
  }
  const mode = classification.isNewConcept ? "AI 新增觀念" : "AI 匹配既有觀念";
  return `${mode} / ${classification.matchedConceptName} / confidence=${classification.confidence}`;
}

printSection("Counts");
console.log(`students: ${data.students.length}`);
console.log(`classes: ${data.classes ? data.classes.length : 0}`);
console.log(`chatSessions: ${data.chatSessions.length}`);
console.log(`chatMessages: ${data.chatMessages.length}`);
console.log(`mistakeRecords: ${data.mistakeRecords.length}`);
console.log(`conceptNotes: ${data.conceptNotes.length}`);
console.log(`generatedPracticeQuestions: ${data.generatedPracticeQuestions.length}`);

printSection("學生與修課");
data.students.forEach((student) => {
  console.log(`- ${student.name} / ${student.gradeYear || "未知年級"}`);
  if (student.email) {
    console.log(`  Email: ${student.email}`);
  }
  if (student.phone) {
    console.log(`  電話: ${student.phone}`);
  }
  (student.subjects || []).forEach((subject) => {
    console.log(`  科目: ${subject.subjectName} / 班級: ${subject.className}`);
  });
});

if (data.classes && data.classes.length > 0) {
  printSection("課程班級");
  data.classes.forEach((courseClass) => {
    console.log(`- ${courseClass.name} (${courseClass.gradeYear || courseClass.gradeLabel || "未知年級"} / ${courseClass.subjectName})`);
  });
}

printSection("分類規則");
if (data.classificationPolicy) {
  console.log(`subjectAndUnitMode: ${data.classificationPolicy.subjectAndUnitMode}`);
  console.log(`conceptMode: ${data.classificationPolicy.conceptMode}`);
  console.log(`preferExistingConcept: ${data.classificationPolicy.preferExistingConcept}`);
  console.log(`createNewConceptOnlyWhenNoGoodMatch: ${data.classificationPolicy.createNewConceptOnlyWhenNoGoodMatch}`);
} else {
  console.log("未提供 classificationPolicy，改以資料內容本身為準。");
}

printSection("歷史對話紀錄");
data.chatSessions.forEach((session) => {
  console.log(`- ${session.title} (${session.startedAt})`);
  console.log(`  分類: ${formatPath(session.subjectId, session.unitId, session.subUnitId, session.conceptClassification.matchedConceptId)}`);
  if (session.className) {
    console.log(`  班級: ${session.className}`);
  }
  console.log(`  規則: ${formatClassification(session.conceptClassification)}`);
  const messages = data.chatMessages
    .filter((message) => message.sessionId === session.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  messages.forEach((message) => {
    console.log(`  [${message.createdAt}] ${message.role}: ${message.content}`);
  });
});

printSection("錯題紀錄分類");
data.mistakeRecords.forEach((record) => {
  console.log(`- ${formatPath(record.subjectId, record.unitId, record.subUnitId, record.conceptId)}`);
  if (record.className) {
    console.log(`  班級: ${record.className}`);
  }
  console.log(`  ${record.questionText}`);
  console.log(`  規則: ${formatClassification(record.conceptClassification)}`);
  console.log(`  AI 摘要: ${record.aiSummary}`);
});

printSection("觀念筆記");
data.conceptNotes.forEach((note) => {
  console.log(`- ${formatPath(note.subjectId, note.unitId, note.subUnitId, note.conceptId)}`);
  if (note.className) {
    console.log(`  班級: ${note.className}`);
  }
  console.log(`  ${note.noteTitle}: ${note.noteContent}`);
});

printSection("生成考題題庫來源");
data.generatedPracticeQuestions.forEach((question) => {
  console.log(`- ${formatPath(question.subjectId, question.unitId, question.subUnitId, question.conceptId)}`);
  if (question.className) {
    console.log(`  班級: ${question.className}`);
  }
  console.log(`  ${question.title}`);
  console.log(`  題型: ${question.questionStyle}`);
  console.log(`  情境: ${question.passage}`);
  console.log(`  Q: ${question.questionText}`);
  console.log(`  A: ${question.answer}`);
});

if (data.studentAnalyticsSummary && data.studentAnalyticsSummary.length > 0) {
  printSection("學生分析摘要");
  data.studentAnalyticsSummary.forEach((summary) => {
    const student = findById(data.students, summary.studentId);
    console.log(`- ${(student && student.name) || summary.studentId} / ${summary.gradeYear || "未知年級"}`);
    if (summary.className) {
      console.log(`  班級: ${summary.className}`);
    }
    console.log(`  錯題數: ${summary.totalMistakes}`);
    console.log(`  星號錯題: ${summary.starredMistakes}`);
    console.log(`  星號筆記: ${summary.starredNotes}`);
    console.log(`  生成考題次數: ${summary.generatedExamCount || 0}`);
    if (summary.generatedExamAccuracy) {
      console.log(
        `  生成考題答對率: ${summary.generatedExamAccuracy.correctCount}/${summary.generatedExamAccuracy.totalAnswered} (${Math.round((summary.generatedExamAccuracy.accuracyRate || 0) * 100)}%)`
      );
    }
    (summary.topWeakConcepts || []).forEach((concept, index) => {
      console.log(`  常錯觀念 ${index + 1}: ${concept.conceptName} (${concept.mistakeCount})`);
    });
  });
}

if (data.teacherDashboardSummary) {
  printSection("老師端班級分析");
  console.log(`班級: ${data.teacherDashboardSummary.className || "未指定班級"}`);
  console.log(`期間: ${data.teacherDashboardSummary.range}`);
  console.log(`學生數: ${data.teacherDashboardSummary.studentCount}`);
  console.log(`錯題總數: ${data.teacherDashboardSummary.weeklyMistakeCount}`);
  if (data.teacherDashboardSummary.generatedExamAccuracy) {
    console.log(
      `生成考題平均答對率: ${data.teacherDashboardSummary.generatedExamAccuracy.correctCount}/${data.teacherDashboardSummary.generatedExamAccuracy.totalAnswered} (${Math.round((data.teacherDashboardSummary.generatedExamAccuracy.accuracyRate || 0) * 100)}%)`
    );
  }
  (data.teacherDashboardSummary.topWeakConcepts || []).forEach((concept, index) => {
    console.log(`常錯觀念 ${index + 1}: ${concept.conceptName} (${concept.mistakeCount})`);
  });
}
