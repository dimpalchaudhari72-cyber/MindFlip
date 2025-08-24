import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  User,
  Lock,
  Trash2,
  Save,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface UserSettings {
  theme: string;
  shuffle_default: boolean;
  daily_reminders: boolean;
  notifications_enabled: boolean;
  default_study_mode: string;
}

const SettingsPage = () => {
  const { user, token, logout } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    shuffle_default: true,
    daily_reminders: true,
    notifications_enabled: true,
    default_study_mode: 'normal'
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/settings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.theme !== (isDark ? 'dark' : 'light')) {
          setTheme(data.theme);
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/profile/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...settings, ...newSettings }),
      });

      if (response.ok) {
        setSettings({ ...settings, ...newSettings });
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update settings' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    updateSettings({ theme: newTheme });
    setTheme(newTheme as 'light' | 'dark');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    try {
      setLoading(true);
      // Note: You'd need to implement this endpoint in the backend
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setLoading(true);
        // Note: You'd need to implement this endpoint in the backend
        const response = await fetch('http://localhost:5000/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          logout();
          navigate('/');
        } else {
          throw new Error('Failed to delete account');
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete account' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center space-x-3 p-4 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                : 'bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200'
            }`}
          >
            <Settings className={`w-8 h-8 ${
              isDark ? 'text-cyan-400' : 'text-blue-600'
            }`} />
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Settings
            </h1>
          </motion.div>
          <p className={`text-lg mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Customize your MindFlip experience
          </p>
        </div>

        {/* Success/Error Messages */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? isDark ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                         : 'bg-green-100 border border-green-200 text-green-600'
                : isDark ? 'bg-red-900/20 border border-red-500/30 text-red-400'
                         : 'bg-red-100 border border-red-200 text-red-600'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/20'
                : 'bg-gradient-to-br from-white to-blue-50 border border-blue-200'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <Moon className="w-6 h-6" />
              </div>
              <span>Appearance</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Theme
                </label>
                <div className="flex space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange('light')}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      settings.theme === 'light'
                        ? isDark
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-blue-500 bg-blue-100 text-blue-600'
                        : isDark
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium">Light Mode</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleThemeChange('dark')}
                    className={`flex-1 p-4 rounded-xl border transition-all ${
                      settings.theme === 'dark'
                        ? isDark
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                          : 'border-blue-500 bg-blue-100 text-blue-600'
                        : isDark
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium">Dark Mode</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Study Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/20'
                : 'bg-gradient-to-br from-white to-purple-50 border border-purple-200'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <span>Study Preferences</span>
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Shuffle by Default
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Automatically shuffle flashcards when starting study sessions
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateSettings({ shuffle_default: !settings.shuffle_default })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.shuffle_default
                      ? isDark ? 'bg-cyan-500' : 'bg-blue-500'
                      : isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.shuffle_default ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                  />
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Daily Reminders
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get reminded to study your flashcards daily
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updateSettings({ daily_reminders: !settings.daily_reminders })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.daily_reminders
                      ? isDark ? 'bg-cyan-500' : 'bg-blue-500'
                      : isDark ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.daily_reminders ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow"
                  />
                </motion.button>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Default Study Mode
                </label>
                <select
                  value={settings.default_study_mode}
                  onChange={(e) => updateSettings({ default_study_mode: e.target.value })}
                  className={`w-full p-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-cyan-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="normal">Normal Study</option>
                  <option value="quiz">Quiz Mode</option>
                  <option value="timed">Timed Study</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Account Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-green-500/20'
                : 'bg-gradient-to-br from-white to-green-50 border border-green-200'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center space-x-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <span>Account Security</span>
            </h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full p-3 pr-12 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full p-3 pr-12 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full p-3 pr-12 rounded-lg border transition-colors ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    autoComplete="new-password"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
                    }`}
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Change Password
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${
              isDark
                ? 'bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30'
                : 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 flex items-center space-x-3 ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              <div className={`p-2 rounded-lg ${
                isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <span>Danger Zone</span>
            </h2>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Sign Out
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sign out of your MindFlip account
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <LogOut className="w-4 h-4 mr-2 inline" />
                  Sign Out
                </motion.button>
              </div>

              <div className="border-t border-red-500/20 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      Delete Account
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isDark
                        ? 'bg-red-600 text-white hover:bg-red-500'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Delete Account
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;