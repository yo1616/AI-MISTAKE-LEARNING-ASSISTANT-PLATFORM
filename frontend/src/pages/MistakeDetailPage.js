import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar } from '../data/mockApi';
import { useFavorites } from '../data/FavoritesContext';

function MistakeDetailPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { loadFavoritedMistakes } = useFavorites();
  const [questions, setQuestions] = useState([]);

  // 從 location.state 取得名稱
  const conceptName = location.state?.conceptName || chapterId;
  const unitName = location.state?.unitName || '';

  useEffect(() => {
    loadMistakes();
  }, [chapterId]);

  const loadMistakes = async () => {
    const result = await getStudentMistakes({ conceptId: chapterId });
    if (result.success) {
      setQuestions(result.data);
    }
  };

  const handleStarToggle = async (questionId, newState) => {
    await toggleMistakeStar(questionId, newState);
    await loadMistakes();
    await loadFavoritedMistakes();
  };

  const handleBackToChapters = () => {
    navigate('/chapters');
  };

  // 組合標題
  const pageTitle = unitName 
    ? `Mistake Notebook /\n${unitName}\n/\n${conceptName}`
    : `Mistake Notebook /\n${conceptName}`;
    
  return (
    <div className="mistake-detail-page">
      <div className="mistake-detail-container">
        <PageHeader title={pageTitle} />
        
        <MistakeList 
          mistakes={questions}
          onStarToggle={handleStarToggle}
          emptyMessage="暫無錯題記錄"
          emptyHint=""
        />
        
        <div className="fixed-back-button">
          <button className="back-to-chapters-btn" onClick={handleBackToChapters}>
            <span className="btn-text">返回章節列表</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default MistakeDetailPage;