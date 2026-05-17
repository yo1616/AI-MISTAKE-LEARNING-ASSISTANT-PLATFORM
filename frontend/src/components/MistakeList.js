import React, { useState } from 'react';
import StarButton from './StarButton';

function MistakeList({ mistakes, onStarToggle, emptyMessage, emptyHint }) {
  const [expandedId, setExpandedId] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState({});

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleOptionClick = (e, mistakeId, letter, isCorrect) => {
    e.stopPropagation();
    setSelectedAnswers({ ...selectedAnswers, [mistakeId]: letter });
    setShowResults({ ...showResults, [mistakeId]: true });
  };

  const getCorrectAnswer = (options) => {
    const correct = options?.find(opt => opt.isCorrect);
    return correct ? `(${correct.letter}) ${correct.text}` : '';
  };

  if (!mistakes || mistakes.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📝</span>
        <p className="empty-text">{emptyMessage || '暫無錯題'}</p>
        {emptyHint && <p className="empty-hint">{emptyHint}</p>}
      </div>
    );
  }

  return (
    <div className="mistake-list-container">
      {mistakes.map((mistake) => {
        const isExpanded = expandedId === mistake.id;
        const correctAnswer = getCorrectAnswer(mistake.options);
        
        return (
          <div 
            key={mistake.id}
            className={`mistake-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => handleCardClick(mistake.id)}
          >
            <div className="card-star">
              <StarButton 
                starred={mistake.starred || false} 
                onToggle={(state) => onStarToggle(mistake.id, state, mistake)}
              />
            </div>

            <div className="mistake-chapter-tag">
              {mistake.subjectId} / {mistake.unitId}
            </div>

            <div className="mistake-content">
              <div className="mistake-header">
                <span className="mistake-icon">📝</span>
              </div>
              
              <div className="mistake-title">{mistake.questionText || '錯題'}</div>
              
              <div className="mistake-tags">
                <span className="tag">#{mistake.conceptId}</span>
              </div>
              
              <div className="divider"></div>
              
              <div className="mistake-description">
                {mistake.aiSummary || mistake.questionText}
              </div>
            </div>

            {isExpanded && (
              <div className="mistake-detail" onClick={(e) => e.stopPropagation()}>
                <div className="divider"></div>
                
                <div className="question-stem">
                  <span className="stem-text">題目</span>
                  <p className="stem-content">{mistake.studentQuestion || mistake.questionText}</p>
                </div>
                
                <div className="options">
                  {mistake.options?.map((option) => (
                    <div 
                      key={option.letter}
                      className={`option ${selectedAnswers[mistake.id] === option.letter ? 'selected' : ''}`}
                      onClick={(e) => handleOptionClick(e, mistake.id, option.letter, option.isCorrect)}
                    >
                      <span className="option-letter">({option.letter})</span>
                      <span className="option-text">{option.text}</span>
                    </div>
                  ))}
                </div>
                
                {showResults[mistake.id] && (
                  <div className="answer-section">
                    <div className="answer">
                      <span className="answer-label">答案</span>
                      <span className="answer-text">{correctAnswer}</span>
                    </div>
                    <div className="explanation">
                      <span className="explanation-label">解析</span>
                      <p className="explanation-text">{mistake.fullExplanation || mistake.aiSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="expand-hint" onClick={(e) => e.stopPropagation()}>
              <span>{isExpanded ? '點擊收合 ▲' : '點擊展開 ▼'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MistakeList;