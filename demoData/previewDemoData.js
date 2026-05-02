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

function formatPath(subjectId, unitId, conceptId) {
  const subject = findById(data.subjects, subjectId);
  const unit = findById(data.units, unitId);
  const concept = findById(data.concepts, conceptId);
  return [subject && subject.name, unit && unit.name, concept && concept.name].filter(Boolean).join(" >> ");
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
console.log(`chatSessions: ${data.chatSessions.length}`);
console.log(`chatMessages: ${data.chatMessages.length}`);
console.log(`mistakeRecords: ${data.mistakeRecords.length}`);
console.log(`conceptNotes: ${data.conceptNotes.length}`);
console.log(`generatedPracticeQuestions: ${data.generatedPracticeQuestions.length}`);

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
  console.log(`  分類: ${formatPath(session.subjectId, session.unitId, session.conceptClassification.matchedConceptId)}`);
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
  console.log(`- ${formatPath(record.subjectId, record.unitId, record.conceptId)}`);
  console.log(`  ${record.questionText}`);
  console.log(`  規則: ${formatClassification(record.conceptClassification)}`);
  console.log(`  AI 摘要: ${record.aiSummary}`);
});

printSection("觀念筆記");
data.conceptNotes.forEach((note) => {
  console.log(`- ${formatPath(note.subjectId, note.unitId, note.conceptId)}`);
  console.log(`  ${note.noteTitle}: ${note.noteContent}`);
});

printSection("生成相似題");
data.generatedPracticeQuestions.forEach((question) => {
  console.log(`- ${formatPath(question.subjectId, question.unitId, question.conceptId)}`);
  console.log(`  ${question.title}`);
  console.log(`  題型: ${question.questionStyle}`);
  console.log(`  情境: ${question.passage}`);
  console.log(`  Q: ${question.questionText}`);
  console.log(`  A: ${question.answer}`);
});
