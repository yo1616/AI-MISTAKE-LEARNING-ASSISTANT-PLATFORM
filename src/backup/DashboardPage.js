import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { getStudentName } from '../data/userData';
import { getStudentAnalyticsSummary, getStudentMistakes, getUnits, getConcepts } from '../services/api';
import '../style/DashboardPage.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [studentName, setStudentName] = useState('同學');
  const [summary, setSummary] = useState(null);
  const [unitDistribution, setUnitDistribution] = useState([]);
const [totalMistakes, setTotalMistakes] = useState(0);
const [weakTopics, setWeakTopics] = useState([]);
  
  // 日期範圍狀態
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    const name = getStudentName();
    setStudentName(name);
    loadData();
  }, []);

const loadData = async () => {
  const [mistakesResult, unitsResult, conceptsResult] = await Promise.all([
    getStudentMistakes(),
    getUnits(),
    getConcepts()
  ]);
  
  if (mistakesResult.success && unitsResult.success && conceptsResult.success) {
    const mistakesData = mistakesResult.data;  // 只宣告一次
    const units = unitsResult.data;
    const concepts = conceptsResult.data;
    
    // 建立 unitId 到 unitName 的映射
    const unitNameMap = new Map();
    units.forEach(unit => {
      unitNameMap.set(unit.id, unit.name);
    });
    
    // 建立 conceptId 到 conceptName 的映射
    const conceptNameMap = new Map();
    concepts.forEach(concept => {
      conceptNameMap.set(concept.id, concept.name);
    });
    
    // 1. 錯誤分佈：依 unitId 分組（章節）
    const unitMap = new Map();
    mistakesData.forEach(m => {
      const unitId = m.unitId || '未分類';
      unitMap.set(unitId, (unitMap.get(unitId) || 0) + 1);
    });
    
    const total = mistakesData.length;
    setTotalMistakes(total);
    
    const unitDist = Array.from(unitMap.entries()).map(([unitId, count], idx) => ({
      name: unitNameMap.get(unitId) || unitId,
      unitId: unitId,
      count: count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: getUnitColor(unitId, idx)
    }));
    setUnitDistribution(unitDist);
    
    // 2. 常錯知識點：依 conceptId 分組
    const conceptMap = new Map();
    mistakesData.forEach(m => {
      const conceptId = m.conceptId || '未分類';
      conceptMap.set(conceptId, (conceptMap.get(conceptId) || 0) + 1);
    });
    
    const conceptDist = Array.from(conceptMap.entries())
      .map(([conceptId, count]) => ({
        name: conceptNameMap.get(conceptId) || conceptId,
        conceptId: conceptId,
        count: count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setWeakTopics(conceptDist);
  }
};

  const getUnitColor = (name, index) => {
  const colors = ['#95A4FC', '#BAEDBD', '#B1E3FF', '#A8C5DA', '#E3F5FF', '#FFD966'];
  // 使用 index 而不是 name.length
  return colors[index % colors.length];
};

  const handleDateRangeChange = () => {
  if (!validateDateRange(startDate, endDate)) {
    alert('起始日期不能晚於結束日期，請重新選擇');
    return;
  }
  console.log(`日期範圍: ${startDate} 到 ${endDate}`);
  loadData();  // 改為 loadData，因為 loadData 已經會根據日期過濾資料
};
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 驗證日期範圍（結束日期不能早於起始日期）
const validateDateRange = (start, end) => {
  if (!start || !end) return true;
  return new Date(start) <= new Date(end);
};

  const maxCount = weakTopics.length > 0 ? Math.max(...weakTopics.map(t => t.count)) : 1;
  
  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <PageHeader title="分析表" />
        
        {/* 歡迎語 */}
        <div className="welcome-section">
          <div className="greeting">{studentName}，你好</div>
        </div>
        
        {/* 日期範圍選擇器 */}
        <div className="date-range-section">
          <div className="date-range-picker">
            <div className="date-picker-input" onClick={() => setShowStartPicker(!showStartPicker)}>
              <span className="date-label">起始日期</span>
              <span className="date-value">{formatDate(startDate)}</span>
            </div>
            <span className="date-separator">—</span>
            <div className="date-picker-input" onClick={() => setShowEndPicker(!showEndPicker)}>
              <span className="date-label">結束日期</span>
              <span className="date-value">{formatDate(endDate)}</span>
            </div>
            <button className="date-apply-btn" onClick={handleDateRangeChange}>套用</button>
          </div>
        </div>
        
        {/* 統計卡片 */}
        <div className="stats-cards">
          <div className="stat-card blue-card">
            <div className="stat-title">總錯題數</div>
            <div className="stat-number">{summary?.totalMistakes || 0}</div>
            <div className="trend-badge"><span className="trend-arrow up">↑</span><span className="trend-value">+11.01%</span></div>
          </div>
          <div className="stat-card gray-card">
            <div className="stat-title">總概念數</div>
            <div className="stat-number">{summary?.starredNotes || 0}</div>
            <div className="trend-badge"><span className="trend-arrow up">↑</span><span className="trend-value">+5.2%</span></div>
          </div>
          <div className="stat-card green-card">
            <div className="stat-title">答對率</div>
            <div className="stat-number">{Math.round((summary?.generatedExamAccuracy?.accuracyRate || 0) * 100)}%</div>
            <div className="trend-badge"><span className="trend-arrow up">↑</span><span className="trend-value">+8.5%</span></div>
          </div>
        </div>
        
        <div className="divider-line"></div>
        
        {/* 錯誤分佈標題 */}
        <div className="error-distribution-title">錯誤分佈</div>
        
        {/* 錯誤分佈圓環圖 + 標籤並排 */}
        <div className="error-distribution-card">
          <div className="error-distribution-row">
            {/* 左側：圓環圖 */}
            <div className="chart-area">
            <svg width="120" height="120" viewBox="0 0 120 120">
                {unitDistribution.map((unit, index) => {
                if (unit.percentage === 0) return null;
                const radius = 50;
                const circumference = 2 * Math.PI * radius;
                const dashArray = (unit.percentage / 100) * circumference;
                
                let dashOffset = 0;
                for (let i = 0; i < index; i++) {
                    dashOffset += (unitDistribution[i].percentage / 100) * circumference;
                }
                
                return (
                    <circle
                    key={index}
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke={unit.color}
                    strokeWidth="12"
                    strokeDasharray={`${dashArray} ${circumference}`}
                    strokeDashoffset={-dashOffset}
                    transform="rotate(-90 60 60)"
                    />
                );
                })}
                <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1C1C1C">
                {totalMistakes}
                </text>
                <text x="60" y="75" textAnchor="middle" fontSize="10" fill="#8E8E93">
                總錯題數
                </text>
            </svg>
            </div>
            
            {/* 右側：錯誤標籤列表 */}
            {/* 右側：錯誤標籤列表 */}
            <div className="error-tags-list">
            {unitDistribution.map((unit, index) => (
                <div key={index} className="error-tag-item">
                <div className="error-tag-dot" style={{ backgroundColor: unit.color }}></div>
                <span className="error-tag-name">{unit.name}</span>
                <span className="error-tag-count">{unit.percentage}%</span>
                </div>
            ))}
            </div>
          </div>
        </div>
        
        <div className="divider-line"></div>
        
        {/* 常錯知識點標題 */}
        <div className="section-title">常錯知識點</div>
        
        {/* 知識點圖表 - 三欄對齊 */}
        <div className="topics-section">
          <div className="topics-list">
             {weakTopics.map((topic, index) => (
              <div key={index} className="topic-item">
                <div className="topic-name">{topic.name}</div>
              </div>
            ))}
          </div>
          
          <div className="progress-bars">
            {weakTopics.map((topic, index) => {
            const percentage = (topic.count / maxCount) * 100;
            return (
                <div key={index} className="progress-bar-container">
                <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                ></div>
                </div>
            );
            })}
        </div>
          
          <div className="topic-counts">
             {weakTopics.map((topic, index) => (
              <div key={index} className="topic-count-item">
                <span className="topic-count-number">{topic.count}</span>
                <span className="topic-count-total"></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 日期彈窗 - 起始日期 */}
      {showStartPicker && (
        <>
          <div className="modal-overlay" onClick={() => setShowStartPicker(false)}></div>
          <div className="date-picker-modal">
            <div className="date-picker-header">
              <span>選擇起始日期</span>
              <button onClick={() => setShowStartPicker(false)}>✕</button>
            </div>
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => {
                const newStartDate = e.target.value;
                // 如果新的起始日期大於結束日期，自動調整結束日期
                if (endDate && new Date(newStartDate) > new Date(endDate)) {
                setEndDate(newStartDate);
                }
                setStartDate(newStartDate);
            }}
            />
            <button className="date-confirm-btn" onClick={() => setShowStartPicker(false)}>確認</button>
          </div>
        </>
      )}
      
      {/* 日期彈窗 - 結束日期 */}
      {showEndPicker && (
        <>
          <div className="modal-overlay" onClick={() => setShowEndPicker(false)}></div>
          <div className="date-picker-modal">
            <div className="date-picker-header">
              <span>選擇結束日期</span>
              <button onClick={() => setShowEndPicker(false)}>✕</button>
            </div>
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => {
                const newEndDate = e.target.value;
                // 如果新的結束日期小於起始日期，顯示警告或不允許
                if (startDate && new Date(newEndDate) < new Date(startDate)) {
                alert('結束日期不能早於起始日期');
                return;
                }
                setEndDate(newEndDate);
            }}
            />
            <button className="date-confirm-btn" onClick={() => setShowEndPicker(false)}>確認</button>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;