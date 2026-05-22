// src/services/api.js
// 符合後端 API 規範的前端服務

const API_BASE_URL = 'http://localhost:3001/api';
const CURRENT_STUDENT_ID = 'student_001';

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
    const result = await response.json();
    
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
  body: JSON.stringify(data)
});
export const addChatMessage = (sessionId, data) => request(`/chat-sessions/${sessionId}/messages`, {
  method: 'POST',
  body: JSON.stringify(data)
});
export const deleteChatSession = (sessionId) => request(`/chat-sessions/${sessionId}`, {
  method: 'DELETE'
});

// ============ 6. 學生分析 API ============
export const getStudentAnalyticsSummary = (range = '30d', limit = 5) => 
  request(`/students/${CURRENT_STUDENT_ID}/analytics/summary?range=${range}&limit=${limit}`);

export const getStudentAnalyticsCharts = (range = '30d') => 
  request(`/students/${CURRENT_STUDENT_ID}/analytics/charts?range=${range}`);

// ============ 7. 學生資料 API ============
export const getStudentProfile = async () => {
  try {
    const students = await request('/students');
    const student = students.find(s => s.id === CURRENT_STUDENT_ID);
    return student;
  } catch {
    return { id: CURRENT_STUDENT_ID, name: '王小明', gradeYear: '高二' };
  }
};

// ============ 8. 生成考題 API（從錯題獲取）============
// 預設範例題目（當沒有錯題時使用）
const getDefaultQuestions = () => {
  return [
    {
      id: 'default_1',
      text: '心臟的主要功能是什麼？',
      options: ['輸送血液', '過濾毒素', '製造紅血球', '儲存養分'],
      correct: 0,
      explanation: '心臟是循環系統的核心器官，負責將血液輸送到全身各處。',
      conceptId: 'concept_bio_001',
      unitId: 'unit_bio_01'
    },
    {
      id: 'default_2',
      text: '肺泡的主要功能是什麼？',
      options: ['過濾空氣', '產生二氧化碳', '進行氣體交換', '儲存氧氣'],
      correct: 2,
      explanation: '肺泡是進行氣體交換的主要場所，氧氣進入血液，二氧化碳排出。',
      conceptId: 'concept_bio_003',
      unitId: 'unit_bio_02'
    },
    {
      id: 'default_3',
      text: '光合作用中，光反應的產物包含？',
      options: ['葡萄糖', '二氧化碳', 'ATP和NADPH', '水'],
      correct: 2,
      explanation: '光反應產生ATP和NADPH，提供給碳反應使用。',
      conceptId: 'concept_bio_005',
      unitId: 'unit_bio_03'
    },
    {
      id: 'default_4',
      text: '體循環和肺循環的共同點是什麼？',
      options: ['都在心臟內完成', '都運送缺氧血', '都經過心臟', '都在肺臟完成'],
      correct: 2,
      explanation: '體循環和肺循環都經過心臟，心臟是兩個循環系統的交匯點。',
      conceptId: 'concept_bio_001',
      unitId: 'unit_bio_01'
    },
    {
      id: 'default_5',
      text: '呼吸作用的主要目的是？',
      options: ['產生氧氣', '分解養分釋放能量', '合成蛋白質', '排除二氧化碳'],
      correct: 1,
      explanation: '呼吸作用是將養分分解，釋放能量供細胞使用。',
      conceptId: 'concept_bio_004',
      unitId: 'unit_bio_02'
    }
  ];
};

// 生成考題 - 從後端錯題中獲取題目
export const generateQuestions = async (params = {}) => {
  const { unitIds, questionCount = 5, difficulty = '中等' } = params;
  
  // 確保 questionCount 是數字
  const targetCount = parseInt(questionCount) || 5;
  
  console.log('生成考題請求:', { unitIds, targetCount, difficulty });
  
  try {
    // 先獲取學生的錯題列表
    const mistakes = await getStudentMistakes();
    console.log('獲取到的錯題數量:', mistakes?.length || 0);
    
    let finalQuestions = [];
    
    // 如果有錯題資料，從錯題中生成
    if (mistakes && mistakes.length > 0) {
      // 根據選擇的單元過濾錯題
      let filteredMistakes = mistakes;
      if (unitIds && unitIds.length > 0) {
        filteredMistakes = mistakes.filter(m => unitIds.includes(m.unitId));
        console.log('按單元過濾後錯題數量:', filteredMistakes.length);
      }
      
      // 如果過濾後沒有題目，使用全部錯題
      if (filteredMistakes.length === 0) {
        console.log('沒有符合單元的錯題，使用全部錯題');
        filteredMistakes = mistakes;
      }
      
      // 將錯題轉換為考題格式
      const questionsFromMistakes = filteredMistakes.map((mistake, index) => {
        // 從錯題中提取選項
        let options = mistake.options;
        if (!options || options.length === 0) {
          options = [
            mistake.correctAnswer || '正確答案',
            '選項B',
            '選項C', 
            '選項D'
          ];
        }
        
        // 找到正確答案的索引
        let correctIndex = 0;
        if (mistake.correctAnswer) {
          const foundIndex = options.findIndex(opt => opt === mistake.correctAnswer);
          if (foundIndex !== -1) correctIndex = foundIndex;
        }
        
        return {
          id: mistake.id || `q_${index}`,
          text: mistake.questionText || mistake.studentQuestion || '題目內容',
          options: options,
          correct: correctIndex,
          explanation: mistake.fullExplanation || mistake.aiSummary || '尚無解析',
          conceptId: mistake.conceptId,
          unitId: mistake.unitId,
          subUnitId: mistake.subUnitId
        };
      });
      
      // 隨機選取題目
      const shuffled = [...questionsFromMistakes];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      finalQuestions = shuffled.slice(0, targetCount);
      console.log('從錯題生成的題目數量:', finalQuestions.length);
    }
    
    // 如果不夠 targetCount，補充預設題目
    if (finalQuestions.length < targetCount) {
      const defaultQuestions = getDefaultQuestions();
      const needed = targetCount - finalQuestions.length;
      const additional = defaultQuestions.slice(0, needed);
      finalQuestions = [...finalQuestions, ...additional];
      console.log(`錯題不夠，補充 ${additional.length} 個預設題目，總共 ${finalQuestions.length} 題`);
    }
    
    // 確保返回的題目數量等於 targetCount
    console.log(`最終返回 ${finalQuestions.length} 題 (目標 ${targetCount} 題)`);
    return finalQuestions;
    
  } catch (error) {
    console.error('從錯題生成考題失敗:', error);
    // 發生錯誤時，返回預設題目
    const defaultQuestions = getDefaultQuestions();
    return defaultQuestions.slice(0, targetCount);
  }
};


// ============ 9. 更新或新增錯題（相容性函數）============
export const updateOrCreateMistake = async (mistakeData) => {
  // 確保所有必要欄位都存在
  const data = {
    studentId: mistakeData.studentId || 'student_001',
    sourceSessionId: mistakeData.sourceSessionId || 'chat_001',
    questionGroupId: mistakeData.questionGroupId || `qg_${Date.now()}`,
    subjectId: mistakeData.subjectId || 'subject_bio',
    classId: mistakeData.classId || 'class_hs2_bio_01',
    unitId: mistakeData.unitId || 'unit_bio_01',
    subUnitId: mistakeData.subUnitId || 'subunit_bio_01_01',
    conceptId: mistakeData.conceptId || 'concept_bio_001',
    inputType: mistakeData.inputType || 'text',
    questionText: mistakeData.questionText,
    studentQuestion: mistakeData.studentQuestion || mistakeData.questionText,
    correctAnswer: mistakeData.correctAnswer,
    aiSummary: mistakeData.aiSummary || mistakeData.fullExplanation?.substring(0, 100) || '',
    fullExplanation: mistakeData.fullExplanation || '',
    starred: mistakeData.starred || false
  };
  
  return createMistake(data);
};

export const processAndSaveMistake = async (question, answer, sessionId) => {
  const mistakeData = {
    sourceSessionId: sessionId,
    subjectId: 'subject_bio',
    classId: 'class_hs2_bio_01',
    questionText: question,
    studentQuestion: question,
    correctAnswer: '請參考解析',
    aiSummary: answer.substring(0, 100),
    fullExplanation: answer,
    inputType: 'text',
    starred: false,
  };
  return updateOrCreateMistake(mistakeData);
};

export const updateConceptMistakeCount = async () => ({ success: true });

// ============ 10. 獲取單元含子單元 ============
export const getUnitsWithSubUnits = async () => {
  const units = await getUnits('subject_bio');
  return units.map(unit => ({ ...unit, subUnits: [] }));
};