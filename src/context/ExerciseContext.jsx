import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import defaultExercises from '../data/Exercises.json';

const ExerciseContext = createContext();

export function useExercises() {
  return useContext(ExerciseContext);
}

function ExerciseInner({ uid, children }) {
  const storageKey = `gym2_${uid}_customExercises`;
  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      const custom = saved ? JSON.parse(saved) : [];
      return [...defaultExercises, ...custom];
    } catch { return defaultExercises; }
  });

  const addCustomExercise = (newExercise) => {
    const exerciseWithId = { ...newExercise, id: 'custom_' + Date.now(), isCustom: true };
    setExercises(prev => {
      const updated = [...prev, exerciseWithId];
      const customOnly = updated.filter(ex => ex.isCustom);
      try { localStorage.setItem(storageKey, JSON.stringify(customOnly)); } catch { }
      return updated;
    });
  };

  return (
    <ExerciseContext.Provider value={{ exercises, addCustomExercise }}>
      {exercises.length > 0 && children}
    </ExerciseContext.Provider>
  );
}

export function ExerciseProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || 'guest';
  return <ExerciseInner key={uid} uid={uid}>{children}</ExerciseInner>;
}
