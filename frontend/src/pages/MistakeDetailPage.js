import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar, getConcepts } from '../data/mockApi';
import { useFavorites } from '../data/FavoritesContext';

function MistakeDetailPage() {
  const { chapterId } = useParams();  // 這裡是 subUnitId
  const navigate = useNavigate();
  const location = useLocation();
  const { loadFavoritedMistakes } = useFavorites();
  const [questions, setQuestions] = useState([]);
  const [concepts, setConcepts] = useState([]);
  
  const subUnitName = location.state?.subUnitName || chapterId;
   const unitName = location.state?.unitName || '';

  useEffect(() => {
    loadMistakes();
    loadConcepts();
  }, [chapterId]);

  const loadMistakes = async () => {
  console.log('查詢的 subUnitId:', chapterId);
  const result = await getStudentMistakes({ subUnitId: chapterId });
  console.log('API 回傳結果:', result);
  if (result.success) {
    console.log('找到的錯題數量:', result.data.length);
    setQuestions(result.data);
  }
};

const loadConcepts = async () => {
    const result = await getConcepts();
    if (result.success) {
      setConcepts(result.data);
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
        <PageHeader title={`錯題列表 ${subUnitName}`} />
        <MistakeList
          mistakes={questions}
          concepts={concepts}
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