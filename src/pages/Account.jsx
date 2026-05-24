import React from 'react';
import { useData } from '../context/DataContext';
import { UserCircle, Mail, Key, LogOut, Dumbbell, Apple, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const Account = () => {
  const { user, handleLogout, workouts, meals, customWorkouts, customFoods } = useData();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to delete all cloud data? This cannot be undone.")) {
      // Logic would go here to trigger the reset via DataContext or storage.
      alert("This is a demo. Cloud reset disabled for safety.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 max-w-3xl mx-auto"
    >
      <header className="mb-8 flex items-center gap-3">
        <UserCircle className="w-10 h-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-textMuted">Manage your profile and data</p>
        </div>
      </header>

      {/* Profile Overview */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-4xl text-white font-bold">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">{user?.displayName || "Fitness Enthusiast"}</h2>
          <p className="text-textMuted flex items-center justify-center md:justify-start gap-2 mt-1">
            <Mail className="w-4 h-4" /> {user?.email}
          </p>
          <div className="mt-4 inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold">
            Cloud Synced
          </div>
        </div>
      </div>

      {/* Account Details & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border border-white/5">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <Database className="w-5 h-5 text-secondary" /> Data Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-textMuted flex items-center gap-2"><Dumbbell className="w-4 h-4" /> Total Workouts Logged</span>
              <span className="font-bold text-lg">{workouts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textMuted flex items-center gap-2"><Apple className="w-4 h-4" /> Total Meals Logged</span>
              <span className="font-bold text-lg">{meals.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textMuted">Custom Workout Templates</span>
              <span className="font-bold text-lg">{customWorkouts.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-textMuted">Custom Foods Created</span>
              <span className="font-bold text-lg">{customFoods.length}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/5">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" /> Authentication
          </h3>
          <p className="text-sm text-textMuted mb-6">
            You are securely logged in using Firebase Authentication. Your User ID is strictly confidential and links your data safely.
          </p>
          <div className="bg-surfaceHighlight p-3 rounded-lg border border-white/10 overflow-x-auto">
            <code className="text-xs text-textMuted">UID: {user?.uid}</code>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-red-500/30 mt-6 bg-red-500/5">
        <h2 className="text-xl font-semibold text-red-500 mb-2 flex items-center gap-2">
          Account Actions
        </h2>
        <p className="text-sm text-textMuted mb-4">
          Manage your active session or clear your cloud data entirely.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={handleLogout} 
            className="flex-1 px-4 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
          >
            <LogOut className="w-5 h-5" /> Sign Out of App
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default Account;
