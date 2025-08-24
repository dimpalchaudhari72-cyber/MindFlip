const express = require('express');
const { db } = require('../models/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get all flashcards for user
router.get('/', authenticateToken, (req, res) => {
  const { category, search } = req.query;
  let query = 'SELECT * FROM flashcards WHERE user_id = ?';
  let params = [req.user.userId];

  if (category && category !== 'all') {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (question LIKE ? OR answer LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get categories for user
router.get('/categories', authenticateToken, (req, res) => {
  db.all(
    'SELECT DISTINCT category FROM flashcards WHERE user_id = ?',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      const categories = rows.map(row => row.category);
      res.json(categories);
    }
  );
});

// Create flashcard
router.post('/', authenticateToken, (req, res) => {
  const { question, answer, category = 'General', difficulty = 'Medium' } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Question and answer are required' });
  }

  db.run(
    'INSERT INTO flashcards (user_id, question, answer, category, difficulty) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, question, answer, category, difficulty],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create flashcard' });
      }

      // Update user stats
      db.run(
        'UPDATE users SET total_flashcards = total_flashcards + 1 WHERE id = ?',
        [req.user.userId]
      );

      res.status(201).json({
        message: 'Flashcard created successfully',
        flashcard: {
          id: this.lastID,
          question,
          answer,
          category,
          difficulty,
          created_at: new Date().toISOString()
        }
      });
    }
  );
});

// Update flashcard
router.put('/:id', authenticateToken, (req, res) => {
  const { question, answer, category, difficulty } = req.body;
  const flashcardId = req.params.id;

  db.run(
    'UPDATE flashcards SET question = ?, answer = ?, category = ?, difficulty = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
    [question, answer, category, difficulty, flashcardId, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update flashcard' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      res.json({ message: 'Flashcard updated successfully' });
    }
  );
});

// Delete flashcard
router.delete('/:id', authenticateToken, (req, res) => {
  const flashcardId = req.params.id;

  db.run(
    'DELETE FROM flashcards WHERE id = ? AND user_id = ?',
    [flashcardId, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete flashcard' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }

      // Update user stats
      db.run(
        'UPDATE users SET total_flashcards = total_flashcards - 1 WHERE id = ?',
        [req.user.userId]
      );

      res.json({ message: 'Flashcard deleted successfully' });
    }
  );
});

// Record study session
router.post('/:id/study', authenticateToken, (req, res) => {
  const { isCorrect, timeSpent = 0 } = req.body;
  const flashcardId = req.params.id;

  // Record study session
  db.run(
    'INSERT INTO study_sessions (user_id, flashcard_id, is_correct, time_spent) VALUES (?, ?, ?, ?)',
    [req.user.userId, flashcardId, isCorrect, timeSpent],
    (err) => {
      if (err) {
        console.error('Study session error:', err);
      }
    }
  );

  // Update flashcard stats
  const updateQuery = isCorrect 
    ? 'UPDATE flashcards SET times_studied = times_studied + 1, correct_answers = correct_answers + 1 WHERE id = ?'
    : 'UPDATE flashcards SET times_studied = times_studied + 1 WHERE id = ?';

  db.run(updateQuery, [flashcardId], (err) => {
    if (err) {
      console.error('Flashcard update error:', err);
    }
  });

  // Update user stats
  db.run(
    'UPDATE users SET total_studied = total_studied + 1 WHERE id = ?',
    [req.user.userId],
    (err) => {
      if (err) {
        console.error('User stats update error:', err);
      }
    }
  );

  res.json({ message: 'Study session recorded' });
});

module.exports = router;