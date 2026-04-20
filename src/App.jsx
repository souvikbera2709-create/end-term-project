import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserProgressProvider } from './context/UserProgressContext';
import { ExerciseProvider } from './context/ExerciseContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import StrengthTracker from './components/StrengthTracker';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExerciseLibrary from './components/ExerciseLibrary'; // Will move to pages later
import Planner from './pages/Planner';
import Nutrition from './pages/Nutrition';
import Profile from './pages/Profile';

// Wrapper for the authenticated layout
const AppLayout = ({ children }) => (
  <div className="flex min-h-screen bg-[#121212] text-white">
    <Sidebar />
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <UserProgressProvider>
        <ExerciseProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              <Route 
                path="/*" 
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/library" element={<ExerciseLibrary />} />
                        <Route path="/log" element={<div className="p-8"><StrengthTracker /></div>} />
                        <Route path="/planner" element={<Planner />} />
                        <Route path="/nutrition" element={<Nutrition />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </AppLayout>
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </ExerciseProvider>
      </UserProgressProvider>
    </AuthProvider>
  );
}

export default App;
