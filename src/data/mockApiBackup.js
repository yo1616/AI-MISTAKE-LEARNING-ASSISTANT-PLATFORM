import { seedData, initializeLocalStorage } from './mockSeedData';
import { getCurrentISOString } from '../utils/timeUtils';
// src/data/mockApi.js
//import { classifyQuestion, isNewConcept } from '../utils/mistakeClassifier';

// 簡單的關鍵字分類（如果不想移除）
const classifyQuestion = (question) => {
  if (question.includes('肺泡') || question.includes('氣體')) {
    return { conceptId: 'concept_bio_003', unitId: 'unit_bio_02', subUnitId: 'subunit_bio_02_02' };
  }
  if (question.includes('循環') || question.includes('心臟')) {
    return { conceptId: 'concept_bio_001', unitId: 'unit_bio_01', subUnitId: 'subunit_bio_01_02' };
  }
  return { conceptId: 'concept_bio_003', unitId: 'unit_bio_02', subUnitId: 'subunit_bio_02_02' };
};

const isNewConcept = (question, matchedConceptId) => {
  return { isNew: false };
};
// 初始化 localStorage
initializeLocalStorage();

// 輔助函數：獲取當前學生 ID（模擬登入）
const getCurrentStudentId = () => {
  return 'student_001';
};

// 獲取學生資料
export const getStudentProfile = async () => {
  const studentId = getCurrentStudentId();
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const student = students.find(s => s.id === studentId);
  return { success: true, data: student };
};

// src/data/mockApi.js

export const getStudentMistakes = async (options = {}) => {
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  let filtered = mistakes.filter(m => m.studentId === getCurrentStudentId());
  
  if (options.subUnitId) {
    filtered = filtered.filter(m => m.subUnitId === options.subUnitId);
  }
  if (options.conceptId) {
    filtered = filtered.filter(m => m.conceptId === options.conceptId);
  }
  if (options.unitId) {
    filtered = filtered.filter(m => m.unitId === options.unitId);
  }
  if (options.starredOnly) {
    filtered = filtered.filter(m => m.starred === true);
  }
  
  return { success: true, data: filtered };
};

// 更新錯題收藏狀態
export const toggleMistakeStar = async (mistakeId, starred) => {
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  const index = mistakes.findIndex(m => m.id === mistakeId);
  if (index !== -1) {
    mistakes[index].starred = starred;
    mistakes[index].starredAt = starred ? getCurrentISOString() : null;
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    return { success: true, data: mistakes[index] };
  }
  return { success: false, error: '錯題不存在' };
};
// src/data/mockApi.js

// 獲取概念列表（已存在）
export const getConcepts = async () => {
  const concepts = JSON.parse(localStorage.getItem('concepts') || '[]');
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  
  const conceptsWithCount = concepts.map(concept => ({
    ...concept,
    mistakeCount: mistakes.filter(m => m.conceptId === concept.id).length
  }));
  
  return { success: true, data: conceptsWithCount };
};
export const getConceptNotes = async (options = {}) => {
  const studentId = getCurrentStudentId();
  const notes = JSON.parse(localStorage.getItem('conceptNotes') || '[]');
  const units = JSON.parse(localStorage.getItem('units') || '[]');
  const concepts = JSON.parse(localStorage.getItem('concepts') || '[]');
  
  // 建立 unitId 到編號的映射
  const unitNumberMap = {};
  units.forEach(unit => {
    const mainChapter = Math.ceil(unit.order / 3);
    const subChapter = ((unit.order - 1) % 3) + 1;
    unitNumberMap[unit.id] = `${mainChapter}-${subChapter}`;
  });
  
  // 建立 conceptId 到 unitId 的映射
  const conceptUnitMap = {};
  concepts.forEach(concept => {
    conceptUnitMap[concept.id] = concept.unitId;
  });
  
  let filtered = notes.filter(n => n.studentId === studentId);
  
  if (options.unitId) {
    filtered = filtered.filter(n => n.unitId === options.unitId);
  }
  if (options.starredOnly) {
    filtered = filtered.filter(n => n.starred === true);
  }
  
  // 添加 unitDisplayNumber 到每個 note
  const notesWithDisplay = filtered.map(note => ({
    ...note,
    unitDisplayNumber: unitNumberMap[conceptUnitMap[note.conceptId]] || '1-1'
  }));
  
  console.log('getConceptNotes 回傳:', notesWithDisplay);
  return { success: true, data: notesWithDisplay };
};

// 更新概念筆記收藏
export const toggleConceptNoteStar = async (noteId, starred) => {
  const notes = JSON.parse(localStorage.getItem('conceptNotes') || '[]');
  const index = notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    notes[index].starred = starred;
    notes[index].starredAt = starred ? getCurrentISOString() : null;
    localStorage.setItem('conceptNotes', JSON.stringify(notes));
    return { success: true, data: notes[index] };
  }
  return { success: false, error: '筆記不存在' };
};

// 獲取學生的聊天 Sessions
export const getChatSessions = async () => {
  const studentId = getCurrentStudentId();
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
  const filtered = sessions.filter(s => s.studentId === studentId);
  filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return { success: true, data: filtered };
};

// 獲取單一 Session 的訊息
export const getChatMessages = async (sessionId) => {
  const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  const filtered = messages.filter(m => m.sessionId === sessionId);
  filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return { success: true, data: filtered };
};

// 創建新的聊天 Session
export const createChatSession = async (sessionData) => {
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
  const newSession = {
    id: `chat_${Date.now()}`,
    ...sessionData,
    studentId: getCurrentStudentId(),
    startedAt: getCurrentISOString(),
    updatedAt: getCurrentISOString(),
    questionGroupCount: 0
  };
  sessions.push(newSession);
  localStorage.setItem('chatSessions', JSON.stringify(sessions));
  return { success: true, data: newSession };
};

// 添加聊天訊息
export const addChatMessage = async (messageData) => {
  const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  const newMessage = {
    id: `msg_${Date.now()}`,
    ...messageData,
    createdAt: getCurrentISOString()
  };
  messages.push(newMessage);
  localStorage.setItem('chatMessages', JSON.stringify(messages));
  
  // 更新 session 的 updatedAt
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
  const sessionIndex = sessions.findIndex(s => s.id === messageData.sessionId);
  if (sessionIndex !== -1) {
    sessions[sessionIndex].updatedAt = getCurrentISOString();
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
  }
  
  return { success: true, data: newMessage };
};

// 獲取學生的統計摘要
export const getStudentAnalyticsSummary = async () => {
  const studentId = getCurrentStudentId();
  const summaries = JSON.parse(localStorage.getItem('studentAnalyticsSummary') || '[]');
  const summary = summaries.find(s => s.studentId === studentId);
  return { success: true, data: summary };
};

// 生成考題
export const generateQuestions = async (params = {}) => {
  const { unitIds, conceptIds, questionCount = 5, difficulty = '中等' } = params;
  
  // 直接從 seedData 獲取練習題
  let questions = [...seedData.generatedPracticeQuestions];
  
  // 如果指定了 unitIds，則過濾
  if (unitIds && unitIds.length > 0) {
    questions = questions.filter(q => unitIds.includes(q.unitId));
  }
  
  // 如果指定了 conceptIds，則過濾
  if (conceptIds && conceptIds.length > 0) {
    questions = questions.filter(q => conceptIds.includes(q.conceptId));
  }
  
  // 隨機選取指定數量的題目
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  const selected = shuffled.slice(0, parseInt(questionCount) || 5);
  
  // 轉換格式給前端使用
  const formattedQuestions = selected.map(q => ({
    id: q.id,
    text: q.questionText,
    options: q.options,
    correct: q.options.findIndex(opt => opt === q.answer),
    explanation: q.explanation,
    title: q.title,
    passage: q.passage,
    conceptId: q.conceptId,
    unitId: q.unitId
  }));
  
  return { success: true, data: formattedQuestions };
};

// 獲取單元列表
export const getUnits = async () => {
  const units = JSON.parse(localStorage.getItem('units') || '[]');
  return { success: true, data: units };
};

// src/data/mockApi.js

// 獲取子章節列表
export const getSubUnits = async () => {
  const subUnits = JSON.parse(localStorage.getItem('subUnits') || '[]');
  return { success: true, data: subUnits };
};

// 獲取章節（含子章節）
export const getUnitsWithSubUnits = async () => {
  const unitsResult = await getUnits();
  const subUnitsResult = await getSubUnits();
  
  if (unitsResult.success && subUnitsResult.success) {
    const unitsWithSubUnits = unitsResult.data.map(unit => ({
      ...unit,
      subUnits: subUnitsResult.data
        .filter(sub => sub.unitId === unit.id)
        .sort((a, b) => a.order - b.order)
    }));
    return { success: true, data: unitsWithSubUnits };
  }
  return { success: false, error: '無法載入資料' };
};


// 更新或新增錯題
export const updateOrCreateMistake = async (mistakeData) => {
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  const existingIndex = mistakes.findIndex(m => 
    m.studentId === getCurrentStudentId() && 
    m.conceptId === mistakeData.conceptId &&
    m.questionText === mistakeData.questionText
  );
  
  if (existingIndex !== -1) {
    // 已存在，錯題次數 +1
    mistakes[existingIndex].mistakeCount = (mistakes[existingIndex].mistakeCount || 1) + 1;
    mistakes[existingIndex].lastMistakeAt = new Date().toISOString();
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    return { success: true, data: mistakes[existingIndex], isNew: false };
  } else {
    // 不存在，新增錯題
    const newMistake = {
      id: `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      studentId: getCurrentStudentId(),
      mistakeCount: 1,
      starred: false,
      starredAt: null,
      createdAt: new Date().toISOString(),
      ...mistakeData
    };
    mistakes.push(newMistake);
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    return { success: true, data: newMistake, isNew: true };
  }
};

// 更新或新增概念錯題統計
export const updateConceptMistakeCount = async (conceptId, unitId) => {
  const concepts = JSON.parse(localStorage.getItem('concepts') || '[]');
  const conceptIndex = concepts.findIndex(c => c.id === conceptId);
  
  if (conceptIndex !== -1) {
    concepts[conceptIndex].mistakeCount = (concepts[conceptIndex].mistakeCount || 0) + 1;
    concepts[conceptIndex].lastMistakeAt = new Date().toISOString();
    localStorage.setItem('concepts', JSON.stringify(concepts));
  }
  return { success: true };
};

// 收藏錯題（加入 Important Mistake Notebook）
export const starMistake = async (mistakeId, starred) => {
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  const index = mistakes.findIndex(m => m.id === mistakeId);
  if (index !== -1) {
    mistakes[index].starred = starred;
    mistakes[index].starredAt = starred ? new Date().toISOString() : null;
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    return { success: true, data: mistakes[index] };
  }
  return { success: false, error: '錯題不存在' };
};

// 收藏概念筆記（加入 Important Concept）
export const starConceptNote = async (noteId, starred) => {
  const notes = JSON.parse(localStorage.getItem('conceptNotes') || '[]');
  const index = notes.findIndex(n => n.id === noteId);
  if (index !== -1) {
    notes[index].starred = starred;
    notes[index].starredAt = starred ? new Date().toISOString() : null;
    localStorage.setItem('conceptNotes', JSON.stringify(notes));
    return { success: true, data: notes[index] };
  }
  return { success: false, error: '筆記不存在' };
};

// 處理錯題分類並儲存
export const processAndSaveMistake = async (question, answer, sessionId) => {
  // 1. 分類問題
  const classification = classifyQuestion(question);
  const newConceptCheck = isNewConcept(question, classification.conceptId);
  
  // 2. 建立錯題資料
  const mistakeData = {
    id: `mistake_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    studentId: getCurrentStudentId(),
    sourceSessionId: sessionId,
    subjectId: 'subject_bio',
    classId: 'class_hs2_bio_01',
    className: '高二生物班',
    unitId: classification.unitId,
    conceptId: newConceptCheck.isNew ? newConceptCheck.newConceptId : classification.conceptId,
    subUnitId: classification.subUnitId,
    questionText: question,
    studentQuestion: question,
    correctAnswer: '請參考解析',
    aiSummary: answer.substring(0, 100),
    fullExplanation: answer,
    mistakeCount: 1,
    starred: false,
    classification: {
      method: classification.method,
      confidence: classification.confidence,
      isNewConcept: newConceptCheck.isNew,
      newConceptReason: newConceptCheck.reason || null
    },
    createdAt: new Date().toISOString()
  };
  
  // 3. 檢查是否已存在
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  const existingIndex = mistakes.findIndex(m => 
    m.studentQuestion === question && m.conceptId === mistakeData.conceptId
  );
  
  if (existingIndex !== -1) {
    mistakes[existingIndex].mistakeCount += 1;
    mistakes[existingIndex].lastMistakeAt = new Date().toISOString();
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    return { success: true, data: mistakes[existingIndex], isNew: false };
  } else {
    mistakes.push(mistakeData);
    localStorage.setItem('mistakeRecords', JSON.stringify(mistakes));
    
    // 4. 如果是新概念，同時建立概念筆記
    if (newConceptCheck.isNew) {
      await createConceptNoteForNewConcept(mistakeData, newConceptCheck);
    }
    
    return { success: true, data: mistakeData, isNew: true };
  }
};

// 為新概念建立筆記
const createConceptNoteForNewConcept = async (mistakeData, newConceptCheck) => {
  const notes = JSON.parse(localStorage.getItem('conceptNotes') || '[]');
  const newNote = {
    id: `note_${Date.now()}`,
    studentId: mistakeData.studentId,
    sourceSessionId: mistakeData.sourceSessionId,
    subjectId: mistakeData.subjectId,
    classId: mistakeData.classId,
    className: mistakeData.className,
    unitId: mistakeData.unitId,
    conceptId: mistakeData.conceptId,
    noteTitle: `${newConceptCheck.newConceptName} 重點整理`,
    noteContent: mistakeData.fullExplanation,
    starred: false,
    createdAt: new Date().toISOString(),
    linkedMistakes: [mistakeData.id]
  };
  notes.push(newNote);
  localStorage.setItem('conceptNotes', JSON.stringify(notes));
};

// src/data/mockApi.js

// 刪除聊天 Session
export const deleteChatSession = async (sessionId) => {
  const sessions = JSON.parse(localStorage.getItem('chatSessions') || '[]');
  const filtered = sessions.filter(s => s.id !== sessionId);
  
  if (filtered.length === sessions.length) {
    return { success: false, error: 'Session 不存在' };
  }
  
  localStorage.setItem('chatSessions', JSON.stringify(filtered));
  
  // 同時刪除相關的訊息
  const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
  const remainingMessages = messages.filter(m => m.sessionId !== sessionId);
  localStorage.setItem('chatMessages', JSON.stringify(remainingMessages));
  
  return { success: true, data: { deletedId: sessionId } };
};