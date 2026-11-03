import React, { useState } from 'react';
import StarButton from './StarButton';

function ConceptList({ items, type, onStarToggle, emptyMessage, emptyHint }) {
  const [expandedId, setExpandedId] = useState(null);

  const getPreviewText = (content = '') => {
    const normalized = String(content).trim();
    if (normalized.length <= 72) {
      return normalized;
    }
    return `${normalized.slice(0, 72)}...`;
  };

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
        const previewText = getPreviewText(note.noteContent || '');
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
              [{note.unitDisplayNumber}] {note.unitName || '未分類'}
              {note.subUnitName ? ` / ${note.subUnitName}` : ''}
            </div>
            <div className="concept-divider"></div>
            <div className="concept-content">
              {isExpanded ? note.noteContent : previewText}
            </div>
            
            {isExpanded && (
              <div className="concept-expanded">
                <div className="concept-divider concept-expanded-divider"></div>
                <div className="concept-detail">相關錯題數：{note.mistakeCount || 0} 題</div>
                {note.createdAt ? <div className="concept-detail">建立時間：{String(note.createdAt).slice(0, 10)}</div> : null}
              </div>
            )}

            {isExpanded && note.linkedMistakes && note.linkedMistakes.length > 0 && (
              <div className="concept-expanded">
              </div>
            )}

            <div
              className="expand-hint"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(note.id);
              }}
            >
              <span>{isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ConceptList;
