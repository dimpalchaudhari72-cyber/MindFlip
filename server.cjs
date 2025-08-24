const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./backend/routes/auth.cjs');
const flashcardRoutes = require('./backend/routes/flashcards.cjs');
const profileRoutes = require('./backend/routes/profile.cjs');
const aiRoutes = require('./backend/routes/ai.cjs');
const { initializeDatabase } = require('./backend/models/database.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.options('*', cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'MindFlip API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 MindFlip server running on port ${PORT}`);
});