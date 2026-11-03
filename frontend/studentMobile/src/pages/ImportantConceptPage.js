import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getStudentConceptNotes, toggleConceptNoteStar, getConcepts, getUnits, getStudentMistakes } from '../services/api';
import { buildConceptNotesViewModel } from './ConceptPage';

function ImportantConceptPage() {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImportantConcepts();
  }, []);

  const loadImportantConcepts = async () => {
    try {
      setLoading(true);
      const [allNotes, conceptsData, unitsData, mistakesData] = await Promise.all([
        getStudentConceptNotes(),
        getConcepts({ subjectId: 'subject_bio' }),
        getUnits('subject_bio'),
        getStudentMistakes()
      ]);

      const importantNotes = allNotes.filter(note => note.starred === true);
      setConcepts(buildConceptNotesViewModel(importantNotes, conceptsData, unitsData, mistakesData));
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
