import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getConceptNotes, toggleConceptNoteStar } from '../data/mockApi';

function ConceptPage() {
  const [conceptNotes, setConceptNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
  const result = await getConceptNotes();
  console.log('getConceptNotes 結果:', result);
  if (result.success) {
    setConceptNotes(result.data);
  }
};

  const handleStarToggle = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
    await loadNotes();
  };

  return (
    <div className="concept-page">
      <div className="concept-container">
        <PageHeader title="觀念" />
        <ConceptList
          items={conceptNotes}
          
          onStarToggle={handleStarToggle}
          emptyMessage="暫無知識點筆記"
          emptyHint="在聊天中讓 AI 幫你整理筆記"
        />
      </div>
    </div>
  );
}

export default ConceptPage;