import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getConceptNotes, toggleConceptNoteStar } from '../data/mockApi';

function ImportantConceptPage() {
  const [favoritedNotes, setFavoritedNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const result = await getConceptNotes({ starredOnly: true });
    if (result.success) {
      setFavoritedNotes(result.data);
    }
  };

  const handleStarToggle = async (noteId, starred) => {
    await toggleConceptNoteStar(noteId, starred);
    await loadNotes();
  };

  return (
    <div className="important-concept-page">
      <div className="important-concept-container">
        <PageHeader title="Important Concept" />
        <ConceptList
          items={favoritedNotes}
          type="concept-note"
          onStarToggle={handleStarToggle}
          emptyMessage="暫無重要筆記"
          emptyHint="在 Concept 頁面點擊星標收藏筆記"
        />
      </div>
    </div>
  );
}

export default ImportantConceptPage;