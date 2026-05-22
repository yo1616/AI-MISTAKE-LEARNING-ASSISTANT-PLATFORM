import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getStudentConceptNotes, toggleConceptNoteStar } from '../services/api';

function ImportantConceptPage() {
  const navigate = useNavigate();
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImportantConcepts();
  }, []);

  const loadImportantConcepts = async () => {
    try {
      setLoading(true);
      // 獲取所有概念筆記，然後過濾 starred = true
      const allNotes = await getStudentConceptNotes();
      console.log('所有筆記:', allNotes);
      
      // 只顯示有星星的筆記
      const importantNotes = allNotes.filter(note => note.starred === true);
      console.log('重要筆記:', importantNotes);
      
      setConcepts(importantNotes);
    } catch (error) {
      console.error('載入重要觀念失敗:', error);
      setConcepts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async (noteId, starred) => {
    try {
      await toggleConceptNoteStar(noteId, starred);
      // 重新載入
      await loadImportantConcepts();
    } catch (error) {
      console.error('切換收藏失敗:', error);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="important-concept-page">
      <div className="important-concept-container">
        <PageHeader title="重要觀念" />
        <ConceptList
          items={concepts}
          onStarToggle={handleStarToggle}
          emptyMessage="暫無重要觀念"
          emptyHint="在觀念筆記中點擊星星標記重要內容"
        />
      </div>
    </div>
  );
}

export default ImportantConceptPage;