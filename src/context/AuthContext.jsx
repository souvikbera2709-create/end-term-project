import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Stable, deterministic uid from email — same email ALWAYS gets same uid
function getStableUid(email) {
  const normalized = email.toLowerCase().trim();
  return 'user_' + btoa(normalized).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) return reject(new Error('Email and password required'));
      setTimeout(() => {
        const uid = getStableUid(email);
        const user = { email, uid };
        setCurrentUser(user);
        localStorage.setItem('gym_session', JSON.stringify(user));
        resolve(user);
      }, 800);
    });
  }

  function login(email, password) {
    return new Promise((resolve, reject) => {
      if (!email || !password) return reject(new Error('Please provide both email and password'));
      setTimeout(() => {
        const uid = getStableUid(email);
        const user = { email, uid };
        setCurrentUser(user);
        localStorage.setItem('gym_session', JSON.stringify(user));
        resolve(user);
      }, 800);
    });
  }

  function logout() {
    return new Promise((resolve) => {
      setCurrentUser(null);
      localStorage.removeItem('gym_session');
      resolve();
    });
  }

  useEffect(() => {
    const saved = localStorage.getItem('gym_session');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch (_) {}
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
