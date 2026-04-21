import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUserProgress } from '../context/UserProgressContext';
import { LogOut, Calendar, Utensils, TrendingUp, BookOpen, ArrowRight, Dumbbell } from 'lucide-react';
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

  const randomQuote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);
  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);
  const todaysPlan = weeklyPlan[today];
  const totalCalories = useMemo(() => dailyMeals.reduce((acc, m) => acc + m.calories, 0), [dailyMeals]);

  const quickLinks = [
    { label: 'Exercise Library', sub: 'Browse all exercises & anatomy', path: '/library', icon: <BookOpen size={22} />, color: 'purple' },
    { label: 'Weekly Planner', sub: 'Plan your training splits', path: '/planner', icon: <Calendar size={22} />, color: 'blue' },
    { label: 'Strength Log', sub: 'Track sets, reps & weight', path: '/log', icon: <Dumbbell size={22} />, color: 'emerald' },
  ];

  const colorMap = {
    purple: { bg: 'bg-purple-600/15', border: 'border-purple-500/30', icon: 'text-purple-400', hover: 'hover:border-purple-400/60 hover:bg-purple-600/20' },
    blue:   { bg: 'bg-blue-600/15',   border: 'border-blue-500/30',   icon: 'text-blue-400',   hover: 'hover:border-blue-400/60 hover:bg-blue-600/20' },
    emerald:{ bg: 'bg-emerald-600/15',border: 'border-emerald-500/30',icon: 'text-emerald-400',hover: 'hover:border-emerald-400/60 hover:bg-emerald-600/20' },
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Top Navbar */}
      <nav className="bg-[#1e1e1e] border-b border-gray-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-bold text-xl text-purple-400 tracking-wider">GYM-BUDDY</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400 hidden sm:inline-block">{currentUser?.email}</span>
            <button onClick={() => logout()} className="p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-violet-600 to-blue-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }} />
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Welcome Back! 💪</h1>
            <p className="text-lg text-purple-100 italic">"{randomQuote}"</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stats */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Today's Plan */}
              <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800/50 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="text-blue-500" size={24} />
                    <h3 className="text-xl font-bold text-white">Today's Plan</h3>
                  </div>
                  <span className="text-sm text-gray-400">{today}</span>
                </div>
                {todaysPlan?.split ? (
                  <div>
                    <div className="text-3xl font-extrabold text-blue-400 mb-2">{todaysPlan.split}</div>
                    {todaysPlan.muscles?.length > 0 && (
                      <div className="text-sm text-gray-400 mb-4">Targeting: {todaysPlan.muscles.join(', ')}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 mb-4 py-2">No workout assigned for today.</div>
                )}
                <Link to="/planner" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm font-medium transition-colors">
                  View Weekly Plan <ArrowRight size={14} />
                </Link>
              </div>

              {/* Nutrition */}
              <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className="text-green-500" size={24} />
                  <h3 className="text-xl font-bold text-white">Nutrition Log</h3>
                </div>
                <div className="text-3xl font-extrabold text-white mb-1">
                  {totalCalories} <span className="text-sm font-medium text-gray-400">kcal logged</span>
                </div>
                <div className="text-sm text-gray-400 mb-4">{dailyMeals.length} meal(s) recorded today.</div>
                <Link to="/nutrition" className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm font-medium transition-colors">
                  Log a Meal <ArrowRight size={14} />
                </Link>
              </div>

              {/* Strength Tracker */}
              <div className="sm:col-span-2 bg-[#1e1e1e] rounded-2xl p-6 border border-gray-800/50 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

          {/* Right: Quick Access Panel */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest px-1">Quick Access</h2>
            {quickLinks.map(({ label, sub, path, icon, color }) => {
              const c = colorMap[color];
              return (
                <Link
                  key={path}
                  to={path}
                  className={`group flex items-center gap-4 p-5 rounded-2xl border ${c.bg} ${c.border} ${c.hover} transition-all duration-200 shadow-sm`}
                >
                  <div className={`${c.icon} flex-shrink-0`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5 truncate">{sub}</div>
                  </div>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
