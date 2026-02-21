import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('hg_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('hg_token', token);
    localStorage.setItem('hg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    localStorage.setItem('hg_token', token);
    localStorage.setItem('hg_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const registerDoctor = async (data) => {
    const res = await api.post('/auth/doctor-register', data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('hg_token');
    localStorage.removeItem('hg_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, registerDoctor, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
