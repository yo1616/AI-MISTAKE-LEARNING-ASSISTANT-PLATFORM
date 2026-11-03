const demoData = require('../seeds/feature-demo-data.json');

const subjectMap = new Map((demoData.subjects || []).map((subject) => [subject.id, subject]));
const unitMap = new Map((demoData.units || []).map((unit) => [unit.id, unit]));
const subUnitMap = new Map((demoData.subUnits || []).map((subUnit) => [subUnit.id, subUnit]));

function getConceptCatalog() {
  return (demoData.concepts || [])
    .filter((concept) => concept.status !== 'inactive')
    .map((concept) => {
      const subject = subjectMap.get(concept.subjectId);
      const unit = unitMap.get(concept.unitId);
      const subUnit = subUnitMap.get(concept.subUnitId);

      return {
        id: concept.id,
        conceptId: concept.id,
        conceptName: concept.name,
        name: concept.name,
        subjectId: concept.subjectId,
        subjectName: subject?.name || '',
        unitId: concept.unitId,
        unitName: unit?.name || '',
        subUnitId: concept.subUnitId || '',
        subUnitName: subUnit?.name || '',
        chapter: [unit?.name, subUnit?.name].filter(Boolean).join(' / '),
        keywords: Array.isArray(concept.keywords) ? concept.keywords : []
      };
    });
}

function getConceptById(conceptId) {
  return getConceptCatalog().find((concept) => concept.id === conceptId) || null;
}

module.exports = {
  getConceptCatalog,
  getConceptById
};
