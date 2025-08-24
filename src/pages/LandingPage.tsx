import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Brain, Sparkles, ArrowRight, Upload, Bot } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: Brain,
      title: 'Smart Learning',
      description: 'AI-powered flashcards that adapt to your learning style'
    },
    {
      icon: Bot,
      title: 'AI Generation',
      description: 'Upload text, PDFs, or images and get instant flashcards'
    },
    {
      icon: Sparkles,
      title: 'Beautiful Design',
      description: 'Stunning neon cyberpunk and colorful themes'
    },
    {
      icon: Upload,
      title: 'OCR Support',
      description: 'Extract text from images automatically'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
      
      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 shadow-lg shadow-cyan-500/25"
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">MindFlip</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          {/* Logo Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-block p-6 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 shadow-2xl shadow-purple-500/25">
              <motion.div
                animate={{ rotateY: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center"
              >
                <Zap className="w-8 h-8 text-purple-600" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold text-white mb-6"
          >
            Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Flip</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl text-gray-300 mb-4"
          >
            From notes to knowledge — flip it.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            Transform your learning with AI-powered flashcards. Upload content, generate cards instantly, and study with beautiful animations in neon cyberpunk style.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-lg font-semibold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all transform hover:scale-105"
            >
              <span className="flex items-center space-x-2">
                <span>Start Learning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-purple-500/30 text-purple-300 text-lg font-semibold rounded-2xl hover:bg-purple-500/10 hover:border-purple-400 transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-32 grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-purple-900/30 border border-purple-500/20 backdrop-blur-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-500/20 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Zap className="w-5 h-5" />
            <span>© 2024 MindFlip. From notes to knowledge — flip it.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;