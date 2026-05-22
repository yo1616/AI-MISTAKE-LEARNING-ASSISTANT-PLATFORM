import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Dropdown from '../components/DropDown';
import StarButton from '../components/StarButton';
import { generateQuestions, toggleMistakeStar, updateOrCreateMistake, updateConceptMistakeCount, getUnits, getConcepts } from '../services/api'; // 改成從 services/api 導入
import { useFavorites } from '../data/FavoritesContext';
import '../style/DiagnosticQuizPage.css';

const subjectOptions = ['生物'];
const questionCountOptions = ['5', '10', '15', '20'];
const difficultyOptions = ['簡單', '中等', '困難', '混合'];

function DiagnosticQuizPage() {
  const navigate = useNavigate();
  const { loadFavoritedMistakes } = useFavorites();
  const [pageState, setPageState] = useState('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [units, setUnits] = useState([]); // 儲存單元列表
  const [chapterOptions, setChapterOptions] = useState(['單元一', '單元二', '單元三']); // 預設值
  const [showAddToMistake, setShowAddToMistake] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const [settings, setSettings] = useState({
    subject: '生物',
    rangeStart: '單元一',
    rangeEnd: '單元三',
    questionCount: '5',
    difficulty: '中等'
  });

  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [loading, setLoading] = useState(false);

  // 載入單元列表
  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      const unitsData = await getUnits('subject_bio');
      console.log('單元列表:', unitsData);
      setUnits(unitsData);
      
      // 將單元名稱轉換為下拉選項
      const unitNames = unitsData.map(unit => unit.name);
      setChapterOptions(unitNames);
      
      // 更新 settings 中的範圍
      if (unitNames.length >= 3) {
        setSettings(prev => ({
          ...prev,
          rangeStart: unitNames[0],
          rangeEnd: unitNames[unitNames.length - 1]
        }));
      }
    } catch (error) {
      console.error('載入單元失敗:', error);
    }
  };

  const startTimer = () => {
    const start = Date.now();
    setStartTime(start);
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // 獲取選中範圍的 unitIds
  const getSelectedUnitIds = () => {
    const startIndex = chapterOptions.indexOf(settings.rangeStart);
    const endIndex = chapterOptions.indexOf(settings.rangeEnd);
    
    if (startIndex === -1 || endIndex === -1) {
      return units.map(u => u.id);
    }
    
    const selectedUnits = units.slice(
      Math.min(startIndex, endIndex),
      Math.max(startIndex, endIndex) + 1
    );
    
    return selectedUnits.map(u => u.id);
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    try {
      const selectedUnitIds = getSelectedUnitIds();
      
      const result = await generateQuestions({
        unitIds: selectedUnitIds,
        questionCount: parseInt(settings.questionCount),
        difficulty: settings.difficulty
      });
      
      console.log('生成的題目:', result);
      
      if (result && result.length > 0) {
        setCurrentQuestions(result);
        setAnswers({});
        setCurrentQuestionIndex(0);
        setPageState('quiz');
        startTimer();
      } else {
        alert('無法生成題目，請稍後再試');
      }
    } catch (error) {
      console.error('生成題目失敗:', error);
      alert('生成題目失敗，請檢查網路連線');
    } finally {
      setLoading(false);
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
    if (isAnswered) return;
    
    const isCorrect = optionIndex === currentQuestion.correct;
    
    setAnswers({ ...answers, [currentQuestionIndex]: optionIndex });
    setIsAnswered(true);
    setShowFeedback(true);
    setShowAddToMistake(true);
  };

const handleAddToMistake = async () => {
  const currentQ = currentQuestion;
  
  if (!currentQ) {
    alert('無法加入錯題本：找不到題目');
    return;
  }
  
  // 使用與 curl 測試完全相同的格式（不自己生成 questionGroupId）
  const mistakeData = {
    studentId: 'student_001',
    sourceSessionId: 'chat_001',
    questionGroupId: 'qg_001',  // 使用已存在的 group ID
    subjectId: 'subject_bio',
    classId: 'class_hs2_bio_01',
    unitId: currentQ.unitId || 'unit_bio_01',
    subUnitId: currentQ.subUnitId || 'subunit_bio_01_01',
    conceptId: currentQ.conceptId || 'concept_bio_001',
    inputType: 'text',
    questionText: currentQ.text,
    studentQuestion: currentQ.text,
    correctAnswer: currentQ.options[currentQ.correct],
    aiSummary: currentQ.explanation?.substring(0, 100) || 'AI 摘要',
    fullExplanation: currentQ.explanation || '完整解析',
    starred: false
  };
  
  console.log('發送資料:', mistakeData);
  
  try {
    const response = await fetch('http://localhost:3001/api/mistakes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mistakeData)
    });
    
    const result = await response.json();
    console.log('回應:', result);
    
    if (response.ok && result.success) {
      alert('已加入錯題本！');
      setShowAddToMistake(false);
    } else {
      alert('加入錯題本失敗：' + (result.error?.message || JSON.stringify(result.error)));
    }
  } catch (error) {
    console.error('加入錯題本失敗:', error);
    alert('加入錯題本失敗：' + error.message);
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
    stopTimer();
    setPageState('result');
  };

  const handleQuizAgain = () => {
    stopTimer();
    setElapsedTime(0);
    setStartTime(null);
    setPageState('setup');
    setCurrentQuestions([]);
    setAnswers({});
    setIsAnswered(false);
    setShowFeedback(false);
    setShowAddToMistake(false);
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

  // 設定頁面
  if (pageState === 'setup') {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <PageHeader title="即時測驗" />
          <div className="quiz-setup-card">
            <div className="setup-item">
              <div className="setup-label">科目</div>
              <Dropdown 
                options={subjectOptions} 
                value={settings.subject} 
                onChange={(val) => handleSettingChange('subject', val)} 
                width="120px" 
              />
            </div>
            <div className="setup-item">
              <div className="setup-label">範圍</div>
              <div className="setup-range">
                <Dropdown 
                  options={chapterOptions} 
                  value={settings.rangeStart} 
                  onChange={(val) => handleSettingChange('rangeStart', val)} 
                  width="110px" 
                />
                <span className="range-sep">~</span>
                <Dropdown 
                  options={chapterOptions} 
                  value={settings.rangeEnd} 
                  onChange={(val) => handleSettingChange('rangeEnd', val)} 
                  width="110px" 
                />
              </div>
            </div>
            <div className="setup-item">
              <div className="setup-label">題數</div>
              <Dropdown 
                options={questionCountOptions} 
                value={settings.questionCount} 
                onChange={(val) => handleSettingChange('questionCount', val)} 
                width="100px" 
              />
            </div>
            <div className="setup-item">
              <div className="setup-label">難度</div>
              <Dropdown 
                options={difficultyOptions} 
                value={settings.difficulty} 
                onChange={(val) => handleSettingChange('difficulty', val)} 
                width="100px" 
              />
            </div>
          </div>
          <button className="quiz-start-btn" onClick={handleStartQuiz} disabled={loading}>
            {loading ? '載入中...' : '開始測驗'}
          </button>
        </div>
      </div>
    );
  }

  // 結果頁面
  if (pageState === 'result') {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <PageHeader title="即時測驗" />
          
          <button className="quiz-again-btn" onClick={handleQuizAgain}>Quiz Again</button>
          
          {/* 題目導航按鈕 */}
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
                  </div>
                  
                  <div className="question-text">{q.text}</div>
                  
                  {/* 顯示選項和答案 */}
                  <div className="review-options">
                    {q.options.map((opt, optIdx) => {
                      let optionClass = 'review-option';
                      if (optIdx === q.correct) optionClass += ' correct-option';
                      if (answers[idx] === optIdx && optIdx !== q.correct) optionClass += ' wrong-option';
                      
                      return (
                        <div key={optIdx} className={optionClass}>
                          <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                          <span className="option-text">{opt}</span>
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