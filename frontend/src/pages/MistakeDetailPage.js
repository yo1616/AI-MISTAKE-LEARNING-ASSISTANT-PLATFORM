import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar } from '../data/mockApi';
import { useFavorites } from '../data/FavoritesContext';

function MistakeDetailPage() {
  const { chapterId } = useParams();  // 例如: 'concept_bio_003'
  const navigate = useNavigate();
  const { loadFavoritedMistakes } = useFavorites();
  const [questions, setQuestions] = useState([]);


  useEffect(() => {
    loadMistakes();
  }, [chapterId]);

  const loadMistakes = async () => {
    // 用 conceptId 查詢該概念的錯題
    const result = await getStudentMistakes({ conceptId: chapterId });
    console.log('查詢結果:', result);  // 檢查是否有資料
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

  return (
    <div className="mistake-detail-page">
      <div className="mistake-detail-container">
        <PageHeader title={`Mistake Notebook / ${chapterId}`} />
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