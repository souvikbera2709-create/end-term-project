import React, { useState } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { useExercises } from '../context/ExerciseContext';
import { Calendar, Plus, X, Edit2, Dumbbell } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SPLITS = ['Push', 'Pull', 'Legs', 'Core', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Active Recovery', 'Rest', 'Custom'];
const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Glutes', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Core', 'Hamstrings', 'Quadriceps', 'Calves', 'Cardio'];

// Build the display label for a custom split
function buildCustomLabel(muscles) {
  if (!muscles || muscles.length === 0) return 'Custom';
  return muscles.join(' · ');
}

// Detect if a split string is a custom one
function isCustomSplit(s) { return s === 'Custom' || (typeof s === 'string' && s.includes(' · ')); }

export default function Planner() {
  const { weeklyPlan, setWeeklyPlan } = useUserProgress();
  const { exercises } = useExercises(); // To potentially use exercises for workouts, though we'll allow free text too
  const [editingDay, setEditingDay] = useState(null);
  
  // Local state for the day currently being edited
  const [editForm, setEditForm] = useState({ split: '', muscles: [], workouts: [] });
  const [newWorkout, setNewWorkout] = useState('');
  // Muscles selected when building a custom split
  const [customMuscles, setCustomMuscles] = useState([]);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const openEditModal = (day) => {
    setEditingDay(day);
    const plan = weeklyPlan[day];
    setEditForm({ ...plan });
    // Restore custom muscles if a custom split already exists
    const existingCustom = (Array.isArray(plan.split) ? plan.split : [plan.split]).find(s => s && s.includes(' · '));
    if (existingCustom) {
      setCustomMuscles(existingCustom.split(' · '));
      setShowCustomPicker(true);
    } else {
      setCustomMuscles([]);
      setShowCustomPicker(false);
    }
  };

  const saveEdit = () => {
    setWeeklyPlan({
      ...weeklyPlan,
      [editingDay]: editForm
    });
    setEditingDay(null);
  };

  const toggleMuscle = (muscle) => {
    setEditForm(prev => {
      const isSelected = prev.muscles.includes(muscle);
      return {
        ...prev,
        muscles: isSelected 
          ? prev.muscles.filter(m => m !== muscle)
          : [...prev.muscles, muscle]
      };
    });
  };

  const addWorkout = (e) => {
    e.preventDefault();
    if (!newWorkout.trim()) return;
    setEditForm(prev => ({
      ...prev,
      workouts: [...prev.workouts, newWorkout.trim()]
    }));
    setNewWorkout('');
  };

  const removeWorkout = (indexToRemove) => {
    setEditForm(prev => ({
      ...prev,
      workouts: prev.workouts.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="text-blue-500 w-8 h-8" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dynamic Planner</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {DAYS.map(day => {
          const plan = weeklyPlan[day];
          const planSplits = Array.isArray(plan.split) ? plan.split : (plan.split ? [plan.split] : []);
          const isRestDay = planSplits.includes('Rest');
          const hasSplit = planSplits.length > 0 && planSplits.some(s => s && s.trim() !== '');

          return (
            <div key={day} className="bg-[#1e1e1e] rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50 flex flex-col h-full hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">{day}</h3>
                <button 
                  onClick={() => openEditModal(day)}
                  className="p-1.5 text-gray-400 hover:text-white bg-[#252525] rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {hasSplit ? (
                <div className="flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {planSplits.map(s => (
                       <div key={s} className={`inline-block px-3 py-1 rounded-full text-xs font-bold self-start ${
                         s === 'Rest' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                       }`}>
                         {s}
                       </div>
                    ))}
                  </div>

                  {!isRestDay && plan.muscles.length > 0 && (
                     <div className="mb-4">
                       <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Focus</div>
                       <div className="flex flex-wrap gap-1.5">
                         {plan.muscles.map(m => (
                           <span key={m} className="px-2 py-0.5 bg-[#2a2a2a] text-gray-300 text-xs rounded border border-gray-700">
                             {m}
                           </span>
                         ))}
                       </div>
                     </div>
                  )}

                  {!isRestDay && plan.workouts.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-800/50">
                      <div className="text-xs text-gray-500 uppercase font-semibold mb-2">Workouts ({plan.workouts.length})</div>
                      <ul className="space-y-1.5">
                        {plan.workouts.slice(0, 4).map((w, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-center gap-2 truncate">
                            <Dumbbell size={12} className="text-gray-500 flex-shrink-0" />
                            <span className="truncate">{w}</span>
                          </li>
                        ))}
                        {plan.workouts.length > 4 && (
                          <li className="text-xs text-gray-500 italic mt-1">+ {plan.workouts.length - 4} more</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {!isRestDay && plan.workouts.length === 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-800/50 text-sm text-gray-500 italic">
                      No workouts assigned yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center mb-2">
                    <Plus className="text-gray-500" size={20} />
                  </div>
                  <span className="text-sm text-gray-500">Unassigned</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {editingDay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-[#222]">
              <h2 className="text-xl font-bold text-white">Edit {editingDay}</h2>
              <button onClick={() => setEditingDay(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Split Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Workout Split <span className="text-gray-600">(select multiple)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SPLITS.map(s => {
                    const currentSplits = Array.isArray(editForm.split) ? editForm.split : (editForm.split ? [editForm.split] : []);
                    // 'Custom' pill is active if showCustomPicker is on
                    const isSelected = s === 'Custom' ? showCustomPicker : currentSplits.includes(s);
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (s === 'Custom') {
                            setShowCustomPicker(p => {
                              if (p) {
                                // Deselecting custom — remove any existing custom split label
                                setCustomMuscles([]);
                                setEditForm(prev => ({
                                  ...prev,
                                  split: (Array.isArray(prev.split) ? prev.split : [prev.split])
                                    .filter(x => x && !isCustomSplit(x))
                                }));
                              }
                              return !p;
                            });
                            return;
                          }
                          setEditForm(prev => {
                            const prevSplits = Array.isArray(prev.split) ? prev.split : (prev.split ? [prev.split] : []);
                            let newSplits;
                            if (s === 'Rest') {
                              // Rest clears everything including custom
                              setShowCustomPicker(false);
                              setCustomMuscles([]);
                              newSplits = isSelected ? [] : ['Rest'];
                            } else {
                              const withoutRest = prevSplits.filter(split => split !== 'Rest');
                              newSplits = isSelected
                                ? withoutRest.filter(split => split !== s)
                                : [...withoutRest, s];
                            }
                            return { ...prev, split: newSplits };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? s === 'Rest' ? 'bg-green-600 text-white'
                              : s === 'Custom' ? 'bg-purple-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-[#252525] text-gray-400 border border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>

                {/* ── Custom Muscle Picker ── */}
                {showCustomPicker && (
                  <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-purple-300">Build Custom Split</p>
                      {customMuscles.length > 0 && (
                        <span className="text-xs text-purple-400 font-mono bg-purple-900/40 px-2 py-0.5 rounded-full">
                          {buildCustomLabel(customMuscles)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Select all muscle groups for this session:</p>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map(mg => {
                        const on = customMuscles.includes(mg);
                        return (
                          <button
                            key={mg}
                            type="button"
                            onClick={() => {
                              setCustomMuscles(prev => {
                                const next = on ? prev.filter(m => m !== mg) : [...prev, mg];
                                // Sync custom label into split array
                                const label = buildCustomLabel(next);
                                setEditForm(ef => ({
                                  ...ef,
                                  split: [
                                    ...(Array.isArray(ef.split) ? ef.split : [ef.split])
                                      .filter(x => x && !isCustomSplit(x) && x !== 'Rest'),
                                    ...(next.length > 0 ? [label] : [])
                                  ]
                                }));
                                return next;
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              on
                                ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]'
                                : 'bg-[#1e1830] text-gray-400 border border-purple-800/40 hover:border-purple-500/60 hover:text-purple-300'
                            }`}
                          >
                            {mg}
                          </button>
                        );
                      })}
                    </div>
                    {customMuscles.length === 0 && (
                      <p className="text-xs text-amber-500/70 italic">Select at least one muscle group above.</p>
                    )}
                  </div>
                )}
              </div>

              {(() => {
                const currentSplits = Array.isArray(editForm.split) ? editForm.split : (editForm.split ? [editForm.split] : []);
                const isRest = currentSplits.includes('Rest');
                const hasSplits = currentSplits.length > 0;
                return hasSplits && !isRest && (
                  <>
                  {/* Muscle Groups */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Target Muscle Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {MUSCLE_GROUPS.map(muscle => {
                        const isSelected = editForm.muscles.includes(muscle);
                        return (
                          <button
                            key={muscle}
                            onClick={() => toggleMuscle(muscle)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-[#252525] text-gray-400 border border-gray-700 hover:border-gray-500'
                            }`}
                          >
                            {muscle}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Workouts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Assigned Workouts</label>
                    
                    {editForm.workouts.length > 0 && (
                      <ul className="mb-3 space-y-2">
                        {editForm.workouts.map((w, idx) => (
                          <li key={idx} className="flex justify-between items-center bg-[#252525] p-2.5 rounded-lg border border-gray-700 text-sm text-gray-200">
                            <span>{w}</span>
                            <button onClick={() => removeWorkout(idx)} className="text-gray-500 hover:text-red-500">
                              <X size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form onSubmit={addWorkout} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Barbell Bench Press (4x10)"
                        value={newWorkout}
                        onChange={(e) => setNewWorkout(e.target.value)}
                        className="flex-1 bg-[#252525] border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center"
                      >
                        <Plus size={18} />
                      </button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                      You can add exercises specifically from your library or type any custom workout above.
                    </p>
                  </div>
                </>
                );
              })()}

            </div>

            <div className="p-5 border-t border-gray-800 bg-[#222] flex justify-end gap-3">
              <button 
                onClick={() => setEditingDay(null)}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Save Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
