import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import UnitSection from '../components/UnitSection';
import { getUnitsWithSubUnits } from '../data/mockApi';

function ChapterListPage() {
  const navigate = useNavigate();
   const [selectedSubUnitId, setSelectedSubUnitId] = useState(null);  // ← 定義這個
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    const result = await getUnitsWithSubUnits();
    if (result.success) {
      setUnits(result.data);
    }
    setLoading(false);
  };

  // 修改這裡：使用 subUnitId
  const handleSelectSubUnit = (subUnitId, subUnitName, unitName) => {
    console.log('點擊子章節:', { subUnitId, subUnitName, unitName });
    setSelectedSubUnitId(subUnitId);
    setTimeout(() => {
      navigate(`/mistake/${subUnitId}`, { state: { subUnitName, unitName } });
    }, 150);
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
            {units.map(unit => (
              <UnitSection
                key={unit.id}
                unit={unit}
                subUnits={unit.subUnits}
                selectedSubUnitId={selectedSubUnitId}
                onSelectSubUnit={handleSelectSubUnit}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterListPage;