const { openDatabase } = require('../db/connection');
const { toPrototypeClassList } = require('../utils/frontendPrototypeClassMap');

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function getTeacherClasses() {
  return withDb((db) => {
    const rows = db.prepare(`
    SELECT
      c.id,
      c.name,
      c.grade_year AS gradeYear,
      c.subject_id AS subjectId,
      s.name AS subjectName
    FROM classes c
    JOIN subjects s ON s.id = c.subject_id
    ORDER BY c.grade_year ASC, s.name ASC, c.name ASC
  `).all();

    return toPrototypeClassList(rows);
  });
}

module.exports = {
  getTeacherClasses
};
