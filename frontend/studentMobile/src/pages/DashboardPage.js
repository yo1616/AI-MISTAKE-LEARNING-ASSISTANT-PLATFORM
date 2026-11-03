import React, { useEffect, useState, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { getStudentName } from '../data/userData';
import {
  getStudentAnalyticsSummary,
  getStudentAnalyticsCharts
} from '../services/api';
import '../style/DashboardPage.css';

function normalizeDateRange(start, end, changedField) {
  if (!start || !end || new Date(start) <= new Date(end)) {
    return { start, end };
  }

  if (changedField === 'start') {
    return { start, end: start };
  }

  return { start: end, end };
}

function DashboardPage() {
  const [studentName, setStudentName] = useState('同學');
  const [summary, setSummary] = useState(null);
  const [unitDistribution, setUnitDistribution] = useState([]);
  const [weakTopics, setWeakTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    setStudentName(getStudentName());
  }, []);

  const buildAnalyticsQuery = (from, to) => ({
    range: 'custom',
    from,
    to,
    limit: 5
  });

  const loadData = useCallback(async (from = startDate, to = endDate) => {
    setLoading(true);
    try {
      const query = buildAnalyticsQuery(from, to);
      const [summaryData, chartsData] = await Promise.all([
        getStudentAnalyticsSummary(query),
        getStudentAnalyticsCharts(query)
      ]);

      const totalMistakeCount = summaryData?.totalMistakes || 0;

      const normalizedUnitDistribution = (chartsData?.unitDistribution || []).map((unit, index) => ({
        ...unit,
        name: unit.name || unit.unitName || unit.unitId || `單元 ${index + 1}`,
        count: unit.count || 0,
        percentage: totalMistakeCount > 0
          ? Math.round(((unit.count || 0) / totalMistakeCount) * 100)
          : 0,
        color: getUnitColor(index)
      }));

      const normalizedWeakTopics = (chartsData?.topWeakConcepts || chartsData?.conceptDistribution || [])
        .map((topic) => ({
          name: topic.conceptName || topic.name || '未命名知識點',
          count: topic.mistakeCount || topic.count || 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setSummary(summaryData || null);
      setUnitDistribution(normalizedUnitDistribution);
      setWeakTopics(normalizedWeakTopics);
    } catch (error) {
      console.error('載入分析表失敗:', error);
      setSummary({
        totalMistakes: 0,
        starredNotes: 0,
        generatedExamAccuracy: { accuracyRate: 0 }
      });
      setUnitDistribution([]);
      setWeakTopics([]);
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    loadData(startDate, endDate);
  }, [endDate, loadData, startDate]);

  const getUnitColor = (index) => {
    const colors = ['#95A4FC', '#BAEDBD', '#B1E3FF', '#A8C5DA', '#E3F5FF', '#FFD966'];
    return colors[index % colors.length];
  };

  const handleDateRangeChange = () => {
    const normalized = normalizeDateRange(startDate, endDate, 'end');
    if (normalized.start !== startDate) {
      setStartDate(normalized.start);
    }
    if (normalized.end !== endDate) {
      setEndDate(normalized.end);
    }

    loadData(normalized.start, normalized.end);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const maxCount = weakTopics.length > 0 ? Math.max(...weakTopics.map((topic) => topic.count), 1) : 1;
  const totalMistakes = summary?.totalMistakes || 0;
  const importantConceptCount = summary?.starredNotes || 0;
  const quizAccuracy = Math.round((summary?.generatedExamAccuracy?.accuracyRate || 0) * 100);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading">載入中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <PageHeader title="分析表" />

        <div className="welcome-section">
          <div className="greeting">{studentName}，你好</div>
        </div>

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

        <div className="stats-cards">
          <div className="stat-card blue-card">
            <div className="stat-title">總錯題數</div>
            <div className="stat-number">{totalMistakes}</div>
            <div className="trend-badge neutral-badge">
              <span className="trend-value neutral-value">依期間統計</span>
            </div>
          </div>
          <div className="stat-card gray-card">
            <div className="stat-title">重要觀念數</div>
            <div className="stat-number">{importantConceptCount}</div>
            <div className="trend-badge neutral-badge">
              <span className="trend-value neutral-value">依期間統計</span>
            </div>
          </div>
          <div className="stat-card green-card">
            <div className="stat-title">Quiz答對率</div>
            <div className="stat-number">{quizAccuracy}%</div>
            <div className="trend-badge neutral-badge">
              <span className="trend-value neutral-value">依期間統計</span>
            </div>
          </div>
        </div>

        <div className="divider-line"></div>

        <div className="error-distribution-title">錯誤分佈</div>

        <div className="error-distribution-card">
          <div className="error-distribution-row">
            <div className="chart-area">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {unitDistribution.map((unit, index) => {
                  if (unit.percentage === 0) return null;
                  const radius = 50;
                  const circumference = 2 * Math.PI * radius;
                  const dashArray = (unit.percentage / 100) * circumference;

                  let dashOffset = 0;
                  for (let i = 0; i < index; i += 1) {
                    dashOffset += (unitDistribution[i].percentage / 100) * circumference;
                  }

                  return (
                    <circle
                      key={unit.unitId || unit.name}
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
                <text x="60" y="55" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1C1C1E">
                  {totalMistakes}
                </text>
                <text x="60" y="75" textAnchor="middle" fontSize="10" fill="#8E8E93">
                  總錯題數
                </text>
              </svg>
            </div>

            <div className="error-tags-list">
              {unitDistribution.length === 0 && (
                <div className="empty-dashboard-text">這個期間內沒有錯題資料。</div>
              )}
              {unitDistribution.map((unit) => (
                <div key={unit.unitId || unit.name} className="error-tag-item">
                  <div className="error-tag-dot" style={{ backgroundColor: unit.color }}></div>
                  <span className="error-tag-name">{unit.name}</span>
                  <span className="error-tag-count">{unit.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-line"></div>

        <div className="section-title">常錯知識點</div>

        <div className="topics-section">
          {weakTopics.length === 0 ? (
            <div className="empty-dashboard-text">這個期間內沒有常錯知識點資料。</div>
          ) : (
            <>
              <div className="topics-list">
                {weakTopics.map((topic) => (
                  <div key={topic.name} className="topic-item">
                    <div className="topic-name">{topic.name}</div>
                  </div>
                ))}
              </div>

              <div className="progress-bars">
                {weakTopics.map((topic) => {
                  const percentage = (topic.count / maxCount) * 100;
                  return (
                    <div key={topic.name} className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              <div className="topic-counts">
                {weakTopics.map((topic) => (
                  <div key={topic.name} className="topic-count-item">
                    <span className="topic-count-number">{topic.count}</span>
                    <span className="topic-count-total"></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

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
              max={endDate}
              onChange={(e) => {
                const normalized = normalizeDateRange(e.target.value, endDate, 'start');
                setStartDate(normalized.start);
                setEndDate(normalized.end);
              }}
            />
            <button className="date-confirm-btn" onClick={() => setShowStartPicker(false)}>確認</button>
          </div>
        </>
      )}

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
              min={startDate}
              onChange={(e) => {
                const normalized = normalizeDateRange(startDate, e.target.value, 'end');
                setStartDate(normalized.start);
                setEndDate(normalized.end);
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
