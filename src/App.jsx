import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import { useData } from './context/DataContext';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import Nutrition from './pages/Nutrition';
import Progress from './pages/Progress';
import AICoach from './pages/AICoach';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';
import InstallPrompt from './components/InstallPrompt';

const ProtectedRoute = ({ children }) => {
  const { user } = useData();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  const { user } = useData();

  return (
    <>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1B2A31',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
      <InstallPrompt />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/onboarding" element={user ? <Navigate to="/dashboard" replace /> : <Onboarding />} />
      
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
