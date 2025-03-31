"use client"; // Add this directive for client-side interactivity (hooks, event handlers)

import React, { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation"; // Import useRouter
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth"; // Import Firebase auth function
import { 
    doc, 
    setDoc, 
    collection,
    query,
    where,
    getDocs,
    getDoc,
    serverTimestamp
} from "@firebase/firestore"; // Import Firestore functions
import { auth, db } from "../../lib/firebase/config"; // Import auth and db from our config file
import { useAuth } from "../../context/AuthContext"; // Import the useAuth hook

// Initial stats for new users
const defaultStats = {
  level: 1,
  hp: 100,
  maxHp: 100,
  exp: 0,
  maxExp: 100, // Exp for next level
  strength: 5,
  vitality: 5,
  agility: 5,
  statPoints: 0, 
  hunterName: "", // Added hunterName
  username: "", // Added username
  email: "", // Will be set during signup
  // workouts: [], // Optional: Add default workouts if needed
};

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hunterName, setHunterName] = useState("");
  const [username, setUsername] = useState(""); // <-- Add state for username
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  useEffect(() => {
    // Redirect if user is logged in and auth check is complete
    if (!authLoading && user) {
      router.push('/'); // Or your dashboard route
    }
  }, [user, authLoading, router]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!hunterName.trim()) {
        setError("Please enter a Hunter Name.");
        return;
    }
    
    if (!username.trim()) {
        setError("Please enter a Username.");
        return;
    }
    
    // Username validation - basic format check
    const usernameValue = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_-]+$/.test(usernameValue)) {
        setError("Username can only contain letters, numbers, underscores, and hyphens.");
        return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setLocalLoading(true);
    setError("");

    try {
      // Check if username exists using a separate collection for usernames
      // This is more secure than querying the entire users collection
      try {
        // Create a reference to a document with the username as the ID
        // in a separate usernames collection
        const usernameDoc = doc(db, "usernames", usernameValue);
        const usernameSnapshot = await getDoc(usernameDoc);
        
        if (usernameSnapshot.exists()) {
          setError("Username already taken. Please choose another one.");
          setLocalLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking username:", error);
        // Don't block signup due to username check error
        // We'll verify again when creating the document
      }

      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log("Hunter registered successfully:", newUser);

      // 2. Create a user document in Firestore
      const userDocRef = doc(db, "users", newUser.uid);
      
      // Also create a document in usernames collection for future uniqueness checks
      const usernameDocRef = doc(db, "usernames", usernameValue);

      // 3. Use a transaction to ensure both operations succeed or fail together
      try {
        // Set the initial data for the new user
        await setDoc(userDocRef, { 
            ...defaultStats,
            email: newUser.email,
            hunterName: hunterName.trim(),
            username: usernameValue
        });
        
        // Create username entry with reference to user
        await setDoc(usernameDocRef, { 
            uid: newUser.uid,
            createdAt: serverTimestamp()
        });
        
        console.log("Firestore documents created for user:", newUser.uid);
      } catch (firestoreError) {
        console.error("Firestore Error:", firestoreError);
        // If we failed to create documents, we should clean up the auth account
        try {
          // Delete the user from Authentication if we couldn't create their documents
          await deleteUser(newUser);
        } catch (deleteError) {
          console.error("Failed to clean up auth after Firestore error:", deleteError);
        }
        throw new Error("Failed to complete registration. Please try again.");
      }

      // Redirect (useEffect will eventually handle this)
      router.push("/");

    } catch (firebaseError) {
      // Handle Firebase errors
      console.error("Firebase Signup Error:", firebaseError);
      let userMessage = "Failed to register. Please try again.";
      if (firebaseError.code === 'auth/email-already-in-use') {
          userMessage = "This Hunter ID (Email) is already registered.";
      } else if (firebaseError.code === 'auth/weak-password') {
          userMessage = "Access Code is too weak. Please use a stronger password.";
      } else if (firebaseError.code === 'auth/invalid-email') {
          userMessage = "Invalid Hunter ID (Email) format.";
      } else if (firebaseError.message) {
          userMessage = firebaseError.message;
      }
      setError(userMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  // Show loading indicator while checking auth state or if already logged in
  if (authLoading || user) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <p className="text-white">Loading...</p> {/* Or a spinner component */}
        </div>
      );
  }

  // Render signup form only if not loading and not logged in
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 font-[family-name:var(--font-geist-sans)] p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Register as a Hunter</h1>
      <form onSubmit={handleSignUp} className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-blue-500/50">
        {error && <p className="text-red-500 mb-4 text-center bg-red-900/50 p-2 rounded">{error}</p>} {/* Improved error display */}
        <div className="mb-4">
            <label htmlFor="hunterName" className="block mb-2 text-sm font-medium text-gray-300">Hunter Name</label>
            <input
                type="text"
                id="hunterName"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                required
                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your Hunter Name"
            />
        </div>
        <div className="mb-4">
            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username (Unique, No Spaces)</label>
            <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, '-').toLowerCase())} // Replace spaces, convert to lowercase
                required
                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., shadow-monarch"
                pattern="^[a-zA-Z0-9_-]+$" // Allow letters, numbers, underscore, hyphen
                title="Only letters, numbers, underscores, and hyphens allowed. No spaces."
            />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Hunter ID (Email)</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your designation"
          />
        </div>
        <div className="mb-4"> {/* Consistent margin */}
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Access Code (Password)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Minimum 6 characters"
          />
        </div>
        {/* Add Confirm Password Field */}
        <div className="mb-6">
            <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">Confirm Access Code</label>
            <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Re-enter your code"
            />
        </div>
        <button
          type="submit"
          disabled={localLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-blue-800 transition-opacity duration-300" // Added transition
        >
          {localLoading ? (
             <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
          ) : "Initiate Registration"}
        </button>

        {/* Link to Login Page */}
        <p className="text-sm text-gray-400 mt-6 text-center">
            Already have a Hunter ID?{" "}
            <a href="/login" className="font-medium text-blue-500 hover:underline">Login Here</a>
        </p>
      </form>
    </div>
  );
} 