import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getStudentConceptNotes, toggleConceptNoteStar, getConcepts, getUnits, getStudentMistakes } from '../services/api';

function buildConceptNotesViewModel(notesData, conceptsData, unitsData, mistakesData) {
  const simplifyUnitName = (name = '') => name.replace(/^單元[一二三四五六七八九十0-9]+\s*/, '').trim();

  const unitMap = new Map();
  unitsData.forEach(unit => {
    unitMap.set(unit.id, {
      name: simplifyUnitName(unit.name),
      order: unit.unitOrder
    });
  });

  const conceptMap = new Map();
  conceptsData.forEach(concept => {
    conceptMap.set(concept.id, concept);
  });

  const mistakeCountMap = new Map();
  mistakesData.forEach(mistake => {
    const conceptId = mistake.conceptId;
    mistakeCountMap.set(conceptId, (mistakeCountMap.get(conceptId) || 0) + 1);
  });

  const getChapterNumber = (order) => {
    const mainChapter = Math.ceil(order / 3);
    const subChapter = ((order - 1) % 3) + 1;
    return `${mainChapter}-${subChapter}`;
  };

  return notesData.map(note => {
    const concept = conceptMap.get(note.conceptId);
    const unitId = note.unitId || concept?.unitId;
    const unitOrder = unitMap.get(unitId)?.order;
    
    return {
      id: note.id,
      noteTitle: note.noteTitle,
      noteContent: note.noteContent,
      starred: note.starred || false,
      conceptId: note.conceptId,
      conceptName: concept?.name || note.conceptName || note.conceptId,
      unitId: unitId,
      unitName: simplifyUnitName(note.unitName || unitMap.get(unitId)?.name || '未分類'),
      subUnitName: note.subUnitName || concept?.subUnitName || '',
      unitDisplayNumber: unitOrder ? getChapterNumber(unitOrder) : '1-1',
      mistakeCount: mistakeCountMap.get(note.conceptId) || 0,
      linkedMistakes: [],
      createdAt: note.createdAt
    };
  });
}

function ConceptPage() {
  const [conceptNotes, setConceptNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notesData, conceptsData, unitsData, mistakesData] = await Promise.all([
        getStudentConceptNotes(),
        getConcepts({ subjectId: 'subject_bio' }),
        getUnits('subject_bio'),
        getStudentMistakes()
      ]);

      const normalizedNotes = buildConceptNotesViewModel(notesData, conceptsData, unitsData, mistakesData);
      setConceptNotes(normalizedNotes);
    } catch (error) {
      console.error('載入失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = async (noteId, starred) => {
    try {
      await toggleConceptNoteStar(noteId, starred);
      await loadData();
    } catch (error) {
      console.error('收藏失敗:', error);
    }
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

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

export { buildConceptNotesViewModel };
export default ConceptPage;
