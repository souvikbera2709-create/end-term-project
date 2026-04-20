import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserProgressContext = createContext();

export function useUserProgress() {
  return useContext(UserProgressContext);
}

function useUserStorage(uid, key, defaultValue) {
  const storageKey = `gym2_${uid}_${key}`;

  const [state, setState] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : defaultValue;
    } catch { return defaultValue; }
  });

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { }
  }, [storageKey, state]);

  return [state, setState];
}

const DEFAULT_WEEKLY_PLAN = {
  Monday: { split: [], muscles: [], workouts: [] },
  Tuesday: { split: [], muscles: [], workouts: [] },
  Wednesday: { split: [], muscles: [], workouts: [] },
  Thursday: { split: [], muscles: [], workouts: [] },
  Friday: { split: [], muscles: [], workouts: [] },
  Saturday: { split: [], muscles: [], workouts: [] },
  Sunday: { split: [], muscles: [], workouts: [] },
};

const DEFAULT_PROFILE = {
  photoUrl: null, name: '', age: '', currentWeight: '',
  targetWeight: '', height: '', gender: 'Male', activityLevel: 'Moderate'
};

// Inner provider that is keyed by uid — remounts automatically on user switch
function UserProgressInner({ uid, children }) {
  const [nutritionGoal, setNutritionGoal]   = useUserStorage(uid, 'nutritionGoal', 'Maintain');
  const [customTargets, setCustomTargets]   = useUserStorage(uid, 'customTargets', { calories: 2000, protein: 150, carbs: 200, fats: 70 });
  const [weeklyPlan,    setWeeklyPlan]       = useUserStorage(uid, 'weeklyPlan', DEFAULT_WEEKLY_PLAN);
  const [dailyMeals,    setDailyMeals]       = useUserStorage(uid, 'dailyMeals', []);
  const [loggedExercises, setLoggedExercises] = useUserStorage(uid, 'loggedExercises', []);
  const [userProfile,   setUserProfile]      = useUserStorage(uid, 'userProfile', DEFAULT_PROFILE);

  return (
    <UserProgressContext.Provider value={{
      nutritionGoal, setNutritionGoal,
      customTargets, setCustomTargets,
      weeklyPlan, setWeeklyPlan,
      dailyMeals, setDailyMeals,
      loggedExercises, setLoggedExercises,
      userProfile, setUserProfile,
    }}>
      {children}
    </UserProgressContext.Provider>
  );
}

export function UserProgressProvider({ children }) {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid || 'guest';
  // key={uid} forces full remount when user switches, reloading correct data
  return <UserProgressInner key={uid} uid={uid}>{children}</UserProgressInner>;
}
