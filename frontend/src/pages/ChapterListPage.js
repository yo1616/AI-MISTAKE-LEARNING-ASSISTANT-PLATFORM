import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import UnitSection from '../components/UnitSection';
import { getUnits, getConcepts } from '../data/mockApi';

function ChapterListPage() {
  const navigate = useNavigate();
  const [selectedConceptId, setSelectedConceptId] = useState(null);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    const [unitsResult, conceptsResult] = await Promise.all([
      getUnits(),
      getConcepts()
    ]);
    
    if (unitsResult.success && conceptsResult.success) {
      // 將 concepts 按 unitId 分組，作為 lessons
      const unitsWithLessons = unitsResult.data.map(unit => ({
        id: unit.id,
        name: unit.name,
        lessons: conceptsResult.data
          .filter(c => c.unitId === unit.id)
          .map(c => ({ id: c.id, name: c.name }))
      }));
      setUnits(unitsWithLessons);
    }
  };

const handleSelectConcept = (conceptId, conceptName) => {
  setSelectedConceptId(conceptId);
  setTimeout(() => {
    navigate(`/mistake/${conceptId}`);  // 確保 conceptId 有值
  }, 150);
};


  return (
    <div className="chapter-page">
      <div className="chapter-container">
        <PageHeader title="Mistake Notebook" />
        <div className="chapter-card">
          <div className="chapter-title">章節</div>
          <div className="unit-list">
            {units.map(unit => (
              <UnitSection
                key={unit.id}
                unit={unit}
                concepts={unit.lessons}
                selectedConceptId={selectedConceptId}
                onSelectConcept={handleSelectConcept}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterListPage;