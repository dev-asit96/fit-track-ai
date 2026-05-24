import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import foodDb from '../data/food-db.json';
import { saveMeal, saveCustomFood, deleteMeal } from '../utils/storage';
import { Search, Plus, Apple, CheckCircle2, X, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Nutrition = () => {
  const { meals, customFoods, refreshData } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState('Breakfast');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newCustom, setNewCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: '1 serving' });

  const [apiFoods, setApiFoods] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const allFoods = useMemo(() => [...foodDb, ...(customFoods || [])], [customFoods]);

  React.useEffect(() => {
    const fetchApiFoods = async () => {
      if (searchQuery.trim().length < 3) {
        setApiFoods([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(searchQuery)}&search_simple=1&action=process&json=1&page_size=8`);
        const data = await res.json();
        const formatted = (data.products || []).filter(p => p.product_name && p.nutriments && p.nutriments['energy-kcal_100g']).map(p => ({
          id: p._id || p.code,
          name: p.product_name + (p.brands ? ` (${p.brands})` : ''),
          servingSize: p.serving_size || '100g',
          calories: Math.round(p.nutriments['energy-kcal_100g'] || 0),
          protein: Math.round((p.nutriments['proteins_100g'] || 0) * 10) / 10,
          carbs: Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
          fats: Math.round((p.nutriments['fat_100g'] || 0) * 10) / 10,
          source: 'OpenFoodFacts'
        }));
        
        // Remove duplicates by name
        const unique = formatted.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);
        setApiFoods(unique);
      } catch (err) {
        console.error("Error fetching foods", err);
      } finally {
        setIsSearching(false);
      }
    };
    
    const debounce = setTimeout(fetchApiFoods, 600);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const filteredFoods = useMemo(() => {
    if (!searchQuery) return [];
    const local = allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Merge local and API foods, avoid exact name duplicates
    const localNames = new Set(local.map(l => l.name.toLowerCase()));
    const filteredApi = apiFoods.filter(a => !localNames.has(a.name.toLowerCase()));
    
    return [...local, ...filteredApi];
  }, [searchQuery, allFoods, apiFoods]);

  const handleAddMeal = async () => {
    if (!selectedFood) return;
    
    await saveMeal({
      foodId: selectedFood.id,
      name: selectedFood.name,
      mealType,
      servings,
      calories: Math.round(selectedFood.calories * servings),
      protein: Math.round(selectedFood.protein * servings * 10) / 10,
      carbs: Math.round(selectedFood.carbs * servings * 10) / 10,
      fats: Math.round(selectedFood.fats * servings * 10) / 10,
    });
    
    await refreshData();
    setSelectedFood(null);
    setSearchQuery('');
    setServings(1);
    toast.success('Meal logged successfully!');
  };

  const handleDeleteMeal = async (id) => {
    if (confirm('Are you sure you want to delete this meal?')) {
      await deleteMeal(id);
      await refreshData();
      toast.success('Meal deleted');
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!newCustom.name || !newCustom.calories) return;
    
    await saveCustomFood({
      name: newCustom.name,
      servingSize: newCustom.servingSize,
      calories: parseFloat(newCustom.calories),
      protein: parseFloat(newCustom.protein) || 0,
      carbs: parseFloat(newCustom.carbs) || 0,
      fats: parseFloat(newCustom.fats) || 0
    });
    
    await refreshData();
    setShowCustomModal(false);
    setNewCustom({ name: '', calories: '', protein: '', carbs: '', fats: '', servingSize: '1 serving' });
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysMeals = meals.filter(m => m.date.startsWith(today));
  const totalCalories = todaysMeals.reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="space-y-6 pb-12">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Nutrition</h1>
          <p className="text-textMuted">Track your meals and hit those macros.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalCalories}</div>
          <div className="text-xs text-textMuted">kcal today</div>
        </div>
      </header>

      {/* Add Food Section */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Log a Meal</h2>
          <button onClick={() => setShowCustomModal(true)} className="text-sm font-medium text-primary hover:text-primaryHover flex items-center gap-1">
            <Plus className="w-4 h-4" /> Custom Food
          </button>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search our database or the internet for foods..." 
            className="w-full bg-surfaceHighlight border border-white/10 rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-primary transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent animate-spin" />
          )}
        </div>

        {filteredFoods.length > 0 && !selectedFood && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-surfaceHighlight rounded-xl overflow-hidden mb-4 border border-white/5">
            {filteredFoods.map(food => (
              <button 
                key={food.id}
                className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 flex justify-between items-center"
                onClick={() => setSelectedFood(food)}
              >
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {food.name} 
                    {food.source === 'OpenFoodFacts' && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">Internet</span>}
                  </div>
                  <div className="text-xs text-textMuted">{food.servingSize} • {food.calories} kcal</div>
                </div>
                <Plus className="w-5 h-5 text-primary" />
              </button>
            ))}
          </motion.div>
        )}

        {selectedFood && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-surfaceHighlight p-4 rounded-xl mb-4 border border-primary/30 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">{selectedFood.name}</h3>
                <p className="text-sm text-textMuted">Serving: {selectedFood.servingSize}</p>
              </div>
              <button onClick={() => setSelectedFood(null)} className="text-textMuted hover:text-white">Cancel</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-textMuted mb-1">Meal Type</label>
                <select 
                  className="w-full bg-surface border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary"
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snack</option>
                  <option>Dinner</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-textMuted mb-1">Number of Servings</label>
                <input 
                  type="number" 
                  min="0.5" step="0.5"
                  className="w-full bg-surface border border-white/10 rounded-lg p-2 focus:outline-none focus:border-primary"
                  value={servings}
                  onChange={e => setServings(parseFloat(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="flex justify-between text-sm mb-6 bg-surface border border-white/10 p-3 rounded-lg shadow-sm">
              <div className="text-center">
                <span className="block font-bold text-primary">{Math.round(selectedFood.calories * servings)}</span>
                <span className="text-xs text-textMuted">Kcal</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">{(selectedFood.protein * servings).toFixed(1)}g</span>
                <span className="text-xs text-textMuted">Protein</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">{(selectedFood.carbs * servings).toFixed(1)}g</span>
                <span className="text-xs text-textMuted">Carbs</span>
              </div>
              <div className="text-center">
                <span className="block font-bold">{(selectedFood.fats * servings).toFixed(1)}g</span>
                <span className="text-xs text-textMuted">Fats</span>
              </div>
            </div>

            <button onClick={handleAddMeal} className="btn-primary w-full flex justify-center items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Log Meal
            </button>
          </motion.div>
        )}
      </div>

      {/* Today's Log */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Today's Log</h2>
        {todaysMeals.length === 0 ? (
          <div className="glass-card p-8 text-center text-textMuted flex flex-col items-center justify-center">
            <Apple className="w-12 h-12 mb-3 opacity-20" />
            <p>No meals logged today yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map(type => {
              const typeMeals = todaysMeals.filter(m => m.mealType === type);
              if (typeMeals.length === 0) return null;
              
              return (
                <div key={type} className="glass-card p-4">
                  <h3 className="font-semibold text-textMuted mb-3">{type}</h3>
                  <div className="space-y-3">
                    {typeMeals.map(m => (
                      <div key={m.id} className="flex justify-between items-center bg-surfaceHighlight p-3 rounded-xl border border-white/5">
                        <div className="flex-1">
                          <p className="font-medium">{m.name}</p>
                          <p className="text-xs text-textMuted">{m.servings} serving(s)</p>
                        </div>
                        <div className="text-right mr-4">
                          <p className="font-semibold text-primary">{m.calories} kcal</p>
                          <p className="text-xs text-textMuted">
                            P: {m.protein}g • C: {m.carbs}g • F: {m.fats}g
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteMeal(m.id)}
                          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-textMuted hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Custom Food Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Custom Food</h2>
              <button onClick={() => setShowCustomModal(false)}><X className="w-6 h-6 text-textMuted" /></button>
            </div>
            <form onSubmit={handleCreateCustom} className="space-y-3">
              <div>
                <label className="block text-xs text-textMuted mb-1">Food Name</label>
                <input required className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none focus:border-primary" value={newCustom.name} onChange={e => setNewCustom({...newCustom, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-textMuted mb-1">Serving Size</label>
                  <input className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none focus:border-primary" placeholder="e.g. 1 bowl" value={newCustom.servingSize} onChange={e => setNewCustom({...newCustom, servingSize: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Calories (kcal)</label>
                  <input required type="number" className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none focus:border-primary" value={newCustom.calories} onChange={e => setNewCustom({...newCustom, calories: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-textMuted mb-1">Protein (g)</label>
                  <input type="number" step="0.1" className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none" value={newCustom.protein} onChange={e => setNewCustom({...newCustom, protein: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Carbs (g)</label>
                  <input type="number" step="0.1" className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none" value={newCustom.carbs} onChange={e => setNewCustom({...newCustom, carbs: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs text-textMuted mb-1">Fats (g)</label>
                  <input type="number" step="0.1" className="w-full bg-surfaceHighlight border border-white/10 rounded-lg p-2 outline-none" value={newCustom.fats} onChange={e => setNewCustom({...newCustom, fats: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-4">Save to Database</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Nutrition;
