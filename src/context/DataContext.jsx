import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [settings, setSettings] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [progress, setProgress] = useState([]);
  const [water, setWater] = useState(0);
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [customFoods, setCustomFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!auth.currentUser) return;
    
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    const storage = await import('../utils/storage');
    
    try {
      const [
        settingsData, workoutsData, mealsData, progressData, waterData, customWkData, customFdData
      ] = await Promise.all([
        storage.getSettings(),
        storage.getWorkouts(),
        storage.getMeals(),
        storage.getProgress(),
        storage.getWaterIntake(today),
        storage.getCustomWorkouts(),
        storage.getCustomFoods()
      ]);
        
      setSettings(settingsData);
      setWorkouts(workoutsData);
      setMeals(mealsData);
      setProgress(progressData);
      setWater(waterData);
      setCustomWorkouts(customWkData);
      setCustomFoods(customFdData);
    } catch (e) {
      console.error("Error loading data from Firestore:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthResolved(true);
      if (currentUser) {
        loadData();
      } else {
        // Clear state on logout
        setSettings(null);
        setWorkouts([]);
        setMeals([]);
        setProgress([]);
        setWater(0);
        setCustomWorkouts([]);
        setCustomFoods([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!authResolved) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <DataContext.Provider value={{
      user, handleLogout,
      workouts, meals, progress, water, settings, customWorkouts, customFoods,
      loading, refreshData: loadData, setWater, setSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
