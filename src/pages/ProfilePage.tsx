import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Target, 
  TrendingUp, 
  Clock,
  Edit3,
  Camera,
  BookOpen,
  Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  study_streak: number;
  total_flashcards: number;
  total_studied: number;
  quiz_accuracy: number;
}

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const { isDark } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    email: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.username,
        email: profile.email
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        updateUser(editData);
        await fetchProfile();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Your Profile
          </h1>
          <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your learning journey and achievements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10'
                  : 'bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-xl'
              }`}
            >
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold ${
                      isDark
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-teal-500 text-white'
                    } shadow-2xl`}
                  >
                    {profile?.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={profile.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile?.username?.charAt(0).toUpperCase()
                    )}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute -bottom-2 -right-2 p-2 rounded-full ${
                      isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    } shadow-lg border-2 border-current`}
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                </div>
                <h2 className={`text-2xl font-bold mt-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {profile?.username}
                </h2>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Email
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                  }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Member since
                    </p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile && formatDate(profile.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditMode(!editMode)}
                className={`w-full mt-6 px-4 py-3 rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/25'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
                }`}
              >
                <Edit3 className="w-4 h-4 mr-2 inline" />
                {editMode ? 'Cancel Edit' : 'Edit Profile'}
              </motion.button>
            </motion.div>
          </div>

          {/* Stats & Edit Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Edit Form */}
            {editMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-purple-500/20'
                    : 'bg-gradient-to-br from-white to-purple-50 border border-purple-200'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Edit Profile
                </h3>

                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Username
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className={`w-full p-3 rounded-lg border transition-colors ${
                        isDark
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Save Changes
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setEditMode(false)}
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
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border border-cyan-500/20'
                    : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-cyan-500/20' : 'bg-cyan-100'
                  }`}>
                    <BookOpen className={`w-8 h-8 ${
                      isDark ? 'text-cyan-400' : 'text-cyan-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile?.total_flashcards || 0}
                    </p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Flashcards Created
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-500/20'
                    : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <Clock className={`w-8 h-8 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile?.total_studied || 0}
                    </p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Cards Studied
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-500/20'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <Target className={`w-8 h-8 ${
                      isDark ? 'text-green-400' : 'text-green-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {Math.round(profile?.quiz_accuracy || 0)}%
                    </p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Quiz Accuracy
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-6 rounded-2xl ${
                  isDark
                    ? 'bg-gradient-to-br from-orange-900/50 to-red-900/50 border border-orange-500/20'
                    : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <Zap className={`w-8 h-8 ${
                      isDark ? 'text-orange-400' : 'text-orange-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {profile?.study_streak || 0}
                    </p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Study Streak
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Achievement Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`p-6 rounded-2xl ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-yellow-500/20'
                  : 'bg-gradient-to-br from-white to-yellow-50 border border-yellow-200'
              }`}
            >
              <h3 className={`text-xl font-bold mb-4 flex items-center space-x-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <Award className={`w-6 h-6 ${
                  isDark ? 'text-yellow-400' : 'text-yellow-600'
                }`} />
                <span>Achievements</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'First Steps', icon: '🎯', unlocked: (profile?.total_flashcards || 0) >= 1 },
                  { name: 'Scholar', icon: '📚', unlocked: (profile?.total_flashcards || 0) >= 10 },
                  { name: 'Consistent', icon: '🔥', unlocked: (profile?.study_streak || 0) >= 7 },
                  { name: 'Expert', icon: '🏆', unlocked: (profile?.quiz_accuracy || 0) >= 80 }
                ].map((achievement, index) => (
                  <motion.div
                    key={achievement.name}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? isDark
                          ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                          : 'bg-yellow-100 border border-yellow-200 text-yellow-600'
                        : isDark
                          ? 'bg-gray-700 border border-gray-600 text-gray-500'
                          : 'bg-gray-100 border border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <p className="text-sm font-medium">{achievement.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;