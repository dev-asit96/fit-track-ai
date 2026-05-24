import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { saveProgressEntry } from '../utils/storage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Scale, Upload, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Progress = () => {
  const { progress, settings, refreshData } = useData();
  const [weight, setWeight] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  // Sort progress by date
  const sortedProgress = useMemo(() => {
    return [...progress].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [progress]);

  const chartData = useMemo(() => {
    return sortedProgress.map(p => ({
      date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: parseFloat(p.weight)
    }));
  }, [sortedProgress]);

  const currentWeight = sortedProgress.length > 0 ? sortedProgress[sortedProgress.length - 1].weight : 0;
  const targetWeight = settings?.weightTarget || 0;
  const startWeight = sortedProgress.length > 0 ? sortedProgress[0].weight : 0;
  
  const weightLost = startWeight > 0 ? (startWeight - currentWeight).toFixed(1) : 0;
  const progressPercent = startWeight > 0 && targetWeight > 0 ? 
    Math.min(Math.max(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100, 0), 100) : 0;

  const handleLogWeight = async (e) => {
    e.preventDefault();
    if (!weight) return;
    
    await saveProgressEntry({
      weight: parseFloat(weight)
    });
    
    await refreshData();
    setWeight('');
    setShowLogModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-textMuted">Visualize your fat-loss journey.</p>
        </div>
        <button onClick={() => setShowLogModal(true)} className="btn-primary p-3 rounded-full flex items-center gap-2">
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Log Weight</span>
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-textMuted text-sm mb-1"><Scale className="w-4 h-4 text-primary" /> Current</div>
          <div className="text-2xl font-bold">{currentWeight > 0 ? `${currentWeight} kg` : '--'}</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 text-textMuted text-sm mb-1"><Target className="w-4 h-4 text-accent" /> Target</div>
          <div className="text-2xl font-bold">{targetWeight > 0 ? `${targetWeight} kg` : '--'}</div>
        </div>
        <div className="glass-card p-4 col-span-2">
          <div className="flex items-center gap-2 text-textMuted text-sm mb-1">
            {weightLost >= 0 ? <TrendingDown className="w-4 h-4 text-accent" /> : <TrendingUp className="w-4 h-4 text-primary" />} 
            Total Lost
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-accent">{weightLost} kg</div>
            <div className="w-32 h-2 bg-surfaceHighlight rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent to-secondary" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-6 h-[350px]">
        <h2 className="text-lg font-semibold mb-4">Weight History</h2>
        {chartData.length < 2 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-textMuted pb-8">
            <LineChart className="w-12 h-12 mb-2 opacity-20" />
            <p>Log your weight at least twice to see the chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3042" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1F2E', borderColor: '#2A3042', borderRadius: '8px' }}
                itemStyle={{ color: '#FF4B4B' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#FF4B4B" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#FF4B4B', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#FF3333' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Log Current Weight</h2>
            <form onSubmit={handleLogWeight}>
              <div className="mb-6">
                <label className="block text-sm text-textMuted mb-2">Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  required
                  autoFocus
                  className="w-full bg-surfaceHighlight border border-white/10 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-primary transition-colors"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium bg-surfaceHighlight hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 btn-primary py-3 px-4"
                >
                  Save Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Also import Target for the icon
import { Target } from 'lucide-react';

export default Progress;
