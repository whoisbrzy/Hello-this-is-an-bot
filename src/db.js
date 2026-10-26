const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dir, { recursive: true });

const db = new Database(path.join(dir, 'bot.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS joins (
    user_id TEXT NOT NULL,
    guild_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tickets (
    channel_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    last_activity INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

module.exports = db;
