const ALL_STUDENTS_CLASS_ID = 'all';

const DB_TO_PROTOTYPE_CLASS = {
  class_hs2_bio_01: {
    id: 'class_jh1_bio_01',
    name: '國一生物1班',
    gradeYear: '國一'
  },
  class_hs2_phys_01: {
    id: 'class_jh1_bio_02',
    name: '國一生物2班',
    gradeYear: '國一'
  },
  class_hs3_bio_01: {
    id: 'class_jh3_bio_review_01',
    name: '國三複習生物班',
    gradeYear: '國三'
  }
};

const PROTOTYPE_TO_DB_CLASS = Object.fromEntries(
  Object.entries(DB_TO_PROTOTYPE_CLASS).map(([dbClassId, prototype]) => [prototype.id, dbClassId])
);

function normalizeDashboardClassId(classId) {
  if (!classId || classId === ALL_STUDENTS_CLASS_ID) {
    return classId;
  }
  return PROTOTYPE_TO_DB_CLASS[classId] || classId;
}

function toPrototypeClass(row) {
  if (!row) {
    return row;
  }

  const prototype = DB_TO_PROTOTYPE_CLASS[row.classId || row.id];
  if (!prototype) {
    return row;
  }

  if (row.id) {
    return {
      ...row,
      id: prototype.id,
      name: prototype.name,
      gradeYear: prototype.gradeYear,
      subjectId: 'subject_bio',
      subjectName: '生物'
    };
  }

  return {
    ...row,
    classId: prototype.id,
    className: prototype.name,
    gradeYear: prototype.gradeYear,
    subjectId: row.subjectId ? 'subject_bio' : row.subjectId,
    subjectName: row.subjectName ? '生物' : row.subjectName
  };
}

function toPrototypeClassList(rows) {
  const mapped = rows
    .map(toPrototypeClass)
    .filter((row) => !row.subjectId || row.subjectId === 'subject_bio');
  const order = new Map([
    [ALL_STUDENTS_CLASS_ID, 0],
    ['class_jh1_bio_01', 1],
    ['class_jh1_bio_02', 2],
    ['class_jh3_bio_review_01', 3]
  ]);

  return ([
    { id: ALL_STUDENTS_CLASS_ID, name: '全部學生' },
    ...mapped
  ]).sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
}

module.exports = {
  ALL_STUDENTS_CLASS_ID,
  normalizeDashboardClassId,
  toPrototypeClass,
  toPrototypeClassList
};
