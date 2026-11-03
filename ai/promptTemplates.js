const { getConceptCatalog, getConceptById } = require("./catalog");

function normalizeConcept(tag) {
  return {
    conceptId: tag.id || tag.conceptId,
    conceptName: tag.name || tag.conceptName,
    chapter: tag.chapter,
    subjectId: tag.subjectId || "subject_bio"
  };
}

function getAvailableTags(tagIds) {
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    return tagIds.map((tagId) => getConceptById(tagId)).filter(Boolean).map(normalizeConcept);
  }

  return getConceptCatalog().map(normalizeConcept);
}

function detectResponsePreference(questionText = "") {
  const text = String(questionText || "");

  if (/表格/.test(text)) {
    return "table";
  }

  if (/條列|重點整理|列點/.test(text)) {
    return "bullet";
  }

  return "normal";
}

function buildTagRecommendationPrompt({
  questionText = "",
  ocrText = "",
  subjectId = "subject_bio",
  unitId = "",
  hasImage = false,
  tagIds
} = {}) {
  const availableTags = getAvailableTags(tagIds);

  return {
    systemPrompt: [
      "你是國中生物錯題分析助理。",
      "你的任務是根據題目文字，在固定科目與既有觀念清單中挑出最相關的觀念。",
      "你必須優先使用既有觀念，不可任意新增。",
      "只有在現有觀念都明顯不適合時，才可將 isNewConcept 設為 true。",
      "請只輸出符合 JSON Schema 的內容，不要輸出額外說明。"
    ].join(" "),
    userPrompt: JSON.stringify(
      {
        task: "recommend_concept",
        ocrText: ocrText || questionText,
        questionText,
        hasImage,
        subjectId,
        unitId,
        availableConcepts: availableTags
      },
      null,
      2
    ),
    availableTags
  };
}

function buildSolvePrompt({
  questionText = "",
  studentAnswer = "",
  correctAnswer = "",
  hasImage = false,
  tagIds
} = {}) {
  const availableTags = getAvailableTags(tagIds);

  return {
    systemPrompt: [
      "你是國中生物解題助理。",
      "你要用國中程度解釋題目，指出學生答案的概念錯誤，並整理成系統可直接顯示的 JSON。",
      "解釋要精簡、可讀、以觀念釐清為主。",
      "若題目文字中包含明確格式要求，例如『用表格解說』、『用條列整理』，請優先遵守。",
      "若要求表格，請在 detailedExplanation 中使用 Markdown 表格格式輸出。",
      "若要求條列，請在 detailedExplanation 中使用清楚的條列格式輸出。",
      "若可從題目判斷相關觀念，請優先引用 availableConcepts 內的名稱。",
      "請只輸出符合 JSON Schema 的內容，不要輸出額外說明。"
    ].join(" "),
    userPrompt: JSON.stringify(
      {
        task: "solve_question",
        questionText,
        hasImage,
        studentAnswer,
        correctAnswer,
        responsePreference: detectResponsePreference(questionText),
        availableConcepts: availableTags
      },
      null,
      2
    ),
    availableTags
  };
}

function buildPracticeQuestionPrompt({
  tagId = "",
  studentGrade = "8",
  difficulty = "medium",
  questionStyle = "literacy",
  variantIndex = 0
} = {}) {
  const fallbackTag = getConceptCatalog()[0];
  const tag = getConceptById(tagId) || fallbackTag;

  return {
    systemPrompt: [
      "你是國中生物出題助理。",
      "請根據指定觀念產生 1 題國中程度的四選一題目。",
      "預設以素養長題為主，但若 questionStyle=short，請改成較短的概念檢核題。",
      "題目要有 4 個選項、正確答案與 1 到 3 句解析。",
      "不得直接重複現有題目文字，但核心知識點必須一致。",
      "請只輸出符合 JSON Schema 的內容，不要輸出額外說明。"
    ].join(" "),
    userPrompt: JSON.stringify(
      {
        task: "generate_practice_question",
        subjectId: tag.subjectId || "subject_bio",
        unitId: "",
        conceptId: tag.id || tag.conceptId,
        conceptName: tag.name || tag.conceptName,
        chapter: tag.chapter,
        studentGrade,
        difficulty,
        questionStyle,
        variantIndex
      },
      null,
      2
    ),
    tag
  };
}

module.exports = {
  buildTagRecommendationPrompt,
  buildSolvePrompt,
  buildPracticeQuestionPrompt
};
