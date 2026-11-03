// src/services/api.js
// 符合後端 API 規範的前端服務

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
const CURRENT_STUDENT_ID = 'student_001';
let conceptCatalogCache = null;

// 通用請求函數
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const rawText = await response.text();
    const result = rawText ? JSON.parse(rawText) : {};
    
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || '請求失敗');
    }
    
    return result.data;
  } catch (error) {
    console.error(`API Error: ${endpoint}`, error);
    throw error;
  }
};

// 獲取當前學生 ID
const getCurrentStudentId = () => CURRENT_STUDENT_ID;

// ============ 1. 基礎資料 API ============
export const getSubjects = () => request('/subjects');
export const getUnits = (subjectId) => request(`/subjects/${subjectId}/units`);
export const getSubUnits = (unitId) => request(`/units/${unitId}/subunits`);
export const getConcepts = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/concepts${query ? `?${query}` : ''}`);
};

const getConceptCatalog = async () => {
  if (conceptCatalogCache) {
    return conceptCatalogCache;
  }

  conceptCatalogCache = await getConcepts({ subjectId: 'subject_bio' });
  return conceptCatalogCache;
};

const resolveConceptContext = async (conceptId) => {
  if (!conceptId) {
    return null;
  }

  const concepts = await getConceptCatalog();
  return concepts.find((concept) => concept.id === conceptId) || null;
};

// ============ 2. 學生錯題 API ============
// 獲取學生錯題列表
export const getStudentMistakes = async (params = {}) => {
  const studentId = getCurrentStudentId();
  const query = new URLSearchParams(params).toString();
  const data = await request(`/students/${studentId}/mistakes${query ? `?${query}` : ''}`);
  return data || [];
};

// 新增錯題
export const createMistake = (mistakeData) => request('/mistakes', {
  method: 'POST',
  body: JSON.stringify(mistakeData)
});

// 更新錯題收藏狀態
export const toggleMistakeStar = (mistakeId, starred) => request(`/mistakes/${mistakeId}/star`, {
  method: 'PATCH',
  body: JSON.stringify({ starred })
});

// 獲取單一錯題詳細內容
export const getMistakeDetail = (mistakeId) => request(`/mistakes/${mistakeId}`);

// 收藏錯題（相容性別名）
export const starMistake = toggleMistakeStar;

// ============ 3. 概念筆記 API ============
export const getStudentConceptNotes = async (params = {}) => {
  const studentId = getCurrentStudentId();
  const query = new URLSearchParams(params).toString();
  const data = await request(`/students/${studentId}/concept-notes${query ? `?${query}` : ''}`);
  return data || [];
};

export const getConceptNotes = getStudentConceptNotes;
export const createConceptNote = (noteData) => request('/concept-notes', {
  method: 'POST',
  body: JSON.stringify(noteData)
});
export const toggleConceptNoteStar = (noteId, starred) => request(`/concept-notes/${noteId}/star`, {
  method: 'PATCH',
  body: JSON.stringify({ starred })
});
export const starConceptNote = toggleConceptNoteStar;
export const getConceptNoteDetail = (noteId) => request(`/concept-notes/${noteId}`);

// ============ 4. 我的最愛 API ============
export const getFavoritesSummary = () => request(`/students/${CURRENT_STUDENT_ID}/favorites`);
export const getFavoriteMistakes = () => request(`/students/${CURRENT_STUDENT_ID}/favorites/mistakes`);
export const getFavoriteConceptNotes = () => request(`/students/${CURRENT_STUDENT_ID}/favorites/concept-notes`);

// ============ 5. 聊天 API ============
export const getStudentChatSessions = () => request(`/students/${CURRENT_STUDENT_ID}/chat-sessions`);
export const getChatSessions = getStudentChatSessions;
export const getChatMessages = (sessionId) => request(`/chat-sessions/${sessionId}/messages`);
export const createChatSession = (data) => request('/chat-sessions', {
  method: 'POST',
  body: JSON.stringify({
    studentId: CURRENT_STUDENT_ID,
    ...data
  })
});
export const addChatMessage = (sessionOrPayload, data) => {
  const sessionId = typeof sessionOrPayload === 'string'
    ? sessionOrPayload
    : sessionOrPayload?.sessionId;
  const payload = typeof sessionOrPayload === 'string' ? data : sessionOrPayload;

  if (!sessionId) {
    throw new Error('缺少 sessionId');
  }

  return request(`/chat-sessions/${sessionId}/messages`, {
  method: 'POST',
    body: JSON.stringify({
      role: payload.role,
      messageType: payload.messageType,
      content: payload.content,
      inputType: payload.inputType,
      questionText: payload.questionText,
      questionImageUrl: payload.questionImageUrl,
      unitId: payload.unitId,
      subUnitId: payload.subUnitId,
      conceptId: payload.conceptId,
      questionGroupId: payload.questionGroupId
    })
  });
};
export const deleteChatSession = (sessionId) => request(`/chat-sessions/${sessionId}`, {
  method: 'DELETE'
});
export const updateChatSessionTitle = (sessionId, title) => request(`/chat-sessions/${sessionId}/title`, {
  method: 'PATCH',
  body: JSON.stringify({ title })
});

// ============ 6. 學生分析 API ============
export const getStudentAnalyticsSummary = (rangeOrOptions = '30d', limit = 5) => {
  const options = typeof rangeOrOptions === 'object'
    ? rangeOrOptions
    : { range: rangeOrOptions, limit };
  const query = new URLSearchParams();

  query.set('range', options.range || '30d');
  query.set('limit', String(options.limit || limit || 5));

  if (options.from) {
    query.set('from', options.from);
  }

  if (options.to) {
    query.set('to', options.to);
  }

  return request(`/students/${CURRENT_STUDENT_ID}/analytics/summary?${query.toString()}`);
};

export const getStudentAnalyticsCharts = (rangeOrOptions = '30d') => {
  const options = typeof rangeOrOptions === 'object'
    ? rangeOrOptions
    : { range: rangeOrOptions };
  const query = new URLSearchParams();

  query.set('range', options.range || '30d');

  if (options.from) {
    query.set('from', options.from);
  }

  if (options.to) {
    query.set('to', options.to);
  }

  return request(`/students/${CURRENT_STUDENT_ID}/analytics/charts?${query.toString()}`);
};

// ============ 7. 學生資料 API ============
export const getStudentClasses = (studentId = CURRENT_STUDENT_ID) => request(`/students/${studentId}/classes`);

export const getStudentProfile = async () => {
  try {
    const students = await request('/students');
    const student = students.find(s => s.id === CURRENT_STUDENT_ID);
    return student;
  } catch {
    return { id: CURRENT_STUDENT_ID, name: '王小明', gradeYear: '高二' };
  }
};

export const askAiQuestion = (data) => request('/ai/ask', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const requestPracticeQuestion = (data) => request('/ai/practice-question', {
  method: 'POST',
  body: JSON.stringify(data)
});

// ============ 8. 生成考題 API（依錯誤觀念補題）============
const getDefaultQuestions = () => {
  return [
    {
      id: 'default_1',
      title: '跑步後的血液供應',
      passage: '體育課結束後，小杰覺得心跳加快、呼吸也變得比較急促。老師提醒大家，運動時肌肉需要更多氧氣與養分，因此身體會加快把含氧血送往全身各處。',
      text: '根據上文，含氧血由心臟送往全身肌肉主要屬於哪一種循環？',
      options: ['體循環', '肺循環', '淋巴循環', '消化循環'],
      correct: 0,
      explanation: '含氧血由心臟送往全身各部位屬於體循環；肺循環則是心臟與肺之間的血液循環。',
      questionStyle: 'literacy',
      conceptId: 'concept_bio_001',
      unitId: 'unit_bio_01'
    },
    {
      id: 'default_2',
      title: '跑步測驗後的呼吸變化',
      passage: '班上進行跑步測驗後，老師請同學觀察自己呼吸變快的原因。老師說，身體需要更多氧氣時，肺部某個構造會和血液進行更頻繁的氣體交換。',
      text: '根據上文，與血液進行氧氣與二氧化碳交換的主要構造是哪一個？',
      options: ['氣管', '鼻腔', '肺泡', '支氣管'],
      correct: 2,
      explanation: '肺泡周圍布滿微血管，是氧氣進入血液、二氧化碳排出血液的主要場所。',
      questionStyle: 'literacy',
      conceptId: 'concept_bio_003',
      unitId: 'unit_bio_02'
    },
    {
      id: 'default_3',
      title: '夜間植物仍需能量',
      passage: '老師提醒同學，植物在晚上雖然沒有陽光，無法進行光合作用，但細胞仍然需要持續分解養分來釋放能量，以維持各種生命活動。',
      text: '上文中「分解養分並釋放能量」所描述的是哪一個生物作用？',
      options: ['呼吸作用', '光合作用', '蒸散作用', '消化作用'],
      correct: 0,
      explanation: '呼吸作用的重點是分解養分並釋放能量，不論白天或夜晚細胞都可能進行。',
      questionStyle: 'literacy',
      conceptId: 'concept_bio_004',
      unitId: 'unit_bio_02'
    },
    {
      id: 'default_4',
      title: '校園植物的養分製造',
      passage: '自然課時，老師帶同學觀察校園中的植物，並說明葉片在白天可以利用陽光、二氧化碳和水製造養分，同時釋放氧氣。',
      text: '根據上文，老師所描述的主要作用為何？',
      options: ['光合作用', '呼吸作用', '蒸散作用', '分解作用'],
      correct: 0,
      explanation: '植物利用光能把二氧化碳和水轉換成養分的過程，稱為光合作用。',
      questionStyle: 'literacy',
      conceptId: 'concept_bio_005',
      unitId: 'unit_bio_03'
    },
    {
      id: 'default_5',
      title: '呼吸器官快速檢核',
      passage: '',
      text: '下列哪一個構造屬於呼吸系統？',
      options: ['支氣管', '腎臟', '小腸', '肝臟'],
      correct: 0,
      explanation: '支氣管屬於呼吸系統，負責將空氣輸送到肺部。',
      questionStyle: 'short',
      conceptId: 'concept_bio_002',
      unitId: 'unit_bio_02'
    },
    {
      id: 'default_6',
      title: '植物中的能量轉換',
      passage: '老師說明植物不會直接把陽光儲存起來，而是先把光能轉成可儲存在葡萄糖中的化學能，之後細胞才能使用這些能量。',
      text: '根據上文，最能描述這個核心概念的是哪一項？',
      options: ['能量轉換', '氣體交換', '血液循環', '消化作用'],
      correct: 0,
      explanation: '題目重點在於植物把光能轉成化學能，這屬於能量轉換的概念。',
      questionStyle: 'literacy',
      conceptId: 'concept_bio_007',
      unitId: 'unit_bio_03'
    },
    {
      id: 'default_7',
      title: '循環系統綜合判斷',
      passage: '',
      text: '體循環和肺循環的共同點是什麼？',
      options: ['都在心臟內完成', '都運送缺氧血', '都經過心臟', '都在肺臟完成'],
      correct: 2,
      explanation: '體循環和肺循環都經過心臟，心臟是兩個循環系統的交匯點。',
      questionStyle: 'short',
      conceptId: 'concept_bio_001',
      unitId: 'unit_bio_01'
    }
  ];
};

const difficultyMap = {
  簡單: 'easy',
  中等: 'medium',
  困難: 'hard',
  混合: 'mixed'
};

const buildQuestionStyle = (index, difficulty) => {
  if (difficulty === '混合') {
    return index % 4 === 3 ? 'short' : 'literacy';
  }
  return index % 5 === 4 ? 'short' : 'literacy';
};

const MAX_AI_QUESTION_RETRIES = 3;

const stripOptionPrefix = (value = '') => {
  let normalized = String(value).trim();

  normalized = normalized
    .replace(/^[\(\[（【]?\s*[A-Da-dＡ-Ｄ]\s*[\)\]）】]?\s*[\.\):：、\-]?\s*/u, '')
    .replace(/^[\(\[（【]?\s*\d+\s*[\)\]）】]?\s*[\.\):：、\-]?\s*/u, '')
    .trim();

  return normalized;
};

const normalizeOptionText = (value = '') =>
  stripOptionPrefix(value)
    .replace(/\s+/g, ' ')
    .trim();

const INVALID_PLACEHOLDER_TEXTS = new Set([
  '',
  '請回答下列問題。',
  '請回答下列問題',
  '請回答問題。',
  '請回答問題'
]);

const isPlaceholderOption = (value = '') => /^選項\s*[A-DＡ-Ｄ]$/u.test(String(value).trim());

const extractAnswerIndex = (answer = '', options = []) => {
  const normalizedAnswer = normalizeOptionText(answer);
  const exactMatchIndex = options.findIndex((option) => option === normalizedAnswer);

  if (exactMatchIndex >= 0) {
    return exactMatchIndex;
  }

  const letterMatch = String(answer).trim().match(/^[\(\[（【]?\s*([A-Da-dＡ-Ｄ])\s*[\)\]）】]?$/u);
  if (letterMatch) {
    const letter = letterMatch[1].toUpperCase().charCodeAt(0);
    const asciiLetter = letter >= 65313 ? letter - 65248 : letter;
    const index = asciiLetter - 65;
    if (index >= 0 && index < options.length) {
      return index;
    }
  }

  return -1;
};

const getFallbackQuestionForConcept = (conceptId, questionStyle, index = 0) => {
  const defaults = getDefaultQuestions();
  const sameConcept = defaults.filter((item) => item.conceptId === conceptId);
  const sameStyle = sameConcept.filter((item) => item.questionStyle === questionStyle);
  const globalSameStyle = defaults.filter((item) => item.questionStyle === questionStyle);
  const source = sameStyle.length > 0
    ? sameStyle
    : (globalSameStyle.length > 0 ? globalSameStyle : (sameConcept.length > 0 ? sameConcept : defaults));
  return source[index % source.length];
};

const isQuestionStructurallyValid = (question) => {
  if (!question.text || question.options.length !== 4) {
    return false;
  }

  if (INVALID_PLACEHOLDER_TEXTS.has(String(question.text).trim())) {
    return false;
  }

  if (question.options.every((option) => isPlaceholderOption(option))) {
    return false;
  }

  const uniqueOptions = new Set(question.options.map((option) => option.trim()));
  if (uniqueOptions.size < 4) {
    return false;
  }

  if (question.correct < 0 || question.correct >= question.options.length) {
    return false;
  }

  return true;
};

const normalizeGeneratedQuestion = (question, index, fallback = {}) => {
  const options = Array.isArray(question.options) && question.options.length >= 2
    ? question.options.slice(0, 4).map(normalizeOptionText)
    : [];
  const answerIndex = extractAnswerIndex(question.answer || '', options);
  const resolvedText = question.questionText || question.text || fallback.text || '';

  return {
    id: question.id || `generated_${fallback.conceptId || 'concept'}_${index + 1}`,
    title: question.title || fallback.title || `第 ${index + 1} 題`,
    passage: question.passage || '',
    text: resolvedText,
    options,
    correct: answerIndex >= 0 ? answerIndex : 0,
    explanation: question.explanation || fallback.explanation || '請參考老師課堂講解。',
    questionStyle: question.questionStyle || fallback.questionStyle || 'literacy',
    conceptId: question.conceptId || fallback.conceptId || null,
    unitId: question.unitId || fallback.unitId || null,
    subUnitId: question.subUnitId || fallback.subUnitId || null
  };
};

const ensureQuestionShape = (question, index, fallback = {}) => {
  const normalizedQuestion = normalizeGeneratedQuestion(question, index, fallback);

  if (isQuestionStructurallyValid(normalizedQuestion)) {
    return normalizedQuestion;
  }

  const fallbackQuestion = getFallbackQuestionForConcept(
    fallback.conceptId || normalizedQuestion.conceptId,
    fallback.questionStyle || normalizedQuestion.questionStyle,
    index
  );

  return {
    ...fallbackQuestion,
    id: `${fallbackQuestion.id}_validated_${index + 1}`
  };
};

const requestValidatedPracticeQuestion = async ({
  conceptId,
  index,
  difficulty,
  concepts
}) => {
  const conceptMeta = (concepts || []).find((concept) => concept.id === conceptId) || {};
  const questionStyle = buildQuestionStyle(index, difficulty);
  const fallbackMeta = {
    conceptId,
    unitId: conceptMeta.unitId || null,
    subUnitId: conceptMeta.subUnitId || null,
    questionStyle
  };

  for (let attempt = 0; attempt < MAX_AI_QUESTION_RETRIES; attempt += 1) {
    try {
      const result = await requestPracticeQuestion({
        conceptId,
        difficulty: difficultyMap[difficulty] || 'medium',
        questionStyle,
        variantIndex: index * 10 + attempt,
        studentGrade: '10'
      });

      const rawQuestion = result?.question;
      if (!rawQuestion) {
        continue;
      }

      const normalizedQuestion = normalizeGeneratedQuestion(rawQuestion, index, fallbackMeta);
      if (isQuestionStructurallyValid(normalizedQuestion)) {
        return normalizedQuestion;
      }
    } catch (error) {
      console.warn(`AI 題目第 ${index + 1} 題第 ${attempt + 1} 次重試失敗`, error);
    }
  }

  return ensureQuestionShape({}, index, fallbackMeta);
};

const rankConceptIdsByMistakes = (mistakes) => {
  const counts = new Map();
  for (const mistake of mistakes) {
    if (!mistake.conceptId) continue;
    counts.set(mistake.conceptId, (counts.get(mistake.conceptId) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([conceptId]) => conceptId);
};

const expandConceptQueue = (conceptIds, targetCount) => {
  if (!conceptIds.length) {
    return [];
  }

  const queue = [];
  let cursor = 0;
  while (queue.length < targetCount) {
    queue.push(conceptIds[cursor % conceptIds.length]);
    cursor += 1;
  }
  return queue;
};

// 生成考題 - 依選定範圍內的錯誤觀念出題，不足時用 AI 補足到指定題數
export const generateQuestions = async (params = {}) => {
  const { unitIds, questionCount = 5, difficulty = '中等' } = params;
  const targetCount = parseInt(questionCount) || 5;
  console.log('生成考題請求:', { unitIds, targetCount, difficulty });

  try {
    const [mistakes, concepts] = await Promise.all([
      getStudentMistakes(),
      getConcepts({ subjectId: 'subject_bio' })
    ]);
    console.log('獲取到的錯題數量:', mistakes?.length || 0);

    const filteredMistakes = unitIds && unitIds.length > 0
      ? mistakes.filter((mistake) => unitIds.includes(mistake.unitId))
      : mistakes;

    const rangeConceptIds = (concepts || [])
      .filter((concept) => !unitIds || unitIds.length === 0 || unitIds.includes(concept.unitId))
      .map((concept) => concept.id);

    const prioritizedConceptIds = rankConceptIdsByMistakes(filteredMistakes);
    const fallbackConceptIds = prioritizedConceptIds.length > 0
      ? prioritizedConceptIds
      : rangeConceptIds;

    const conceptQueue = expandConceptQueue(fallbackConceptIds, targetCount);
    if (conceptQueue.length === 0) {
      return getDefaultQuestions().slice(0, targetCount);
    }

    const finalQuestions = await Promise.all(
      conceptQueue.map((conceptId, index) =>
        requestValidatedPracticeQuestion({
          conceptId,
          index,
          difficulty,
          concepts
        })
      )
    );

    if (finalQuestions.length < targetCount) {
      while (finalQuestions.length < targetCount) {
        const currentIndex = finalQuestions.length;
        const desiredStyle = buildQuestionStyle(currentIndex, difficulty);
        const conceptId = conceptQueue[currentIndex] || conceptQueue[conceptQueue.length - 1] || null;
        const fallback = getFallbackQuestionForConcept(conceptId, desiredStyle, currentIndex);
        finalQuestions.push({
          ...fallback,
          id: `${fallback.id}_${finalQuestions.length + 1}`
        });
      }
    }

    console.log(`最終返回 ${finalQuestions.length} 題 (目標 ${targetCount} 題)`);
    return finalQuestions.slice(0, targetCount);
  } catch (error) {
    console.error('從錯題生成考題失敗:', error);
    return getDefaultQuestions().slice(0, targetCount);
  }
};


// ============ 9. 更新或新增錯題（相容性函數）============
export const updateOrCreateMistake = async (mistakeData) => {
  // 確保所有必要欄位都存在
  const data = {
    studentId: mistakeData.studentId || 'student_001',
    sourceSessionId: mistakeData.sourceSessionId || null,
    questionGroupId: mistakeData.questionGroupId || null,
    subjectId: mistakeData.subjectId || 'subject_bio',
    classId: mistakeData.classId || 'class_hs2_bio_01',
    unitId: mistakeData.unitId || 'unit_bio_02',
    subUnitId: mistakeData.subUnitId || 'subunit_bio_02_02',
    conceptId: mistakeData.conceptId || 'concept_bio_003',
    inputType: mistakeData.inputType || 'text',
    questionText: mistakeData.questionText,
    studentQuestion: mistakeData.studentQuestion || mistakeData.questionText,
    studentAnswer: mistakeData.studentAnswer || null,
    correctAnswer: mistakeData.correctAnswer,
    aiSummary: mistakeData.aiSummary || mistakeData.fullExplanation?.substring(0, 100) || '',
    fullExplanation: mistakeData.fullExplanation || '',
    questionImageUrl: mistakeData.questionImageUrl || null,
    starred: mistakeData.starred || false
  };
  
  return createMistake(data);
};

export const processAndSaveMistake = async (question, answerPayload, sessionId, options = {}) => {
  const answerText = typeof answerPayload === 'string'
    ? answerPayload
    : answerPayload?.summary || '';
  const recommendation = typeof answerPayload === 'string' ? null : options.recommendation;
  const resolvedTag = recommendation?.recommendedTags?.[0] || null;
  const resolvedConceptId = resolvedTag?.tagId || options.conceptId || null;
  const conceptMeta = await resolveConceptContext(resolvedConceptId);
  const rawQuestion = String(question || '').trim();
  const rawOcrText = String(options.ocrText || recommendation?.ocrText || '').trim();
  const placeholderTexts = new Set(['請根據這張圖片幫我分析', '請根據圖片內容分析題目']);
  const effectiveQuestion = rawOcrText && !placeholderTexts.has(rawOcrText) ? rawOcrText : rawQuestion;
  const normalizedQuestion = effectiveQuestion.toLowerCase();
  const isGreetingOnly = ['你好', '嗨', 'hi', 'hello', 'test'].includes(normalizedQuestion) || /^[a-z]\d+$/i.test(normalizedQuestion);
  const isInvalidRecord = !resolvedConceptId
    || (isGreetingOnly && !rawOcrText)
    || answerText.includes('無法判斷題目內容')
    || answerText.includes('並非一個生物學問題');
  const isConceptLookupOnly = !isInvalidRecord
    && (options.inputType || 'text') === 'text'
    && effectiveQuestion.length > 0
    && effectiveQuestion.length <= 8
    && !/[?？!！。,.，、:：;；]/.test(effectiveQuestion);

  if (isInvalidRecord) {
    return null;
  }

  if (isConceptLookupOnly) {
    await createConceptNote({
      studentId: CURRENT_STUDENT_ID,
      sourceSessionId: sessionId,
      subjectId: 'subject_bio',
      classId: 'class_hs2_bio_01',
      unitId: conceptMeta?.unitId || options.unitId || 'unit_bio_02',
      subUnitId: conceptMeta?.subUnitId || options.subUnitId || 'subunit_bio_02_02',
      conceptId: resolvedConceptId,
      noteTitle: resolvedTag?.tagName || effectiveQuestion || options.noteTitle || 'AI 觀念筆記',
      noteContent: typeof answerPayload === 'string'
        ? answerPayload
        : [answerPayload.summary, answerPayload.detailedExplanation].filter(Boolean).join('\n')
    });

    return null;
  }

  const mistakeData = {
    sourceSessionId: sessionId,
    subjectId: 'subject_bio',
    classId: 'class_hs2_bio_01',
    unitId: conceptMeta?.unitId || options.unitId || 'unit_bio_02',
    subUnitId: conceptMeta?.subUnitId || options.subUnitId || 'subunit_bio_02_02',
    conceptId: resolvedConceptId,
    questionText: effectiveQuestion,
    studentQuestion: effectiveQuestion,
    studentAnswer: options.studentAnswer || null,
    correctAnswer: options.correctAnswer || '請參考解析',
    aiSummary: answerText.substring(0, 100),
    fullExplanation: typeof answerPayload === 'string'
      ? answerPayload
      : [answerPayload.summary, answerPayload.detailedExplanation].filter(Boolean).join('\n'),
    inputType: options.inputType || 'text',
    questionImageUrl: options.questionImageUrl || null,
    starred: false,
  };
  const mistake = await updateOrCreateMistake(mistakeData);

  await createConceptNote({
    studentId: CURRENT_STUDENT_ID,
    sourceSessionId: sessionId,
    subjectId: 'subject_bio',
    classId: 'class_hs2_bio_01',
    unitId: mistakeData.unitId,
    subUnitId: mistakeData.subUnitId,
    conceptId: mistakeData.conceptId,
    noteTitle: resolvedTag?.tagName || options.noteTitle || 'AI 觀念筆記',
    noteContent: typeof answerPayload === 'string'
      ? answerPayload
      : [answerPayload.summary, answerPayload.detailedExplanation].filter(Boolean).join('\n')
  });

  return mistake;
};

export const updateConceptMistakeCount = async () => ({ success: true });

// ============ 10. 獲取單元含子單元 ============
export const getUnitsWithSubUnits = async () => {
  const units = await getUnits('subject_bio');
  return units.map(unit => ({ ...unit, subUnits: [] }));
};
