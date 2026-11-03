import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar } from '../services/api';
import { getSubUnitById } from '../data/subUnitMapping';

function MistakeDetailPage() {
  const { chapterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); 
  const { subUnitName, unitName } = location.state || {};
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('錯題列表');

  useEffect(() => {
    // 根據 chapterId 獲取子章節資訊
    const subUnit = getSubUnitById(chapterId);
    if (subUnit) {
      setTitle(`${subUnit.code} ${subUnit.name}`);
    } else if (subUnitName) {
      setTitle(subUnitName);
    }
    loadMistakes();
  }, [chapterId]);

   const handleBackToChapters = () => {
    navigate('/chapters');
  };

  const loadMistakes = async () => {
    try {
      setLoading(true);
      // 使用 subUnitId 查詢錯題
      const data = await getStudentMistakes({ subUnitId: chapterId });
      setMistakes(data || []);
    } catch (error) {
      console.error('載入錯題失敗:', error);
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async (mistakeId, starred) => {
    try {
      await toggleMistakeStar(mistakeId, starred);
      await loadMistakes();
    } catch (error) {
      console.error('切換收藏失敗:', error);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="mistake-detail-page">
      <div className="mistake-detail-container">
        <PageHeader title={`錯題列表 ${title}`} />
        <MistakeList
          mistakes={mistakes}
          onStarToggle={handleStarToggle}
          emptyMessage="此章節暫無錯題"
          emptyHint="在測驗或聊天中回答錯誤的題目會自動記錄在這裡"
        />
         <div className="back-button-container">
          <button className="back-to-chapters-btn" onClick={handleBackToChapters}>
            <span className="btn-text">返回章節列表</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MistakeDetailPage;
