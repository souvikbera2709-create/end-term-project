import React, { useState, useMemo } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import NutritionSystem from '../components/NutritionSystem';
import AINutritionCoach from '../components/AINutritionCoach';
import { CheckCircle2, Utensils, X } from 'lucide-react';

const STANDARD_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner'];

export default function Nutrition() {
  const { dailyMeals, setDailyMeals } = useUserProgress();
  
  // States for manual entry form
  const [manualEntry, setManualEntry] = useState({ name: '', calories: '', protein: '', carbs: '', fats: '' });
  const [manualCategory, setManualCategory] = useState('Breakfast');
  const [manualCustomType, setManualCustomType] = useState('');

  // States for the Meal Category Prompt Modal (for AI additions)
  const [pendingMeal, setPendingMeal] = useState(null);
  const [promptCategory, setPromptCategory] = useState('Breakfast');
  const [promptCustomType, setPromptCustomType] = useState('');

  // Initiate adding a meal from AI Coach
  const handleInitiateAdd = (meal) => {
    setPendingMeal(meal);
    setPromptCategory('Breakfast');
    setPromptCustomType('');
  };

  // Confirm adding the pending meal with its category
  const confirmAddMeal = () => {
    if (!pendingMeal) return;
    const finalType = promptCategory === 'Custom' ? (promptCustomType || 'Other') : promptCategory;
    
    setDailyMeals([...dailyMeals, { ...pendingMeal, mealType: finalType, logId: Date.now() }]);
    setPendingMeal(null);
  };

  // Submit the manual entry form
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualEntry.name || !manualEntry.calories) return;
    
    const finalType = manualCategory === 'Custom' ? (manualCustomType || 'Other') : manualCategory;

    setDailyMeals([...dailyMeals, {
      name: manualEntry.name,
      calories: Number(manualEntry.calories) || 0,
      protein: Number(manualEntry.protein) || 0,
      carbs: Number(manualEntry.carbs) || 0,
      fats: Number(manualEntry.fats) || 0,
      mealType: finalType,
      logId: Date.now()
    }]);
    
    setManualEntry({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    setManualCategory('Breakfast');
    setManualCustomType('');
  };

  const removeMeal = (logId) => {
    setDailyMeals(dailyMeals.filter(m => m.logId !== logId));
  };

  const totals = useMemo(() => {
    return dailyMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fats: acc.fats + meal.fats,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [dailyMeals]);

  const groupedMeals = useMemo(() => {
    // Pre-populate standard categories so they always show up
    const groups = {
      Breakfast: [],
      Lunch: [],
      Dinner: []
    };
    
    dailyMeals.forEach(meal => {
      const type = meal.mealType;
      if (groups[type]) {
        groups[type].push(meal);
      } else {
        // Custom types
        if (!groups[type]) groups[type] = [];
        groups[type].push(meal);
      }
    });

    return groups;
  }, [dailyMeals]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative">
      
      {/* Left Column: Targets, Summary & AI Coach */}
      <div className="w-full lg:w-1/3 space-y-6">
        <NutritionSystem totals={totals} />
        
        {/* Daily Summary */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
          <h3 className="text-xl font-bold text-white mb-4">Daily Intake</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Calories</span>
                <span className="text-white font-medium">{totals.calories} kcal</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#252525] p-3 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400 uppercase">Protein</div>
                <div className="text-lg font-bold text-white">{totals.protein}g</div>
              </div>
              <div className="bg-[#252525] p-3 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400 uppercase">Carbs</div>
                <div className="text-lg font-bold text-white">{totals.carbs}g</div>
              </div>
              <div className="bg-[#252525] p-3 rounded-xl border border-gray-800 text-center">
                <div className="text-xs text-gray-400 uppercase">Fats</div>
                <div className="text-lg font-bold text-white">{totals.fats}g</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Nutrition Coach */}
        <AINutritionCoach onAddMeal={handleInitiateAdd} />

      </div>

      {/* Right Column: Meal Logging */}
      <div className="w-full lg:w-2/3 space-y-6">
        
        {/* Manual Entry Form */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
          <div className="flex items-center gap-2 mb-6">
            <Utensils className="text-blue-500" />
            <h3 className="text-xl font-bold text-white">Log Custom Meal</h3>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            {/* Category Selection for Manual Entry */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <select 
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="w-full bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Custom">Custom (Snack, Brunch, etc.)</option>
                </select>
              </div>
              {manualCategory === 'Custom' && (
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="E.g., Pre-workout"
                    required
                    value={manualCustomType}
                    onChange={(e) => setManualCustomType(e.target.value)}
                    className="w-full bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Meal Name"
                required
                value={manualEntry.name}
                onChange={e => setManualEntry({...manualEntry, name: e.target.value})}
                className="bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
              <input
                type="number"
                placeholder="Calories (kcal)"
                required
                value={manualEntry.calories}
                onChange={e => setManualEntry({...manualEntry, calories: e.target.value})}
                className="bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Protein (g)"
                value={manualEntry.protein}
                onChange={e => setManualEntry({...manualEntry, protein: e.target.value})}
                className="bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
              <input
                type="number"
                placeholder="Carbs (g)"
                value={manualEntry.carbs}
                onChange={e => setManualEntry({...manualEntry, carbs: e.target.value})}
                className="bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
              <input
                type="number"
                placeholder="Fats (g)"
                value={manualEntry.fats}
                onChange={e => setManualEntry({...manualEntry, fats: e.target.value})}
                className="bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm">
              Add to Log
            </button>
          </form>
        </div>

        {/* Consumed Meals Log */}
        <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Today's Log
          </h3>
          
          <div className="space-y-8">
            {Object.entries(groupedMeals).map(([category, meals]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider border-b border-gray-800 pb-2">
                  {category}
                </h4>
                {meals.length === 0 ? (
                  <div className="text-xs text-gray-500 italic py-1">
                    No meals logged for {category.toLowerCase()} yet.
                  </div>
                ) : (
                  meals.map(meal => (
                    <div key={meal.logId} className="flex justify-between items-center p-3 bg-[#252525] rounded-xl border border-gray-800">
                      <div>
                        <div className="text-white font-medium text-sm">{meal.name}</div>
                        <div className="text-xs text-gray-400 mt-1 flex gap-3">
                          <span><span className="text-orange-400 font-semibold">{meal.calories}</span> kcal</span>
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carbs}g</span>
                          <span>F: {meal.fats}g</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeMeal(meal.logId)}
                        className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category Prompt Modal */}
      {pendingMeal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#222]">
              <h2 className="text-lg font-bold text-white">Select Category</h2>
              <button onClick={() => setPendingMeal(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-400 mb-2">
                What type of meal is <strong className="text-white">{pendingMeal.name}</strong>?
              </div>

              <select 
                value={promptCategory}
                onChange={(e) => setPromptCategory(e.target.value)}
                className="w-full bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Custom">Custom (Snack, Brunch, etc.)</option>
              </select>

              {promptCategory === 'Custom' && (
                <input
                  type="text"
                  placeholder="E.g., Post-workout"
                  required
                  value={promptCustomType}
                  onChange={(e) => setPromptCustomType(e.target.value)}
                  className="w-full bg-[#252525] border border-gray-700 text-white text-sm rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>

            <div className="p-5 border-t border-gray-800 bg-[#222] flex justify-end gap-3">
              <button 
                onClick={() => setPendingMeal(null)}
                className="px-4 py-2 rounded-lg font-medium text-sm text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmAddMeal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
