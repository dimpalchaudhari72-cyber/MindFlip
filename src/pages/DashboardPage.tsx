import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Shuffle, 
  Play, 
  Upload,
  BookOpen,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Flashcard from '../components/Flashcard';
import useDebounce from '../hooks/useDebounce';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  created_at: string;
  times_studied: number;
  correct_answers: number;
}

interface GeneratedCard {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

const DashboardPage = () => {
  const { user, token } = useAuth();
  const { isDark } = useTheme();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

  // Create form state
  const [newCard, setNewCard] = useState({
    question: '',
    answer: '',
    category: 'General',
    difficulty: 'Medium'
  });

  // AI form state
  const [aiText, setAiText] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchFlashcards = React.useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory !== 'all') queryParams.append('category', selectedCategory);
      if (debouncedSearchTerm) queryParams.append('search', debouncedSearchTerm);

      const response = await fetch(`http://localhost:5000/api/flashcards?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlashcards(data);
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, debouncedSearchTerm]);

  const fetchCategories = React.useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/flashcards/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchFlashcards();
    fetchCategories();
  }, [fetchFlashcards, fetchCategories]);

  const createFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCard),
      });

      if (response.ok) {
        setNewCard({ question: '', answer: '', category: 'General', difficulty: 'Medium' });
        setShowCreateModal(false);
        fetchFlashcards();
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating flashcard:', error);
    }
  };

  const deleteFlashcard = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/flashcards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchFlashcards();
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
    }
  };

  const recordStudySession = async (id: number, isCorrect: boolean) => {
    try {
      await fetch(`http://localhost:5000/api/flashcards/${id}/study`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isCorrect }),
      });

      // Move to next card in study mode
      if (studyMode && currentCardIndex < shuffledCards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else if (studyMode) {
        // End of study session
        setStudyMode(false);
        setCurrentCardIndex(0);
        fetchFlashcards(); // Refresh to show updated stats
      }
    } catch (error) {
      console.error('Error recording study session:', error);
    }
  };

  const startStudyMode = () => {
    if (flashcards.length > 0) {
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setShuffledCards(shuffled);
      setCurrentCardIndex(0);
      setStudyMode(true);
    }
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);

    try {
      let textToProcess = aiText;

      // If file is uploaded, extract text first
      if (aiFile) {
        const formData = new FormData();
        formData.append('image', aiFile);

        const extractResponse = await fetch('http://localhost:5000/api/ai/extract-text', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (extractResponse.ok) {
          const extractData = await extractResponse.json();
          textToProcess = extractData.text;
        } else {
          throw new Error('Failed to extract text from image');
        }
      }

      // Generate flashcards
      const generateResponse = await fetch('http://localhost:5000/api/ai/generate-flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: textToProcess, count: 5 }),
      });

      if (generateResponse.ok) {
        const generateData = await generateResponse.json();
        setGeneratedCards(generateData.flashcards);
      } else {
        throw new Error('Failed to generate flashcards');
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const saveGeneratedCard = async (card: GeneratedCard) => {
    try {
      const response = await fetch('http://localhost:5000/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(card),
      });

      if (response.ok) {
        fetchFlashcards();
        fetchCategories();
        // Remove from generated cards
        setGeneratedCards(generatedCards.filter(c => c !== card));
      }
    } catch (error) {
      console.error('Error saving generated card:', error);
    }
  };

  // The backend handles filtering, so we can use the flashcards state directly.
  const filteredCards = flashcards;
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading your flashcards...
          </span>
        </div>
      </div>
    );
  }

  if (studyMode && shuffledCards.length > 0) {
    const currentCard = shuffledCards[currentCardIndex];
    
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
        <div className="max-w-2xl mx-auto px-4">
          {/* Study Mode Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
            }`}>
              <Target className="w-4 h-4" />
              <span className="font-medium">
                Study Mode - Card {currentCardIndex + 1} of {shuffledCards.length}
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStudyMode(false);
                setCurrentCardIndex(0);
              }}
              className={`mt-4 px-6 py-2 rounded-lg ${
                isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-300 transition-colors`}
            >
              Exit Study Mode
            </motion.button>
          </div>

          {/* Progress Bar */}
          <div className={`w-full h-2 rounded-full mb-8 ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentCardIndex + 1) / shuffledCards.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full rounded-full ${
                isDark 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500'
              }`}
            />
          </div>

          {/* Current Flashcard */}
          <div className="group">
            <Flashcard
              {...currentCard}
              onStudy={recordStudySession}
              showActions={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Welcome back, {user?.username}! 👋
            </h1>
            <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ready to flip your way to knowledge?
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAIModal(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
              }`}
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              AI Generate
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
              }`}
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Card
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-cyan-500/20'
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'
              }`}>
                <BookOpen className={`w-6 h-6 ${
                  isDark ? 'text-cyan-400' : 'text-cyan-600'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {flashcards.length}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Cards
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-purple-500/20' : 'bg-purple-100'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  isDark ? 'text-purple-400' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {categories.length}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Categories
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/20'
                : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <Target className={`w-6 h-6 ${
                  isDark ? 'text-green-400' : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Math.round(flashcards.reduce((acc, card) => 
                    acc + (card.times_studied > 0 ? (card.correct_answers / card.times_studied) * 100 : 0), 0
                  ) / flashcards.length) || 0}%
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Accuracy
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/20'
                : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${
                isDark ? 'bg-orange-500/20' : 'bg-orange-100'
              }`}>
                <Clock className={`w-6 h-6 ${
                  isDark ? 'text-orange-400' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {flashcards.reduce((acc, card) => acc + card.times_studied, 0)}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Times Studied
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`pl-10 pr-8 py-2 rounded-lg border transition-colors appearance-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-cyan-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Study Mode Button */}
          {filteredCards.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startStudyMode}
              className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Start Study Session</span>
              <Shuffle className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Flashcards Grid */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20'
                : 'bg-gradient-to-r from-blue-100 to-purple-100'
            }`}>
              <BookOpen className={`w-12 h-12 ${
                isDark ? 'text-cyan-400' : 'text-blue-500'
              }`} />
            </div>
            <h3 className={`text-2xl font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No flashcards yet
            </h3>
            <p className={`text-lg mb-8 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your first flashcard or use AI to generate some!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                }`}
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Create Flashcard
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAIModal(true)}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25'
                }`}
              >
                <Upload className="w-5 h-5 mr-2 inline" />
                AI Generate
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group"
              >
                <Flashcard
                  {...card}
                  onDelete={deleteFlashcard}
                  showActions={true}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Create New Flashcard
              </h2>

              <form onSubmit={createFlashcard} className="space-y-4">
                <div>
                  <label htmlFor="new-card-question" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Question
                  </label>
                  <textarea
                    id="new-card-question"
                    value={newCard.question}
                    onChange={(e) => setNewCard({ ...newCard, question: e.target.value })}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    rows={3}
                    placeholder="Enter your question..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-card-answer" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Answer
                  </label>
                  <textarea
                    id="new-card-answer"
                    value={newCard.answer}
                    onChange={(e) => setNewCard({ ...newCard, answer: e.target.value })}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    rows={3}
                    placeholder="Enter the answer..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="new-card-category" className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Category
                    </label>
                    <input
                      id="new-card-category"
                      type="text"
                      value={newCard.category}
                      onChange={(e) => setNewCard({ ...newCard, category: e.target.value })}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      placeholder="e.g., Math, History"
                    />
                  </div>

                  <div>
                    <label htmlFor="new-card-difficulty" className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Difficulty
                    </label>
                    <select
                      id="new-card-difficulty"
                      value={newCard.difficulty}
                      onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value })}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    Create Card
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Generation Modal */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAIModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                AI-Powered Flashcard Generation
              </h2>

              <form onSubmit={handleAIGenerate} className="space-y-6">
                <div>
                  <label htmlFor="ai-file-upload" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Upload Image (Optional)
                  </label>
                  <input
                    id="ai-file-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white file:bg-gray-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3'
                        : 'bg-white border-gray-300 text-gray-900 file:bg-gray-100 file:text-gray-700 file:border-none file:rounded file:px-3 file:py-1 file:mr-3'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Upload an image to extract text using OCR
                  </p>
                </div>

                <div>
                  <label htmlFor="ai-text-input" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Or Enter Text Directly
                  </label>
                  <textarea
                    id="ai-text-input"
                    value={aiText}
                    onChange={(e) => setAiText(e.target.value)}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    rows={6}
                    placeholder="Paste your study material here (minimum 50 characters)..."
                  />
                </div>

                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={aiLoading || (!aiText && !aiFile)}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      'Generate Flashcards'
                    )}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowAIModal(false);
                      setAiText('');
                      setAiFile(null);
                      setGeneratedCards([]);
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>

              {/* Generated Cards */}
              {generatedCards.length > 0 && (
                <div className="mt-8">
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Generated Flashcards ({generatedCards.length})
                  </h3>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${
                          isDark
                            ? 'bg-gray-700 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="mb-3">
                          <p className={`font-medium text-sm ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            Q: {card.question}
                          </p>
                          <p className={`text-sm mt-2 ${
                            isDark ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            A: {card.answer}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className={`px-2 py-1 rounded ${
                              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {card.category}
                            </span>
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              {card.difficulty}
                            </span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => saveGeneratedCard(card)}
                            className="px-3 py-1 text-xs bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded font-medium hover:shadow-lg transition-all"
                          >
                            Save
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;