import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Apple, LineChart, Bot, Settings, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MainLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Workouts', path: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', path: '/nutrition', icon: Apple },
    { name: 'Progress', path: '/progress', icon: LineChart },
    { name: 'AI Coach', path: '/ai-coach', icon: Bot },
    { name: 'Account', path: '/account', icon: UserCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-surface/50 backdrop-blur-xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            FitTrack AI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/20 text-primary font-medium'
                    : 'text-textMuted hover:text-text hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 p-2 z-50">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-full p-2"
              >
                <div className={`relative flex flex-col items-center p-1 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-textMuted'}`}>
                  {isActive && (
                    <motion.div
                      layoutId="mobileNavIndicator"
                      className="absolute inset-0 bg-primary/20 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className="w-6 h-6 mb-1 relative z-10" />
                  <span className="text-[10px] font-medium relative z-10">{item.name}</span>
                </div>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
