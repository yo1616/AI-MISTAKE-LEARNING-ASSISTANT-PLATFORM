const path = require('path');
const Database = require('better-sqlite3');

const defaultDbPath = path.join(__dirname, '..', '..', 'data', 'app.sqlite');

function openDatabase(dbPath = process.env.DATABASE_PATH || defaultDbPath) {
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  return db;
}

module.exports = {
  openDatabase,
  defaultDbPath
};
