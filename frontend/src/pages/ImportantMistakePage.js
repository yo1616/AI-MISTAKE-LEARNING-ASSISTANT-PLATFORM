import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import MistakeList from '../components/MistakeList';
import { getStudentMistakes, toggleMistakeStar, getConcepts } from '../data/mockApi';
import { useFavorites } from '../data/FavoritesContext';

function ImportantMistakePage() {
  const [importantMistakes, setImportantMistakes] = useState([]);
  const [concepts, setConcepts] = useState([]);
  const { loadFavoritedMistakes } = useFavorites();

  useEffect(() => {
    loadMistakes();
    loadConcepts();
  }, []);

const loadMistakes = async () => {
  const result = await getStudentMistakes({ starredOnly: true });
  if (result.success) {
    setImportantMistakes(result.data);
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

  return (
    <div className="important-mistake-page">
      <div className="important-mistake-container">
        <PageHeader title="Important Mistake Notebook" />
        <MistakeList
          mistakes={importantMistakes}
          concepts={concepts}
          onStarToggle={handleStarToggle}
          emptyMessage="暫無重要錯題"
          emptyHint="在 Mistake Notebook 中點擊星標收藏錯題"
        />
      </div>
    </div>
  );
}

export default ImportantMistakePage;