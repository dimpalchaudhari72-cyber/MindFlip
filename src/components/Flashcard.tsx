import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface FlashcardProps {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  onStudy?: (id: number, isCorrect: boolean) => void;
  showActions?: boolean;
  autoFlip?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({
  id,
  question,
  answer,
  category,
  difficulty,
  onEdit,
  onDelete,
  onStudy,
  showActions = true,
  autoFlip = false,
}) => {
  const { isDark } = useTheme();
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleStudyResponse = (isCorrect: boolean) => {
    if (onStudy) {
      onStudy(id, isCorrect);
    }
    setIsFlipped(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'medium':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      case 'hard':
        return isDark ? 'text-red-400' : 'text-red-600';
      default:
        return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className="relative w-full h-80 perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={isFlipped ? 'back' : 'front'}
          initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className={`absolute inset-0 w-full h-full rounded-2xl p-6 cursor-pointer transform-gpu ${
            isDark
              ? isFlipped
                ? 'bg-gradient-to-br from-purple-900/90 to-pink-900/90 border border-purple-500/30 shadow-2xl shadow-purple-500/20'
                : 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20'
              : isFlipped
                ? 'bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200 shadow-xl'
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200 shadow-xl'
          } backdrop-blur-sm hover:scale-[1.02] transition-all duration-300`}
          onClick={handleFlip}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {!isFlipped ? (
            // Front of card (Question)
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  isDark
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-orange-100 text-orange-600 border border-orange-200'
                }`}>
                  {category}
                </span>
                <span className={`text-xs font-medium ${getDifficultyColor(difficulty)}`}>
                  {difficulty}
                </span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <h3 className={`text-lg font-semibold text-center leading-relaxed ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {question}
                </h3>
              </div>

              <div className="flex items-center justify-center mt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    isDark
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'bg-orange-100 text-orange-600 border border-orange-200'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-sm font-medium">Show Answer</span>
                </motion.div>
              </div>
            </div>
          ) : (
            // Back of card (Answer)
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center">
                <p className={`text-base text-center leading-relaxed ${
                  isDark ? 'text-gray-100' : 'text-gray-800'
                }`}>
                  {answer}
                </p>
              </div>

              {onStudy && (
                <div className="flex space-x-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudyResponse(false);
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-red-100 text-red-600 border border-red-200 hover:bg-red-200'
                    }`}
                  >
                    Incorrect
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStudyResponse(true);
                    }}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-green-100 text-green-600 border border-green-200 hover:bg-green-200'
                    }`}
                  >
                    Correct
                  </motion.button>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && !isFlipped && (
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(id);
                  }}
                  className={`p-2 rounded-full ${
                    isDark
                      ? 'bg-gray-800/50 text-gray-300 hover:text-white'
                      : 'bg-white/50 text-gray-600 hover:text-gray-900'
                  } backdrop-blur-sm`}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
              )}
              
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                  }}
                  className={`p-2 rounded-full ${
                    isDark
                      ? 'bg-red-900/50 text-red-400 hover:text-red-300'
                      : 'bg-red-100/50 text-red-600 hover:text-red-700'
                  } backdrop-blur-sm`}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Flashcard;