import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getConceptNotes, toggleConceptNoteStar } from '../data/mockApi';

function ConceptPage() {
  const [conceptTags, setConceptTags] = useState([]);
  const [conceptNotes, setConceptNotes] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const concepts = JSON.parse(localStorage.getItem('concepts') || '[]');
    setConceptTags(concepts);
    const notesResult = await getConceptNotes();
    if (notesResult.success) setConceptNotes(notesResult.data);
  };

  const handleNoteStarToggle = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
    await loadData();
  };

  return (
    <div className="concept-page">
      <div className="concept-container">
        <PageHeader title="Concept" />
        
        <div className="section-title">觀念標籤</div>
        <ConceptList
          items={conceptTags}
          type="concept-tag"
          onStarToggle={() => {}}
          emptyMessage="暫無觀念標籤"
        />
        
        <div className="section-title">知識點筆記</div>
        <ConceptList
          items={conceptNotes}
          type="concept-note"
          onStarToggle={handleNoteStarToggle}
          emptyMessage="暫無知識點筆記"
          emptyHint="在聊天中讓 AI 幫你整理筆記"
        />
      </div>
    </div>
  );
}

export default ConceptPage;