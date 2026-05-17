import React, { useState } from 'react';

function UnitSection({ unit, concepts, selectedConceptId, onSelectConcept }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="unit-item" onClick={() => setExpanded(!expanded)}>
        <span className="unit-name">{unit.name}</span>
        <span className={`unit-arrow ${expanded ? 'expanded' : ''}`}>▶</span>
      </div>
      <div className={`sub-lesson-list ${expanded ? 'show' : ''}`}>
        {concepts?.map((concept) => (
          <div 
            key={concept.id}
            className={`sub-lesson-item ${selectedConceptId === concept.id ? 'selected' : ''}`}
            onClick={() => onSelectConcept(concept.id, concept.name)}
            >
            <span className="sub-lesson-name">{concept.name}</span>
            <span className="sub-lesson-arrow">›</span>
            </div>
        ))}
      </div>
    </>
  );
}

export default UnitSection;