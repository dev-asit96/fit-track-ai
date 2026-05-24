import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInAnonymously, updateProfile } from 'firebase/auth';
import { saveSettings, getSettings } from '../utils/storage';
import { ArrowRight, ArrowLeft, CheckCircle2, Dumbbell } from 'lucide-react';

const steps = [
  { id: 'name', title: 'What should we call you?' },
  { id: 'demographics', title: 'A bit about yourself' },
  { id: 'workout', title: 'Your Workout Style' },
  { id: 'diet', title: 'Your Diet Preference' },
  { id: 'auth', title: 'Secure your account' }
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'guest';
  const navigate = useNavigate();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    workoutPreference: '',
    dietPreference: '',
    email: '',
    password: ''
  });

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const nextStep = () => {
    // Validation
    if (currentStepIndex === 0 && !formData.name.trim()) return;
    if (currentStepIndex === 1 && (!formData.age || !formData.height)) return;
    if (currentStepIndex === 2 && !formData.workoutPreference) return;
    if (currentStepIndex === 3 && !formData.dietPreference) return;
    
    // If guest mode and we just finished step 3 (index 3, Diet), skip Auth step
    if (mode === 'guest' && currentStepIndex === 3) {
      handleComplete();
      return;
    }

    setDirection(1);
    setCurrentStepIndex(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStepIndex === 0) {
      navigate('/');
      return;
    }
    setDirection(-1);
    setCurrentStepIndex(prev => prev - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    
    try {
      let userCredential;
      if (mode === 'guest') {
        userCredential = await signInAnonymously(auth);
      } else {
        if (!formData.email || !formData.password) {
          setError("Please enter email and password");
          setLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }

      if (formData.name.trim()) {
        await updateProfile(userCredential.user, { displayName: formData.name.trim() });
      }

      const currentSettings = await getSettings();
      await saveSettings({
        ...currentSettings,
        age: parseInt(formData.age) || null,
        height: parseFloat(formData.height) || null,
        workoutPreference: formData.workoutPreference,
        dietPreference: formData.dietPreference
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
      setLoading(false);
    }
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-background text-text flex flex-col max-w-md mx-auto relative overflow-hidden">
      
      {/* Top Bar with Back Button and Progress */}
      <div className="p-6 pt-12 flex items-center justify-between z-10 relative">
        <button onClick={prevStep} className="p-2 -ml-2 text-textMuted hover:text-text transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-1.5">
          {steps.slice(0, mode === 'guest' ? 4 : 5).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${idx <= currentStepIndex ? 'bg-primary' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentStepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 px-6 flex flex-col justify-center pb-24"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">{currentStep.title}</h2>

            {currentStep.id === 'name' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto bg-surfaceHighlight rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-xl">
                    <Dumbbell className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-textMuted">Let's personalize your experience.</p>
                </div>
                <input 
                  type="text" 
                  placeholder="Your First Name"
                  className="w-full text-center text-2xl bg-surfaceHighlight border border-white/10 rounded-2xl py-5 focus:outline-none focus:border-primary transition-colors"
                  value={formData.name}
                  onChange={e => updateForm('name', e.target.value)}
                  autoFocus
                />
              </div>
            )}

            {currentStep.id === 'demographics' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-center text-textMuted mb-2">How old are you?</label>
                  <input 
                    type="number" 
                    placeholder="25"
                    className="w-full text-center text-2xl bg-surfaceHighlight border border-white/10 rounded-2xl py-5 focus:outline-none focus:border-primary transition-colors"
                    value={formData.age}
                    onChange={e => updateForm('age', e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-center text-textMuted mb-2">Height in cm</label>
                  <input 
                    type="number" 
                    placeholder="170"
                    className="w-full text-center text-2xl bg-surfaceHighlight border border-white/10 rounded-2xl py-5 focus:outline-none focus:border-primary transition-colors"
                    value={formData.height}
                    onChange={e => updateForm('height', e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep.id === 'workout' && (
              <div className="space-y-4">
                {['Home Workouts', 'Gym / Weights', 'Cardio / Running', 'Yoga / Pilates'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { updateForm('workoutPreference', opt); setTimeout(nextStep, 300); }}
                    className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      formData.workoutPreference === opt 
                        ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20' 
                        : 'bg-surfaceHighlight border-white/5 text-textMuted hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg font-medium text-white">{opt}</span>
                    {formData.workoutPreference === opt && <CheckCircle2 className="w-6 h-6" />}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'diet' && (
              <div className="space-y-4">
                {['Balanced', 'Vegetarian', 'Vegan', 'Keto', 'High Protein'].map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { updateForm('dietPreference', opt); setTimeout(mode === 'guest' ? handleComplete : nextStep, 300); }}
                    className={`w-full p-5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                      formData.dietPreference === opt 
                        ? 'bg-secondary/20 border-secondary text-secondary shadow-lg shadow-secondary/20' 
                        : 'bg-surfaceHighlight border-white/5 text-textMuted hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg font-medium text-white">{opt}</span>
                    {formData.dietPreference === opt && <CheckCircle2 className="w-6 h-6" />}
                  </button>
                ))}
              </div>
            )}

            {currentStep.id === 'auth' && mode !== 'guest' && (
              <div className="space-y-4">
                <p className="text-textMuted text-center mb-6">Create a password to keep your data synced and secure across devices.</p>
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-surfaceHighlight border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-colors"
                  value={formData.email}
                  onChange={e => updateForm('email', e.target.value)}
                />
                <input 
                  type="password" 
                  placeholder="Create a password"
                  className="w-full bg-surfaceHighlight border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-colors"
                  value={formData.password}
                  onChange={e => updateForm('password', e.target.value)}
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button 
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full btn-primary py-4 mt-4 disabled:opacity-50 flex justify-center"
                >
                  {loading ? 'Creating account...' : 'Complete Profile'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Fixed Navigation Bar for non-auto-advancing steps */}
      {currentStep.id !== 'workout' && currentStep.id !== 'diet' && currentStep.id !== 'auth' && (
        <div className="fixed bottom-0 left-0 right-0 p-6 max-w-md mx-auto bg-gradient-to-t from-background via-background to-transparent pt-12 z-20">
          <button 
            onClick={nextStep}
            className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-xl shadow-primary/30"
          >
            Continue <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Full screen loader for guest creation to prevent double clicking */}
      {loading && mode === 'guest' && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="font-medium text-lg">Setting up your guest profile...</p>
        </div>
      )}
    </div>
  );
};

export default Onboarding;
