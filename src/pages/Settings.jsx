import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { saveSettings, resetAllData } from '../utils/storage';
import { Settings2, Save, Trash2, Key, Download, Upload, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, handleLogout, settings, setSettings, refreshData, workouts, meals, progress, customWorkouts, customFoods } = useData();
  const [formData, setFormData] = useState({
    goal: 'Fat Loss',
    weightTarget: '',
    activityLevel: 'Active',
    age: '',
    height: '',
    workoutPreference: 'Home Workouts',
    dietPreference: 'Balanced',
    apiKey: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        goal: settings.goal || 'Fat Loss',
        weightTarget: settings.weightTarget || '',
        activityLevel: settings.activityLevel || 'Active',
        age: settings.age || '',
        height: settings.height || '',
        workoutPreference: settings.workoutPreference || 'Home Workouts',
        dietPreference: settings.dietPreference || 'Balanced',
        apiKey: settings.apiKey || '',
      });
    }
  }, [settings]);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSettings({ ...settings, ...formData });
    await refreshData();
    alert('Settings saved successfully!'); // We could use a proper Toast here
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to delete all your data? This cannot be undone.")) {
      await resetAllData();
      window.location.href = '/';
    }
  };

  const handleExport = () => {
    const allData = {
      settings, workouts, meals, progress, customWorkouts, customFoods
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allData, null, 2));
    const anchor = document.createElement('a');
    anchor.href = dataStr;
    anchor.download = `fittrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImport = (e) => {
    // Note: With Firebase, we might want to directly upload this to Firestore or not support it here.
    // For now, it's safer to alert the user that data is synced automatically.
    alert("Data is now automatically synced to the cloud via your account! Manual import is disabled.");
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <header className="mb-6 flex items-center gap-3">
        <Settings2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Fitness Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-textMuted mb-2">Primary Goal</label>
              <select 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.goal}
                onChange={e => setFormData({...formData, goal: e.target.value})}
              >
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Target Weight (kg)</label>
              <input 
                type="number" 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.weightTarget}
                onChange={e => setFormData({...formData, weightTarget: parseFloat(e.target.value) || ''})}
              />
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Activity Level</label>
              <select 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.activityLevel}
                onChange={e => setFormData({...formData, activityLevel: e.target.value})}
              >
                <option>Sedentary</option>
                <option>Lightly Active</option>
                <option>Active</option>
                <option>Very Active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Age</label>
              <input 
                type="number" 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.age}
                onChange={e => setFormData({...formData, age: parseInt(e.target.value) || ''})}
              />
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Height (cm)</label>
              <input 
                type="number" 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.height}
                onChange={e => setFormData({...formData, height: parseFloat(e.target.value) || ''})}
              />
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Workout Preference</label>
              <select 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.workoutPreference}
                onChange={e => setFormData({...formData, workoutPreference: e.target.value})}
              >
                <option>Home Workouts</option>
                <option>Gym / Weights</option>
                <option>Cardio / Running</option>
                <option>Yoga / Pilates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-textMuted mb-2">Diet Preference</label>
              <select 
                className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary"
                value={formData.dietPreference}
                onChange={e => setFormData({...formData, dietPreference: e.target.value})}
              >
                <option>Balanced</option>
                <option>Vegetarian</option>
                <option>Vegan</option>
                <option>Keto</option>
                <option>High Protein</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-secondary/30">
          <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
            <Key className="w-5 h-5 text-secondary" /> AI Coach Integration
          </h2>
          <p className="text-sm text-textMuted mb-4">
            Enter your Google Gemini API key to enable the AI coach features. The key is stored locally in your browser.
          </p>
          <div>
            <label className="block text-sm text-textMuted mb-2">Gemini API Key</label>
            <input 
              type="password" 
              placeholder="AIzaSy..."
              className="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-secondary font-mono"
              value={formData.apiKey}
              onChange={e => setFormData({...formData, apiKey: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" /> Save Changes
          </button>
        </div>

      </form>

      {/* Backup Section */}
      <div className="glass-card p-6 mt-6 border-primary/20">
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-2">Data Backup & Sync</h2>
        <p className="text-sm text-textMuted mb-4">
          Since FitTrack AI works entirely offline without user accounts, you are in full control of your data. 
          Use these tools to backup your progress so you never lose it, or to transfer your data to another device.
        </p>
        <div className="flex gap-4">
          <button onClick={handleExport} className="btn-secondary flex-1 flex justify-center items-center gap-2">
            <Download className="w-5 h-5" /> Export Data (Backup)
          </button>
          
          <label className="btn-secondary flex-1 flex justify-center items-center gap-2 cursor-pointer text-center">
            <Upload className="w-5 h-5" /> Import Data (Restore)
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border border-red-500/30 mt-6">
        <h2 className="text-xl font-semibold text-red-500 mb-2 flex items-center gap-2">
          Account
        </h2>
        <p className="text-sm text-textMuted mb-4">
          Logged in as <strong>{user?.email}</strong>. Your data is safely synced to the cloud.
        </p>
        <div className="flex gap-4">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl font-medium transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button onClick={handleReset} className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Reset Cloud Data
          </button>
        </div>
      </div>

    </div>
  );
};

export default Settings;
