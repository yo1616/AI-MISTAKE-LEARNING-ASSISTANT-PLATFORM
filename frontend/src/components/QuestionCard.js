import React, { useState } from 'react';
import StarButton from './StarButton';

function QuestionCard({ question, onAnswerSelect, onStarToggle }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleCardClick = () => {
    setExpanded(!expanded);
    if (expanded) {
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleOptionClick = (e, letter, isCorrect) => {
    e.stopPropagation();
    setSelectedAnswer(letter);
    setShowResult(true);
    if (onAnswerSelect) {
      onAnswerSelect(letter, isCorrect, question.id);
    }
  };

  const correctOption = question.options?.find(opt => opt.isCorrect);
  const correctAnswer = correctOption ? `(${correctOption.letter}) ${correctOption.text}` : '';

  return (
    <div 
      className={`question-card ${expanded ? 'expanded' : ''}`}
      onClick={handleCardClick}
    >
      <div className="question-content">
        <div className="question-header">
          <div className="question-title">{question.questionText || question.title}</div>
          <div className="card-star">
            <StarButton 
              starred={question.starred || false} 
              onToggle={(state) => onStarToggle(question.id, state)}
            />
          </div>
        </div>
        
        <div className="question-tags">
          <span className="tag">#{question.conceptId || '未分類'}</span>
        </div>
        
        <div className="divider"></div>
        
        <div className="question-text">
          {question.aiSummary || question.description}
        </div>
      </div>

      {expanded && (
        <div className="question-detail" onClick={(e) => e.stopPropagation()}>
          <div className="divider"></div>
          
          <div className="question-stem">
            <span className="stem-text">題目</span>
            <p className="stem-content">{question.studentQuestion || question.stem || question.questionText}</p>
          </div>
          
          <div className="options">
            {question.options?.map((option) => (
              <div 
                key={option.letter}
                className={`option ${selectedAnswer === option.letter ? 'selected' : ''}`}
                onClick={(e) => handleOptionClick(e, option.letter, option.isCorrect)}
              >
                <span className="option-letter">({option.letter})</span>
                <span className="option-text">{option.text}</span>
              </div>
            ))}
          </div>
          
          {showResult && (
            <div className="answer-section">
              <div className="answer">
                <span className="answer-label">答案</span>
                <span className="answer-text">{correctAnswer}</span>
              </div>
              <div className="explanation">
                <span className="explanation-label">解析</span>
                <p className="explanation-text">{question.fullExplanation || question.explanation}</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="expand-hint" onClick={(e) => e.stopPropagation()}>
        <span>{expanded ? '點擊收合 ▲' : '點擊展開 ▼'}</span>
      </div>
    </div>
  );
}

export default QuestionCard;