import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import ConceptList from '../components/ConceptList';
import { getStudentConceptNotes, toggleConceptNoteStar, getConcepts, getUnits, getStudentMistakes } from '../services/api';

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
      
      // 建立 unitId 到 unitName 和 order 的映射
      const unitMap = new Map();
      unitsData.forEach(unit => {
        unitMap.set(unit.id, {
          name: unit.name,
          order: unit.unitOrder
        });
      });
      
      // 建立 conceptId 到 concept 的映射
      const conceptMap = new Map();
      conceptsData.forEach(concept => {
        conceptMap.set(concept.id, concept);
      });
      
      // 計算每個概念的錯題數
      const mistakeCountMap = new Map();
      mistakesData.forEach(mistake => {
        const conceptId = mistake.conceptId;
        mistakeCountMap.set(conceptId, (mistakeCountMap.get(conceptId) || 0) + 1);
      });
      
      // 生成章節編號的輔助函數（根據 order 產生 1-1, 1-2 格式）
      const getChapterNumber = (order) => {
        const mainChapter = Math.ceil(order / 3);
        const subChapter = ((order - 1) % 3) + 1;
        return `${mainChapter}-${subChapter}`;
      };
      
      // 標準化筆記資料
      const normalizedNotes = notesData.map(note => {
        const concept = conceptMap.get(note.conceptId);
        const unitId = concept?.unitId;
        const unitOrder = unitMap.get(unitId)?.order;
        
        return {
          id: note.id,
          noteTitle: note.noteTitle,
          noteContent: note.noteContent,
          starred: note.starred || false,
          conceptId: note.conceptId,
          conceptName: concept?.name || note.conceptId,
          unitId: unitId,
          unitName: unitMap.get(unitId)?.name || '未分類',
          unitDisplayNumber: unitOrder ? getChapterNumber(unitOrder) : '1-1',
          mistakeCount: mistakeCountMap.get(note.conceptId) || 0,
          linkedMistakes: [], // 後端可能需要另外取得
          createdAt: note.createdAt
        };
      });
      
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

export default ConceptPage;