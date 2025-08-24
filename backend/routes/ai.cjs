const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Extract text from image using OCR
router.post('/extract-text', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;

    // Use Tesseract.js for OCR
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    if (!text.trim()) {
      return res.status(400).json({ error: 'No text found in image' });
    }

    res.json({ text: text.trim() });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ error: 'Failed to extract text from image' });
  }
});

// Generate flashcards from text using AI (mock implementation)
router.post('/generate-flashcards', authenticateToken, async (req, res) => {
  try {
    const { text, count = 5 } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({ error: 'Text must be at least 50 characters long' });
    }

    // Mock AI flashcard generation (replace with actual OpenAI API call)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const flashcards = [];

    for (let i = 0; i < Math.min(count, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (sentence.length > 20) {
        // Simple question generation logic (replace with AI)
        const words = sentence.split(' ');
        const keyWord = words.find(w => w.length > 4) || words[0];
        
        flashcards.push({
          question: `What is the significance of "${keyWord}" in the context?`,
          answer: sentence,
          category: 'AI Generated',
          difficulty: 'Medium'
        });
      }
    }

    if (flashcards.length === 0) {
      return res.status(400).json({ error: 'Could not generate flashcards from the provided text' });
    }

    res.json({ flashcards });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

module.exports = router;