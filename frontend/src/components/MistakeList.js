import React, { useState } from 'react';
import StarButton from './StarButton';

function MistakeList({ mistakes, onStarToggle, emptyMessage, emptyHint }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
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
        
        return (
          <div 
            key={mistake.id}
            className={`mistake-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => handleCardClick(mistake.id)}
          >
            <div className="card-star">
              <StarButton 
                starred={mistake.starred || false} 
                onToggle={(state) => onStarToggle(mistake.id, state)}
              />
            </div>

           

            <div className="mistake-content">
              
              
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
                
                {/* 直接顯示答案和解析，沒有選項 */}
                <div className="answer-section">
                  <div className="answer">
                    <span className="answer-label">答案</span>
                    <span className="answer-text">{mistake.correctAnswer || '無答案'}</span>
                  </div>
                  <div className="explanation">
                    <span className="explanation-label">解析</span>
                    <p className="explanation-text">{mistake.fullExplanation || mistake.aiSummary || '無解析'}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="expand-hint" onClick={(e) => e.stopPropagation()}>
              <span>{isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MistakeList;