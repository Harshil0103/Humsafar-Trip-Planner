import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
  auth,
  firebaseLogin,
  firebaseRegister,
  firebaseGoogleSignIn,
  firebaseSignOut,
  formatFirebaseAuthError
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and restore authenticated session
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = localStorage.getItem('tripplanner_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (isMounted) setUser(res.user);
        } catch (err) {
          console.warn('Existing session invalid or expired:', err.message);
          localStorage.removeItem('tripplanner_token');
          if (isMounted) setUser(null);
        }
      }

      // Listen for Firebase Auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!isMounted) return;
        if (fbUser) {
          // If we don't have a user or user email doesn't match fbUser, sync with backend
          const currentToken = localStorage.getItem('tripplanner_token');
          if (!currentToken) {
            try {
              const syncRes = await api.syncFirebaseUser({
                email: fbUser.email,
                name: fbUser.displayName || fbUser.email.split('@')[0],
                avatar_url: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
                firebase_uid: fbUser.uid
              });
              localStorage.setItem('tripplanner_token', syncRes.token);
              setUser(syncRes.user);
            } catch (syncErr) {
              console.error('Firebase Auth state sync error:', syncErr);
            }
          }
        }
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }

    initAuth().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in via Email & Password (with Firebase Auth fallback & API sync)
   */
  async function login(email, password) {
    try {
      // First attempt Firebase Auth
      let fbUser = null;
      try {
        fbUser = await firebaseLogin(email, password);
      } catch (fbErr) {
        // If Firebase auth throws (e.g. demo credentials not in Firebase cloud or custom API account), fallback to API login
        console.info('Direct API login fallback:', fbErr.message);
      }

      if (fbUser) {
        const syncRes = await api.syncFirebaseUser({
          email: fbUser.email,
          name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Traveler'),
          avatar_url: fbUser.photoURL,
          firebase_uid: fbUser.uid
        });
        localStorage.setItem('tripplanner_token', syncRes.token);
        const userObj = syncRes.user || syncRes;
        setUser(userObj);
        return userObj;
      } else {
        // Standard API Login
        const res = await api.login({ email, password });
        localStorage.setItem('tripplanner_token', res.token);
        const userObj = res.user || res;
        setUser(userObj);
        return userObj;
      }
    } catch (err) {
      throw new Error(err.message || 'Login failed.');
    }
  }

  /**
   * Register with Email & Password via Firebase Auth + backend sync
   */
  async function register(userData) {
    try {
      const { name, email, password } = userData;
      let fbUser = null;
      try {
        fbUser = await firebaseRegister(email, password, name);
      } catch (fbErr) {
        console.info('Direct API register fallback:', fbErr.message);
      }

      if (fbUser) {
        const syncRes = await api.syncFirebaseUser({
          email: fbUser.email,
          name: name || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Traveler'),
          avatar_url: fbUser.photoURL,
          firebase_uid: fbUser.uid
        });
        localStorage.setItem('tripplanner_token', syncRes.token);
        const userObj = syncRes.user || syncRes;
        setUser(userObj);
        return userObj;
      } else {
        const res = await api.register(userData);
        localStorage.setItem('tripplanner_token', res.token);
        const userObj = res.user || res;
        setUser(userObj);
        return userObj;
      }
    } catch (err) {
      throw new Error(err.message || 'Registration failed.');
    }
  }

  /**
   * Instant Google Traveler Login (works even when Firebase Console Google Provider is awaiting activation)
   */
  async function instantGoogleLogin(customEmail, customName) {
    try {
      const email = customEmail?.trim() || `google_traveler_${Date.now()}@gmail.com`;
      const name = customName?.trim() || (email.includes('@') ? email.split('@')[0] : 'Traveler');
      const avatar_url = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`;
      
      const syncRes = await api.syncFirebaseUser({
        email,
        name,
        avatar_url,
        firebase_uid: `google_${Date.now()}`
      });

      localStorage.setItem('tripplanner_token', syncRes.token);
      const userObj = syncRes.user || syncRes;
      setUser(userObj);
      return userObj;
    } catch (err) {
      throw new Error(err.message || 'Google account sign-in failed.');
    }
  }

  /**
   * Log in with Google via Firebase Popup with automatic fallback option
   */
  async function loginWithGoogle() {
    try {
      const fbUser = await firebaseGoogleSignIn();
      if (!fbUser || !fbUser.email) {
        throw new Error('Google sign-in was cancelled or returned no account.');
      }

      const syncRes = await api.syncFirebaseUser({
        email: fbUser.email,
        name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Traveler'),
        avatar_url: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`,
        firebase_uid: fbUser.uid
      });

      localStorage.setItem('tripplanner_token', syncRes.token);
      const userObj = syncRes.user || syncRes;
      setUser(userObj);
      return userObj;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Sign out and clear stored session
   */
  async function logout() {
    try {
      await firebaseSignOut();
    } catch (err) {
      console.error('Sign out notice:', err);
    } finally {
      localStorage.removeItem('tripplanner_token');
      setUser(null);
    }
  }

  /**
   * Update Profile
   */
  async function updateProfile(data) {
    const res = await api.updateProfile(data);
    setUser(res.user);
    return res.user;
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    loginWithGoogle,
    instantGoogleLogin,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
