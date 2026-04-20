import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, BookOpen, Layers, Plus, X } from 'lucide-react';
import { useExercises } from '../context/ExerciseContext';
import ExerciseDetailModal from './ExerciseDetailModal';
import MuscleAnatomyMap from './MuscleAnatomyMap';

export default function ExerciseLibrary() {
  const { exercises: exercisesData, addCustomExercise } = useExercises();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // State for Add Exercise Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [anatomySelection, setAnatomySelection] = useState({ primary: [], secondary: [], states: {}, selected: [] });
  const [newEx, setNewEx] = useState({
    name: '', muscleGroup: 'Chest', subCategory: '', equipment: 'Barbell',
    difficulty: 'Beginner', instructions: '', mistakes: '', anatomy: ''
  });

  // Extract unique filters
  const muscleGroups = ['All', ...new Set(exercisesData.map(e => e.muscleGroup))];
  const equipmentTypes = ['All', ...new Set(exercisesData.map(e => e.equipment))];

  // Extract subcategories when a specific muscle is selected
  const availableSubCategories = useMemo(() => {
    if (selectedMuscle === 'All') return [];
    const subs = exercisesData
      .filter(e => e.muscleGroup === selectedMuscle && e.subCategory)
      .map(e => e.subCategory);
    return ['All', ...new Set(subs)];
  }, [selectedMuscle, exercisesData]);

  // Reset subcategory when main muscle group changes
  useEffect(() => {
    setSelectedSubCategory('All');
  }, [selectedMuscle]);

  // Real-time filtering logic
  const filteredExercises = useMemo(() => {
    return exercisesData.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
      const matchesSubCategory = selectedSubCategory === 'All' || ex.subCategory === selectedSubCategory;
      const matchesEquipment = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
      
      return matchesSearch && matchesMuscle && matchesSubCategory && matchesEquipment;
    });
  }, [searchQuery, selectedMuscle, selectedSubCategory, selectedEquipment, exercisesData]);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEx.name) return;
    
    const formattedExercise = {
      ...newEx,
      instructions: newEx.instructions ? newEx.instructions.split('\n').filter(s => s.trim()) : [],
      mistakes: newEx.mistakes ? newEx.mistakes.split('\n').filter(s => s.trim()) : [],
      anatomy: newEx.anatomy ? newEx.anatomy.split(',').map(s => s.trim()).filter(Boolean) : [],
      anatomySelection
    };
    
    addCustomExercise(formattedExercise);
    setShowAddModal(false);
    setAnatomySelection({ primary: [], secondary: [], states: {}, selected: [] });
    setNewEx({
      name: '', muscleGroup: 'Chest', subCategory: '', equipment: 'Barbell',
      difficulty: 'Beginner', instructions: '', mistakes: '', anatomy: ''
    });
  };

  const handleAnatomySelectionChange = (payload) => {
    setAnatomySelection(payload);
    // All selected muscles treated equally — just track which are on
    const allActive = [...payload.primary, ...payload.secondary];
    setNewEx((prev) => ({ ...prev, anatomy: allActive.join(', ') }));
  };

  const handleAnatomyInputChange = (value) => {
    const muscles = value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    const nextStates = muscles.reduce((acc, muscleName) => {
      acc[muscleName] = 'primary';
      return acc;
    }, {});

    setAnatomySelection({
      primary: muscles,
      secondary: [],
      states: nextStates,
      selected: muscles.map((muscle) => ({ muscle, state: 'primary' }))
    });
    setNewEx((prev) => ({ ...prev, anatomy: value }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
            <BookOpen className="text-purple-500" size={36} />
            Discovery Engine
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Browse or expand our comprehensive exercise library.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl shadow-lg transition-all font-bold flex items-center gap-2 w-fit"
        >
          <Plus size={20} /> Add Exercise
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#1e1e1e] p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search exercises (e.g., Squat, Bench Press)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#252525] border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Primary Muscle Filter */}
        <div className="flex flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-400">Muscle:</span>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {muscleGroups.map(muscle => (
                <button
                  key={muscle}
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedMuscle === muscle 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' 
                      : 'bg-[#2d2d2d] text-gray-400 hover:text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conditional Subcategory Filter */}
        {selectedMuscle !== 'All' && availableSubCategories.length > 1 && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-800/50">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-purple-500 ml-1" />
              <span className="text-sm font-semibold text-purple-400">Target Area:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {availableSubCategories.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubCategory(sub)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      selectedSubCategory === sub 
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50' 
                        : 'bg-[#2d2d2d] border border-transparent text-gray-400 hover:text-white hover:bg-[#3d3d3d]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Equipment Filter */}
        <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-400 pl-6">Equipment:</span>
            <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {equipmentTypes.map(equip => (
                <button
                  key={equip}
                  onClick={() => setSelectedEquipment(equip)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedEquipment === equip 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                      : 'bg-[#2d2d2d] text-gray-400 hover:text-white hover:bg-[#3d3d3d]'
                  }`}
                >
                  {equip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Exercise Grid — original card design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredExercises.map(exercise => (
          <div 
            key={exercise.id} 
            onClick={() => setSelectedExercise(exercise)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col h-full ${
              exercise.isCustom 
                ? 'bg-purple-900/10 border-purple-800/50 hover:border-purple-500 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]' 
                : 'bg-[#1e1e1e] border-gray-800/50 hover:border-purple-500/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.1)]'
            }`}
          >
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-200 group-hover:text-purple-400 transition-colors">
                  {exercise.name}
                </h3>
                {exercise.isCustom && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Custom
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-[#252525] border border-gray-700 text-gray-300 rounded text-xs font-semibold">
                  {exercise.muscleGroup}
                </span>
                {exercise.subCategory && (
                  <span className="px-2 py-1 bg-purple-900/20 border border-purple-800/50 text-purple-300 rounded text-xs font-semibold">
                    {exercise.subCategory}
                  </span>
                )}
                <span className="px-2 py-1 bg-[#252525] border border-gray-700 text-gray-300 rounded text-xs font-semibold">
                  {exercise.equipment}
                </span>
              </div>
            </div>
            <div className="mt-auto text-sm text-purple-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              View Details →
            </div>
          </div>
        ))}
        {filteredExercises.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#1e1e1e] rounded-2xl border border-dashed border-gray-700">
            No exercises match your search criteria.
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
        />
      )}

      {/* Add Exercise Modal — wide, two-column with full-size anatomy mapper */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0c18] border border-gray-800/60 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl"
            style={{ boxShadow: '0 0 60px rgba(120,40,220,0.12), 0 25px 60px rgba(0,0,0,0.7)' }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0e0c18]/95 backdrop-blur-md border-b border-gray-800/60 p-5 flex justify-between items-center z-10">
              <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
                <Plus className="text-purple-500" /> Add Custom Exercise
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6">
              {/* Two-column layout: form fields left, anatomy mapper right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: form fields */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Exercise Name *</label>
                      <input required type="text" value={newEx.name} onChange={e => setNewEx({...newEx, name: e.target.value})}
                        className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="E.g., Incline Machine Press" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Equipment</label>
                      <input type="text" value={newEx.equipment} onChange={e => setNewEx({...newEx, equipment: e.target.value})}
                        className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Barbell, Machine, etc." />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Main Muscle Group</label>
                      <select value={newEx.muscleGroup} onChange={e => setNewEx({...newEx, muscleGroup: e.target.value})}
                        className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option>Chest</option><option>Back</option><option>Shoulders</option>
                        <option>Legs</option><option>Arms</option><option>Core</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Target Area (Subcategory)</label>
                      <input type="text" value={newEx.subCategory} onChange={e => setNewEx({...newEx, subCategory: e.target.value})}
                        className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="E.g., Upper Chest, Lats" />
                    </div>
                  </div>

                  {/* Anatomy text input */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Targeted Muscles (comma separated)</label>
                    <input
                      type="text"
                      value={newEx.anatomy}
                      onChange={e => handleAnatomyInputChange(e.target.value)}
                      className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="E.g., Upper Pectoralis Major, Anterior Deltoids"
                    />
                    {/* Muscle tags */}
                    {(anatomySelection.primary.length > 0 || anatomySelection.secondary.length > 0) && (
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {anatomySelection.primary.map((muscle) => (
                          <span key={`p-${muscle}`} className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-[#1b1226] px-3 py-1 text-xs font-semibold text-purple-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                            {muscle}
                          </span>
                        ))}
                        {anatomySelection.secondary.map((muscle) => (
                          <span key={`s-${muscle}`} className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-[#0d1d22] px-3 py-1 text-xs font-semibold text-cyan-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            {muscle}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Step-by-Step Instructions (one per line)</label>
                    <textarea value={newEx.instructions} onChange={e => setNewEx({...newEx, instructions: e.target.value})}
                      className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white h-28 custom-scrollbar resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={"Step 1...\nStep 2..."} />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Common Mistakes (one per line)</label>
                    <textarea value={newEx.mistakes} onChange={e => setNewEx({...newEx, mistakes: e.target.value})}
                      className="w-full bg-[#1a1630] border border-gray-700 rounded-xl px-4 py-2.5 text-white h-20 custom-scrollbar resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder={"Mistake 1...\nMistake 2..."} />
                  </div>

                  <div className="pt-3 border-t border-gray-800/60 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowAddModal(false)}
                      className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors">
                      Cancel
                    </button>
                    <button type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-7 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-purple-900/30">
                      Save Exercise
                    </button>
                  </div>
                </div>

                {/* Right: Full-size interactive anatomy mapper */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-300">Interactive Anatomy Mapper</p>
                    <p className="text-xs text-gray-500">Click muscle → Primary → Secondary → Off</p>
                  </div>
                  {/* Tall anatomy map */}
                  <div className="rounded-2xl border border-purple-900/40 bg-[#08060f] overflow-hidden flex-1" style={{ minHeight: '520px' }}>
                    <MuscleAnatomyMap
                      value={anatomySelection.states}
                      onChange={handleAnatomySelectionChange}
                    />
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
