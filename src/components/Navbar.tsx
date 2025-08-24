import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Settings, 
  LogOut, 
  Zap,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className={`${
      isDark 
        ? 'bg-gray-900/95 border-b border-cyan-500/20' 
        : 'bg-white/95 border-b border-orange-200/50'
    } backdrop-blur-sm sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 360 }}
              transition={{ duration: 0.3 }}
              className={`p-2 rounded-xl ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/25'
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg shadow-orange-500/25'
              }`}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
            <span className={`text-xl font-bold ${
              isDark 
                ? 'text-white' 
                : 'text-gray-900'
            }`}>
              MindFlip
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    location.pathname === item.path
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-orange-100 text-orange-600 border border-orange-200'
                      : isDark
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {/* User Info */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
              isDark ? 'bg-gray-800/50' : 'bg-gray-100/50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500'
              }`}>
                <span className="text-white text-sm font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className={`text-sm font-medium hidden sm:block ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {user?.username}
              </span>
            </div>

            {/* Logout Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                  : 'text-red-600 hover:text-red-700 hover:bg-red-100'
              }`}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;