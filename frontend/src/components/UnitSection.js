import React, { useState } from 'react';

function UnitSection({ unit, concepts, selectedConceptId, onSelectConcept }) {
  const [expanded, setExpanded] = useState(false);
  // 在 UnitSection 最上方加入
console.log('UnitSection received:', { unit, concepts });

  // 如果 unit 不存在，不渲染
  if (!unit) return null;

  const handleUnitClick = () => {
    setExpanded(!expanded);
  };

  const handleConceptClick = (conceptId, conceptName) => {
    if (onSelectConcept) {
      onSelectConcept(conceptId, conceptName, unit.name);
    }
  };

  return (
    <>
      <div className="unit-item" onClick={handleUnitClick}>
        <span className="unit-name">{unit.name}</span>
        <span className={`unit-arrow ${expanded ? 'expanded' : ''}`}>▶</span>
      </div>
      
      <div className={`sub-lesson-list ${expanded ? 'show' : ''}`}>
        {concepts && concepts.map((concept) => (
          <div 
            key={concept.id}
            className={`sub-lesson-item ${selectedConceptId === concept.id ? 'selected' : ''}`}
            onClick={() => handleConceptClick(concept.id, concept.name)}
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