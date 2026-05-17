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