import React, { createContext, useState, useEffect } from 'react';
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ktx_token');
    const userData = localStorage.getItem('ktx_user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('ktx_token', token);
    localStorage.setItem('ktx_user', JSON.stringify(userData));
    setUser(userData);
  };
  
  const logout = () => {
    localStorage.removeItem('ktx_token');
    localStorage.removeItem('ktx_user');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
