import React, { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(() => {
    const savedRole = localStorage.getItem('activeRole');
    if (savedRole) return savedRole;
    if (localStorage.getItem('adminToken')) return 'admin';
    if (localStorage.getItem('verifierToken')) return 'verifier';
    if (localStorage.getItem('token')) return 'student';
    return null;
  });

  const [user, setUser] = useState(() => {
    try {
      const activeRole = localStorage.getItem('activeRole');
      if (activeRole === 'admin' && localStorage.getItem('adminUser')) {
        return JSON.parse(localStorage.getItem('adminUser'));
      }
      if (activeRole === 'verifier' && localStorage.getItem('verifierUser')) {
        return JSON.parse(localStorage.getItem('verifierUser'));
      }
      if (activeRole === 'student' && localStorage.getItem('studentProfile')) {
        return JSON.parse(localStorage.getItem('studentProfile'));
      }
      // Fallbacks
      if (localStorage.getItem('adminUser')) return JSON.parse(localStorage.getItem('adminUser'));
      if (localStorage.getItem('verifierUser')) return JSON.parse(localStorage.getItem('verifierUser'));
      if (localStorage.getItem('studentProfile')) return JSON.parse(localStorage.getItem('studentProfile'));
    } catch {
      return null;
    }
    return null;
  });

  const [token, setToken] = useState(() => {
    const activeRole = localStorage.getItem('activeRole');
    if (activeRole === 'admin') return localStorage.getItem('adminToken');
    if (activeRole === 'verifier') return localStorage.getItem('verifierToken');
    if (activeRole === 'student') return localStorage.getItem('token');
    return localStorage.getItem('adminToken') || localStorage.getItem('verifierToken') || localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(false);

  const loginStudent = (jwtToken, profileData) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('activeRole', 'student');
    if (profileData) {
      localStorage.setItem('studentProfile', JSON.stringify(profileData));
      setUser(profileData);
    }
    setToken(jwtToken);
    setRole('student');
  };

  const loginVerifier = (jwtToken, verifierData) => {
    localStorage.setItem('verifierToken', jwtToken);
    localStorage.setItem('activeRole', 'verifier');
    if (verifierData) {
      localStorage.setItem('verifierUser', JSON.stringify(verifierData));
      setUser(verifierData);
    }
    setToken(jwtToken);
    setRole('verifier');
  };

  const loginAdmin = (jwtToken, adminData) => {
    localStorage.setItem('adminToken', jwtToken);
    localStorage.setItem('activeRole', 'admin');
    if (adminData) {
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      setUser(adminData);
    }
    setToken(jwtToken);
    setRole('admin');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('studentProfile');
    localStorage.removeItem('studentAvatar');
    localStorage.removeItem('verifierToken');
    localStorage.removeItem('verifierUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('activeRole');
    setRole(null);
    setUser(null);
    setToken(null);
  };

  const updateUser = (updated) => {
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      if (role === 'admin') localStorage.setItem('adminUser', JSON.stringify(merged));
      else if (role === 'verifier') localStorage.setItem('verifierUser', JSON.stringify(merged));
      else if (role === 'student') localStorage.setItem('studentProfile', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!role,
        loading,
        loginStudent,
        loginVerifier,
        loginAdmin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
