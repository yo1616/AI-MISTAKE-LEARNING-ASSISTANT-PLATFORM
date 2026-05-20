import React, { useState } from 'react';
import StarButton from './StarButton';

function ConceptList({ items, type, onStarToggle, emptyMessage, emptyHint }) {
  const [expandedId, setExpandedId] = useState(null);

  const handleCardClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!items || items.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-text">{emptyMessage || '暫無資料'}</p>
        {emptyHint && <p className="empty-hint">{emptyHint}</p>}
      </div>
    );
  }

  
  // 知識點筆記類型
  return (
    <div className="concept-list-container">
      {items.map((note) => {
        const isExpanded = expandedId === note.id;
        return (
          <div 
            key={note.id}
            className={`concept-card ${isExpanded ? 'expanded' : ''}`}
            onClick={() => handleCardClick(note.id)}
          >
            <div className="concept-header">
              <div className="concept-title">{note.noteTitle || '筆記'}</div>
              <div className="card-star">
                <StarButton 
                  starred={note.starred || false} 
                  onToggle={(state) => onStarToggle(note.id, state, note)}
                />
              </div>
            </div>
            <div className="concept-location">
            [{note.unitDisplayNumber}]
            </div>
            <div className="concept-divider"></div>
            <div className="concept-content">{note.noteContent}</div>
            
            {isExpanded && note.linkedMistakes && note.linkedMistakes.length > 0 && (
              <div className="concept-expanded">
                <div className="concept-divider"></div>
                <div className="concept-detail">
                  相關錯題數：{note.linkedMistakes.length}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ConceptList;