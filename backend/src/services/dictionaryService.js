const { openDatabase } = require('../db/connection');

function withDb(callback) {
  const db = openDatabase();
  try {
    return callback(db);
  } finally {
    db.close();
  }
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function mapSubjectRow(row) {
  return {
    id: row.subjectId,
    ...row
  };
}

function mapUnitRow(row) {
  return {
    id: row.unitId,
    ...row
  };
}

function mapSubUnitRow(row) {
  return {
    id: row.subUnitId,
    ...row
  };
}

function mapConceptRow(row) {
  return {
    id: row.conceptId,
    ...row,
    keywords: parseJsonArray(row.keywords)
  };
}

function getSubjects() {
  return withDb((db) => {
    const rows = db.prepare(`
      SELECT
        id AS subjectId,
        name,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM subjects
      ORDER BY name ASC, id ASC
    `).all();

    return rows.map(mapSubjectRow);
  });
}

function getUnitsBySubjectId(subjectId) {
  return withDb((db) => {
    const rows = db.prepare(`
      SELECT
        id AS unitId,
        subject_id AS subjectId,
        name,
        unit_order AS unitOrder,
        is_fixed AS isFixed,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM units
      WHERE subject_id = ?
      ORDER BY unit_order ASC, name ASC, id ASC
    `).all(subjectId);

    return rows.map((row) => ({
      ...mapUnitRow(row),
      isFixed: Boolean(row.isFixed)
    }));
  });
}

function getSubUnitsByUnitId(unitId) {
  return withDb((db) => {
    const rows = db.prepare(`
      SELECT
        id AS subUnitId,
        unit_id AS unitId,
        code,
        name,
        sub_unit_order AS subUnitOrder,
        is_fixed AS isFixed,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM sub_units
      WHERE unit_id = ?
      ORDER BY sub_unit_order ASC, name ASC, id ASC
    `).all(unitId);

    return rows.map((row) => ({
      ...mapSubUnitRow(row),
      isFixed: Boolean(row.isFixed)
    }));
  });
}

function getConcepts(filters = {}) {
  return withDb((db) => {
    const conditions = ['status = ?'];
    const params = ['active'];

    if (filters.subjectId) {
      conditions.push('subject_id = ?');
      params.push(filters.subjectId);
    }

    if (filters.unitId) {
      conditions.push('unit_id = ?');
      params.push(filters.unitId);
    }

    if (filters.subUnitId) {
      conditions.push('sub_unit_id = ?');
      params.push(filters.subUnitId);
    }

    const rows = db.prepare(`
      SELECT
        id AS conceptId,
        subject_id AS subjectId,
        unit_id AS unitId,
        sub_unit_id AS subUnitId,
        name,
        keywords,
        status,
        created_by AS createdBy,
        source_session_id AS sourceSessionId,
        creation_reason AS creationReason,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM concepts
      WHERE ${conditions.join(' AND ')}
      ORDER BY name ASC, id ASC
    `).all(...params);

    return rows.map(mapConceptRow);
  });
}

module.exports = {
  getSubjects,
  getUnitsBySubjectId,
  getSubUnitsByUnitId,
  getConcepts
};
