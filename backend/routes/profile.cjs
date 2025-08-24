const express = require('express');
const { db } = require('../models/database.cjs');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, (req, res) => {
  db.get(
    `SELECT 
      u.id, u.username, u.email, u.profile_picture, u.created_at, 
      u.study_streak, u.total_flashcards, u.total_studied, u.quiz_accuracy,
      s.theme, s.shuffle_default, s.daily_reminders, s.default_study_mode
     FROM users u 
     LEFT JOIN user_settings s ON u.id = s.user_id 
     WHERE u.id = ?`,
    [req.user.userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Calculate quiz accuracy
      db.get(
        `SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_sessions
         FROM study_sessions 
         WHERE user_id = ?`,
        [req.user.userId],
        (err, stats) => {
          if (err) {
            console.error('Stats error:', err);
          }

          const accuracy = stats && stats.total_sessions > 0 
            ? (stats.correct_sessions / stats.total_sessions) * 100 
            : 0;

          res.json({
            ...user,
            quiz_accuracy: Math.round(accuracy * 100) / 100
          });
        }
      );
    }
  );
});

// Update user profile
router.put('/', authenticateToken, (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  db.run(
    'UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [username, email, req.user.userId],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Get user settings
router.get('/settings', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [req.user.userId],
    (err, settings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!settings) {
        // Create default settings if they don't exist
        db.run(
          'INSERT INTO user_settings (user_id) VALUES (?)',
          [req.user.userId],
          function (err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create settings' });
            }

            res.json({
              theme: 'dark',
              shuffle_default: true,
              daily_reminders: true,
              default_study_mode: 'normal'
            });
          }
        );
      } else {
        res.json(settings);
      }
    }
  );
});

// Update user settings
router.put('/settings', authenticateToken, (req, res) => {
  const { theme, shuffle_default, daily_reminders, default_study_mode } = req.body;

  db.run(
    `UPDATE user_settings SET 
      theme = ?, 
      shuffle_default = ?, 
      daily_reminders = ?, 
      default_study_mode = ?
     WHERE user_id = ?`,
    [theme, shuffle_default, daily_reminders, default_study_mode, req.user.userId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update settings' });
      }

      res.json({ message: 'Settings updated successfully' });
    }
  );
});

module.exports = router;