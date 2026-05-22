import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getUnits } from '../services/api';
import { getSubUnitsByUnitId } from '../data/subUnitMapping';

function ChapterListPage() {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [selectedSubUnit, setSelectedSubUnit] = useState(null);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const unitsData = await getUnits('subject_bio');
      
      const unitsWithSubUnits = unitsData.map(unit => ({
        ...unit,
        subUnits: getSubUnitsByUnitId(unit.id)
      }));
      
      setUnits(unitsWithSubUnits);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnit(expandedUnit === unitId ? null : unitId);
  };

  const handleSelectSubUnit = (subUnitId, subUnitName, unitName) => {
    setSelectedSubUnit(subUnitId);
    navigate(`/mistake/${subUnitId}`, { state: { subUnitName, unitName } });
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="chapter-page">
      <div className="chapter-container">
        <PageHeader title="錯題列表" />
        <div className="chapter-card">
          <div className="chapter-title">章節列表</div>
          <div className="unit-list">
            {units.length === 0 ? (
              <div className="empty-state">暫無章節資料</div>
            ) : (
              units.map(unit => (
                <div key={unit.id}>
                  {/* 單元項目 */}
                  <div 
                    className={`unit-item ${expandedUnit === unit.id ? 'selected' : ''}`}
                    onClick={() => toggleUnit(unit.id)}
                  >
                    <span className="unit-name">{unit.name}</span>
                    <span className={`unit-arrow ${expandedUnit === unit.id ? 'expanded' : ''}`}>▶</span>
                  </div>
                  
                  {/* 子單元列表 */}
                  {expandedUnit === unit.id && unit.subUnits.length > 0 && (
                    <div className="sub-lesson-list show">
                      {unit.subUnits.map(sub => (
                        <div
                          key={sub.id}
                          className={`sub-lesson-item ${selectedSubUnit === sub.id ? 'selected' : ''}`}
                          onClick={() => handleSelectSubUnit(sub.id, sub.name, unit.name)}
                        >
                          <span className="sub-lesson-name">
                            {sub.code} {sub.name}
                          </span>
                          <span className="sub-lesson-arrow">›</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterListPage;