import { seedData, initializeLocalStorage } from './mockSeedData';
import { getCurrentISOString } from '../utils/timeUtils';

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

export const getStudentMistakes = async (options = {}) => {
  const mistakes = JSON.parse(localStorage.getItem('mistakeRecords') || '[]');
  let filtered = mistakes.filter(m => m.studentId === getCurrentStudentId());
  
  if (options.conceptId) {
    filtered = filtered.filter(m => m.conceptId === options.conceptId);
  }
  if (options.unitId) {
    filtered = filtered.filter(m => m.unitId === options.unitId);
  }
  if (options.starredOnly) {
    filtered = filtered.filter(m => m.starred === true);
  }
  
  console.log('getStudentMistakes 查詢:', { options, filtered });
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

// 獲取概念筆記
export const getConceptNotes = async (options = {}) => {
  const studentId = getCurrentStudentId();
  const notes = JSON.parse(localStorage.getItem('conceptNotes') || '[]');
  let filtered = notes.filter(n => n.studentId === studentId);
  
  if (options.unitId) {
    filtered = filtered.filter(n => n.unitId === options.unitId);
  }
  if (options.starredOnly) {
    filtered = filtered.filter(n => n.starred === true);
  }
  
  return { success: true, data: filtered };
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

// 獲取概念列表
export const getConcepts = async () => {
  const concepts = JSON.parse(localStorage.getItem('concepts') || '[]');
  return { success: true, data: concepts };
};