import React from 'react';
import { NavLink } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Apple, Calendar, LogOut, BookOpen, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserProgress } from '../context/UserProgressContext';

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { userProfile } = useUserProgress();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Exercise Library', path: '/library', icon: <BookOpen size={20} /> },
    { name: 'Planner', path: '/planner', icon: <Calendar size={20} /> },
    { name: 'Strength Log', path: '/log', icon: <Dumbbell size={20} /> },
    { name: 'Nutrition', path: '/nutrition', icon: <Apple size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#1e1e1e] border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-4 border-b border-gray-800">
        <NavLink 
          to="/profile"
          className="w-10 h-10 flex-shrink-0 rounded-full border-2 border-blue-600/50 overflow-hidden bg-[#2a2a2a] flex items-center justify-center hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Your Profile"
        >
          {userProfile.photoUrl ? (
            <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="text-gray-400" size={20} />
          )}
        </NavLink>
        <h1 className="font-extrabold text-xl tracking-tight text-white hidden sm:block">Gym-Buddy</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-500' 
                  : 'text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="bg-[#252525] p-4 rounded-xl flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-white truncate">{userProfile.name || currentUser?.email || 'Guest'}</span>
            <span className="text-xs text-gray-500">Pro Member</span>
          </div>
          <button 
            onClick={() => logout()}
            className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
