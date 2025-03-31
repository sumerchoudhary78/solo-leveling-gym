"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase/config";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [localLoading, setLocalLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Hunter logged in successfully:", userCredential.user);
    } catch (firebaseError) {
      console.error("Firebase Login Error:", firebaseError);
      let userMessage = "Failed to login. Please check your credentials.";
      if (firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        userMessage = "Invalid Hunter ID or Access Code.";
      } else if (firebaseError.code === 'auth/invalid-email') {
        userMessage = "Invalid Hunter ID (Email) format.";
      }
      setError(userMessage);
    } finally {
      setLocalLoading(false);
    }
  };

  if (authLoading || user) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-gray-900">
            <p className="text-white">Loading...</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-100 font-[family-name:var(--font-geist-sans)] p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Hunter Login</h1>
      <form onSubmit={handleLogin} className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg border border-blue-500/50">
        {error && <p className="text-red-500 mb-4 text-center bg-red-900/50 p-2 rounded">{error}</p>}
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
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Access Code (Password)</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your code"
          />
        </div>
        <button
          type="submit"
          disabled={localLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-blue-800 transition-opacity duration-300"
        >
          {localLoading ? (
             <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying Access...
              </div>
          ) : "Enter the System"}
        </button>

        <p className="text-sm text-gray-400 mt-6 text-center">
            Don't have a Hunter ID?{" "}
            <a href="/signup" className="font-medium text-blue-500 hover:underline">Register Here</a>
        </p>
      </form>
    </div>
  );
} 