'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase/config'; // Adjust path if needed

// Create the context
const AuthContext = createContext({
  user: null, // Initially no user
  loading: true, // Start in loading state until auth check completes
});

// Create a provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // currentUser will be null if logged out, or the user object if logged in
      setLoading(false); // Auth check is complete
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs only once on mount

  const value = {
    user,
    loading,
  };

  // Provide the context value to children components
  // Don't render children until the initial loading is false
  return (
    <AuthContext.Provider value={value}>
      {children} 
    </AuthContext.Provider>
  );
}

// Create a custom hook to use the auth context easily
export const useAuth = () => {
  return useContext(AuthContext);
}; 