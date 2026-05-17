import React from 'react';

function MistakeCard({ questionText, tags = [], aiSummary }) {
  return (
    <div className="mistake-card"> 
      <div className="card-title">{questionText}</div>
      <div className="card-tags">{tags.join(' ')}</div>
      <div className="card-divider"></div>
      <div className="card-content">{aiSummary}</div>
      <div className="placeholder-image"></div>
    </div>
  );
}

export default MistakeCard;
