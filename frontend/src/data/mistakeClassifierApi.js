// src/data/mistakeClassifierApi.js
// 這個檔案模擬後端 API 的回應

export const callClassifierAPI = async (question, answer) => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 模擬後端回傳的分類結果
  return {
    success: true,
    data: {
      conceptId: 'concept_bio_003',
      conceptName: '氣體交換',
      unitId: 'unit_bio_02',
      subUnitId: 'subunit_bio_02_02',
      isNewConcept: false,
      confidence: 0.92,
      explanation: '問題核心為氣體交換機制'
    }
  };
};