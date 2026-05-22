// src/data/quizData.js - 臨時兼容層
import { api } from '../services/api';

export const getQuestionsByCount = async (count) => {
  const result = await api.generatePracticeQuestions({ questionCount: count });
  return result.success ? result.data.questions : [];
};

export const getQuestionsByDifficulty = async (count, difficulty) => {
  const result = await api.generatePracticeQuestions({ questionCount: count, difficulty });
  return result.success ? result.data.questions : [];
};