// src/utils/mistakeClassifier.js

// 關鍵字對應表
const keywordMapping = {
  concepts: {
    '肺泡|氣體|交換|氧氣|二氧化碳': { 
      conceptId: 'concept_bio_003', 
      name: '氣體交換', 
      unitId: 'unit_bio_02', 
      subUnitId: 'subunit_bio_02_02' 
    },
    '循環|心臟|血液|體循環|肺循環': { 
      conceptId: 'concept_bio_001', 
      name: '血液循環方向', 
      unitId: 'unit_bio_01', 
      subUnitId: 'subunit_bio_01_02' 
    },
    '光合|葉綠|光能|葡萄糖': { 
      conceptId: 'concept_bio_005', 
      name: '光合作用', 
      unitId: 'unit_bio_03', 
      subUnitId: 'subunit_bio_03_01' 
    },
    '呼吸|ATP|能量|細胞呼吸': { 
      conceptId: 'concept_bio_004', 
      name: '呼吸作用', 
      unitId: 'unit_bio_02', 
      subUnitId: 'subunit_bio_02_03' 
    },
    '葉綠體|葉綠素': { 
      conceptId: 'concept_bio_006', 
      name: '葉綠體功能', 
      unitId: 'unit_bio_03', 
      subUnitId: 'subunit_bio_03_02' 
    }
  },
  default: {
    conceptId: 'concept_bio_003',
    name: '氣體交換',
    unitId: 'unit_bio_02',
    subUnitId: 'subunit_bio_02_02'
  }
};

// 分類問題
export const classifyQuestion = (question) => {
  for (const [pattern, result] of Object.entries(keywordMapping.concepts)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(question)) {
      return {
        ...result,
        confidence: 0.85,
        method: 'keyword_match'
      };
    }
  }
  
  return {
    ...keywordMapping.default,
    confidence: 0.5,
    method: 'default'
  };
};

// 判斷是否為新概念
export const isNewConcept = (question, matchedConceptId) => {
  const newConceptKeywords = ['ATP', '能量轉換', '光能轉換'];
  for (const keyword of newConceptKeywords) {
    if (question.includes(keyword) && matchedConceptId === 'concept_bio_005') {
      return {
        isNew: true,
        newConceptId: 'concept_bio_007',
        newConceptName: '能量轉換',
        reason: '題目主軸為能量轉換，非單純光合作用'
      };
    }
  }
  return { isNew: false };
};
