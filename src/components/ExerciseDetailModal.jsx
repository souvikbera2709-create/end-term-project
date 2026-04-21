import React, { useMemo } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import MuscleAnatomyDisplay from './MuscleAnatomyDisplay';

export default function ExerciseDetailModal({ exercise, onClose }) {
  const anatomyStates = useMemo(() => {
    if (!exercise) return {};
    if (exercise.anatomySelection?.states) return exercise.anatomySelection.states;
    const fallback = {};
    (exercise.anatomy || []).forEach((muscle) => { fallback[muscle] = 'primary'; });
    return fallback;
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0e0c18] border border-gray-800/60 rounded-t-3xl sm:rounded-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ boxShadow: '0 0 60px rgba(120,40,220,0.18), 0 25px 60px rgba(0,0,0,0.7)' }}
      >
        {/* ── Sticky Header ── */}
        <div className="sticky top-0 bg-[#0e0c18]/95 backdrop-blur-md border-b border-gray-800/60 px-5 py-4 sm:px-6 sm:py-5 flex justify-between items-start z-10">
          <div className="flex-1 pr-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">{exercise.name}</h2>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-300 rounded-full text-xs font-bold uppercase tracking-widest">
                {exercise.muscleGroup}
              </span>
              <span className="px-3 py-1 bg-blue-600/15 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest">
                {exercise.equipment}
              </span>
              {exercise.subCategory && (
                <span className="px-3 py-1 bg-gray-700/30 border border-gray-600/40 text-gray-400 rounded-full text-xs font-semibold">
                  {exercise.subCategory}
                </span>
              )}
            </div>
          </div>
          {/* Large tap target for close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors flex-shrink-0"
          >
            <X size={22} />
          </button>
        </div>

        {/* ── Content ──
            Mobile:  anatomy FIRST (order-first), then instructions + mistakes below (single col)
            Desktop: instructions LEFT  |  anatomy RIGHT  (side by side)
        ── */}
        <div className="p-5 sm:p-6 flex flex-col md:grid md:grid-cols-2 md:gap-8 gap-0">

          {/* ── 3D Anatomy (shown on TOP on mobile, RIGHT on desktop) ── */}
          <div className="order-first md:order-last mb-6 md:mb-0 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-200">Target Anatomy</h3>

            <MuscleAnatomyDisplay
              muscleGroup={exercise.muscleGroup}
              anatomyStates={anatomyStates}
            />

            {/* Primary & Secondary Tags */}
            {exercise.anatomy?.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse flex-shrink-0" />
                  Primary &amp; Secondary Targets
                </h4>
                <div className="flex flex-wrap gap-2">
                  {exercise.anatomy.map((muscle, idx) => {
                    const state = anatomyStates[muscle];
                    const isPrimary = state === 'primary' || (!state && idx === 0);
                    return (
                      <span
                        key={idx}
                        className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${
                          isPrimary
                            ? 'bg-purple-900/30 border border-purple-500/40 text-purple-300'
                            : 'bg-[#1e1a2e] border border-purple-700/20 text-purple-400/70'
                        }`}
                      >
                        {muscle}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Instructions & Mistakes (LEFT on desktop, BELOW anatomy on mobile) ── */}
          <div className="order-last md:order-first space-y-7">
            <section>
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 text-gray-200">
                <CheckCircle2 className="text-green-500 flex-shrink-0" size={20} />
                Step-by-Step Instructions
              </h3>
              <ol className="space-y-3">
                {(exercise.instructions || []).map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-300 text-sm leading-relaxed">
                    <span className="font-bold text-gray-500 flex-shrink-0 w-5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {(exercise.mistakes || []).length > 0 && (
              <section>
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 text-gray-200">
                  <AlertTriangle className="text-amber-500 flex-shrink-0" size={20} />
                  Common Mistakes
                </h3>
                <ul className="space-y-2.5 bg-[#1a1620] p-5 rounded-xl border border-gray-800/50">
                  {exercise.mistakes.map((mistake, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-400 text-sm">
                      <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
