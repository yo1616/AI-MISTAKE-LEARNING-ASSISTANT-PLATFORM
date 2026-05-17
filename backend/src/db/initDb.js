const fs = require('fs');
const path = require('path');
const { openDatabase, defaultDbPath } = require('./connection');

const schemaPath = path.join(__dirname, 'schema.sql');
const dbPath = process.env.DATABASE_PATH || defaultDbPath;

function initDb() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const schema = fs.readFileSync(schemaPath, 'utf8');
  const db = openDatabase(dbPath);

  try {
    db.exec(schema);
    console.log(`Database initialized at ${dbPath}`);
  } finally {
    db.close();
  }
}

if (require.main === module) {
  initDb();
}

module.exports = { initDb };
