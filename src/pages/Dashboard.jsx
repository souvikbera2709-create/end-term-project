import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserProgress } from '../context/UserProgressContext';
import { LogOut, Calendar, Utensils, TrendingUp } from 'lucide-react';
import AICoach from '../components/AICoach';
import { Link } from 'react-router-dom';

const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Wake up. Work out. Look kick-ass.",
  "Sore today, strong tomorrow.",
  "Sweat is just fat crying.",
  "Push harder than yesterday if you want a different tomorrow."
];

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const { weeklyPlan, dailyMeals } = useUserProgress();
  
  // Pick a random quote for this session
  const randomQuote = useMemo(() => {
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  const todaysPlan = weeklyPlan[today];

  const totalCalories = useMemo(() => {
    return dailyMeals.reduce((acc, meal) => acc + meal.calories, 0);
  }, [dailyMeals]);

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Top Navbar/Banner */}
      <nav className="bg-[#1e1e1e] border-b border-gray-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-xl text-blue-500 tracking-wider">GYM COMPANION</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline-block">{currentUser?.email}</span>
            <button 
              onClick={() => logout()}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome Back!</h1>
            <p className="text-lg text-blue-100 italic">"{randomQuote}"</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             {/* Decorative element */}
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22h20L12 2z"/>
            </svg>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats / Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Today's Plan Summary */}
              <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-500" size={24} />
                    <h3 className="text-xl font-bold text-white">Today's Plan</h3>
                  </div>
                  <span className="text-sm text-gray-400">{today}</span>
                </div>
                
                {todaysPlan.split ? (
                  <div>
                    <div className="text-3xl font-extrabold text-blue-400 mb-2">{todaysPlan.split}</div>
                    {todaysPlan.muscles.length > 0 && (
                      <div className="text-sm text-gray-400 mb-4">
                        Targeting: {todaysPlan.muscles.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4 py-2">
                    No workout assigned for today.
                  </div>
                )}
                
                <Link to="/planner" className="inline-block px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm font-medium transition-colors">
                  View Weekly Plan
                </Link>
              </div>

              {/* Nutrition Summary */}
              <div className="bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="text-green-500" size={24} />
                  <h3 className="text-xl font-bold text-white">Nutrition Log</h3>
                </div>
                
                <div className="text-3xl font-extrabold text-white mb-1">
                  {totalCalories} <span className="text-sm font-medium text-gray-400">kcal logged</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {dailyMeals.length} meal(s) recorded today.
                </div>
                
                <Link to="/nutrition" className="inline-block px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Log a Meal
                </Link>
              </div>

              {/* Strength Tracker Shortcut */}
              <div className="sm:col-span-2 bg-[#1e1e1e] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600/20 p-3 rounded-xl">
                    <TrendingUp className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Strength Tracker</h3>
                    <p className="text-sm text-gray-400">Log your sets, reps, and weights for today's workout.</p>
                  </div>
                </div>
                <Link to="/log" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium transition-colors whitespace-nowrap text-center">
                  Open Tracker
                </Link>
              </div>
              
            </div>

          </div>
          
          <div className="space-y-6">
            <AICoach />
          </div>
        </div>
      </main>
    </div>
  );
}
