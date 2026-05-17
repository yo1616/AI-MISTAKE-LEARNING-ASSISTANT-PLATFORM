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
    const unitsWithConcepts = unitsResult.data.map(unit => ({
      id: unit.id,
      name: unit.name,           // 確保有 name
      concepts: conceptsResult.data.filter(c => c.unitId === unit.id)
    }));
    setUnits(unitsWithConcepts);
  }
};

  const handleSelectConcept = (conceptId, conceptName, unitName) => {
  setSelectedConceptId(conceptId);
  setTimeout(() => {
    navigate(`/mistake/${conceptId}`, { state: { conceptName, unitName } });
  }, 150);
};

  return (
    <div className="chapter-page">
      <div className="chapter-container">
        <PageHeader title="Mistake Notebook" />
        <div className="chapter-card">
          <div className="chapter-title">章節列表</div>
          <div className="unit-list">
            {units.map(unit => (
              <UnitSection
                key={unit.id}
                unit={unit}
                concepts={unit.concepts}
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