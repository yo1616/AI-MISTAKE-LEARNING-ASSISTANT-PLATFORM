const { getAiMode, getAiService } = require("../../ai");
const {
  buildTagRecommendationPrompt,
  buildSolvePrompt,
  buildPracticeQuestionPrompt
} = require("../../ai/promptTemplates");
const { schemas } = require("../../ai/realAiService");

const aiMode = getAiMode();
const aiService = getAiService();

const tagRequest = {
  questionText: "肺泡與微血管之間進行何種作用？",
  subjectId: "subject_bio",
  unitId: "unit_bio_02"
};

const solveRequest = {
  questionText: "血液從心臟送往全身屬於哪一循環？",
  studentAnswer: "肺循環"
};

const practiceRequest = {
  tagId: "tag_bio_003",
  studentGrade: "8"
};

function printBlock(title, payload) {
  console.log(`\n=== ${title} ===`);
  console.log(typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
}

async function previewRealDryRun() {
  const tagPrompt = buildTagRecommendationPrompt(tagRequest);
  const solvePrompt = buildSolvePrompt(solveRequest);
  const practicePrompt = buildPracticeQuestionPrompt(practiceRequest);

  printBlock("AI_MODE", aiMode);
  printBlock("Tag Recommendation System Prompt", tagPrompt.systemPrompt);
  printBlock("Tag Recommendation User Prompt", JSON.parse(tagPrompt.userPrompt));
  printBlock("Tag Recommendation JSON Schema", schemas.tagRecommendationSchema);

  printBlock("Solve System Prompt", solvePrompt.systemPrompt);
  printBlock("Solve User Prompt", JSON.parse(solvePrompt.userPrompt));
  printBlock("Solve JSON Schema", schemas.solveQuestionSchema);

  printBlock("Practice System Prompt", practicePrompt.systemPrompt);
  printBlock("Practice User Prompt", JSON.parse(practicePrompt.userPrompt));
  printBlock("Practice JSON Schema", schemas.practiceQuestionSchema);
}

async function previewActualResponses() {
  printBlock("AI_MODE", aiMode);
  printBlock("Tag Request", tagRequest);
  printBlock("Tag Response", await aiService.recommendTags(tagRequest));

  printBlock("Solve Request", solveRequest);
  printBlock("Solve Response", await aiService.solveQuestion(solveRequest));

  printBlock("Practice Request", practiceRequest);
  printBlock("Practice Response", await aiService.generatePracticeQuestion(practiceRequest));
}

async function main() {
  if (aiMode === "real" && !process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY 未設定，以下改為顯示真實 API 模式的 prompt 與 schema dry run。");
    await previewRealDryRun();
    return;
  }

  await previewActualResponses();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
