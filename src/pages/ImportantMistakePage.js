import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar } from '../services/api';

function ImportantMistakePage() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImportantMistakes();
  }, []);

  const loadImportantMistakes = async () => {
    try {
      setLoading(true);
      // 獲取所有錯題，然後過濾 starred = true
      const allMistakes = await getStudentMistakes();
      console.log('所有錯題:', allMistakes);
      
      // 只顯示有星星的錯題
      const importantMistakes = allMistakes.filter(m => m.starred === true);
      console.log('重要錯題:', importantMistakes);
      
      setMistakes(importantMistakes);
    } catch (error) {
      console.error('載入重要錯題失敗:', error);
      setMistakes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async (mistakeId, starred) => {
    try {
      await toggleMistakeStar(mistakeId, starred);
      await loadImportantMistakes();
    } catch (error) {
      console.error('切換收藏失敗:', error);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="important-mistake-page">
      <div className="important-mistake-container">
        <PageHeader title="重要錯題" />
        <MistakeList
          mistakes={mistakes}
          onStarToggle={handleStarToggle}
          emptyMessage="暫無重要錯題"
          emptyHint="在錯題本中點擊星星標記重要題目"
        />
      </div>
    </div>
  );
}

export default ImportantMistakePage;