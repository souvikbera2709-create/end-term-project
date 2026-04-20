import React, { useMemo, useState } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { Apple, Flame, Target, Activity, CheckCircle2, ChevronRight, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NutritionSystem({ totals }) {
  const { userProfile, customTargets, setCustomTargets } = useUserProgress();
  const [useCustomOverride, setUseCustomOverride] = useState(false);

  // Safely parse numbers from string inputs
  const weight = Number(userProfile.currentWeight) || 0;
  const targetWeight = Number(userProfile.targetWeight) || 0;
  const height = Number(userProfile.height) || 0;
  const age = Number(userProfile.age) || 0;
  
  const hasValidData = weight > 0 && height > 0 && age > 0;

  // --- Calculations ---
  const calculations = useMemo(() => {
    if (!hasValidData) return null;

    // 1. BMI Calculation
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmiCategory = "Normal";
    let bmiColor = "text-green-400";
    if (bmi < 18.5) { bmiCategory = "Underweight"; bmiColor = "text-blue-400"; }
    else if (bmi >= 25 && bmi < 30) { bmiCategory = "Overweight"; bmiColor = "text-orange-400"; }
    else if (bmi >= 30) { bmiCategory = "Obese"; bmiColor = "text-red-400"; }

    // 2. BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += userProfile.gender === 'Female' ? -161 : 5;

    // 3. TDEE Calculation
    const activityMultipliers = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Active': 1.725,
      'Very Active': 1.9
    };
    const tdee = Math.round(bmr * (activityMultipliers[userProfile.activityLevel] || 1.55));

    // 4. Target Goal Calculation
    let goalType = "Maintain";
    let targetCalories = tdee;
    
    // Threshold to prevent minor 1kg differences from triggering aggressive cuts/bulks
    const weightDiff = targetWeight - weight;
    
    if (targetWeight > 0) {
      if (weightDiff <= -1) {
        goalType = "Cut (Weight Loss)";
        targetCalories = tdee - 500; // Aggressive 500 cal deficit
      } else if (weightDiff >= 1) {
        goalType = "Bulk (Weight Gain)";
        targetCalories = tdee + 500; // 500 cal surplus
      }
    }

    // Safety floor
    if (userProfile.gender === 'Female' && targetCalories < 1200) targetCalories = 1200;
    if (userProfile.gender === 'Male' && targetCalories < 1500) targetCalories = 1500;

    // Macros based on Target Weight (or Current if no target)
    const activeWeight = targetWeight > 0 ? targetWeight : weight;
    const protein = Math.round(activeWeight * 2.2); // ~2.2g per kg (1g per lb)
    const fats = Math.round(activeWeight * 0.9); // ~0.9g per kg
    
    const proteinCals = protein * 4;
    const fatCals = fats * 9;
    const remainingCals = targetCalories - proteinCals - fatCals;
    const carbs = Math.max(0, Math.round(remainingCals / 4));

    return {
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmiColor,
      tdee,
      goalType,
      targetCalories,
      macros: { protein, carbs, fats }
    };
  }, [weight, targetWeight, height, age, userProfile.gender, userProfile.activityLevel, hasValidData]);

  const activeTargets = useCustomOverride && customTargets.calories > 0 
    ? customTargets 
    : (calculations ? { calories: calculations.targetCalories, ...calculations.macros } : { calories: 0, protein: 0, carbs: 0, fats: 0 });

  return (
    <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Apple className="text-green-500" />
          Nutrition Engine
        </h3>
        {hasValidData && (
          <button 
            onClick={() => setUseCustomOverride(!useCustomOverride)}
            className={`p-2 rounded-lg transition-colors border ${useCustomOverride ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-[#252525] border-gray-700 text-gray-400 hover:text-white'}`}
            title="Override Automatically Calculated Targets"
          >
            <Settings2 size={18} />
          </button>
        )}
      </div>

      {!hasValidData ? (
        <div className="bg-[#252525] border border-orange-500/30 rounded-xl p-6 text-center">
          <p className="text-gray-300 text-sm mb-4">Your profile is missing key metrics (Age, Weight, Height) to calculate accurate nutrition targets.</p>
          <Link to="/profile" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors text-sm">
            Complete Profile <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          {/* SECTION 1: MAINTENANCE & TDEE */}
          <div className="bg-[#252525] rounded-xl p-5 border border-gray-800">
            <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-400" /> Maintenance & TDEE
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800/50">
                <div className="text-xs text-gray-500 font-medium mb-1">BMI SCORE</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{calculations.bmi}</span>
                  <span className={`text-xs font-bold uppercase ${calculations.bmiColor}`}>{calculations.bmiCategory}</span>
                </div>
              </div>
              <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-800/50">
                <div className="text-xs text-gray-500 font-medium mb-1">MAINTENANCE (TDEE)</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{calculations.tdee}</span>
                  <span className="text-xs text-gray-400 font-medium">kcal/day</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TARGET GOAL */}
          <div className={`bg-[#252525] rounded-xl p-5 border ${useCustomOverride ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-gray-800'}`}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-orange-400" /> Target Goal
              </h4>
              {!useCustomOverride && (
                <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold uppercase border border-orange-500/20">
                  {calculations.goalType}
                </span>
              )}
            </div>
            
            {useCustomOverride ? (
              <div className="space-y-4">
                <div className="text-xs text-blue-400 font-medium bg-blue-500/10 p-2 rounded border border-blue-500/20 text-center mb-4">
                  Manual Override Active
                </div>
                <div className="flex items-center gap-3 mb-4 text-orange-400 justify-center">
                  <Flame size={24} />
                  <input 
                    type="number" 
                    value={customTargets.calories}
                    onChange={(e) => setCustomTargets({...customTargets, calories: Number(e.target.value)})}
                    className="bg-transparent border-b border-orange-400/50 text-4xl font-extrabold text-orange-400 w-28 focus:outline-none focus:border-orange-400 text-center"
                  />
                  <span className="text-sm font-medium mt-2">kcal / day</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-6 text-orange-400">
                <Flame size={28} />
                <span className="text-4xl font-extrabold tracking-tight">{calculations.targetCalories}</span>
                <span className="text-sm font-medium mt-3 text-orange-400/80">kcal / day</span>
              </div>
            )}
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800/50 text-center">
                <div className="text-gray-500 text-xs font-semibold mb-1 uppercase">Protein</div>
                {useCustomOverride ? (
                  <div className="flex items-center justify-center">
                    <input type="number" value={customTargets.protein} onChange={e => setCustomTargets({...customTargets, protein: Number(e.target.value)})} className="bg-transparent border-b border-gray-600 text-white font-bold text-lg w-12 text-center focus:outline-none focus:border-blue-500" />
                    <span className="text-white font-bold text-lg">g</span>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg">{calculations.macros.protein}g</div>
                )}
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800/50 text-center">
                <div className="text-gray-500 text-xs font-semibold mb-1 uppercase">Carbs</div>
                {useCustomOverride ? (
                  <div className="flex items-center justify-center">
                    <input type="number" value={customTargets.carbs} onChange={e => setCustomTargets({...customTargets, carbs: Number(e.target.value)})} className="bg-transparent border-b border-gray-600 text-white font-bold text-lg w-12 text-center focus:outline-none focus:border-blue-500" />
                    <span className="text-white font-bold text-lg">g</span>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg">{calculations.macros.carbs}g</div>
                )}
              </div>
              <div className="bg-[#1a1a1a] p-3 rounded-lg border border-gray-800/50 text-center">
                <div className="text-gray-500 text-xs font-semibold mb-1 uppercase">Fats</div>
                {useCustomOverride ? (
                  <div className="flex items-center justify-center">
                    <input type="number" value={customTargets.fats} onChange={e => setCustomTargets({...customTargets, fats: Number(e.target.value)})} className="bg-transparent border-b border-gray-600 text-white font-bold text-lg w-12 text-center focus:outline-none focus:border-blue-500" />
                    <span className="text-white font-bold text-lg">g</span>
                  </div>
                ) : (
                  <div className="text-white font-bold text-lg">{calculations.macros.fats}g</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
