const { getConceptCatalog, getConceptById } = require("./catalog");

const tagKeywordRules = [
  { tagId: "concept_bio_001", keywords: ["循環", "心臟", "血液", "體循環", "肺循環"] },
  { tagId: "concept_bio_002", keywords: ["呼吸系統", "鼻腔", "氣管", "支氣管", "肺"] },
  { tagId: "concept_bio_003", keywords: ["肺泡", "氧氣", "二氧化碳", "氣體交換", "微血管"] },
  { tagId: "concept_bio_004", keywords: ["呼吸作用", "ATP", "能量", "細胞呼吸", "養分"] },
  { tagId: "concept_bio_005", keywords: ["光合作用", "葡萄糖", "陽光", "葉"] },
  { tagId: "concept_bio_006", keywords: ["葉綠體", "葉綠素", "光能"] },
  { tagId: "concept_bio_007", keywords: ["能量轉換", "化學能", "ATP"] }
];

const literacyPracticeTemplates = {
  concept_bio_001: [
    {
      title: "跑步後的血液流向",
      passage: "阿誠跑完 800 公尺後感覺心跳明顯加快。老師提醒他，這時心臟會更快地把含氧血送往全身肌肉，讓細胞獲得活動所需的氧氣與養分。",
      questionText: "根據上文，血液由心臟送往全身各部位主要屬於哪一種循環？",
      options: ["體循環", "肺循環", "淋巴循環", "消化循環"],
      answer: "體循環",
      explanation: "從心臟把含氧血送到全身的是體循環。"
    },
    {
      title: "登山前的呼吸與循環",
      passage: "登山社在出發前做暖身，老師提醒同學運動時肌肉需要更多氧氣，因此心臟與血管必須更有效率地把氧氣送到全身。",
      questionText: "依照上文，含氧血離開左心室後，最主要會進入哪一種循環路徑？",
      options: ["體循環", "肺循環", "門脈循環", "淋巴循環"],
      answer: "體循環",
      explanation: "左心室將含氧血送往全身，屬於體循環。"
    }
  ],
  concept_bio_002: [
    {
      title: "空氣進入身體的路徑",
      passage: "小芸深吸一口氣時，空氣會依序通過多個器官，最後才抵達真正能進行氣體交換的部位。老師要同學分清楚各器官在呼吸系統中的位置和功能。",
      questionText: "根據上文，下列哪一個構造屬於呼吸系統的一部分？",
      options: ["支氣管", "腎臟", "小腸", "胰臟"],
      answer: "支氣管",
      explanation: "支氣管屬於呼吸系統，負責將空氣送往肺部。"
    },
    {
      title: "感冒時的呼吸器官判讀",
      passage: "小翔感冒時鼻塞又咳嗽，醫生說上呼吸道和下呼吸道都可能受到影響，必須先了解空氣平常進出身體時會經過哪些器官。",
      questionText: "若要判斷空氣進入肺部前經過的器官，下列哪一個選項正確屬於呼吸系統？",
      options: ["氣管", "肝臟", "胃", "胰臟"],
      answer: "氣管",
      explanation: "氣管是呼吸系統的重要通道，負責輸送空氣。"
    }
  ],
  concept_bio_003: [
    {
      title: "爬樓梯後的呼吸變化",
      passage: "小杰上學時一口氣跑上四樓，發現自己呼吸變快。老師解釋，這是因為身體需要更多氧氣進入血液，才能提供細胞活動所需的能量。",
      questionText: "根據上文，氧氣進入血液的主要位置是哪裡？",
      options: ["支氣管", "鼻腔", "肺泡", "氣管"],
      answer: "肺泡",
      explanation: "肺泡周圍有微血管，能進行氣體交換。"
    },
    {
      title: "跑步測驗後的氧氣交換",
      passage: "班上進行跑步測驗後，同學們都氣喘吁吁。老師說，呼吸加快的目的之一，是讓更多氧氣能在肺部某個特定構造與血液完成交換。",
      questionText: "上文提到與血液進行氧氣交換的主要構造應為下列何者？",
      options: ["肺泡", "咽喉", "鼻腔", "支氣管"],
      answer: "肺泡",
      explanation: "肺泡周圍布滿微血管，是氣體交換的主要場所。"
    }
  ],
  concept_bio_004: [
    {
      title: "運動後細胞如何取得能量",
      passage: "阿豪打完球後覺得全身發熱又疲累。老師說，細胞會把養分逐步分解，並釋放出可供生命活動使用的能量，這是細胞維持活動的重要過程。",
      questionText: "根據上文，老師描述的最可能是哪一個作用？",
      options: ["呼吸作用", "光合作用", "蒸散作用", "消化作用"],
      answer: "呼吸作用",
      explanation: "呼吸作用是細胞分解養分並釋放能量的過程。"
    },
    {
      title: "夜間仍需能量的原因",
      passage: "老師提醒同學，晚上植物雖然沒有進行光合作用，但細胞仍然需要把養分分解來釋放能量，才能維持生命活動。",
      questionText: "依據上文，細胞將養分分解並釋放能量的過程稱為什麼？",
      options: ["呼吸作用", "蒸散作用", "受精作用", "消化作用"],
      answer: "呼吸作用",
      explanation: "呼吸作用負責分解養分並釋放能量。"
    }
  ],
  concept_bio_005: [
    {
      title: "植物在白天的養分製造",
      passage: "老師帶同學觀察校園的植物，說明葉片在白天接受陽光後，會利用空氣中的二氧化碳和水製造養分，並釋放氧氣。",
      questionText: "根據上文，老師描述的作用最可能是哪一個？",
      options: ["光合作用", "呼吸作用", "消化作用", "蒸散作用"],
      answer: "光合作用",
      explanation: "植物利用光能製造養分的過程稱為光合作用。"
    },
    {
      title: "校園樹木的白天活動",
      passage: "午休時老師要同學觀察操場旁的大樹，並說明葉片在有陽光時能把無機物轉成可儲存能量的養分。",
      questionText: "根據上文，葉片製造養分的主要作用是下列哪一項？",
      options: ["光合作用", "呼吸作用", "蒸散作用", "分解作用"],
      answer: "光合作用",
      explanation: "有光時葉片利用二氧化碳和水製造養分，屬於光合作用。"
    }
  ],
  concept_bio_006: [
    {
      title: "葉片中的能量工廠",
      passage: "在觀察水蘊草實驗時，老師指出植物細胞中有一種構造，能吸收光能並參與製造葡萄糖，是植物能進行光合作用的重要場所。",
      questionText: "根據上文，這個構造最可能是哪一個？",
      options: ["葉綠體", "細胞膜", "細胞核", "液泡"],
      answer: "葉綠體",
      explanation: "葉綠體含有葉綠素，是進行光合作用的重要場所。"
    },
    {
      title: "植物細胞中的綠色構造",
      passage: "老師展示葉片切片時提到，細胞中帶有綠色色素、能吸收光能並協助製造養分的構造，是植物與動物細胞的重要差異之一。",
      questionText: "上文提到的構造最可能是下列何者？",
      options: ["葉綠體", "液泡", "細胞核", "粒線體"],
      answer: "葉綠體",
      explanation: "葉綠體含有葉綠素，可吸收光能並參與光合作用。"
    }
  ],
  concept_bio_007: [
    {
      title: "植物把光能轉成可用能量",
      passage: "老師在課堂上說明，植物先透過葉綠體吸收光能，再把這些能量轉換成可以儲存在葡萄糖中的化學能，供後續生命活動使用。",
      questionText: "根據上文，最能描述這個過程核心概念的是哪一項？",
      options: ["能量轉換", "消化作用", "氣體交換", "血液循環"],
      answer: "能量轉換",
      explanation: "題目重點在於把光能轉成化學能，屬於能量轉換。"
    },
    {
      title: "光能儲存在養分中的意義",
      passage: "老師解釋植物不是直接把陽光存起來，而是把光能轉變成能儲存在葡萄糖內的形式，之後細胞才方便利用。",
      questionText: "上文主要說明哪一項生物概念？",
      options: ["能量轉換", "氣體交換", "血液循環", "消化作用"],
      answer: "能量轉換",
      explanation: "把光能轉成化學能並儲存在葡萄糖中，屬於能量轉換。"
    }
  ]
};

const shortPracticeTemplates = {
  concept_bio_001: {
    title: "循環方向快速檢核",
    passage: "",
    questionText: "含氧血由左心室送往全身，主要屬於哪一種循環？",
    options: ["體循環", "肺循環", "淋巴循環", "消化循環"],
    answer: "體循環",
    explanation: "左心室將含氧血送往全身，屬於體循環。"
  },
  concept_bio_002: {
    title: "呼吸器官快速檢核",
    passage: "",
    questionText: "下列何者屬於呼吸系統？",
    options: ["支氣管", "腎臟", "小腸", "肝臟"],
    answer: "支氣管",
    explanation: "支氣管屬於呼吸系統，負責輸送空氣。"
  },
  concept_bio_003: {
    title: "氣體交換快速檢核",
    passage: "",
    questionText: "人體中進行氧氣與二氧化碳交換的主要部位是哪裡？",
    options: ["肺泡", "鼻腔", "支氣管", "氣管"],
    answer: "肺泡",
    explanation: "肺泡是氣體交換的主要場所。"
  },
  concept_bio_004: {
    title: "呼吸作用快速檢核",
    passage: "",
    questionText: "細胞分解養分並釋放能量的作用稱為什麼？",
    options: ["呼吸作用", "光合作用", "消化作用", "蒸散作用"],
    answer: "呼吸作用",
    explanation: "呼吸作用會分解養分並釋放能量。"
  },
  concept_bio_005: {
    title: "光合作用快速檢核",
    passage: "",
    questionText: "植物利用光能製造養分的過程稱為什麼？",
    options: ["光合作用", "呼吸作用", "蒸散作用", "分解作用"],
    answer: "光合作用",
    explanation: "植物利用光能製造養分，稱為光合作用。"
  },
  concept_bio_006: {
    title: "葉綠體快速檢核",
    passage: "",
    questionText: "植物細胞中進行光合作用的重要場所是哪個構造？",
    options: ["葉綠體", "液泡", "細胞核", "細胞膜"],
    answer: "葉綠體",
    explanation: "葉綠體是植物進行光合作用的重要場所。"
  },
  concept_bio_007: {
    title: "能量轉換快速檢核",
    passage: "",
    questionText: "植物把光能儲存在葡萄糖中，最能代表哪一項概念？",
    options: ["能量轉換", "氣體交換", "血液循環", "消化作用"],
    answer: "能量轉換",
    explanation: "把光能轉成化學能，屬於能量轉換。"
  }
};

function findRecommendedTags(questionText = "") {
  const concepts = getConceptCatalog();
  const normalizedText = questionText.trim();
  const matches = tagKeywordRules
    .map((rule) => {
      const hitCount = rule.keywords.filter((keyword) => normalizedText.includes(keyword)).length;
      return { tagId: rule.tagId, hitCount };
    })
    .filter((rule) => rule.hitCount > 0)
    .sort((a, b) => b.hitCount - a.hitCount)
    .slice(0, 3)
    .map((rule) => {
      const tag = getConceptById(rule.tagId);
      return {
        tagId: rule.tagId,
        tagName: tag ? tag.conceptName : rule.tagId,
        chapter: tag ? tag.chapter : "",
        confidence: Math.min(0.6 + rule.hitCount * 0.15, 0.95)
      };
    });

  if (matches.length > 0) {
    return matches;
  }

  const fallbackTag = concepts[0];
  return [
    {
      tagId: fallbackTag.id,
      tagName: fallbackTag.conceptName,
      chapter: fallbackTag.chapter,
      confidence: 0.4
    }
  ];
}

function recommendTags({
  questionText = "",
  subjectId = "subject_bio",
  unitId = "",
  ocrText = "",
  questionImageUrl = ""
} = {}) {
  const effectiveText = [questionText, ocrText, questionImageUrl ? '附帶圖片題目' : ''].filter(Boolean).join(' ');
  const recommendedTags = findRecommendedTags(effectiveText);
  const matchedTag = recommendedTags[0] || null;

  return {
    ocrText: questionText || ocrText || "這是 mock 模式，尚未接真實 OCR。",
    subjectId,
    unitId,
    matchedConceptId: matchedTag ? matchedTag.tagId : null,
    matchedConceptName: matchedTag ? matchedTag.tagName : null,
    isNewConcept: false,
    confidence: matchedTag ? matchedTag.confidence : 0,
    candidateConceptIds: recommendedTags.map((tag) => tag.tagId),
    recommendedTags
  };
}

function generateSolveResponse({ questionText = "", studentAnswer = "", questionImageUrl = "" }) {
  const effectiveText = [questionText, questionImageUrl ? '附帶圖片題目' : ''].filter(Boolean).join(' ');
  const recommendedTags = findRecommendedTags(effectiveText);
  const mainTag = recommendedTags[0];
  const hasImage = Boolean(questionImageUrl);
  const wantsTable = /表格/.test(questionText);

  const detailedExplanation = wantsTable
    ? [
      `| 項目 | 說明 |`,
      `| --- | --- |`,
      `| 核心概念 | ${mainTag.tagName} |`,
      `| 判斷重點 | 先看題目在比較單細胞生物與多細胞生物的差異。 |`,
      `| 解題方向 | 先確認哪個選項能由單一細胞完成所有生命活動，再排除其餘多細胞生物。 |`,
      `| 作答提醒 | 再次遇到同類題時，先抓題幹關鍵字，再比對各選項的生物層級。 |`
    ].join('\n')
    : [
      `題目重點落在「${mainTag.chapter} / ${mainTag.tagName}」這個知識點。`,
      hasImage ? "圖片中的題目資訊會和你的文字描述一起判讀。" : null,
      "先找出題目在問的核心概念，再對照定義、位置或作用。",
      "如果再次遇到同類題，建議先判斷關鍵名詞，再排除容易混淆的選項。"
    ].filter(Boolean).join(" ");

  return {
    summary: `這題主要考 ${mainTag.tagName}。${hasImage ? '我有一併參考你上傳的圖片內容。' : ''}你的答案「${studentAnswer || "未填寫"}」和正解概念不一致，應先釐清核心定義。`,
    detailedExplanation,
    knowledgePoints: recommendedTags.map((tag) => ({
      tagId: tag.tagId,
      tagName: tag.tagName,
      chapter: tag.chapter,
      point: `先掌握 ${tag.tagName} 的定義與常見混淆點。`
    })),
    recommendedTags
  };
}

function generatePracticeQuestion(input = {}) {
  const tagId = typeof input === "string" ? input : input.tagId || input.conceptId || "concept_bio_001";
  const questionStyle = input.questionStyle === 'short' ? 'short' : 'literacy';
  const variantIndex = Number(input.variantIndex || 0);
  const literacyTemplates = literacyPracticeTemplates[tagId] || literacyPracticeTemplates.concept_bio_001;
  const literacyTemplate = literacyTemplates[variantIndex % literacyTemplates.length];
  const shortTemplate = shortPracticeTemplates[tagId] || shortPracticeTemplates.concept_bio_001;
  const template = questionStyle === 'short' ? shortTemplate : literacyTemplate;
  const tag = getConceptById(tagId) || getConceptCatalog()[0];
  return {
    subjectId: tag.subjectId,
    unitId: tag.unitId,
    conceptId: tag.id,
    tagId,
    questionStyle,
    ...template
  };
}

module.exports = {
  recommendTags,
  findRecommendedTags,
  solveQuestion: generateSolveResponse,
  generateSolveResponse,
  generatePracticeQuestion
};
