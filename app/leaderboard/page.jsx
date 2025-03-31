'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from '@firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext'; // To potentially protect this page too
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Optional: Protect this page like the home page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch if auth is checked and user exists (or if page is public)
    if (authLoading) return; 
    // If page is protected, add: if (!user) return;
    
    setLoading(true);
    const usersRef = collection(db, 'users');
    // Query to order users by level descending
    const q = query(usersRef, orderBy("level", "desc")); 

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboard(usersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leaderboard: ", error);
      setLoading(false);
      // Handle error (e.g., show message)
    });

    // Cleanup listener on unmount
    return () => unsubscribe();

  }, [authLoading, user]); // Add user if page is protected

  // Show loading state for auth or data fetching
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#101827]">
        <p className="text-white text-xl">Loading Leaderboard...</p>
      </div>
    );
  }

  // Optional: Add check if page is protected and user is null after loading
  // if (!user) return null; 

  return (
    <div className="min-h-screen bg-[#101827] text-gray-100 font-[family-name:var(--font-geist-sans)] p-4 sm:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300">Hunter Rankings</h1>
        {/* Optional: Link back to dashboard */}
        <a href="/" className="text-sm text-blue-400 hover:underline mt-2 inline-block">Back to Dashboard</a>
      </header>

      <main className="max-w-2xl mx-auto bg-[#1f2a40] p-6 rounded-lg shadow-md">
        {leaderboard.length > 0 ? (
          <ul className="space-y-4">
            {leaderboard.map((hunter, index) => (
              <li key={hunter.id} className="flex justify-between items-center p-3 bg-[#313f5b] rounded">
                <span className="font-medium text-white">
                  {index + 1}. {hunter.hunterName || 'Anonymous Hunter'} 
                </span>
                <span className="text-lg font-bold text-blue-300">Lv. {hunter.level}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400">No hunters found in the rankings yet.</p>
        )}
      </main>
    </div>
  );
} 