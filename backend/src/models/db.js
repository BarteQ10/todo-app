/**
 * Database model module
 * Handles database connection and schema creation
 */
const sqlite3 = require('sqlite3').verbose();
const { dbFile } = require('../config/db');

const db = new sqlite3.Database(dbFile);

/**
 * Initialize database and create required tables if they don't exist
 * Creates users and todos tables with appropriate schema
 */
function init() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    // Todos table
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
    
    console.log('Connected to SQLite database and tables created');
  });
}

module.exports = {
  db,
  init
};