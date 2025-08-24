const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../mindflip.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      profile_picture VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      study_streak INTEGER DEFAULT 0,
      total_flashcards INTEGER DEFAULT 0,
      total_studied INTEGER DEFAULT 0,
      quiz_accuracy REAL DEFAULT 0.0
    )
  `);

  // Flashcards table
  db.run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category VARCHAR(255) DEFAULT 'General',
      difficulty VARCHAR(50) DEFAULT 'Medium',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      times_studied INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Study sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS study_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      flashcard_id INTEGER NOT NULL,
      is_correct BOOLEAN NOT NULL,
      time_spent INTEGER DEFAULT 0,
      session_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (flashcard_id) REFERENCES flashcards (id) ON DELETE CASCADE
    )
  `);

  // User settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      theme VARCHAR(50) DEFAULT 'dark',
      shuffle_default BOOLEAN DEFAULT 1,
      daily_reminders BOOLEAN DEFAULT 1,
      notifications_enabled BOOLEAN DEFAULT 1,
      default_study_mode VARCHAR(50) DEFAULT 'normal',
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database initialized successfully');
};

module.exports = { db, initializeDatabase };