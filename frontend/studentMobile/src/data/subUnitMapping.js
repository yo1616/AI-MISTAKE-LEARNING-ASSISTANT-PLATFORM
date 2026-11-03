// 前端子章節映射表（不需要後端 API）
export const subUnitMapping = {
  // 單元一
  '心臟與血管': { id: 'subunit_bio_01_01', unitId: 'unit_bio_01', code: '1-1' },
  '體循環與肺循環': { id: 'subunit_bio_01_02', unitId: 'unit_bio_01', code: '1-2' },
  // 單元二
  '呼吸器官': { id: 'subunit_bio_02_01', unitId: 'unit_bio_02', code: '2-1' },
  '肺泡與氣體交換': { id: 'subunit_bio_02_02', unitId: 'unit_bio_02', code: '2-2' },
  '呼吸作用與能量': { id: 'subunit_bio_02_03', unitId: 'unit_bio_02', code: '2-3' },
  // 單元三
  '葉綠體與光合色素': { id: 'subunit_bio_03_01', unitId: 'unit_bio_03', code: '3-1' },
  '光反應': { id: 'subunit_bio_03_02', unitId: 'unit_bio_03', code: '3-2' },
  '碳反應': { id: 'subunit_bio_03_03', unitId: 'unit_bio_03', code: '3-3' },
};

// 根據單元 ID 獲取所有子章節
export const getSubUnitsByUnitId = (unitId) => {
  return Object.entries(subUnitMapping)
    .filter(([_, info]) => info.unitId === unitId)
    .map(([name, info]) => ({
      id: info.id,
      name: name,
      code: info.code,
      unitId: info.unitId,
    }));
};

// 根據子章節名稱獲取 ID
export const getSubUnitId = (subUnitName) => {
  return subUnitMapping[subUnitName]?.id || null;
};

// 根據 ID 獲取子章節資訊
export const getSubUnitById = (subUnitId) => {
  for (const [name, info] of Object.entries(subUnitMapping)) {
    if (info.id === subUnitId) {
      return { id: info.id, name, code: info.code, unitId: info.unitId };
    }
  }
  return null;
};
