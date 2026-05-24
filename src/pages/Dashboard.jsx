import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';
import { Flame, Droplet, Target, Dumbbell, Zap, ChevronRight, TrendingUp, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { user, loading, workouts, meals, water, settings } = useData();
  const [macros, setMacros] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0 });
  const [nutritionHistory, setNutritionHistory] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);

  useEffect(() => {
    if (meals) {
      const today = new Date().toISOString().split('T')[0];
      const todayMeals = meals.filter(m => m.date.startsWith(today));
      const totals = todayMeals.reduce((acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: acc.protein + curr.protein,
        carbs: acc.carbs + curr.carbs,
        fats: acc.fats + curr.fats
      }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
      setMacros(totals);

      // Generate last 7 days history
      const hist = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        // Find meals for this day
        const dayMeals = meals.filter(m => m.date.startsWith(dStr));
        const dayCals = dayMeals.reduce((sum, m) => sum + m.calories, 0);
        
        hist.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          calories: dayCals || (i > 0 ? 1500 + Math.random()*500 : 0) // mock past days if empty for demo
        });
      }
      setNutritionHistory(hist);
    }
  }, [meals]);

  useEffect(() => {
    if (workouts) {
      const hist = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        const dayWk = workouts.filter(w => w.date.startsWith(dStr));
        const duration = dayWk.reduce((sum, w) => sum + w.duration, 0);
        
        hist.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          duration: duration || (i > 0 ? (Math.random() > 0.5 ? 30 : 0) : 0) // mock past days
        });
      }
      setWorkoutHistory(hist);
    }
  }, [workouts]);

  if (loading) return <div className="p-8 text-center text-textMuted">Loading your data...</div>;

  const targetCalories = settings?.goal === 'Fat Loss' ? 1800 : 2200; 
  const caloriePercent = Math.min((macros.calories / targetCalories) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-textMuted">Welcome back, {user?.displayName || "Fitness Enthusiast"}. Let's hit your goals today!</p>
        </div>
      </header>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Calories Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" /> Daily Calories
              </h2>
              <p className="text-sm text-textMuted">{macros.calories} / {targetCalories} kcal</p>
            </div>
          </div>
          
          <div className="w-full h-3 bg-surfaceHighlight rounded-full overflow-hidden mb-6">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${caloriePercent}%` }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>

          <div className="flex justify-between text-sm">
            <div className="text-center">
              <span className="block font-bold">{macros.protein.toFixed(1)}g</span>
              <span className="text-textMuted text-xs">Protein</span>
            </div>
            <div className="text-center">
              <span className="block font-bold">{macros.carbs.toFixed(1)}g</span>
              <span className="text-textMuted text-xs">Carbs</span>
            </div>
            <div className="text-center">
              <span className="block font-bold">{macros.fats.toFixed(1)}g</span>
              <span className="text-textMuted text-xs">Fats</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Small Widgets */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/workouts" className="glass-card p-4 flex flex-col items-center justify-center text-center hover:bg-surfaceHighlight transition-colors group">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-6 h-6 text-secondary" />
            </div>
            <span className="font-medium">Log Workout</span>
          </Link>

          <Link to="/nutrition" className="glass-card p-4 flex flex-col items-center justify-center text-center hover:bg-surfaceHighlight transition-colors group">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <span className="font-medium">Log Meal</span>
          </Link>

          <div className="glass-card p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-textMuted text-sm">
              <Droplet className="w-4 h-4 text-secondary" /> Water
            </div>
            <div className="text-2xl font-bold mt-2">{water} <span className="text-sm font-normal text-textMuted">glasses</span></div>
          </div>

          <div className="glass-card p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-textMuted text-sm">
              <Zap className="w-4 h-4 text-accent" /> Streak
            </div>
            <div className="text-2xl font-bold mt-2">3 <span className="text-sm font-normal text-textMuted">days</span></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Nutrition Chart */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Calorie Trend
            </h2>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={nutritionHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorCals)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Workout Activity Chart */}
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" /> Workout Activity
            </h2>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workoutHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 'bold' }}
                />
                <Bar dataKey="duration" name="Minutes" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Mini Insight */}
      <div className="glass-card p-6 bg-gradient-to-br from-surface to-primary/5 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-primary flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4" /> AI Insight
            </h3>
            <p className="text-sm text-text/80 leading-relaxed max-w-lg">
              Your calorie trend is looking solid. If you maintain this deficit and continue hitting your daily protein target, you are on track to crush your fat-loss goals!
            </p>
          </div>
          <Link to="/ai-coach" className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronRight className="w-5 h-5 text-textMuted" />
          </Link>
        </div>
      </div>

    </motion.div>
  );
};

export default Dashboard;
