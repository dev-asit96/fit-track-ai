import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Dumbbell, Sparkles } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Your Personal <br />
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AI Fitness Coach
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-textMuted mb-10 leading-relaxed max-w-xl mx-auto">
          Achieve your fat-loss goals at home. Track workouts, monitor nutrition, and get personalized insights powered by AI. No gym required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <Link to="/onboarding?mode=guest" className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-4 flex-1">
            Enter as Guest
          </Link>
          <Link to="/onboarding?mode=signup" className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-4 flex-1">
            Sign Up <Sparkles className="w-5 h-5" />
          </Link>
        </div>
        <div className="mt-6">
          <Link to="/auth" className="text-textMuted hover:text-primary transition-colors">
            Already have an account? <strong>Login</strong>
          </Link>
        </div>
      </motion.div>

      {/* Feature highlight section to wow the user */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl relative z-10"
      >
        <div className="glass-card p-6 text-left">
          <Dumbbell className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Home Workouts</h3>
          <p className="text-textMuted">Tailored routines you can do anywhere, anytime with zero equipment.</p>
        </div>
        <div className="glass-card p-6 text-left">
          <Activity className="w-8 h-8 text-accent mb-4" />
          <h3 className="text-xl font-bold mb-2">Smart Nutrition</h3>
          <p className="text-textMuted">Track daily macros and calories. Designed specially for fat-loss goals.</p>
        </div>
        <div className="glass-card p-6 text-left">
          <Sparkles className="w-8 h-8 text-secondary mb-4" />
          <h3 className="text-xl font-bold mb-2">AI Insights</h3>
          <p className="text-textMuted">Receive personalized daily advice based on your consistency and progress.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
