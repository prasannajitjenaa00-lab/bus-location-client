import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('adminAuth');
    return saved ? JSON.parse(saved) : null;
  });

  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem('driverAuth');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/admin/login', { email, password });
    if (res.data.success) {
      setAdmin(res.data.data);
      localStorage.setItem('adminAuth', JSON.stringify(res.data.data));
      return res.data;
    }
  };

  const driverLogin = async (employeeId, password) => {
    const res = await api.post('/driver/login', { employeeId, password });
    if (res.data.success) {
      setDriver(res.data.data);
      localStorage.setItem('driverAuth', JSON.stringify(res.data.data));
      return res.data;
    }
  };

  const adminLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminAuth');
  };

  const driverLogout = () => {
    setDriver(null);
    localStorage.removeItem('driverAuth');
  };

  return (
    <AuthContext.Provider value={{
      admin,
      driver,
      theme,
      toggleTheme,
      adminLogin,
      driverLogin,
      adminLogout,
      driverLogout,
      setDriver
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
