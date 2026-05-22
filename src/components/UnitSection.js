import React, { useState } from 'react';

function UnitSection({ unit, subUnits, selectedSubUnitId, onSelectSubUnit }) {
  const [expanded, setExpanded] = useState(false);

  const handleUnitClick = () => {
    setExpanded(!expanded);
  };

  const handleSubUnitClick = (subUnitId, subUnitName) => {
    if (onSelectSubUnit) {
      onSelectSubUnit(subUnitId, subUnitName, unit.name);
    }
  };

  return (
    <>
      <div className="unit-item" onClick={handleUnitClick}>
        <span className="unit-name">{unit.name}</span>
        <span className={`unit-arrow ${expanded ? 'expanded' : ''}`}>▶</span>
      </div>
      
      <div className={`sub-lesson-list ${expanded ? 'show' : ''}`}>
        {subUnits && subUnits.map((subUnit) => (
          <div 
            key={subUnit.id}
            className={`sub-lesson-item ${selectedSubUnitId === subUnit.id ? 'selected' : ''}`}
            onClick={() => handleSubUnitClick(subUnit.id, subUnit.name)}
          >
            <span className="sub-lesson-name">{subUnit.name}</span>
            <span className="sub-lesson-arrow">›</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default UnitSection;