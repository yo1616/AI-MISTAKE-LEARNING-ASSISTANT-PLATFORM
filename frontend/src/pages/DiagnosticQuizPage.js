import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Dropdown from '../components/DropDown';
import StarButton from '../components/StarButton';
import { generateQuestions } from '../data/mockApi';
import { toggleMistakeStar } from '../data/mockApi';
import { useFavorites } from '../data/FavoritesContext';
import '../style/DiagnosticQuizPage.css';

const subjectOptions = ['生物'];
const chapterOptions = ['單元一', '單元二', '單元三'];
const questionCountOptions = ['5', '10', '15', '20'];
const difficultyOptions = ['簡單', '中等', '困難', '隨機'];

function DiagnosticQuizPage() {
  const navigate = useNavigate();
  const { loadFavoritedMistakes } = useFavorites();
  const [pageState, setPageState] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [settings, setSettings] = useState({
    subject: '生物',
    rangeStart: '單元一',
    rangeEnd: '單元三',
    questionCount: '5',
    difficulty: '中等'
  });

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleStartQuiz = async () => {
    const result = await generateQuestions({
      unitIds: ['unit_bio_01', 'unit_bio_02', 'unit_bio_03'],
      questionCount: settings.questionCount,
      difficulty: settings.difficulty
    });
    if (result.success) {
      setCurrentQuestions(result.data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setPageState('quiz');
    }
  };

  const calculateScore = () => {
    let correct = 0;
    currentQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correct) correct++;
    });
    return { correct, total: currentQuestions.length, percentage: Math.round((correct / currentQuestions.length) * 100) };
  };

  const handleSelectAnswer = (optionIndex) => {
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < currentQuestions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setPageState('result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleFinishQuiz = () => {
    setPageState('result');
  };

  const handleQuizAgain = () => {
    setPageState('setup');
    setCurrentQuestions([]);
    setAnswers({});
  };

const handleStarToggle = async (questionId, starred) => {
  await toggleMistakeStar(questionId, starred);
  await loadFavoritedMistakes();
};

  const score = calculateScore();
  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (pageState === 'setup') {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <PageHeader title="Diagnostic Quiz" />
          <div className="quiz-setup-card">
            <div className="setup-item"><div className="setup-label">科目</div><Dropdown options={subjectOptions} value={settings.subject} onChange={(val) => handleSettingChange('subject', val)} width="120px" /></div>
            <div className="setup-item"><div className="setup-label">範圍</div><div className="setup-range"><Dropdown options={chapterOptions} value={settings.rangeStart} onChange={(val) => handleSettingChange('rangeStart', val)} width="110px" /><span className="range-sep">~</span><Dropdown options={chapterOptions} value={settings.rangeEnd} onChange={(val) => handleSettingChange('rangeEnd', val)} width="110px" /></div></div>
            <div className="setup-item"><div className="setup-label">題數</div><Dropdown options={questionCountOptions} value={settings.questionCount} onChange={(val) => handleSettingChange('questionCount', val)} width="100px" /></div>
            <div className="setup-item"><div className="setup-label">難度</div><Dropdown options={difficultyOptions} value={settings.difficulty} onChange={(val) => handleSettingChange('difficulty', val)} width="100px" /></div>
          </div>
          <button className="quiz-start-btn" onClick={handleStartQuiz}>開始測驗</button>
        </div>
      </div>
    );
  }

  if (pageState === 'result') {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <PageHeader title="Diagnostic Quiz" />
          <button className="quiz-again-btn" onClick={handleQuizAgain}>Quiz Again</button>
          <div className="detail-results">
            <div className="results-header"><div className="results-title">DIAGNOSTIC QUIZ RESULTS</div><div className="results-score-badge">{score.percentage}/100</div></div>
            <div className="stats-row"><div className="stat-card"><div className="stat-label">Time Spent</div><div className="stat-value">24:12</div></div>
            <div className="stat-card"><div className="stat-label">Correct</div><div className="stat-value correct">{score.correct}/{score.total}</div></div>
            <div className="stat-card"><div className="stat-label">Accuracy</div><div className="stat-value accuracy">{score.percentage}%</div></div></div>
            {currentQuestions.map((q, idx) => {
              const isCorrect = answers[idx] === q.correct;
              return (
                <div key={q.id} className={`result-question-card ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="card-star"><StarButton starred={false} onToggle={(state) => handleStarToggle(q.id, state, q)} /></div>
                  <div className="question-header"><div className="question-number">第{idx + 1}題</div><div className={`status-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>{isCorrect ? 'CORRECT' : 'INCORRECT'}</div></div>
                  <div className="question-text">{q.text}</div>
                  <div className="review-options">{q.options.map((opt, optIdx) => (<div key={optIdx} className={`review-option ${optIdx === q.correct ? 'correct-option' : ''} ${answers[idx] === optIdx && optIdx !== q.correct ? 'wrong-option' : ''}`}>
                    <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span><span className="option-text">{opt}</span>
                    {optIdx === q.correct && <span className="status-text">(正確答案)</span>}
                    {answers[idx] === optIdx && optIdx !== q.correct && <span className="status-text">(您的答案)</span>}
                  </div>))}</div>
                  <div className="explanation-section"><div className="explanation-title">📖 解析</div><div className="explanation-text">{q.explanation}</div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;
  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <PageHeader title="Diagnostic Quiz" />
        <div className="quiz-card">
          <div className="quiz-progress">Question: {currentQuestionIndex + 1}/{currentQuestions.length}</div>
          <div className="quiz-question">{currentQuestion.text}</div>
          <div className="card-star"><StarButton starred={false} onToggle={(state) => handleStarToggle(currentQuestion.id, state, currentQuestion)} /></div>
          <div className="quiz-options">{currentQuestion.options.map((option, idx) => (<div key={idx} className={`quiz-option ${answers[currentQuestionIndex] === idx ? 'selected' : ''}`} onClick={() => handleSelectAnswer(idx)}>{option}</div>))}</div>
        </div>
        <div className="quiz-nav"><button className="nav-btn prev" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Previous</button>
        <button className="nav-btn finish" onClick={handleFinishQuiz}>Finish</button>
        <button className="nav-btn next" onClick={handleNext}>{currentQuestionIndex + 1 === currentQuestions.length ? 'Submit' : 'Next'}</button></div>
      </div>
    </div>
  );
}

export default DiagnosticQuizPage;