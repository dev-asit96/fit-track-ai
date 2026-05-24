import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import templatesData from '../data/workout-templates.json';
import { Play, Plus, Clock, History, ChevronRight, X, Edit2, Check } from 'lucide-react';
import { saveWorkout, saveCustomWorkout, updateCustomWorkout, deleteCustomWorkout } from '../utils/storage';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ExerciseMedia from '../components/ExerciseMedia';

const Workouts = () => {
  const { workouts, customWorkouts, refreshData } = useData();
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'history', 'active'
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', duration: 30, exercises: [] });
  const [showAddExModal, setShowAddExModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [restTimer, setRestTimer] = useState(null);

  useEffect(() => {
    let interval;
    if (restTimer?.active && restTimer.time > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => ({ ...prev, time: prev.time - 1 }));
      }, 1000);
    } else if (restTimer?.time === 0) {
      setRestTimer(null);
      toast("Rest is over! Time to work.", { icon: "🔔" });
    }
    return () => clearInterval(interval);
  }, [restTimer]);

  const allTemplates = [...templatesData, ...(customWorkouts || [])];
  
  const startWorkout = (template) => {
    setActiveWorkout({
      ...template,
      startTime: new Date(),
      exercises: template.exercises.map(e => ({ 
        ...e, 
        setDetails: Array(parseInt(e.sets) || 3).fill().map(() => ({
          reps: e.reps || '10',
          weight: '',
          completed: false
        }))
      }))
    });
    setActiveTab('active');
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    const endTime = new Date();
    const durationMins = Math.round((endTime - activeWorkout.startTime) / 60000) || 1;
    
    await saveWorkout({
      name: activeWorkout.name,
      duration: durationMins,
      caloriesBurned: durationMins * 8, 
      exercises: activeWorkout.exercises
    });
    
    await refreshData();
    setActiveWorkout(null);
    setActiveTab('history');
  };

  const handleUpdateActiveExercise = (idx, field, value) => {
    const updated = { ...activeWorkout };
    updated.exercises[idx][field] = value;
    setActiveWorkout(updated);
  };

  const handleUpdateActiveSet = (exIdx, setIdx, field, value) => {
    const updated = { ...activeWorkout };
    updated.exercises[exIdx].setDetails[setIdx][field] = value;
    setActiveWorkout(updated);
  };

  const toggleSetComplete = (exIdx, setIdx) => {
    const updated = { ...activeWorkout };
    const isCompleted = !updated.exercises[exIdx].setDetails[setIdx].completed;
    updated.exercises[exIdx].setDetails[setIdx].completed = isCompleted;
    setActiveWorkout(updated);

    if (isCompleted) {
      const allSetsDone = updated.exercises[exIdx].setDetails.every(s => s.completed);
      if (allSetsDone) {
        setRestTimer({ time: 120, active: true });
      } else {
        setRestTimer({ time: 60, active: true });
      }
    }
  };

  const addExerciseToActive = () => {
    if (!newExName) return;
    updated.exercises.push({ 
      name: newExName, 
      sets: 3, 
      reps: '10', 
      setDetails: Array(3).fill().map(() => ({ reps: '10', weight: '', completed: false }))
    });
    setActiveWorkout(updated);
    setNewExName('');
    setShowAddExModal(false);
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTemplate.name) return;
    
    try {
      const templateToSave = {
        ...newTemplate,
        duration: parseInt(newTemplate.duration) || 30,
        category: 'Custom',
        description: 'Your custom workout template'
      };

      if (isEditing) {
        await updateCustomWorkout(templateToSave);
        toast.success('Template updated successfully!');
      } else {
        await saveCustomWorkout(templateToSave);
        toast.success('Template saved successfully!');
      }
      
      await refreshData();
      setShowCreateModal(false);
      setNewTemplate({ name: '', duration: 30, exercises: [] });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save custom template:', err);
      toast.error('Error saving template: ' + err.message);
    }
  };

  const addExToNewTemplate = () => {
    setNewTemplate(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: 'New Exercise', sets: 3, reps: '10' }]
    }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setNewTemplate({ name: '', duration: 30, exercises: [] });
    setShowCreateModal(true);
  };

  const openEditModal = (tpl) => {
    setIsEditing(true);
    setNewTemplate(tpl);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (id) => {
    if (confirm('Are you sure you want to delete this custom template?')) {
      await deleteCustomWorkout(id);
      await refreshData();
      toast.success('Template deleted');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-textMuted">Track your home workouts and crush your goals.</p>
        </div>
        {activeTab === 'templates' && (
          <button onClick={openCreateModal} className="btn-secondary flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Template
          </button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('templates')}
          className={`font-medium whitespace-nowrap ${activeTab === 'templates' ? 'text-primary border-b-2 border-primary pb-4 -mb-4' : 'text-textMuted'}`}
        >
          Templates
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`font-medium whitespace-nowrap ${activeTab === 'history' ? 'text-primary border-b-2 border-primary pb-4 -mb-4' : 'text-textMuted'}`}
        >
          History
        </button>
        {activeWorkout && (
          <button 
            onClick={() => setActiveTab('active')}
            className={`font-medium whitespace-nowrap flex items-center gap-1 ${activeTab === 'active' ? 'text-accent border-b-2 border-accent pb-4 -mb-4' : 'text-textMuted'}`}
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Active Session
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div 
            key="templates"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {allTemplates.map(tpl => (
              <div key={tpl.id} className="glass-card p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">{tpl.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-textMuted border border-white/10">{tpl.category}</span>
                      {tpl.id?.startsWith('custom_') && (
                        <div className="flex items-center gap-1 ml-2 bg-surfaceHighlight rounded-lg p-1">
                          <button onClick={() => openEditModal(tpl)} className="p-1 hover:text-primary transition-colors" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteTemplate(tpl.id)} className="p-1 hover:text-red-500 transition-colors" title="Delete">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-textMuted mb-4">{tpl.description}</p>
                  <div className="flex items-center gap-4 text-sm text-textMuted mb-6">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {tpl.duration} min</span>
                    <span>{tpl.exercises.length} exercises</span>
                  </div>
                </div>
                <button 
                  onClick={() => startWorkout(tpl)}
                  className="btn-primary flex items-center justify-center gap-2 w-full"
                >
                  <Play className="w-4 h-4" /> Start Workout
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'active' && activeWorkout && (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 border-accent/30"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-accent">{activeWorkout.name}</h2>
              <button onClick={finishWorkout} className="btn-primary !bg-accent hover:!bg-emerald-400">Finish</button>
            </div>

            <div className="space-y-4 mb-6 pb-20">
              {activeWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-surfaceHighlight p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
                    <ExerciseMedia name={ex.name} className="w-16 h-16 md:w-20 md:h-20" />
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={ex.name}
                        onChange={(e) => handleUpdateActiveExercise(idx, 'name', e.target.value)}
                        className="font-semibold text-lg bg-transparent border-b border-transparent focus:border-primary focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  
                  {/* Per Set Rows */}
                  <div className="space-y-2">
                    <div className="flex text-xs text-textMuted px-2">
                      <div className="w-12 text-center">Set</div>
                      <div className="flex-1 text-center">Lbs</div>
                      <div className="flex-1 text-center">Reps</div>
                      <div className="w-12 text-center">Done</div>
                    </div>
                    {ex.setDetails?.map((set, sIdx) => (
                      <div key={sIdx} className={`flex items-center p-2 rounded-lg transition-colors ${set.completed ? 'bg-accent/10' : 'bg-surface/50 hover:bg-surface'}`}>
                        <div className="w-12 text-center font-medium text-textMuted">{sIdx + 1}</div>
                        <div className="flex-1 px-1">
                          <input 
                            type="number" 
                            value={set.weight}
                            placeholder="-"
                            onChange={(e) => handleUpdateActiveSet(idx, sIdx, 'weight', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 focus:border-primary focus:outline-none text-center py-1"
                          />
                        </div>
                        <div className="flex-1 px-1">
                          <input 
                            type="text" 
                            value={set.reps}
                            onChange={(e) => handleUpdateActiveSet(idx, sIdx, 'reps', e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 focus:border-primary focus:outline-none text-center py-1"
                          />
                        </div>
                        <div className="w-12 flex justify-center">
                          <button 
                            onClick={() => toggleSetComplete(idx, sIdx)}
                            className={`shrink-0 w-8 h-8 rounded border flex items-center justify-center transition-colors ${set.completed ? 'bg-accent border-accent text-white' : 'border-textMuted hover:bg-accent/20'}`}
                          >
                            {set.completed && <Check className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setShowAddExModal(true)}
              className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-textMuted hover:bg-surfaceHighlight transition-colors flex items-center justify-center gap-2 font-medium mb-12"
            >
              <Plus className="w-5 h-5" /> Add Exercise
            </button>

            {/* Rest Timer Overlay */}
            <AnimatePresence>
              {restTimer && (
                <motion.div 
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  className="fixed bottom-20 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[400px] bg-surfaceHighlight border border-accent/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between z-40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-accent flex items-center justify-center font-bold text-lg">
                      {restTimer.time}
                    </div>
                    <div>
                      <p className="font-bold text-accent">Rest Time</p>
                      <p className="text-xs text-textMuted">Catch your breath!</p>
                    </div>
                  </div>
                  <button onClick={() => setRestTimer(null)} className="text-sm font-medium hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg">
                    Skip
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {workouts.length === 0 ? (
              <div className="text-center py-12 text-textMuted">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No workouts logged yet.</p>
              </div>
            ) : (
              workouts.slice().reverse().map(w => (
                <div key={w.id} className="glass-card p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold">{w.name}</h4>
                    <p className="text-sm text-textMuted">
                      {new Date(w.date).toLocaleDateString()} • {w.duration} min • {w.caloriesBurned} kcal
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-textMuted" />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Exercise Modal */}
      {showAddExModal && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add Exercise</h2>
            <input 
              autoFocus
              placeholder="Exercise Name (e.g. Burpees)"
              className="w-full bg-surfaceHighlight border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-primary"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddExModal(false)} className="flex-1 py-3 bg-surfaceHighlight rounded-xl font-medium">Cancel</button>
              <button onClick={addExerciseToActive} className="flex-1 btn-primary py-3">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{isEditing ? 'Edit Custom Template' : 'Create Custom Template'}</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-6 h-6 text-textMuted" /></button>
            </div>
            <form onSubmit={handleCreateTemplate}>
              <div className="mb-4">
                <label className="block text-sm text-textMuted mb-1">Template Name</label>
                <input required className="w-full bg-surfaceHighlight border border-white/10 rounded-xl p-3 focus:border-primary outline-none" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
              </div>
              <div className="mb-6">
                <label className="block text-sm text-textMuted mb-1">Duration (minutes)</label>
                <input required type="number" className="w-full bg-surfaceHighlight border border-white/10 rounded-xl p-3 focus:border-primary outline-none" value={newTemplate.duration} onChange={e => setNewTemplate({...newTemplate, duration: e.target.value})} />
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Exercises</h3>
                {newTemplate.exercises.map((ex, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className="flex-1 bg-surfaceHighlight border border-white/10 rounded-lg p-2" value={ex.name} onChange={e => {
                      const exes = newTemplate.exercises.map((eObj, idx) => idx === i ? { ...eObj, name: e.target.value } : eObj);
                      setNewTemplate({...newTemplate, exercises: exes});
                    }} placeholder="Name" />
                    <input type="number" className="w-16 bg-surfaceHighlight border border-white/10 rounded-lg p-2 text-center" value={ex.sets} onChange={e => {
                      const exes = newTemplate.exercises.map((eObj, idx) => idx === i ? { ...eObj, sets: e.target.value } : eObj);
                      setNewTemplate({...newTemplate, exercises: exes});
                    }} placeholder="Sets" />
                    <input className="w-20 bg-surfaceHighlight border border-white/10 rounded-lg p-2 text-center" value={ex.reps} onChange={e => {
                      const exes = newTemplate.exercises.map((eObj, idx) => idx === i ? { ...eObj, reps: e.target.value } : eObj);
                      setNewTemplate({...newTemplate, exercises: exes});
                    }} placeholder="Reps" />
                  </div>
                ))}
                <button type="button" onClick={addExToNewTemplate} className="text-primary text-sm font-medium flex items-center gap-1 mt-2">
                  <Plus className="w-4 h-4" /> Add Exercise
                </button>
              </div>

              <button type="submit" className="btn-primary w-full">Save Template</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workouts;
