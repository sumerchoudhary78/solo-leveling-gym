// src/app/leaderboard/page.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { collection, query, orderBy, onSnapshot } from '@firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { processAvatarUrl } from '@/lib/utils/avatarUtils';

// Import regular components
import Link from 'next/link';

// Dynamically import Three.js components with no SSR to avoid server-side issues
const PlayerAvatarFrame = dynamic(
  () => import('../components/three/PlayerAvatarFrame'),
  { ssr: false }
);

// Loading placeholder for Three.js components
const AvatarPlaceholder = ({ rank }) => {
  // Get appropriate color based on rank
  const getColor = (level) => {
    if (level >= 50) return 'bg-purple-700';
    if (level >= 40) return 'bg-red-700';
    if (level >= 30) return 'bg-red-600';
    if (level >= 25) return 'bg-orange-600';
    if (level >= 20) return 'bg-yellow-600';
    if (level >= 15) return 'bg-green-600';
    if (level >= 10) return 'bg-blue-600';
    return 'bg-gray-600';
  };

  return (
    <div className={`w-16 h-16 rounded-full ${getColor(rank)} animate-pulse`}></div>
  );
};

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRank, setFilterRank] = useState('All');

  // Optional: Protect this page
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (authLoading) return;

    setLoading(true);
    const usersRef = collection(db, 'users');
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
    });

    return () => unsubscribe();
  }, [authLoading, user]);

  // Function to determine rank from level
  const getRankFromLevel = (level) => {
    if (level >= 50) return "Special Authority";
    if (level >= 40) return "National Level";
    if (level >= 30) return "S";
    if (level >= 25) return "A";
    if (level >= 20) return "B";
    if (level >= 15) return "C";
    if (level >= 10) return "D";
    return "E";
  };

  // Function to get rank color class
  const getRankColorClass = (rank) => {
    const colors = {
      'E': 'text-gray-400',
      'D': 'text-blue-400',
      'C': 'text-green-400',
      'B': 'text-yellow-400',
      'A': 'text-orange-400',
      'S': 'text-red-400',
      'National Level': 'text-red-300',
      'Special Authority': 'text-purple-300'
    };
    return colors[rank] || colors['E'];
  };

  // Filter leaderboard by rank if needed
  const filteredLeaderboard = filterRank === 'All'
    ? leaderboard
    : leaderboard.filter(hunter => getRankFromLevel(hunter.level) === filterRank);

  // Calculate top hunter (for special effects)
  const topHunter = leaderboard.length > 0 ? leaderboard[0] : null;
  const isTopRank = topHunter && (
    getRankFromLevel(topHunter.level) === 'S' ||
    getRankFromLevel(topHunter.level) === 'National Level' ||
    getRankFromLevel(topHunter.level) === 'Special Authority'
  );

  // Show loading state for auth or data fetching
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#101827]">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white text-xl">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101827] text-gray-100 font-[family-name:var(--font-geist-sans)] p-4 sm:p-8">
      {/* Top hunter spotlight (only shown if top hunter is high rank) */}
      {isTopRank && topHunter && (
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 z-0"></div>

          <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#21305b] to-[#2d4070] p-6 rounded-lg shadow-lg relative z-10 border border-blue-500/30">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1 rounded-full shadow-lg transform rotate-12">
              <span className="text-black font-bold text-sm">TOP HUNTER</span>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:mr-8 mb-4 md:mb-0 relative">
                <Suspense fallback={<AvatarPlaceholder rank={topHunter.level} />}>
                  <PlayerAvatarFrame
                    rank={topHunter.level}
                    size={120}
                    imageUrl={processAvatarUrl(topHunter.avatarUrl, 120)}
                  />
                </Suspense>
              </div>

              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">{topHunter.hunterName || 'Anonymous Hunter'}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-3">
                  <div className={`px-3 py-1 rounded-full ${getRankFromLevel(topHunter.level) === 'Special Authority' ? 'bg-purple-900/40' : 'bg-red-900/40'}`}>
                    <span className={`font-bold ${getRankColorClass(getRankFromLevel(topHunter.level))}`}>
                      {getRankFromLevel(topHunter.level)}
                    </span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-blue-900/40">
                    <span className="font-bold text-blue-300">Level {topHunter.level}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  Leading the hunter rankings with {topHunter.huntsCompleted || '0'} successful missions and counting.
                  {topHunter.joinDate ? ` Hunter since ${topHunter.joinDate}.` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative elements for top hunter */}
          <div className="hidden md:block absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
          <div className="hidden md:block absolute -bottom-20 -right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
      )}

      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-300">Hunter Rankings</h1>
        <Link href="/" className="text-sm text-blue-400 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </header>

      {/* Filter controls */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setFilterRank('All')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              filterRank === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Ranks
          </button>
          {['Special Authority', 'National Level', 'S', 'A', 'B', 'C', 'D', 'E'].map(rank => (
            <button
              key={rank}
              onClick={() => setFilterRank(rank)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filterRank === rank ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {rank}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto bg-[#1f2a40] p-6 rounded-lg shadow-md">
        {filteredLeaderboard.length > 0 ? (
          <ul className="space-y-6">
            {filteredLeaderboard.map((hunter, index) => {
              const hunterRank = getRankFromLevel(hunter.level);
              const rankColorClass = getRankColorClass(hunterRank);
              const isTopThree = index < 3;

              // Determine animation class based on rank
              const animationClass = isTopThree
                ? 'animate-float-slow'
                : hunterRank === 'S' || hunterRank === 'National Level' || hunterRank === 'Special Authority'
                  ? 'animate-pulse-slow'
                  : '';

              // Determine background class based on rank
              const bgClass = isTopThree
                ? 'bg-gradient-to-r from-[#21325b] to-[#324775]'
                : hunterRank === 'S' || hunterRank === 'National Level' || hunterRank === 'Special Authority'
                  ? 'bg-gradient-to-r from-[#313f5b] to-[#3a4862]'
                  : 'bg-[#313f5b]';

              // Top 3 get special treatment
              const borderClass =
                index === 0 ? 'border-2 border-yellow-400 shadow-glow-gold' :
                index === 1 ? 'border-2 border-gray-300 shadow-glow-silver' :
                index === 2 ? 'border-2 border-amber-700 shadow-glow-bronze' :
                '';

              return (
                <li
                  key={hunter.id}
                  className={`flex items-center p-4 rounded-lg ${bgClass} ${borderClass} ${animationClass} transition-all duration-300 hover:translate-x-1`}
                >
                  {/* Rank number */}
                  <div className={`flex justify-center items-center w-10 h-10 rounded-full
                    ${index < 3 ? 'bg-gradient-to-br from-blue-500 to-indigo-700' : 'bg-blue-900'}
                    text-white font-bold mr-4`}
                  >
                    {index + 1}
                  </div>

                  {/* Avatar with Three.js frame */}
                  <div className="relative mr-4">
                    <Suspense fallback={<AvatarPlaceholder rank={hunter.level} />}>
                      <PlayerAvatarFrame
                        rank={hunter.level}
                        size={80}
                        imageUrl={processAvatarUrl(hunter.avatarUrl, 80)}
                      />
                    </Suspense>
                  </div>

                  {/* Hunter info */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-white text-lg">
                        {hunter.hunterName || 'Anonymous Hunter'}
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className={`text-lg font-bold ${rankColorClass}`}>
                          {hunterRank}
                        </span>
                        <span className="text-lg font-bold text-blue-300">
                          Lv. {hunter.level}
                        </span>
                      </div>
                    </div>

                    {/* Additional hunter stats could go here */}
                    {isTopThree && (
                      <div className="mt-2 text-sm text-gray-300">
                        <span className="inline-block mr-4">
                          <span className="text-gray-400">Missions:</span> {hunter.huntsCompleted || 0}
                        </span>
                        <span className="inline-block">
                          <span className="text-gray-400">Joined:</span> {hunter.joinDate || 'Unknown'}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-400 py-8">
            {filterRank === 'All'
              ? 'No hunters found in the rankings yet.'
              : `No hunters of rank ${filterRank} found.`}
          </p>
        )}
      </main>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .shadow-glow-gold {
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        .shadow-glow-silver {
          box-shadow: 0 0 10px rgba(192, 192, 192, 0.5);
        }
        .shadow-glow-bronze {
          box-shadow: 0 0 10px rgba(205, 127, 50, 0.5);
        }
      `}</style>
    </div>
  );
}