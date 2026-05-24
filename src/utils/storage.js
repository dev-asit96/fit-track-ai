import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  goal: 'Fat Loss',
  weightTarget: 70,
  activityLevel: 'Active',
  apiKey: '',
};

const getUid = () => {
  if (!auth.currentUser) return null;
  return auth.currentUser.uid;
};

// Generic helper to get a document's list
const getList = async (key) => {
  const uid = getUid();
  if (!uid) return [];
  const docRef = doc(db, 'users', uid, 'data', key);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().list || []) : [];
};

// Generic helper to save a list
const saveList = async (key, list) => {
  const uid = getUid();
  if (!uid) return;
  const docRef = doc(db, 'users', uid, 'data', key);
  await setDoc(docRef, { list });
};

export const getSettings = async () => {
  const uid = getUid();
  if (!uid) return DEFAULT_SETTINGS;
  const docRef = doc(db, 'users', uid, 'data', 'settings');
  const snap = await getDoc(docRef);
  return snap.exists() ? { ...DEFAULT_SETTINGS, ...snap.data() } : DEFAULT_SETTINGS;
};

export const saveSettings = async (settings) => {
  const uid = getUid();
  if (!uid) return;
  const docRef = doc(db, 'users', uid, 'data', 'settings');
  await setDoc(docRef, settings);
};

export const getWorkouts = async () => getList('workouts');

export const saveWorkout = async (workout) => {
  const workouts = await getWorkouts();
  workouts.push({ ...workout, id: Date.now().toString(), date: new Date().toISOString() });
  await saveList('workouts', workouts);
};

export const getCustomWorkouts = async () => getList('customWorkouts');

export const saveCustomWorkout = async (template) => {
  const custom = await getCustomWorkouts();
  template.id = template.id || `custom_${Date.now()}`;
  custom.push(template);
  await saveList('customWorkouts', custom);
};

export const updateCustomWorkout = async (template) => {
  const custom = await getCustomWorkouts();
  const index = custom.findIndex(t => t.id === template.id);
  if (index !== -1) {
    custom[index] = template;
    await saveList('customWorkouts', custom);
  }
};

export const deleteCustomWorkout = async (id) => {
  const custom = await getCustomWorkouts();
  const filtered = custom.filter(t => t.id !== id);
  await saveList('customWorkouts', filtered);
};

export const getCustomFoods = async () => getList('customFoods');

export const saveCustomFood = async (food) => {
  const custom = await getCustomFoods();
  food.id = `food_custom_${Date.now()}`;
  custom.push(food);
  await saveList('customFoods', custom);
};

export const getMeals = async () => getList('meals');

export const saveMeal = async (meal) => {
  const meals = await getMeals();
  meals.push({ ...meal, id: meal.id || Date.now().toString(), date: meal.date || new Date().toISOString() });
  await saveList('meals', meals);
};

export const deleteMeal = async (id) => {
  const meals = await getMeals();
  const filtered = meals.filter(m => m.id !== id);
  await saveList('meals', filtered);
};

export const getProgress = async () => getList('progress');

export const saveProgressEntry = async (entry) => {
  const progress = await getProgress();
  progress.push({ ...entry, id: Date.now().toString(), date: new Date().toISOString() });
  await saveList('progress', progress);
};

export const getWaterIntake = async (dateStr) => {
  const uid = getUid();
  if (!uid) return 0;
  const docRef = doc(db, 'users', uid, 'data', 'water');
  const snap = await getDoc(docRef);
  if (!snap.exists()) return 0;
  return snap.data()[dateStr] || 0;
};

export const saveWaterIntake = async (dateStr, amount) => {
  const uid = getUid();
  if (!uid) return;
  const docRef = doc(db, 'users', uid, 'data', 'water');
  const snap = await getDoc(docRef);
  const data = snap.exists() ? snap.data() : {};
  data[dateStr] = amount;
  await setDoc(docRef, data);
};

export const resetAllData = async () => {
  // Resetting all data in Firestore is trickier from the client (requires deleting all subcollection docs).
  // For simplicity, we just overwrite them with empty objects/arrays.
  await saveList('workouts', []);
  await saveList('meals', []);
  await saveList('progress', []);
  await saveList('customWorkouts', []);
  await saveList('customFoods', []);
  await saveSettings(DEFAULT_SETTINGS);
};
