import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Dropdown from '../components/DropDown';
import StarButton from '../components/StarButton';
import { generateQuestions } from '../services/api';
import { toggleMistakeStar } from '../services/api';
import { updateOrCreateMistake, updateConceptMistakeCount } from '../services/api';
import { useFavorites } from '../data/FavoritesContext';
import '../style/DiagnosticQuizPage.css';

const subjectOptions = ['生物'];
const chapterOptions = ['單元一', '單元二', '單元三'];
const questionCountOptions = ['5', '10', '15', '20'];
const difficultyOptions = ['簡單', '中等', '困難', '混合'];

function DiagnosticQuizPage() {
  const navigate = useNavigate();
  const { loadFavoritedMistakes } = useFavorites();
  const [pageState, setPageState] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentQuestions, setCurrentQuestions] = useState([]);
  // 在 state 區域新增
const [showAddToMistake, setShowAddToMistake] = useState(false);
const [showFeedback, setShowFeedback] = useState(false);  // 是否顯示答案反饋
const [isAnswered, setIsAnswered] = useState(false);      // 是否已作答

  const [settings, setSettings] = useState({
    subject: '生物',
    rangeStart: '單元一',
    rangeEnd: '單元三',
    questionCount: '5',
    difficulty: '中等'
  });


  // 在現有 state 附近添加
const [startTime, setStartTime] = useState(null);
const [elapsedTime, setElapsedTime] = useState(0);
const [timerInterval, setTimerInterval] = useState(null);

// 開始計時
const startTimer = () => {
  const start = Date.now();
  setStartTime(start);
  const interval = setInterval(() => {
    setElapsedTime(Math.floor((Date.now() - start) / 1000));
  }, 1000);
  setTimerInterval(interval);
};

// 停止計時
const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    setTimerInterval(null);
  }
};

// 格式化時間 (秒 -> MM:SS)
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
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
    startTimer();  // 開始計時
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
  if (isAnswered) return;  // 已經回答過就不能再選
  
  const isCorrect = optionIndex === currentQuestion.correct;
  
  setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
  setIsAnswered(true);
  setShowFeedback(true);
  
  setShowAddToMistake(true);
};

const handleAddToMistake = async () => {
  const currentQ = currentQuestion;
  const isCorrect = answers[currentQuestionIndex] === currentQ.correct;
  
  // 直接使用 currentQuestion 中的資料
  const mistakeData = {
    questionText: currentQ.text,
    studentQuestion: currentQ.text,
    correctAnswer: currentQ.options[currentQ.correct],
    aiSummary: currentQ.explanation?.substring(0, 100) || '',
    fullExplanation: currentQ.explanation || '',
    conceptId: currentQ.conceptId,      // 直接使用題目自帶的 conceptId
    unitId: currentQ.unitId,            // 直接使用題目自帶的 unitId
    subUnitId: currentQ.subUnitId,      // 直接使用題目自帶的 subUnitId
    subjectId: currentQ.subjectId || 'subject_bio',
    classId: currentQ.classId || 'class_hs2_bio_01',
    className: currentQ.className || '高二生物班',
    inputType: 'text',
    starred: false,
    // 額外記錄答題資訊
    userAnswer: currentQ.options[answers[currentQuestionIndex]],
    isCorrect: isCorrect,
    answeredAt: new Date().toISOString()
  };
  
  const result = await updateOrCreateMistake(mistakeData);
  
  if (result.success) {
    alert('已加入錯題本！');
    setShowAddToMistake(false);
  }
};

const handleNextQuestion = () => {
  if (currentQuestionIndex + 1 < currentQuestions.length) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setIsAnswered(false);
    setShowFeedback(false);
    setShowAddToMistake(false);
  } else {
    stopTimer();
    setPageState('result');
  }
};

  const handleFinishQuiz = () => {
  stopTimer();  // 停止計時
  setPageState('result');
};

const handleQuizAgain = () => {
  stopTimer();  // 停止計時
  setElapsedTime(0);
  setStartTime(null);
  setPageState('setup');
  setCurrentQuestions([]);
  setAnswers({});
};


  const score = calculateScore();
  const currentQuestion = currentQuestions[currentQuestionIndex];

   useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  
  if (pageState === 'setup') {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <PageHeader title="即時測驗" />
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

  {/* 結果頁面 */}
if (pageState === 'result') {
  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <PageHeader title="即時測驗" />
        
        {/* Quiz Again 按鈕 */}
        <button className="quiz-again-btn" onClick={handleQuizAgain}>Quiz Again</button>
        
        {/* 題目導航按鈕 - 橫向滑動 */}
        <div className="question-nav-chips">
          {currentQuestions.map((q, idx) => {
            const hasAnswer = answers[idx] !== undefined;
            const isCorrect = hasAnswer && answers[idx] === q.correct;
            const isIncorrect = hasAnswer && answers[idx] !== q.correct;
            const isCurrent = idx === currentQuestionIndex;
            
            let chipClass = 'nav-chip';
            if (isCorrect) chipClass += ' correct';
            else if (isIncorrect) chipClass += ' incorrect';
            else chipClass += ' unanswered';
            if (isCurrent) chipClass += ' current';
            
            return (
              <div 
                key={idx}
                className={chipClass}
                onClick={() => {
                  setCurrentQuestionIndex(idx);
                  const element = document.getElementById(`question-${idx}`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
        
        {/* 結果摘要卡片 */}
        <div className="detail-results">
          <div className="results-header">
            <div className="results-title">DIAGNOSTIC QUIZ RESULTS</div>
            <div className="results-score-badge">{score.percentage}/100</div>
          </div>
          
          <div className="stats-row">
            <div className="stat-card">
                <div className="stat-label">Time Spent</div>
                <div className="stat-value">{formatTime(elapsedTime)}</div>
                </div>
            <div className="stat-card">
              <div className="stat-label">Correct</div>
              <div className="stat-value correct">{score.correct}/{score.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Accuracy</div>
              <div className="stat-value accuracy">{score.percentage}%</div>
            </div>
          </div>
          
          {/* 題目列表 */}
          {currentQuestions.map((q, idx) => {
            const isCorrect = answers[idx] === q.correct;
            return (
              <div 
                key={q.id} 
                id={`question-${idx}`}
                className={`result-question-card ${isCorrect ? 'correct' : 'incorrect'}`}
              >
                
                
                <div className="question-header">
                  <div className="question-number">第{idx + 1}題</div>
                  <div className={`status-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                   
                  </div>
                </div>
                
                
                
                <div className="question-text">{q.text}</div>
                
                {/* 顯示選項和答案 */}
                <div className="review-options">
                  {q.options.map((opt, optIdx) => {
                    let optionClass = 'review-option';
                    if (optIdx === q.correct) optionClass += ' correct-option';
                    if (answers[idx] === optIdx && optIdx !== q.correct) optionClass += ' wrong-option';
                    
                    let statusText = '';
                    
                    return (
                      <div key={optIdx} className={optionClass}>
                        <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                        <span className="option-text">{opt}</span>
                        {statusText && <span className="status-text">{statusText}</span>}
                      </div>
                    );
                  })}
                </div>
                
                <div className="explanation-section">
                  <div className="explanation-title">解析 (Analysis)</div>
                  <div className="explanation-text">{q.explanation}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// 答題頁面
if (!currentQuestion) return null;

const isCurrentAnswered = answers[currentQuestionIndex] !== undefined;
const isCurrentCorrect = isCurrentAnswered && answers[currentQuestionIndex] === currentQuestion.correct;

return (
  <div className="quiz-page">
    <div className="quiz-container">
      <PageHeader title="即時測驗" />
      
      <div className="quiz-card">
        <div className="quiz-progress">
          第 {currentQuestionIndex + 1} / {currentQuestions.length} 題
        </div>
        <div className="quiz-question">{currentQuestion.text}</div>
        
        <div className="quiz-options">
          {currentQuestion.options.map((option, idx) => {
            const isAnswered = answers[currentQuestionIndex] !== undefined;
            const isSelected = answers[currentQuestionIndex] === idx;
            const isCorrectOption = idx === currentQuestion.correct;
            
            let optionClass = 'quiz-option';
            if (isAnswered) {
              if (isCorrectOption) optionClass += ' correct-answer';
              if (isSelected && !isCorrectOption) optionClass += ' wrong-answer';
            }
            
            return (
              <div 
                key={idx}
                className={optionClass}
                onClick={() => {
                  if (answers[currentQuestionIndex] !== undefined) return;
                  handleSelectAnswer(idx);
                }}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}.</span>
                <span className="option-text">{option}</span>
                {isCurrentAnswered && isCorrectOption && <span className="check-icon">✓</span>}
                {isCurrentAnswered && isSelected && !isCorrectOption && <span className="x-icon">✗</span>}
                </div>
            );
          })}
        </div>
        
        {/* 答案反饋區域 */}
        {showFeedback && (
         <div className="button-group">
            <button className="add-to-mistake-btn" onClick={handleAddToMistake}>加入錯題本</button>
            <button className="next-question-btn" onClick={handleNextQuestion}>下一題</button>
            </div>
        )}
      </div>
    </div>
  </div>
);
}

export default DiagnosticQuizPage;