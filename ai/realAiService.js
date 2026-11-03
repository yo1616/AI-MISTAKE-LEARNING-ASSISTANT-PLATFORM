const { getConceptById, getConceptCatalog } = require("./catalog");
const {
  buildTagRecommendationPrompt,
  buildSolvePrompt,
  buildPracticeQuestionPrompt
} = require("./promptTemplates");

const GEMINI_BASE_URL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.OPENAI_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const REAL_AI_PROVIDER = "gemini";

const tagRecommendationSchema = {
  type: "object",
  properties: {
    ocrText: { type: "string" },
    subjectId: { type: "string" },
    unitId: { type: "string" },
    matchedConceptId: { type: "string" },
    matchedConceptName: { type: "string" },
    isNewConcept: { type: "boolean" },
    confidence: { type: "number" },
    candidateConceptIds: {
      type: "array",
      items: { type: "string" }
    },
    newConceptReason: { type: "string" }
  },
  required: [
    "ocrText",
    "subjectId",
    "unitId",
    "matchedConceptId",
    "matchedConceptName",
    "isNewConcept",
    "confidence",
    "candidateConceptIds"
  ]
};

const solveQuestionSchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    detailedExplanation: { type: "string" },
    knowledgePoints: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tagId: { type: "string" },
          tagName: { type: "string" },
          chapter: { type: "string" },
          point: { type: "string" }
        },
        required: ["tagId", "tagName", "chapter", "point"]
      }
    },
    recommendedTags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          tagId: { type: "string" },
          tagName: { type: "string" },
          chapter: { type: "string" },
          confidence: { type: "number" }
        },
        required: ["tagId", "tagName", "chapter", "confidence"]
      }
    }
  },
  required: ["summary", "detailedExplanation", "knowledgePoints", "recommendedTags"]
};

const practiceQuestionSchema = {
  type: "object",
  properties: {
    subjectId: { type: "string" },
    unitId: { type: "string" },
    conceptId: { type: "string" },
    questionStyle: { type: "string" },
    title: { type: "string" },
    passage: { type: "string" },
    questionText: { type: "string" },
    options: {
      type: "array",
      items: { type: "string" }
    },
    answer: { type: "string" },
    explanation: { type: "string" }
  },
  required: [
    "subjectId",
    "unitId",
    "conceptId",
    "questionStyle",
    "title",
    "passage",
    "questionText",
    "options",
    "answer",
    "explanation"
  ]
};

function getApiKey() {
  return process.env.GEMINI_API_KEY || "";
}

function ensureApiKey() {
  if (!getApiKey()) {
    throw new Error("缺少 GEMINI_API_KEY，無法使用真實 AI 模式。");
  }
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function parseDataUrl(dataUrl = "") {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: match[2]
  };
}

function buildUserParts(userPrompt, questionImageUrl = "") {
  const parts = [{ text: userPrompt }];
  const parsed = parseDataUrl(questionImageUrl);

  if (parsed) {
    parts.push({
      inlineData: {
        mimeType: parsed.mimeType,
        data: parsed.data
      }
    });
  }

  return parts;
}

function extractResponseText(payload) {
  const part = payload?.candidates?.[0]?.content?.parts?.find((item) => typeof item?.text === "string");
  if (part?.text?.trim()) {
    return part.text.trim();
  }

  throw new Error("Gemini 回應中找不到可解析文字。");
}

async function requestStructuredJson({ schema, systemPrompt, userPrompt, questionImageUrl = "" }) {
  ensureApiKey();

  const response = await fetch(`${normalizeBaseUrl(GEMINI_BASE_URL)}/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": getApiKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: buildUserParts(userPrompt, questionImageUrl)
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    })
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || "Gemini API 呼叫失敗。";
    throw new Error(message);
  }

  return JSON.parse(extractResponseText(payload));
}

function toRecommendedTags(candidateConceptIds) {
  return candidateConceptIds
    .map((tagId, index) => {
      const tag = getConceptById(tagId);
      if (!tag) {
        return null;
      }

      return {
        tagId: tag.id,
        tagName: tag.conceptName,
        chapter: tag.chapter,
        confidence: Math.max(0.3, 0.95 - index * 0.15)
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

async function recommendTags(input = {}) {
  const { systemPrompt, userPrompt } = buildTagRecommendationPrompt({
    ...input,
    hasImage: Boolean(input.questionImageUrl)
  });

  const result = await requestStructuredJson({
    schema: tagRecommendationSchema,
    systemPrompt,
    userPrompt,
    questionImageUrl: input.questionImageUrl
  });

  return {
    ...result,
    recommendedTags: toRecommendedTags(
      result.candidateConceptIds?.length ? result.candidateConceptIds : [getConceptCatalog()[0]?.id]
    )
  };
}

async function solveQuestion(input = {}) {
  const { systemPrompt, userPrompt } = buildSolvePrompt({
    ...input,
    hasImage: Boolean(input.questionImageUrl)
  });

  return requestStructuredJson({
    schema: solveQuestionSchema,
    systemPrompt,
    userPrompt,
    questionImageUrl: input.questionImageUrl
  });
}

async function generatePracticeQuestion(input = {}) {
  const { systemPrompt, userPrompt } = buildPracticeQuestionPrompt(input);

  return requestStructuredJson({
    schema: practiceQuestionSchema,
    systemPrompt,
    userPrompt
  });
}

module.exports = {
  recommendTags,
  solveQuestion,
  generatePracticeQuestion,
  schemas: {
    tagRecommendationSchema,
    solveQuestionSchema,
    practiceQuestionSchema
  },
  getRuntimeConfig() {
    return {
      provider: REAL_AI_PROVIDER,
      baseUrl: GEMINI_BASE_URL,
      model: GEMINI_MODEL,
      hasApiKey: Boolean(getApiKey())
    };
  }
};
