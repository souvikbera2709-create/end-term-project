import React, { useState, useCallback, useMemo } from 'react';
import { Plus, Trash2, Dumbbell, ChevronDown } from 'lucide-react';
import { useExercises } from '../context/ExerciseContext';
import { useUserProgress } from '../context/UserProgressContext';

export default function StrengthTracker() {
  const { exercises: exercisesData } = useExercises();
  const { loggedExercises, setLoggedExercises } = useUserProgress();
  
  // States for adding an exercise
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedExerciseName, setSelectedExerciseName] = useState('');
  const [customExerciseName, setCustomExerciseName] = useState('');

  // Unique muscle groups from data
  const muscleGroups = useMemo(() => {
    return [...new Set(exercisesData.map(e => e.muscleGroup))];
  }, [exercisesData]);

  // Exercises for the selected muscle group
  const availableExercises = useMemo(() => {
    if (!selectedMuscle) return [];
    return exercisesData.filter(e => e.muscleGroup === selectedMuscle);
  }, [selectedMuscle, exercisesData]);

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!selectedMuscle) return;

    let finalName = '';
    if (selectedExerciseName === 'custom') {
      if (!customExerciseName.trim()) return;
      finalName = customExerciseName;
    } else {
      if (!selectedExerciseName) return;
      finalName = selectedExerciseName;
    }

    setLoggedExercises(prev => [
      ...prev,
      { 
        id: Date.now(), 
        name: finalName, 
        muscleGroup: selectedMuscle,
        sets: [{ id: Date.now() + 1, weight: 0, reps: 0, rpe: 8 }] 
      }
    ]);

    // Reset fields
    setSelectedExerciseName('');
    setCustomExerciseName('');
  };

  const removeExercise = useCallback((exerciseId) => {
    setLoggedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  }, []);

  const addSet = useCallback((exerciseId) => {
    setLoggedExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        // Copy the last set's weight and reps as a convenience
        const lastSet = ex.sets[ex.sets.length - 1];
        return { 
          ...ex, 
          sets: [...ex.sets, { 
            id: Date.now(), 
            weight: lastSet ? lastSet.weight : 0, 
            reps: lastSet ? lastSet.reps : 0,
            rpe: lastSet ? lastSet.rpe : 8
          }] 
        };
      }
      return ex;
    }));
  }, []);

  const removeSet = useCallback((exerciseId, setId) => {
    setLoggedExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  }, []);

  const updateSet = useCallback((exerciseId, setId, field, value) => {
    setLoggedExercises(prev => prev.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, [field]: Number(value) };
            }
            return s;
          })
        };
      }
      return ex;
    }));
  }, []);

  // Performance optimization using useMemo to calculate total volume lifted
  const totalVolume = useMemo(() => {
    return loggedExercises.reduce((acc, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setAcc, set) => setAcc + (set.weight * set.reps), 0);
      return acc + exerciseVolume;
    }, 0);
  }, [loggedExercises]);

  // Group logged exercises by muscle group
  const groupedExercises = useMemo(() => {
    return loggedExercises.reduce((acc, ex) => {
      if (!acc[ex.muscleGroup]) acc[ex.muscleGroup] = [];
      acc[ex.muscleGroup].push(ex);
      return acc;
    }, {});
  }, [loggedExercises]);

  return (
    <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <Dumbbell className="text-blue-500" size={28} />
          Professional Log
        </h3>
        <div className="bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-xl font-bold flex flex-col items-center">
          <span className="text-xs text-blue-500/70 uppercase tracking-wider">Session Load</span>
          <span>{totalVolume} kg</span>
        </div>
      </div>

      {/* Add Exercise Form */}
      <div className="bg-[#252525] p-5 rounded-xl border border-gray-800 mb-8">
        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Add to Log</h4>
        <form onSubmit={handleAddExercise} className="flex flex-wrap md:flex-nowrap gap-4">
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Muscle Group</label>
            <div className="relative">
              <select 
                value={selectedMuscle}
                onChange={(e) => {
                  setSelectedMuscle(e.target.value);
                  setSelectedExerciseName('');
                }}
                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Muscle...</option>
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-500 mb-1">Exercise</label>
            <div className="relative">
              <select 
                value={selectedExerciseName}
                onChange={(e) => setSelectedExerciseName(e.target.value)}
                disabled={!selectedMuscle}
                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">Select Exercise...</option>
                {availableExercises.map(ex => (
                  <option key={ex.id} value={ex.name}>{ex.name}</option>
                ))}
                <option value="custom">+ Custom Exercise</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>

          {selectedExerciseName === 'custom' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-gray-500 mb-1">Custom Name</label>
              <input
                type="text"
                value={customExerciseName}
                onChange={(e) => setCustomExerciseName(e.target.value)}
                placeholder="E.g., Special Press"
                className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex items-end">
            <button 
              type="submit"
              disabled={!selectedMuscle || (!selectedExerciseName && selectedExerciseName !== 'custom') || (selectedExerciseName === 'custom' && !customExerciseName)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed h-[46px]"
            >
              <Plus size={18} /> Add
            </button>
          </div>
        </form>
      </div>

      {/* Logged Exercises Grouped by Muscle */}
      <div className="space-y-8">
        {Object.keys(groupedExercises).length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-[#252525] rounded-xl border border-dashed border-gray-700">
            <Dumbbell size={48} className="mx-auto mb-4 text-gray-600 opacity-50" />
            <p className="text-lg">No exercises logged yet.</p>
            <p className="text-sm">Select a muscle group above to get started.</p>
          </div>
        ) : (
          Object.entries(groupedExercises).map(([muscleGroup, exercises]) => (
            <div key={muscleGroup} className="bg-[#252525] rounded-2xl p-5 border border-gray-800 shadow-inner">
              <div className="mb-4 flex items-center gap-2">
                <span className="bg-purple-900/40 text-purple-400 border border-purple-800/50 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider shadow-sm">
                  {muscleGroup}
                </span>
                <div className="h-px bg-gray-800 flex-1 ml-2"></div>
              </div>

              <div className="space-y-5">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-[#1e1e1e] rounded-xl p-4 border border-gray-700/50 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-lg text-gray-200">{exercise.name}</h4>
                      <button 
                        onClick={() => removeExercise(exercise.id)}
                        className="text-gray-500 hover:text-red-400 p-2 rounded transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider px-2">
                        <div className="col-span-2 text-center">Set</div>
                        <div className="col-span-3 text-center">Kg</div>
                        <div className="col-span-3 text-center">Reps</div>
                        <div className="col-span-2 text-center">RPE</div>
                        <div className="col-span-2 text-center"></div>
                      </div>
                      
                      {exercise.sets.map((set, index) => (
                        <div key={set.id} className="grid grid-cols-12 gap-2 items-center bg-[#252525] p-2 rounded-lg border border-gray-800">
                          <div className="col-span-2 text-center font-bold text-gray-400 bg-[#1e1e1e] py-1 rounded-md">{index + 1}</div>
                          <div className="col-span-3">
                            <input 
                              type="number" 
                              min="0"
                              value={set.weight || ''} 
                              onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md px-2 py-1.5 text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            />
                          </div>
                          <div className="col-span-3">
                            <input 
                              type="number" 
                              min="0"
                              value={set.reps || ''} 
                              onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md px-2 py-1.5 text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                            />
                          </div>
                          <div className="col-span-2">
                            <input 
                              type="number" 
                              min="1" max="10"
                              value={set.rpe || ''} 
                              onChange={(e) => updateSet(exercise.id, set.id, 'rpe', e.target.value)}
                              className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md px-1 py-1.5 text-gray-300 text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm"
                            />
                          </div>
                          <div className="col-span-2 flex justify-center">
                             <button 
                              onClick={() => removeSet(exercise.id, set.id)}
                              className="text-gray-600 hover:text-red-400 hover:bg-red-400/10 p-1.5 rounded-md transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => addSet(exercise.id)}
                      className="mt-4 w-full py-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Set
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
